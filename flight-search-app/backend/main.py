"""
FastAPI Backend - Wyszukiwarka Lotów Ryanair
Backend proxy dla Ryanair API + baza danych
"""
from fastapi import FastAPI, Depends, HTTPException, status, Body, Response, Request, Query
from database import get_db
from models import *
from schemas import *
from auth import get_current_user, verify_password, create_access_token, get_password_hash

# Simple in-memory cache used by various endpoints; durable caching may be added later
MEMORY_CACHE = {}
from fastapi.middleware.cors import CORSMiddleware
import json
import gzip
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional
import random
import asyncio
from datetime import datetime, timedelta, timezone
import os
import httpx
import brotli

# Initialize FastAPI app instance and basic middleware
app = FastAPI()
# Configure CORS to allow local frontend dev servers
FRONTEND_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    # Fetch exchange rates on startup and schedule periodic refresh
    try:
        await fetch_exchange_rates()
    except Exception as e:
        print(f"⚠️ NBP rates fetch on startup failed: {e}")

    async def _periodic_rates_refresh():
        while True:
            try:
                await asyncio.sleep(24 * 60 * 60)  # 24 hours
                await fetch_exchange_rates()
            except Exception as e:
                print(f"⚠️ periodic NBP refresh error: {e}")
                await asyncio.sleep(60 * 60)  # retry in 1 hour

    # Schedule the periodic refresher
    asyncio.create_task(_periodic_rates_refresh())

@app.get("/api/ryanair/routes")
async def get_routes(origin: str = Query(..., alias="origin"), market: str = Query("pl-pl", alias="market")):
    """
    Zwraca listę destynacji (kody IATA) z lotniska używając publicznego endpointu LOCATE.
    - jeśli brak tras dla origin (np. WAW), spróbuj lotnisk w tym samym mieście (cityCode/macCity)
    - wynik cache'owany 12h
    """
    from datetime import datetime, timedelta

    try:
        origin = origin.upper().strip()
        market = (market or "pl-pl").lower().strip()
        market_lang = (market.split('-')[0] or 'pl').lower()

        # Cache
        cache_key = f"routes-locate:{origin}:{market}"
        cached = MEMORY_CACHE.get(cache_key)
        now = datetime.now()
        if cached and cached.get("expires_at") and cached["expires_at"] > now:
            print(f"🔁 Routes z cache [{origin}/{market}] -> {cached['data'].get('count', 0)}")
            return cached["data"]

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "pl,pl-PL;q=0.9,en-US;q=0.6,en;q=0.4",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Origin": "https://www.ryanair.com",
            "Referer": "https://www.ryanair.com/pl/pl",
        }

        locate_base = "https://www.ryanair.com/api/views/locate"
        urls = [
            # v3 ma pełne routes array!
            f"{locate_base}/3/airports/{market_lang}/active",
            f"{locate_base}/3/airports/{market_lang}",
            # v5 jako fallback (czasem nowsza, ale brak routes)
            f"{locate_base}/5/airports/{market_lang}/active",
            f"{locate_base}/5/airports/{market_lang}",
            # EN jako ostatni
            f"{locate_base}/3/airports/en/active",
        ]

        print(f"📊 Szukam tras (LOCATE only) z {origin}…")

        async with httpx.AsyncClient(timeout=30.0, http2=True) as client:
            airports_data = None
            for u in urls:
                try:
                    print(f"🔎 LOCATE fetch: {u}")
                    r = await safe_get(client, u, headers=headers)
                    if r.status_code == 200:
                        airports_data = decode_response_content(r)
                        if isinstance(airports_data, list) and len(airports_data) > 0:
                            break
                except Exception as e:
                    print(f"⚠️ LOCATE fetch error: {type(e).__name__}: {e}")

            destinations: set[str] = set()
            effective_origin = origin

            if isinstance(airports_data, list):
                print(f"🧩 LOCATE airports count: {len(airports_data)}")

                def get_airport_code(apt) -> str:
                    """Wyciąga kod IATA z obiektu lotniska (obsługuje 'code' i 'iataCode')"""
                    return (apt.get("iataCode") or apt.get("code") or "").upper()

                def extract_routes_for(apt) -> list[str]:
                    out = []
                    for r in (apt.get("routes") or []):
                        if isinstance(r, str) and r.startswith("airport:"):
                            code = r.split(":", 1)[1].strip().upper()
                            if len(code) == 3:
                                out.append(code)
                    return out

                # 1) spróbuj dokładnie origin
                origin_entry = next((a for a in airports_data if get_airport_code(a) == origin), None)
                if origin_entry:
                    routes = extract_routes_for(origin_entry)
                    print(f"🧩 LOCATE match {origin}, routes count: {len(routes)}")
                    if routes:
                        destinations.update(routes)
                        print(f"✅ Znaleziono trasy dla {origin}: {', '.join(routes[:5])}{'...' if len(routes) > 5 else ''}")
                    else:
                        print(f"⚠️ {origin} ma pusty routes array")

                # 2) jeżeli brak, spróbuj lotnisk w tym samym mieście (cityCode lub macCityCode)
                if not destinations and origin_entry:
                    city_code = origin_entry.get("cityCode") or (origin_entry.get("city") or {}).get("code")
                    mac_code = origin_entry.get("macCityCode") or (origin_entry.get("macCity") or {}).get("code") or (origin_entry.get("macCity") or {}).get("macCode")

                    print(f"🔍 Brak tras dla {origin}, szukam w mieście: cityCode={city_code}, macCityCode={mac_code}")

                    def same_city(a):
                        a_city = a.get("cityCode") or (a.get("city") or {}).get("code")
                        a_mac = a.get("macCityCode") or (a.get("macCity") or {}).get("code") or (a.get("macCity") or {}).get("macCode")
                        return (
                            (city_code and a_city == city_code)
                            or (mac_code and a_mac == mac_code)
                        )

                    siblings = [a for a in airports_data if same_city(a) and get_airport_code(a) != origin] if (city_code or mac_code) else []
                    print(f"🧩 Znaleziono {len(siblings)} lotnisk w tym samym mieście")

                    # preferuj bazy i te z jakimikolwiek trasami
                    ranked = []
                    for a in siblings:
                        routes = extract_routes_for(a)
                        code = get_airport_code(a)
                        if routes:
                            is_base = a.get("base", False)
                            ranked.append((is_base, len(routes), code, a))
                            print(f"  → {code}: base={is_base}, routes={len(routes)}")

                    ranked.sort(key=lambda t: (not t[0], -t[1]))  # bazy najpierw, potem najwięcej tras

                    if ranked:
                        best = ranked[0][3]
                        effective_origin = get_airport_code(best)
                        routes = extract_routes_for(best)
                        destinations.update(routes)
                        print(f"🧭 Używam lotniska w obrębie miasta: {effective_origin} (base={best.get('base')}, routes: {len(routes)})")
                    else:
                        print(f"⚠️ Brak lotnisk z trasami w mieście")

                # 3) extra fallback: searchWidget (tylko jeśli dalej pusto)
                if not destinations:
                    print(f"🔎 Fallback searchWidget dla {origin}…")
                    for lang in (market_lang, "en"):
                        sw_url = f"https://www.ryanair.com/api/views/locate/searchWidget/routes/{lang}/airport/{origin}"
                        print(f"   → {sw_url}")
                        try:
                            sw_r = await safe_get(client, sw_url, headers=headers)
                            if sw_r.status_code == 200:
                                sw_data = decode_response_content(sw_r)
                                cands = [sw_data] if isinstance(sw_data, dict) else (sw_data or [])
                                for ap in cands:
                                    code = get_airport_code(ap)
                                    if code in (origin, effective_origin):
                                        for r in (ap.get("routes") or []):
                                            if isinstance(r, str) and r.startswith("airport:"):
                                                d = r.split(":", 1)[1].strip().upper()
                                                if len(d) == 3:
                                                    destinations.add(d)
                                if destinations:
                                    print(f"✅ searchWidget[{lang}] zwrócił {len(destinations)} destynacji")
                                    break
                                else:
                                    print(f"⚠️ searchWidget[{lang}] brak tras")
                            else:
                                print(f"⚠️ searchWidget[{lang}] status={sw_r.status_code}")
                        except Exception as e:
                            print(f"⚠️ searchWidget[{lang}] error: {type(e).__name__}: {e}")

            destinations_list = sorted(destinations)
            result = {
                "origin": origin,
                "effectiveOrigin": effective_origin,
                "destinations": destinations_list,
                "count": len(destinations_list)
            }

            if result['count'] > 0:
                print(f"✅ Znaleziono {result['count']} destynacji (LOCATE only) dla {origin}{' → ' + effective_origin if effective_origin != origin else ''}")
                print(f"   Przykłady: {', '.join(destinations_list[:10])}{'...' if len(destinations_list) > 10 else ''}")
            else:
                print(f"❌ Nie znaleziono żadnych połączeń z {origin}")

            MEMORY_CACHE[cache_key] = {
                "data": result,
                "created_at": now,
                "expires_at": now + timedelta(hours=12)
            }

            return result

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Błąd pobierania połączeń: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Błąd pobierania połączeń: {str(e)}")


# Helper: decode HTTPX response content with common encodings
def decode_response_content(resp):
    try:
        # Prefer httpx Response.json() which handles decoding
        return resp.json()
    except Exception:
        try:
            content = resp.content
            # Try brotli
            try:
                import brotli as _brotli
                content = _brotli.decompress(content)
            except Exception:
                pass
            # Try gzip
            try:
                content = gzip.decompress(content)
            except Exception:
                pass
            # Fallback to text
            text = content.decode('utf-8', errors='ignore') if isinstance(content, (bytes, bytearray)) else str(content)
            return json.loads(text) if text else None
        except Exception:
            return None


# Exchange rates storage (NBP)
EXCHANGE_RATES = {
        'PLN': 1,
        'EUR': 4.35,
        'GBP': 5.15,
        'USD': 4.05,
        'CZK': 0.18,
        'HUF': 0.011,
        'SEK': 0.39,
        'NOK': 0.38,
        'DKK': 0.58
    }


async def fetch_exchange_rates():
        """Fetch rates from NBP and update EXCHANGE_RATES dict."""
        url = 'http://api.nbp.pl/api/exchangerates/tables/A?format=json'
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                r = await safe_get(client, url)
                if r.status_code == 200:
                    data = decode_response_content(r)
                    if isinstance(data, list) and len(data) > 0:
                        rates = data[0].get('rates', [])
                        new_rates = {'PLN': 1}
                        for rr in rates:
                            code = rr.get('code')
                            mid = rr.get('mid')
                            if code and mid:
                                new_rates[code] = float(mid)
                        global EXCHANGE_RATES
                        EXCHANGE_RATES = new_rates
                        print(f"✅ NBP rates updated: {list(EXCHANGE_RATES.keys())}")
                        return
        except Exception as e:
            print(f"⚠️ NBP fetch failed: {e}")
        print("⚠️ Using fallback exchange rates")


def convert_to_pln(amount, currency):
        """Convert a numeric amount in given currency to PLN using EXCHANGE_RATES."""
        try:
            if amount is None:
                return None
            if isinstance(amount, str) and amount.strip() == '':
                return None
            val = float(amount)
            if val == 0:
                return 0
            rate = EXCHANGE_RATES.get((currency or '').upper(), None)
            if rate is None:
                # Try to refresh rates once if missing
                return round(val * 1.0, 2)
            return round(val * rate, 2)
        except Exception:
            return None


# User-Agent rotation list
USER_AGENTS = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Safari/605.1.15',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:115.0) Gecko/20100101 Firefox/115.0'
    ]


async def safe_get(client: httpx.AsyncClient, url: str, params: dict = None, headers: dict = None, max_retries: int = 3):
        """Wrapper for client.get with jitter/throttling, UA rotation, and retry on 429/503."""
        attempt = 0
        while attempt <= max_retries:
            attempt += 1
            # Soft delay (throttle)
            await asyncio.sleep(random.uniform(0.2, 0.5))
            # Build headers with UA rotation
            h = dict(headers or {})
            h['User-Agent'] = random.choice(USER_AGENTS)
            h['Accept-Encoding'] = 'gzip, deflate, br'
            try:
                r = await client.get(url, params=params, headers=h)
                # Rate-limit hits
                if r.status_code in (429, 503, 502):
                    backoff = 1.0 * (2 ** (attempt - 1))
                    print(f"⚠️ Received {r.status_code} from {url}. Backing off {backoff}s (attempt {attempt})")
                    await asyncio.sleep(backoff)
                    continue
                return r
            except httpx.RequestError as e:
                print(f"⚠️ HTTP request error {e} (attempt {attempt}) for {url}")
                await asyncio.sleep(0.5 * attempt)
                continue
        # Last attempt
        return await client.get(url, params=params, headers=headers or {})



# Helper: robustly extract a numeric price and currency from FareFinder/Search API price objects
import re
def extract_price_value(price_obj):
        try:
            if isinstance(price_obj, dict):
                # Common names
                for k in ("value", "amount", "valueMainUnit", "rawAmount"):
                    if price_obj.get(k) is not None:
                        return float(price_obj.get(k))
                # Some payloads use nested structures - try 'total' or 'price'
                if price_obj.get('total') is not None:
                    return float(price_obj.get('total'))
            elif isinstance(price_obj, (int, float)):
                return float(price_obj)
            elif isinstance(price_obj, str):
                # Try to extract value= or amount=
                m = re.search(r"value=([0-9]+(?:\.[0-9]+)?)", price_obj)
                if m:
                    return float(m.group(1))
                m2 = re.search(r"amount=([0-9]+(?:\.[0-9]+)?)", price_obj)
                if m2:
                    return float(m2.group(1))
                # last resort - find any number like 123.45
                m3 = re.search(r"([0-9]+(?:\.[0-9]+)?)", price_obj)
                if m3:
                    return float(m3.group(1))
        except Exception:
            pass
        return None


def extract_currency(price_obj):
        try:
            if isinstance(price_obj, dict):
                for k in ("currencyCode", "currency", "currencyCodeIso", "currencyIso"):
                    if price_obj.get(k):
                        return price_obj.get(k)
            elif isinstance(price_obj, str):
                m = re.search(r"currency(?:Code)?=([A-Z]{3})", price_obj)
                if m:
                    return m.group(1)
                # sometimes currency appears as PLN or EUR alone
                m2 = re.search(r"\b(PLN|EUR|GBP|USD|CZK|HUF|SEK|NOK|DKK)\b", price_obj)
                if m2:
                    return m2.group(1)
        except Exception:
            pass
        return None


def normalize_price_obj(price_obj):
        value = extract_price_value(price_obj)
        currency = extract_currency(price_obj) or 'PLN'
        return { 'value': value, 'currencyCode': currency }


def ensure_fare_prices(fare):
    """Ensure outbound/inbound price objects exist and have priceInPLN populated."""
    try:
        # Outbound
        out = fare.get('outbound') or {}
        out_price = out.get('price') or {}
        if not isinstance(out_price, dict):
            out_price = normalize_price_obj(out_price)
        if out_price.get('currencyCode') is None:
            out_price['currencyCode'] = extract_currency(out_price) or 'PLN'
        out_price['priceInPLN'] = convert_to_pln(out_price.get('value'), out_price.get('currencyCode'))
        out['price'] = out_price
        fare['outbound'] = out
    except Exception:
        pass
    try:
        # Inbound
        inbound = fare.get('inbound') or {}
        in_price = inbound.get('price') or {}
        if not isinstance(in_price, dict):
            in_price = normalize_price_obj(in_price)
        if in_price.get('currencyCode') is None:
            in_price['currencyCode'] = extract_currency(in_price) or 'PLN'
        in_price['priceInPLN'] = convert_to_pln(in_price.get('value'), in_price.get('currencyCode'))
        inbound['price'] = in_price
        fare['inbound'] = inbound
    except Exception:
        pass
    # total for roundtrip
    try:
        t = (fare.get('outbound', {}).get('price', {}).get('priceInPLN') or 0) + (fare.get('inbound', {}).get('price', {}).get('priceInPLN') or 0)
        fare['totalPriceInPLN'] = round(t, 2) if t else None
    except Exception:
        fare['totalPriceInPLN'] = None
    return fare


# ============================================
# AVAILABLE DATES ENDPOINT (optymalizacja wyszukiwania)
# ============================================

@app.get("/api/ryanair/availableDates")
async def get_available_dates(origin: str, destination: str, market: str = "pl-pl"):
    """
    Zwraca listę dat na których są dostępne loty dla danej trasy.
    Używa endpointu /api/farfnd/3/oneWayFares/{origin}/{destination}/availabilities

    To pozwala na optymalizację wyszukiwania - sprawdzamy tylko dni z lotami,
    zamiast pytać o ceny dla każdego dnia z osobna.

    Parametry:
    - origin: kod IATA lotniska wylotu (np. WAW)
    - destination: kod IATA lotniska przylotu (np. ALC)
    - market: rynek (domyślnie pl-pl)

    Zwraca:
    - dates: lista dat w formacie YYYY-MM-DD
    - count: liczba dostępnych dat
    - cached: czy dane z cache (24h)
    """
    from datetime import datetime, timedelta

    try:
        origin = origin.upper().strip()
        destination = destination.upper().strip()
        market = (market or "pl-pl").lower().strip()

        # Cache na 24h (dostępność dat zmienia się rzadziej niż ceny)
        cache_key = f"avail-dates:{origin}:{destination}:{market}"
        cached = MEMORY_CACHE.get(cache_key)
        now = datetime.now()
        if cached and cached.get("expires_at") and cached["expires_at"] > now:
            data = cached["data"]
            data["cached"] = True
            print(f"🔁 AvailDates z cache [{origin}→{destination}] → {data.get('count', 0)} dni")
            return data

        # Endpoint z dostępnością dat
        url = f"https://www.ryanair.com/api/farfnd/3/oneWayFares/{origin}/{destination}/availabilities"

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "pl,pl-PL;q=0.9,en-US;q=0.6,en;q=0.4",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Origin": "https://www.ryanair.com",
            "Referer": "https://www.ryanair.com/pl/pl",
            "client": "desktop",
            "client-version": "0.149.0 (desktop)",
            "dnt": "1",
            "sec-ch-ua": '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"'
        }

        print(f"📅 Pobieram dostępne daty dla {origin}→{destination}...")

        async with httpx.AsyncClient(timeout=15.0, http2=True) as client:
            response = await safe_get(client, url, headers=headers)

            if response.status_code != 200:
                print(f"⚠️ AvailDates status: {response.status_code}")
                # Zwróć pustą listę zamiast błędu - frontend może wtedy przejść do pełnego skanowania
                return {
                    "origin": origin,
                    "destination": destination,
                    "dates": [],
                    "count": 0,
                    "cached": False,
                    "error": f"HTTP {response.status_code}"
                }

            dates_data = decode_response_content(response)

            # Odpowiedź to prosta lista stringów z datami
            dates = []
            if isinstance(dates_data, list):
                dates = [d for d in dates_data if isinstance(d, str) and len(d) == 10]

            result = {
                "origin": origin,
                "destination": destination,
                "dates": sorted(dates),
                "count": len(dates),
                "cached": False
            }

            print(f"✅ Znaleziono {result['count']} dostępnych dni dla {origin}→{destination}")
            if result['count'] > 0:
                print(f"   Pierwsze: {dates[0]}, ostatnie: {dates[-1]}")

            # Cache na 24h
            MEMORY_CACHE[cache_key] = {
                "data": result,
                "created_at": now,
                "expires_at": now + timedelta(hours=24)
            }

            return result

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Błąd pobierania dostępności: {type(e).__name__}: {str(e)}")
        # Graceful degradation - zwróć pustą listę
        return {
            "origin": origin,
            "destination": destination,
            "dates": [],
            "count": 0,
            "cached": False,
            "error": str(e)
        }


# ============================================
# ROUND-TRIP FARFINDER ENDPOINT
# ============================================

@app.get("/api/ryanair/farfinder")
async def search_roundtrip_fares(
    departureAirportIataCode: str,
    arrivalAirportIataCode: str,
    outboundDepartureDateFrom: str,
    outboundDepartureDateTo: str,
    inboundDepartureDateFrom: str,
    inboundDepartureDateTo: str,
    durationFrom: int = 1,
    durationTo: int = 7,
    adultPaxCount: int = 1,
    market: str = "pl-pl",
    searchMode: str = "ALL",
    # 'confirm' parameter removed - no Search API confirmation anymore
):
    """
    Round-Trip FareFinder API - zwraca najtańsze kombinacje lotów tam i z powrotem
    """
    try:
        # FareFinder endpoint
        url = "https://www.ryanair.com/api/farfnd/v4/roundTripFares"

        params = {
            "departureAirportIataCode": departureAirportIataCode,
            "arrivalAirportIataCode": arrivalAirportIataCode,
            "outboundDepartureDateFrom": outboundDepartureDateFrom,
            "outboundDepartureDateTo": outboundDepartureDateTo,
            "inboundDepartureDateFrom": inboundDepartureDateFrom,
            "inboundDepartureDateTo": inboundDepartureDateTo,
            "durationFrom": durationFrom,
            "durationTo": durationTo,
            "adultPaxCount": adultPaxCount,
            "market": market,
            "searchMode": searchMode,
            "outboundDepartureDaysOfWeek": "MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY,SUNDAY",
            "outboundDepartureTimeFrom": "00:00",
            "outboundDepartureTimeTo": "23:59",
            "inboundDepartureTimeFrom": "00:00",
            "inboundDepartureTimeTo": "23:59"
        }

        print(f"📊 Wywołuję RoundTrip FareFinder API: {url}")
        print(f"Parametry: {params}")

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "pl",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "client": "desktop",
            "client-version": "0.0.22-alpha.2",
            "dnt": "1",
            "priority": "u=1, i",
            "sec-ch-ua": '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"'
        }

        async with httpx.AsyncClient(timeout=30.0, http2=True) as client:
            # Najpierw odwiedź stronę główną (ustanów sesję)
            await safe_get(client, "https://www.ryanair.com/pl/pl", headers=headers)

            # Teraz wywołaj FareFinder
            response = await safe_get(client, url, params=params, headers=headers)

            print(f"Status code: {response.status_code}")

            if response.status_code == 200:
                data = decode_response_content(response)
                print(f"📊 Otrzymano ceny dla {len(data.get('fares', []))} kombinacji round-trip")

                # Search API confirmation removed — return FareFinder data as received, normalized

                # Normalize price objects to include PLN conversion
                if isinstance(data.get('fares'), list):
                    for i, f in enumerate(data.get('fares')):
                        data['fares'][i] = ensure_fare_prices(f)
                return data
            else:
                print(f"Błąd RoundTrip FareFinder response: {response.text}")
                return {"fares": []}  # Zwróć puste fares zamiast błędu

    except Exception as e:
        print(f"Błąd RoundTrip FareFinder: {type(e).__name__}: {str(e)}")
        return {"fares": []}  # Graceful fallback


# ============================================
# FLIGHT SEARCH ENDPOINT (szczegółowe dane lotów)
# ============================================

@app.get("/api/ryanair/search")
async def search_flights(
    ADT: int = 1,
    TEEN: int = 0,
    CHD: int = 0,
    INF: int = 0,
    Origin: str = "",
    Destination: str = "",
    DateOut: str = "",
    DateIn: str = "",
    RoundTrip: str = "false",
    IncludeConnectingFlights: str = "false",
    promoCode: str = "",
    ToUs: str = "AGREED"
):
    """
    Flight Search API - szczegółowe informacje o lotach (godziny, ceny z podziałem na opłaty)
    Używane do pobrania konkretnych lotów dla wybranych dat
    """
    try:
        url = "https://www.ryanair.com/api/booking/v4/pl-pl/availability"

        params = {
            "ADT": ADT,
            "TEEN": TEEN,
            "CHD": CHD,
            "INF": INF,
            "Origin": Origin.upper(),
            "Destination": Destination.upper(),
            "DateOut": DateOut,
            "RoundTrip": RoundTrip.lower(),
            "IncludeConnectingFlights": IncludeConnectingFlights.lower(),
            "promoCode": promoCode,
            "ToUs": ToUs
        }

        # Dodaj DateIn tylko dla round-trip
        if RoundTrip.lower() == "true" and DateIn:
            params["DateIn"] = DateIn

        print(f"🔍 Wywołuję Search API: {url}")
        print(f"Parametry: {params}")

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "pl",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "client": "desktop",
            "client-version": "0.0.22-alpha.2",
            "dnt": "1",
            "priority": "u=1, i",
            "sec-ch-ua": '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"'
        }

        async with httpx.AsyncClient(timeout=30.0, http2=True) as client:
            # Najpierw odwiedź stronę główną
            await safe_get(client, "https://www.ryanair.com/pl/pl", headers=headers)

            # Wywołaj Search API
            response = await safe_get(client, url, params=params, headers=headers)

            print(f"Status code: {response.status_code}")

            if response.status_code == 200:
                data = decode_response_content(response)

                # Policz loty w odpowiedzi
                trips = data.get("trips", [])
                flight_count = sum(len(trip.get("dates", [])) for trip in trips)
                print(f"✈️ Otrzymano {flight_count} lotów dla {Origin}→{Destination} na {DateOut}")

                return data
            else:
                print(f"⚠️ Search API error: {response.status_code} - {response.text[:200]}")
                return {"trips": []}  # Zwróć pustą strukturę

    except Exception as e:
        print(f"❌ Błąd Search API: {type(e).__name__}: {str(e)}")
        return {"trips": []}  # Graceful fallback

# ============================================
# ONE-WAY FARFINDER ENDPOINT
# ============================================

@app.get("/api/ryanair/oneWayFares")
async def search_oneway_fares(
    departureAirportIataCode: str,
    arrivalAirportIataCode: str,
    outboundDepartureDateFrom: str,
    outboundDepartureDateTo: str,
    outboundDepartureDaysOfWeek: str,
    outboundDepartureTimeFrom: str,
    outboundDepartureTimeTo: str,
    adultPaxCount: int = 1,
    market: str = "pl-pl",
    searchMode: str = "ALL",
    # 'confirm' parameter removed per user request
):
    """
    OneWay FareFinder API - zwraca najtańsze ceny dla lotów w jedną stronę
    Właściwy endpoint dla one-way flights (nie roundTrip z duration=1)
    """
    try:
        # OneWay FareFinder endpoint
        url = "https://www.ryanair.com/api/farfnd/v4/oneWayFares"

        params = {
            "departureAirportIataCode": departureAirportIataCode,
            "arrivalAirportIataCode": arrivalAirportIataCode,
            "outboundDepartureDateFrom": outboundDepartureDateFrom,
            "outboundDepartureDateTo": outboundDepartureDateTo,
            "outboundDepartureDaysOfWeek": outboundDepartureDaysOfWeek,
            "outboundDepartureTimeFrom": outboundDepartureTimeFrom,
            "outboundDepartureTimeTo": outboundDepartureTimeTo,
            "adultPaxCount": adultPaxCount,
            "market": market,
            "searchMode": searchMode
        }

        print(f"📊 Wywołuję OneWay FareFinder API: {url}")
        print(f"Parametry: {params}")

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "pl",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "client": "desktop",
            "client-version": "0.0.22-alpha.2",
            "dnt": "1",
            "priority": "u=1, i",
            "sec-ch-ua": '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"'
        }

        async with httpx.AsyncClient(timeout=30.0, http2=True) as client:
            # Najpierw odwiedź stronę główną (ustanów sesję)
            await client.get("https://www.ryanair.com/pl/pl", headers=headers)

            # Teraz wywołaj OneWay FareFinder
            response = await safe_get(client, url, params=params, headers=headers)

            print(f"Status code: {response.status_code}")

            if response.status_code == 200:
                data = decode_response_content(response)
                print(f"📊 Otrzymano ceny dla {len(data.get('fares', []))} lotów jednokierunkowych")
                # Confirmation via Search API is removed. We normalize and return all fares instead.
                # Normalize prices for non-confirmed results
                if isinstance(data.get('fares'), list):
                    for i, f in enumerate(data.get('fares')):
                        data['fares'][i] = ensure_fare_prices(f)
                return data
            else:
                print(f"Błąd OneWay FareFinder response: {response.text}")
                return {"fares": []}  # Zwróć puste fares zamiast błędu

    except Exception as e:
        print(f"Błąd OneWay FareFinder: {type(e).__name__}: {str(e)}")
        return {"fares": []}  # Graceful fallback


# ============================================
# ANY DESTINATION ENDPOINT (Dowolny kierunek)
# ============================================

# --- STARA WERSJA ENDPOINTU /api/ryanair/anyDestination ZAKOMENTOWANA ---
# @app.get("/api/ryanair/anyDestination")
# async def search_any_destination(
#     departureAirportIataCode: str,
#     outboundDepartureDateFrom: str,
#     outboundDepartureDateTo: str,
#     adultPaxCount: int = 1,
#     market: str = "pl-pl",
#     searchMode: str = "ALL"
# ):
#     """
#     ANY Destination API - wyszukuje loty do dowolnego kierunku z danego lotniska
#     Używa arrivalAirportIataCode=ANY aby znaleźć wszystkie możliwe destynacje
#     """
#     try:
#         # Użyj OneWay FareFinder z destinationIata=ANY
#         url = "https://www.ryanair.com/api/farfnd/v4/oneWayFares"
#
#         params = {
#             "departureAirportIataCode": departureAirportIataCode,
#             "arrivalAirportIataCode": "ANY",  # Kluczowe - wyszukuj dowolny kierunek
#             "outboundDepartureDateFrom": outboundDepartureDateFrom,
#             "outboundDepartureDateTo": outboundDepartureDateTo,
#             "outboundDepartureDaysOfWeek": "MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY,SUNDAY",
#             "outboundDepartureTimeFrom": "00:00",
#             "outboundDepartureTimeTo": "23:59",
#             "adultPaxCount": adultPaxCount,
#             "market": market,
#             "searchMode": searchMode
#         }
#
#         print(f"📊 Wywołuję ANY Destination API: {url}")
#         print(f"Parametry: {params}")
#
#         headers = {
#             "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
#             "Accept": "application/json, text/plain, */*",
#             "Accept-Language": "pl",
#             "Accept-Encoding": "gzip, deflate, br, zstd",
#             "client": "desktop",
#             "client-version": "0.0.22-alpha.2",
#             "dnt": "1",
#             "priority": "u=1, i",
#             "sec-ch-ua": '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
#             "sec-ch-ua-mobile": "?0",
#             "sec-ch-ua-platform": '"Windows"'
#         }
#
#         async with httpx.AsyncClient(timeout=30.0, http2=True) as client:
#             # Najpierw odwiedź stronę główną (ustanów sesję)
#             await client.get("https://www.ryanair.com/pl/pl", headers=headers)
#
#             # Teraz wywołaj API
#             response = await client.get(url, params=params, headers=headers)
#
#             print(f"Status code: {response.status_code}")
#
#             if response.status_code == 200:
#                 data = decode_response_content(response)
#                 print(f"📊 Otrzymano loty do {len(data.get('fares', []))} różnych destynacji")
#                 return data
#             else:
#                 print(f"Błąd ANY Destination response: {response.text}")
#                 return {"fares": []}
#
#     except Exception as e:
#         print(f"Błąd ANY Destination: {type(e).__name__}: {str(e)}")
#         return {"fares": []}


# ============================================
# AIRPORTS ENDPOINT (Lista lotnisk)
# ============================================

@app.get("/api/ryanair/airports")
async def get_airports(market: str = "pl"):
    """
    Pobiera listę wszystkich dostępnych lotnisk Ryanair
    Używa publicznego API Ryanair /api/views/locate/
    """
    try:
        url = f"https://www.ryanair.com/api/views/locate/5/airports/{market}"

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "pl",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "client": "desktop",
            "client-version": "0.0.22-alpha.2",
            "dnt": "1",
            "sec-ch-ua": '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"'
        }

        print(f"📊 Pobieram listę lotnisk: {url}")

        async with httpx.AsyncClient(timeout=15.0, http2=True) as client:
            response = await client.get(url, headers=headers)

            if response.status_code == 200:
                data = decode_response_content(response)
                print(f"📊 Otrzymano {len(data)} lotnisk")
                return data
            else:
                print(f"Błąd airports response: {response.status_code}")
                return []

    except Exception as e:
        print(f"Błąd pobierania lotnisk: {type(e).__name__}: {str(e)}")
        return []


@app.get("/api/ryanair/airport-categories")
async def get_airport_categories(market: str = "pl"):
    """
    Pobiera kategorie lotnisk (kraje, regiony itp.)
    """
    try:
        url = f"https://www.ryanair.com/api/views/locate/3/categories/{market}"

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "pl",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "client": "desktop",
            "client-version": "0.0.22-alpha.2",
            "dnt": "1",
            "sec-ch-ua": '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"'
        }

        print(f"📊 Pobieram kategorie lotnisk: {url}")

        async with httpx.AsyncClient(timeout=15.0, http2=True) as client:
            response = await client.get(url, headers=headers)

            if response.status_code == 200:
                data = decode_response_content(response)
                print(f"📊 Otrzymano kategorie lotnisk")
                return data
            else:
                print(f"Błąd categories response: {response.status_code}")
                return []

    except Exception as e:
        print(f"Błąd pobierania kategorii: {type(e).__name__}: {str(e)}")
        return []


# (Usunięto duplikat endpointu /api/ryanair/routes opartego na FareFinder -
# obecnie trasy są wyznaczane wyłącznie przez publiczne endpointy LOCATE/searchWidget,
# bez odpytywania cen.)


# ============================================
# AIRPORTS DATABASE - Synchronizacja i zarządzanie
# ============================================

@app.post("/api/ryanair/sync-airports")
async def sync_airports(market: str = "pl", db: Session = Depends(get_db)):
    """
    Synchronizuje bazę danych lotnisk z Ryanair API

    Pobiera wszystkie lotniska z API i zapisuje do PostgreSQL:
    - Tworzy/aktualizuje kraje (countries)
    - Tworzy/aktualizuje miasta (cities)
    - Tworzy/aktualizuje lotniska (airports)

    Parametry:
    - market: Rynek (domyślnie "pl") - pobiera lotniska dostępne dla tego rynku

    Zwraca statystyki synchronizacji
    """
    try:
        # 1. Pobierz dane z Ryanair API
        url = f"https://www.ryanair.com/api/views/locate/5/airports/{market}/active"

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "pl",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "client": "desktop",
            "client-version": "0.149.0 (desktop)",
            "dnt": "1",
            "sec-ch-ua": '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"'
        }

        print(f"🔄 Synchronizacja lotnisk z API: {url}")

        async with httpx.AsyncClient(timeout=30.0, http2=True) as client:
            response = await client.get(url, headers=headers)

            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Nie udało się pobrać lotnisk z API")

            airports_data = decode_response_content(response)

        print(f"📥 Pobrano {len(airports_data)} lotnisk z API")

        # 2. Statystyki
        stats = {
            "countries_added": 0,
            "countries_updated": 0,
            "cities_added": 0,
            "cities_updated": 0,
            "airports_added": 0,
            "airports_updated": 0,
            "errors": []
        }

        # 3. Przetwarzaj każde lotnisko
        for airport_data in airports_data:
            try:
                # Wyciągnij dane kraju
                country_data = airport_data.get("country", {})
                country_code = country_data.get("code", "").lower()

                if not country_code:
                    stats["errors"].append(f"Brak kodu kraju dla lotniska {airport_data.get('code')}")
                    continue

                # Sprawdź/dodaj kraj
                country = db.query(Country).filter(Country.code == country_code).first()
                if not country:
                    country = Country(
                        code=country_code,
                        iso3code=country_data.get("iso3code", ""),
                        name=country_data.get("name", ""),
                        currency=country_data.get("currency", "EUR"),
                        default_airport_code=country_data.get("defaultAirportCode"),
                        schengen=country_data.get("schengen", False)
                    )
                    db.add(country)
                    db.flush()  # Natychmiastowy zapis do bazy
                    stats["countries_added"] += 1
                else:
                    # Aktualizuj istniejący
                    country.iso3code = country_data.get("iso3code", country.iso3code)
                    country.name = country_data.get("name", country.name)
                    country.currency = country_data.get("currency", country.currency)
                    country.schengen = country_data.get("schengen", country.schengen)
                    stats["countries_updated"] += 1

                # Wyciągnij dane miasta
                city_data = airport_data.get("city", {})
                city_code = city_data.get("code", "").upper()
                city_name = city_data.get("name", "")

                if not city_code:
                    stats["errors"].append(f"Brak kodu miasta dla lotniska {airport_data.get('code')}")
                    continue

                # Sprawdź/dodaj miasto
                city = db.query(City).filter(City.code == city_code).first()
                if not city:
                    city = City(
                        code=city_code,
                        name=city_name,
                        country_code=country_code
                    )
                    db.add(city)
                    db.flush()  # Natychmiastowy zapis do bazy
                    stats["cities_added"] += 1
                else:
                    # Aktualizuj istniejące
                    city.name = city_name
                    city.country_code = country_code
                    stats["cities_updated"] += 1                # Wyciągnij dane lotniska
                airport_code = airport_data.get("code", "").upper()

                if not airport_code:
                    stats["errors"].append(f"Brak kodu IATA dla lotniska")
                    continue

                # Współrzędne
                coords = airport_data.get("coordinates", {})
                latitude = coords.get("latitude")
                longitude = coords.get("longitude")

                # Region
                region_data = airport_data.get("region", {})
                region_name = region_data.get("name") if region_data else None

                # Sprawdź/dodaj lotnisko
                airport = db.query(Airport).filter(Airport.code == airport_code).first()
                if not airport:
                    airport = Airport(
                        code=airport_code,
                        name=airport_data.get("name", ""),
                        seo_name=airport_data.get("seoName"),
                        city_code=city_code,
                        country_code=country_code,
                        latitude=latitude,
                        longitude=longitude,
                        region=region_name,
                        timezone=airport_data.get("timeZone"),
                        base=airport_data.get("base", False),
                        aliases=airport_data.get("aliases", []),
                        last_synced=datetime.now(timezone.utc)
                    )
                    db.add(airport)
                    stats["airports_added"] += 1
                else:
                    # Aktualizuj istniejące
                    airport.name = airport_data.get("name", airport.name)
                    airport.seo_name = airport_data.get("seoName", airport.seo_name)
                    airport.city_code = city_code
                    airport.country_code = country_code
                    airport.latitude = latitude
                    airport.longitude = longitude
                    airport.region = region_name
                    airport.timezone = airport_data.get("timeZone", airport.timezone)
                    airport.base = airport_data.get("base", airport.base)
                    airport.aliases = airport_data.get("aliases", airport.aliases)
                    airport.last_synced = datetime.now(timezone.utc)
                    stats["airports_updated"] += 1

            except Exception as e:
                error_msg = f"Błąd przetwarzania lotniska {airport_data.get('code', 'UNKNOWN')}: {str(e)}"
                stats["errors"].append(error_msg)
                print(f"❌ {error_msg}")

        # 4. Zapisz wszystkie zmiany
        db.commit()

        print(f"✅ Synchronizacja zakończona:")
        print(f"   Kraje: +{stats['countries_added']} ~{stats['countries_updated']}")
        print(f"   Miasta: +{stats['cities_added']} ~{stats['cities_updated']}")
        print(f"   Lotniska: +{stats['airports_added']} ~{stats['airports_updated']}")
        print(f"   Błędy: {len(stats['errors'])}")

        return {
            "success": True,
            "message": "Synchronizacja zakończona",
            "stats": stats,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Błąd synchronizacji: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Błąd synchronizacji: {str(e)}")


@app.get("/api/airports")
async def get_airports_from_db(
    country: Optional[str] = None,
    city: Optional[str] = None,
    base_only: bool = False,
    search: Optional[str] = None,
    limit: int = 1000,
    db: Session = Depends(get_db)
):
    """
    Pobiera lotniska z lokalnej bazy danych PostgreSQL

    Parametry filtrowania:
    - country: Kod kraju (np. "pl", "de") - zwraca tylko lotniska z tego kraju
    - city: Kod miasta (np. "WARSAW") - zwraca tylko lotniska z tego miasta
    - base_only: true - zwraca tylko lotniska bazowe Ryanair
    - search: Wyszukiwanie po nazwie lotniska lub miasta (case-insensitive)
    - limit: Maksymalna liczba wyników (domyślnie 1000)

    Zwraca listę lotnisk z pełnymi danymi (kraj, miasto, lokalizacja)
    """
    try:
        # Buduj query z JOIN do cities i countries
        query = db.query(Airport, City, Country).join(
            City, Airport.city_code == City.code
        ).join(
            Country, Airport.country_code == Country.code
        )

        # Filtruj po kraju
        if country:
            query = query.filter(Airport.country_code == country.lower())

        # Filtruj po mieście
        if city:
            query = query.filter(Airport.city_code == city.upper())

        # Tylko lotniska bazowe
        if base_only:
            query = query.filter(Airport.base == True)

        # Wyszukiwanie po nazwie
        if search:
            search_term = f"%{search.lower()}%"
            query = query.filter(
                (Airport.name.ilike(search_term)) |
                (City.name.ilike(search_term)) |
                (Country.name.ilike(search_term))
            )

        # Ogranicz wyniki
        query = query.limit(limit)

        # Wykonaj query
        results = query.all()

        # Formatuj wyniki
        airports_list = []
        for airport, city, country in results:
            airports_list.append({
                "code": airport.code,
                "name": airport.name,
                "seoName": airport.seo_name,
                "city": {
                    "code": city.code,
                    "name": city.name
                },
                "country": {
                    "code": country.code,
                    "name": country.name,
                    "currency": country.currency,
                    "schengen": country.schengen
                },
                "coordinates": {
                    "latitude": airport.latitude,
                    "longitude": airport.longitude
                } if airport.latitude and airport.longitude else None,
                "region": airport.region,
                "timezone": airport.timezone,
                "base": airport.base,
                "aliases": airport.aliases,
                "lastSynced": airport.last_synced.isoformat() if airport.last_synced else None
            })

        print(f"📊 Zwracam {len(airports_list)} lotnisk z bazy danych")

        return {
            "success": True,
            "count": len(airports_list),
            "airports": airports_list
        }

    except Exception as e:
        print(f"❌ Błąd pobierania lotnisk z bazy: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Błąd pobierania lotnisk: {str(e)}")


# ============================================
# AUTH ENDPOINTS
# ============================================

@app.post("/api/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """Rejestracja nowego użytkownika"""
    # Sprawdź czy email już istnieje
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email już zarejestrowany")

    # Utwórz użytkownika
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        name=user.name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


@app.post("/api/auth/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    """Logowanie użytkownika"""
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nieprawidłowy email lub hasło"
        )

    access_token = create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/api/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Pobierz dane zalogowanego użytkownika"""
    return current_user


# ============================================
# SEARCH HISTORY
# ============================================

@app.post("/api/search-history", response_model=SearchHistoryResponse, status_code=status.HTTP_201_CREATED)
def save_search(
    search: SearchHistoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Zapisz historię wyszukiwania"""
    db_search = SearchHistory(
        user_id=current_user.id,
        origin=search.origin,
        destination=search.destination,
        date_out=search.date_out,
        date_in=search.date_in,
        adults=search.adults,
        flights_found=search.flights_found,
        min_price=search.min_price,
        max_price=search.max_price,
        avg_price=search.avg_price
    )
    db.add(db_search)
    db.commit()
    db.refresh(db_search)

    return db_search


@app.get("/api/search-history", response_model=List[SearchHistoryResponse])
def get_search_history(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Pobierz historię wyszukiwań użytkownika"""
    searches = db.query(SearchHistory)\
        .filter(SearchHistory.user_id == current_user.id)\
        .order_by(SearchHistory.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()

    return searches


@app.delete("/api/search-history/{search_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_search(
    search_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Usuń wpis z historii"""
    search = db.query(SearchHistory).filter(
        SearchHistory.id == search_id,
        SearchHistory.user_id == current_user.id
    ).first()

    if not search:
        raise HTTPException(status_code=404, detail="Nie znaleziono wyszukiwania")

    db.delete(search)
    db.commit()


# ============================================
# PRICE ALERTS
# ============================================

@app.post("/api/price-alerts", response_model=PriceAlertResponse, status_code=status.HTTP_201_CREATED)
def create_alert(
    alert: PriceAlertCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Utwórz alert cenowy"""
    db_alert = PriceAlert(
        user_id=current_user.id,
        origin=alert.origin,
        destination=alert.destination,
        date_out=alert.date_out,
        max_price=alert.max_price,
        is_active=True
    )
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)

    return db_alert


@app.get("/api/price-alerts", response_model=List[PriceAlertResponse])
def get_alerts(
    active_only: bool = True,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Pobierz alerty cenowe użytkownika"""
    query = db.query(PriceAlert).filter(PriceAlert.user_id == current_user.id)

    if active_only:
        query = query.filter(PriceAlert.is_active == True)

    alerts = query.order_by(PriceAlert.created_at.desc()).all()
    return alerts


@app.patch("/api/price-alerts/{alert_id}/deactivate", response_model=PriceAlertResponse)
def deactivate_alert(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Dezaktywuj alert cenowy"""
    alert = db.query(PriceAlert).filter(
        PriceAlert.id == alert_id,
        PriceAlert.user_id == current_user.id
    ).first()

    if not alert:
        raise HTTPException(status_code=404, detail="Nie znaleziono alertu")

    alert.is_active = False
    db.commit()
    db.refresh(alert)

    return alert


@app.delete("/api/price-alerts/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_alert(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Usuń alert cenowy"""
    alert = db.query(PriceAlert).filter(
        PriceAlert.id == alert_id,
        PriceAlert.user_id == current_user.id
    ).first()

    if not alert:
        raise HTTPException(status_code=404, detail="Nie znaleziono alertu")

    db.delete(alert)
    db.commit()


# ============================================
# FAVORITE FLIGHTS
# ============================================

@app.post("/api/favorites", response_model=FavoriteFlightResponse, status_code=status.HTTP_201_CREATED)
def add_favorite(
    favorite: FavoriteFlightCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Dodaj lot do ulubionych"""
    # Sprawdź czy już nie istnieje
    existing = db.query(FavoriteFlight).filter(
        FavoriteFlight.user_id == current_user.id,
        FavoriteFlight.origin == favorite.origin,
        FavoriteFlight.destination == favorite.destination,
        FavoriteFlight.flight_date == favorite.flight_date,
        FavoriteFlight.flight_number == favorite.flight_number
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Ten lot jest już w ulubionych")

    db_favorite = FavoriteFlight(
        user_id=current_user.id,
        origin=favorite.origin,
        destination=favorite.destination,
        flight_date=favorite.flight_date,
        flight_number=favorite.flight_number,
        departure_time=favorite.departure_time,
        arrival_time=favorite.arrival_time,
        price=favorite.price,
        currency=favorite.currency
    )
    db.add(db_favorite)
    db.commit()
    db.refresh(db_favorite)

    return db_favorite


@app.get("/api/favorites", response_model=List[FavoriteFlightResponse])
def get_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Pobierz ulubione loty użytkownika"""
    favorites = db.query(FavoriteFlight)\
        .filter(FavoriteFlight.user_id == current_user.id)\
        .order_by(FavoriteFlight.flight_date.asc())\
        .all()

    return favorites


@app.delete("/api/favorites/{favorite_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_favorite(
    favorite_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Usuń lot z ulubionych"""
    favorite = db.query(FavoriteFlight).filter(
        FavoriteFlight.id == favorite_id,
        FavoriteFlight.user_id == current_user.id
    ).first()

    if not favorite:
        raise HTTPException(status_code=404, detail="Nie znaleziono ulubionego lotu")

    db.delete(favorite)
    db.commit()


# ============================================
# CACHE API - przechowywanie cache w PostgreSQL
# ============================================


@app.get("/api/ryanair/anyDestination")
async def search_any_destination(
    departureAirportIataCode: str = Query(..., alias="departureAirportIataCode"),
    outboundDepartureDateFrom: str = Query(..., alias="outboundDepartureDateFrom"),
    outboundDepartureDateTo: str = Query(..., alias="outboundDepartureDateTo"),
    adultPaxCount: int = Query(1, alias="adultPaxCount"),
    market: str = Query("pl-pl", alias="market"),
    searchMode: str = Query("ALL", alias="searchMode"),
    # 'confirm' parameter removed per user request
    minPrice: Optional[float] = Query(None, alias='minPrice'),
    maxPrice: Optional[float] = Query(None, alias='maxPrice')
):
    """
    Wyszukaj loty z danego lotniska do dowolnego kierunku (ANY destination)
    """
    import asyncio
    params = {
        "departureAirportIataCode": departureAirportIataCode,
        "arrivalAirportIataCode": "ANY",
        "outboundDepartureDateFrom": outboundDepartureDateFrom,
        "outboundDepartureDateTo": outboundDepartureDateTo,
        "adultPaxCount": adultPaxCount,
        "market": market,
        "searchMode": searchMode
    }
    """
    Wyszukaj loty z danego lotniska do dowolnego kierunku (ANY destination)
    """
    url = f"https://www.ryanair.com/api/farfnd/3/oneWayFares"
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            # Helper to filter fares and optionally confirm availability/price
            import asyncio
            sem = asyncio.Semaphore(5)
            async def check_fare(fare, allowed=None):
                """Lightweight check: apply filters and normalize prices; no Search API confirmation."""
                async with sem:
                    outbound = fare.get('outbound') or {}
                    dest = (outbound.get('arrivalAirport') or {}).get('iataCode') or (outbound.get('arrivalAirport') or {}).get('code') or ''
                    dest = (dest or '').upper()
                    price_obj = outbound.get('price')
                    price = None
                    try:
                        # Try to parse numeric amounts
                        if isinstance(price_obj, dict):
                            price = price_obj.get('value') or price_obj.get('amount')
                        elif isinstance(price_obj, (int, float)):
                            price = price_obj
                        elif isinstance(price_obj, str):
                            import re
                            m = re.search(r"([0-9]+(?:\.[0-9]+)?)", price_obj)
                            if m:
                                price = float(m.group(1))
                    except Exception:
                        price = None
                    if price is None or price == 0:
                        return None
                    # Normalize and convert price to PLN and compare against minPrice (PLN)
                    try:
                        fare = ensure_fare_prices(fare)
                        price_pln = fare.get('outbound', {}).get('price', {}).get('priceInPLN')
                        if (price_pln is None) and isinstance(price, (int, float)):
                            # fallback: convert using currency from price_obj
                            currency = (price_obj.get('currencyCode') if isinstance(price_obj, dict) else None) or (price_obj.get('currency') if isinstance(price_obj, dict) else None) or 'PLN'
                            price_pln = convert_to_pln(price, currency)
                    except Exception:
                        price_pln = None
                    if minPrice is not None:
                        try:
                            if price_pln is None or float(price_pln) < float(minPrice):
                                return None
                        except Exception:
                            return None
                    if maxPrice is not None:
                        try:
                            if price_pln is None or float(price_pln) > float(maxPrice):
                                return None
                        except Exception:
                            return None
                    if allowed is not None and dest not in allowed:
                        return None
                    return fare


            response = await safe_get(client, url, params=params)
            response.raise_for_status()
            data = response.json()
            # Jeśli są wyniki, zwróć je od razu
            if data.get("fares"):
                # Pobierz listę realnych tras dla origin (locate) - aby przefiltrować nierealne destynacje
                lang = (market.split('-')[0] or 'pl').lower()
                locate_url = f"https://www.ryanair.com/api/views/locate/3/airports/{lang}/active"
                try:
                    lr = await safe_get(client, locate_url)
                    lr.raise_for_status()
                    airports_data = decode_response_content(lr)
                    def ai_code(a):
                        return (a.get('iataCode') or a.get('code') or '').upper()
                    def extract_routes(a):
                        out = []
                        for r in (a.get('routes') or []):
                            if isinstance(r, str) and r.startswith('airport:'):
                                code = r.split(':',1)[1].strip().upper()
                                if len(code) == 3:
                                    out.append(code)
                        return out
                    allowed = set()
                    if isinstance(airports_data, list):
                        origin_entry = next((a for a in airports_data if ai_code(a) == departureAirportIataCode.upper()), None)
                        if origin_entry:
                            allowed.update(extract_routes(origin_entry))
                except Exception:
                    allowed = None

                fares = data.get('fares') or []
                # filtruj i opcjonalnie potwierdzaj
                import asyncio
                sem = asyncio.Semaphore(5)
                async def check_fare(fare, allowed=None):
                    async with sem:
                        outbound = fare.get('outbound') or {}
                        dest = (outbound.get('arrivalAirport') or {}).get('iataCode') or (outbound.get('arrivalAirport') or {}).get('code') or ''
                        dest = (dest or '').upper()
                        price_obj = outbound.get('price')
                        price = None
                        if isinstance(price_obj, dict):
                            price = price_obj.get('value')
                        elif isinstance(price_obj, (int, float)):
                            price = price_obj
                        if price is None or price == 0:
                            return None
                        # Normalize and convert price to PLN and compare against minPrice (PLN)
                        try:
                            fare = ensure_fare_prices(fare)
                            price_pln = fare.get('outbound', {}).get('price', {}).get('priceInPLN')
                            if (price_pln is None) and isinstance(price, (int, float)):
                                currency = (price_obj.get('currencyCode') if isinstance(price_obj, dict) else None) or (price_obj.get('currency') if isinstance(price_obj, dict) else None) or 'PLN'
                                price_pln = convert_to_pln(price, currency)
                        except Exception:
                            price_pln = None
                        # Filter against minPrice (lower bound) and maxPrice (upper bound)
                        if minPrice is not None:
                            try:
                                if price_pln is None or float(price_pln) < float(minPrice):
                                    return None
                            except Exception:
                                return None
                        if maxPrice is not None:
                            try:
                                if price_pln is None or float(price_pln) > float(maxPrice):
                                    return None
                            except Exception:
                                return None
                        if allowed is not None and dest not in allowed:
                            return None
                        # No Search API confirmation: normalize price and return fare
                        return fare
                        # No Search API confirmation here - keep fare as-is after normalization

                tasks = [check_fare(f) for f in fares]
                results = await asyncio.gather(*tasks)
                # Confirmation removed: return all normalized fares
                filtered = [r for r in results if r]
                return {'fares': filtered}
            # Fallback: jeśli brak wyników, spróbuj iterować po wszystkich destynacjach
            print("⚠️ Brak wyników dla ANY, fallback na iterację po destynacjach")

            # Pobierz realne destynacje z /api/views/locate/3/airports/{lang}/active
            lang = (market.split('-')[0] or 'pl').lower()
            locate_url = f"https://www.ryanair.com/api/views/locate/3/airports/{lang}/active"
            try:
                print(f"🔎 Pobieram realne trasy z {locate_url}")
                resp = await safe_get(client, locate_url)
                resp.raise_for_status()
                airports_data = decode_response_content(resp)
            except Exception as e:
                print(f"❌ Błąd pobierania lotnisk z {locate_url}: {e}")
                return {"fares": []}

            def get_airport_code(apt):
                return (apt.get("iataCode") or apt.get("code") or "").upper()

            def extract_routes_for(apt):
                out = []
                for r in (apt.get("routes") or []):
                    if isinstance(r, str) and r.startswith("airport:"):
                        code = r.split(":", 1)[1].strip().upper()
                        if len(code) == 3:
                            out.append(code)
                return out

            origin = departureAirportIataCode.upper()
            destinations = set()
            if isinstance(airports_data, list):
                origin_entry = next((a for a in airports_data if get_airport_code(a) == origin), None)
                if origin_entry:
                    routes = extract_routes_for(origin_entry)
                    if routes:
                        destinations.update(routes)
                        print(f"✅ Znaleziono trasy dla {origin}: {', '.join(routes[:5])}{'...' if len(routes) > 5 else ''}")
                    else:
                        print(f"⚠️ {origin} ma pusty routes array")
            if not destinations:
                print(f"⚠️ Brak destynacji do sprawdzenia dla {departureAirportIataCode}")
                return {"fares": []}

            fares = []
            sem = asyncio.Semaphore(5)  # max 5 równoległych zapytań
            async def fetch_fare(dest):
                async with sem:
                    params2 = params.copy()
                    params2["arrivalAirportIataCode"] = dest
                    try:
                        fare_resp = await safe_get(client, url, params=params2)
                        fare_resp.raise_for_status()
                        fare_data = fare_resp.json()
                        if fare_data.get("fares"):
                            return fare_data["fares"]
                    except Exception as e:
                        print(f"❌ Błąd pobierania fare dla {dest}: {e}")
                    # If FareFinder returned no fares, we do not fall back to Search API; just return empty
                    return []
            tasks = [fetch_fare(dest) for dest in destinations]
            results = await asyncio.gather(*tasks)
            for fares_list in results:
                fares.extend(fares_list)
            # Apply same filtering/confirmation on fallback results
            check_tasks = [check_fare(f, allowed=destinations) for f in fares]
            check_results = await asyncio.gather(*check_tasks)
            # Confirmation removed - return all valid fares
            filtered = [r for r in check_results if r]
            return {"fares": filtered}
    except Exception as e:
        print(f"❌ Błąd search_any_destination: {e}")
        raise HTTPException(status_code=500, detail=f"Błąd wyszukiwania: {e}")
        if exp > now:
            age_seconds = int((now - created).total_seconds())
            resp = {
                "data": mem["data"],
                "age_seconds": age_seconds,
                "created_at": created.isoformat(),
                "expires_at": exp.isoformat()
            }
            print(f"[CACHE][GET][MEM] HIT key={cache_key} age={age_seconds}s")
            return resp

    return {"data": None}


@app.post("/api/cache")
def save_cache(
    payload: dict = Body(...),
    request: Request = None,
    response: Response = None,
    db: Session = Depends(get_db)
):
    # CORS headers
    if request is not None and response is not None:
        origin = request.headers.get("origin")
        if origin:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Vary"] = "Origin"
            response.headers["Access-Control-Allow-Credentials"] = "true"
    """
    Zapisz dane do cache z określonym TTL (w sekundach).
    Jeśli klucz już istnieje, aktualizuje dane i TTL.
    """
    # Wyciągnij pola z payload
    cache_key = payload.get("cache_key")
    data = payload.get("data")
    ttl = int(payload.get("ttl", 3600))

    if not cache_key or data is None:
        raise HTTPException(status_code=400, detail="'cache_key' i 'data' są wymagane")

    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(seconds=ttl)
    print(f"[CACHE][SAVE] key={cache_key} ttl={ttl}s")

    # Sprawdź czy już istnieje
    try:
        existing = db.query(FlightCache).filter(FlightCache.cache_key == cache_key).first()

        if existing:
            # Aktualizuj istniejący
            existing.data = data
            existing.created_at = now
            existing.expires_at = expires_at
        else:
            # Utwórz nowy
            new_cache = FlightCache(
                cache_key=cache_key,
                data=data,
                expires_at=expires_at
            )
            db.add(new_cache)

        db.commit()
        print(f"[CACHE][SAVE][DB] OK key={cache_key}")
    except Exception:
        # Fallback do pamięci w razie błędu DB
        MEMORY_CACHE[cache_key] = {
            "data": data,
            "created_at": now,
            "expires_at": expires_at
        }
        print(f"[CACHE][SAVE][MEM] OK key={cache_key}")

    return {"status": "saved", "cache_key": cache_key, "expires_at": expires_at.isoformat()}


@app.get("/api/cache/{cache_key}")
def get_cache(cache_key: str, request: Request, response: Response, db: Session = Depends(get_db)):
    """Pobierz wpis z cache po kluczu (dla frontendu)"""
    origin = request.headers.get("origin")
    if origin:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Vary"] = "Origin"
        response.headers["Access-Control-Allow-Credentials"] = "true"
    # Najpierw DB
    try:
        cache_entry = db.query(FlightCache).filter(FlightCache.cache_key == cache_key).first()
        if cache_entry:
            now = datetime.now(timezone.utc)
            created = cache_entry.created_at or now
            age_seconds = int((now - created).total_seconds())
            return {
                "data": cache_entry.data,
                "expires_at": cache_entry.expires_at,
                "created_at": created.isoformat(),
                "age_seconds": age_seconds
            }
    except Exception:
        pass
    # Potem pamięć
    mem = MEMORY_CACHE.get(cache_key)
    if mem:
        try:
            now = datetime.now(timezone.utc)
            created = mem.get("created_at") or now
            if isinstance(created, str):
                # If stored as isoformat string
                try:
                    from datetime import datetime as _dt
                    created = _dt.fromisoformat(created)
                except Exception:
                    created = now
            age_seconds = int((now - created).total_seconds())
        except Exception:
            age_seconds = 0
        return {"data": mem["data"], "expires_at": mem["expires_at"], "created_at": mem.get("created_at"), "age_seconds": age_seconds}
    raise HTTPException(status_code=404, detail="Cache entry not found")

@app.delete("/api/cache/{cache_key}")
def delete_cache(
    cache_key: str,
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """Usuń wpis z cache (opcjonalne, do debugowania)"""
    origin = request.headers.get("origin")
    if origin:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Vary"] = "Origin"
        response.headers["Access-Control-Allow-Credentials"] = "true"
    try:
        cache_entry = db.query(FlightCache).filter(FlightCache.cache_key == cache_key).first()

        if cache_entry:
            db.delete(cache_entry)
            db.commit()
            return {"status": "deleted"}
    except Exception:
        pass

    # Usuń z pamięci (nawet jeśli DB nie działa)
    if cache_key in MEMORY_CACHE:
        del MEMORY_CACHE[cache_key]
        return {"status": "deleted"}

    raise HTTPException(status_code=404, detail="Cache entry not found")


@app.delete("/api/cache")
def clear_expired_cache(request: Request, response: Response, db: Session = Depends(get_db)):
    """Wyczyść wygasłe wpisy z cache (cron job)"""
    origin = request.headers.get("origin")
    if origin:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Vary"] = "Origin"
        response.headers["Access-Control-Allow-Credentials"] = "true"
    deleted_count = 0
    try:
        now = datetime.now(timezone.utc)
        deleted_count = db.query(FlightCache).filter(
            FlightCache.expires_at <= now
        ).delete()
        db.commit()
    except Exception:
        pass

    # Wyczyść pamięć
    now = datetime.now(timezone.utc)
    mem_keys = [k for k, v in MEMORY_CACHE.items() if v.get("expires_at") and v["expires_at"] <= now]
    for k in mem_keys:
        del MEMORY_CACHE[k]
        deleted_count += 1

    return {"status": "cleared", "deleted_count": deleted_count}


@app.delete("/api/cache/prefix/{prefix}")
def delete_cache_prefix(prefix: str, request: Request, response: Response, db: Session = Depends(get_db)):
    """Usuń wszystkie wpisy cache zaczynające się od podanego prefixu.
    Zabezpieczone przez nagłówek X-Admin-Secret.
    Używaj ostrożnie — przydatne do czyszczenia cache dev/qa.
    """
    origin = request.headers.get("origin")
    if origin:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Vary"] = "Origin"
        response.headers["Access-Control-Allow-Credentials"] = "true"

    token = request.headers.get("X-Admin-Secret")
    expected = os.environ.get("CACHE_ADMIN_SECRET")
    if not expected:
        # Default dev token
        expected = 'dev-secret'

    if token != expected:
        raise HTTPException(status_code=401, detail="Unauthorized: X-Admin-Secret missing or invalid")

    deleted = 0
    try:
        q = db.query(FlightCache).filter(FlightCache.cache_key.like(f"{prefix}%"))
        deleted += q.delete(synchronize_session=False)
        db.commit()
    except Exception as e:
        print(f"⚠️ Error deleting DB cache prefix={prefix}: {e}")
        db.rollback()

    # clear memory cache keys
    mem_keys = [k for k in list(MEMORY_CACHE.keys()) if k.startswith(prefix)]
    for k in mem_keys:
        del MEMORY_CACHE[k]
        deleted += 1

    print(f"[CACHE][DELETE_PREFIX] prefix={prefix} deleted_count={deleted}")
    return {"status": "deleted", "deleted_count": deleted}


@app.get("/api/cache/dev/clear_ryanair")
def clear_ryanair_cache_dev(request: Request, response: Response, db: Session = Depends(get_db)):
    """Dev-only endpoint: Clear all cache keys that start with 'ryanair_'.
    Allowed only from loopback addresses to reduce accidental exposure.
    """
    origin = request.headers.get("origin")
    if origin:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Vary"] = "Origin"
        response.headers["Access-Control-Allow-Credentials"] = "true"
    client_ip = request.client.host if request.client else None
    if client_ip not in ("127.0.0.1", "::1"):
        raise HTTPException(status_code=403, detail="Forbidden - dev endpoint only accessible locally")

    prefix = "ryanair_"
    deleted = 0
    try:
        q = db.query(FlightCache).filter(FlightCache.cache_key.like(f"{prefix}%"))
        deleted += q.delete(synchronize_session=False)
        db.commit()
    except Exception as e:
        print(f"⚠️ Error deleting DB cache prefix={prefix}: {e}")
        db.rollback()

    mem_keys = [k for k in list(MEMORY_CACHE.keys()) if k.startswith(prefix)]
    for k in mem_keys:
        del MEMORY_CACHE[k]
        deleted += 1

    print(f"[CACHE][DEV_DELETE] prefix={prefix} deleted_count={deleted}")
    return {"status": "deleted", "deleted_count": deleted}


# ============================================
# HEALTH CHECK
# ============================================

@app.get("/")
def root():
    return {
        "status": "running",
        "service": "Flight Search API",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
