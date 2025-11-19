// src/api/ryanair.js
var BACKEND_API = (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace(/\/+$/, "");
var BACKEND_ROOT = BACKEND_API.replace(/\/api$/, "");
var RYANAIR_BLOCK_KEY = "ryanair_hard_blocked";
var _ryanairState = {
  blocked: false,
  chain: Promise.resolve(),
  errorsInRow: 0
};
try {
  const persisted = localStorage.getItem(RYANAIR_BLOCK_KEY);
  if (persisted === "true") {
    _ryanairState.blocked = true;
    console.warn("\u{1F6D1} Ryanair API w stanie BLOKADY (przywr\xF3cono z localStorage). Wstrzymuj\u0119 wszystkie wywo\u0142ania do czasu r\u0119cznego resetu.");
  }
} catch {
}
function _markRyanairBlocked(reason = "Wykryto blokad\u0119 po stronie Ryanair", status) {
  _ryanairState.blocked = true;
  try {
    localStorage.setItem(RYANAIR_BLOCK_KEY, "true");
  } catch {
  }
  const err = new Error(`Ryanair zablokowa\u0142 ruch API. ${reason}. Zresetuj router i kliknij \u201EOdblokuj\u201D w aplikacji.`);
  err.name = "RyanairHardBlockError";
  err.hardBlocked = true;
  if (status) err.status = status;
  console.warn("\u{1F6D1} [HARD BLOCK] Zatrzymuj\u0119 wszystkie zapytania do /ryanair/* a\u017C do r\u0119cznego resetu.", { status });
  throw err;
}
function _isRyanairUrl(url) {
  try {
    const u = typeof url === "string" ? new URL(url, window.location.origin) : url;
    return typeof url === "string" ? url.includes("/ryanair/") : (u.pathname || "").includes("/ryanair/");
  } catch {
    return String(url).includes("/ryanair/");
  }
}
var _activeRequests = 0;
var _waitingResolvers = [];
async function _enqueue(fn) {
  if (_ryanairState.blocked) {
    return _markRyanairBlocked("Stan blokady aktywny");
  }
  await new Promise((resolve) => {
    const tryTake = () => {
      if (_ryanairState.blocked) return resolve(_markRyanairBlocked("Stan blokady aktywny"));
      const max = RATE_LIMIT_CONFIG.maxParallelRequests || 1;
      if (_activeRequests < max) {
        _activeRequests++;
        return resolve();
      }
      _waitingResolvers.push(tryTake);
    };
    tryTake();
  });
  try {
    await smartDelay();
    return await fn();
  } finally {
    _activeRequests = Math.max(0, _activeRequests - 1);
    const next = _waitingResolvers.shift();
    if (next) next();
  }
}
function isRyanairBlocked() {
  return !!_ryanairState.blocked;
}
function getRyanairLimiterStatus() {
  return {
    blocked: _ryanairState.blocked,
    errorsInRow: _ryanairState.errorsInRow,
    note: "Globalna kolejka + mi\u0119kki delay 600\xB1200ms; CB po 3x 429/409/403"
  };
}
function resetRyanairLimiter() {
  _ryanairState.blocked = false;
  try {
    localStorage.removeItem(RYANAIR_BLOCK_KEY);
  } catch {
  }
  console.log("\u2705 Odblokowano limiter Ryanair (r\u0119czny reset).");
}
async function safeRyanairFetch(url, options = {}) {
  if (!_isRyanairUrl(url)) {
    return fetch(url, options);
  }
  return _enqueue(async () => {
    if (_ryanairState.blocked) {
      return _markRyanairBlocked("Stan blokady aktywny");
    }
    let attempt = 0;
    while (true) {
      const res = await fetch(url, options);
      if (res && (res.status === 429 || res.status === 409 || res.status === 403)) {
        _ryanairState.errorsInRow += 1;
        if (_ryanairState.errorsInRow >= 3) {
          _markRyanairBlocked(`HTTP ${res.status}`, res.status);
        }
        if (attempt < (RATE_LIMIT_CONFIG.maxRetries || 0)) {
          attempt += 1;
          await new Promise((r) => setTimeout(r, RATE_LIMIT_CONFIG.retryDelay || 2e3));
          continue;
        }
        return res;
      }
      if (res && res.ok) {
        _ryanairState.errorsInRow = 0;
      }
      try {
        if (res && res.ok && res.headers.get("content-type")?.includes("application/json")) {
          const cloned = res.clone();
          const body = await cloned.json().catch(() => null);
          if (body && (body.error?.includes?.("blocked") || body.message?.includes?.("blocked"))) {
            _ryanairState.errorsInRow += 1;
            if (_ryanairState.errorsInRow >= 3) {
              _markRyanairBlocked("Odpowied\u017A API sygnalizuje blokad\u0119");
            }
          }
        }
      } catch {
      }
      return res;
    }
  });
}
async function ensureBackendUp() {
  try {
    const res = await fetch(`${BACKEND_ROOT}/health`, { method: "GET" });
    if (!res.ok) throw new Error(`Backend health ${res.status}`);
    return true;
  } catch (e) {
    console.error("Backend (cache/proxy) niedost\u0119pny:", e);
    throw new Error("Backend niedost\u0119pny \u2013 w\u0142\u0105cz serwer (http://localhost:8000) zanim zaczniesz szuka\u0107.");
  }
}
async function debugCheckPair({ origin, destination, outDate, inDate, returnAirport, adults = 1, maxPrice = 9999 }) {
  const MET = { apiCalls: 0, fareFinderCalls: 0 };
  const cachedOut = await getFlightsFromCache(origin, destination, outDate, adults);
  let outFlights = cachedOut !== null ? cachedOut.map((f) => ({ ...f, source: "CACHE" })) : null;
  if (!outFlights) {
    MET.apiCalls += 1;
    outFlights = (await searchFlights({ origin, destination, dateOut: outDate, adults }, MET)).map((f) => ({ ...f, source: "API" }));
  }
  const cachedIn = await getFlightsFromCache(destination, returnAirport, inDate, adults);
  let inFlights = cachedIn !== null ? cachedIn.map((f) => ({ ...f, source: "CACHE" })) : null;
  if (!inFlights) {
    MET.apiCalls += 1;
    inFlights = (await searchFlights({ origin: destination, destination: returnAirport, dateOut: inDate, adults }, MET)).map((f) => ({ ...f, source: "API" }));
  }
  const debugOut = outFlights.filter((f) => f.priceInPLN != null && f.departure && f.arrival);
  const debugIn = inFlights.filter((f) => f.priceInPLN != null && f.departure && f.arrival);
  const results = [];
  for (const out of debugOut) {
    for (const inbound of debugIn) {
      const outArrival = /* @__PURE__ */ new Date(`${out.date}T${out.arrival}:00`);
      const inDeparture = /* @__PURE__ */ new Date(`${inbound.date}T${inbound.departure}:00`);
      const diffH = (inDeparture - outArrival) / (1e3 * 60 * 60);
      const total = (out.priceInPLN || 0) + (inbound.priceInPLN || 0);
      const reasons = [];
      if (diffH < 7) reasons.push("czas<7h");
      if (total > maxPrice) reasons.push("cena>max");
      const stayDays = Math.round((new Date(inbound.date) - new Date(out.date)) / (1e3 * 60 * 60 * 24)) + 1;
      if (stayDays < 1) reasons.push("pobyt<1");
      results.push({ outbound: out, inbound, totalPriceInPLN: total, timeDiffHours: diffH, stayDays, accepted: reasons.length === 0, reasons });
    }
  }
  const accepted = results.filter((r) => r.accepted);
  const rejected = results.filter((r) => !r.accepted);
  console.log(`\u{1F50D} debugCheckPair: ${origin}->${destination} ${outDate} + ${destination}->${returnAirport} ${inDate}`);
  console.log(`   Out flights: ${debugOut.length}, In flights: ${debugIn.length}, Total pairs: ${results.length}`);
  console.log(`   Accepted: ${accepted.length}, Rejected: ${rejected.length}`);
  rejected.slice(0, 20).forEach((r) => console.log(`   \u274C Rejected: ${r.outbound.date} ${r.outbound.arrival} + ${r.inbound.date} ${r.inbound.departure} -> ${r.totalPriceInPLN} PLN; outPrice=${r.outbound.priceInPLN} (${r.outbound.price} ${r.outbound.currency}), inPrice=${r.inbound.priceInPLN} (${r.inbound.price} ${r.inbound.currency}); reasons: ${r.reasons.join(", ")}`));
  accepted.slice(0, 20).forEach((r) => console.log(`   \u2705 Accepted: ${r.outbound.date} ${r.outbound.arrival} + ${r.inbound.date} ${r.inbound.departure} -> ${r.totalPriceInPLN} PLN; outPrice=${r.outbound.priceInPLN} (${r.outbound.price} ${r.outbound.currency}), inPrice=${r.inbound.priceInPLN} (${r.inbound.price} ${r.inbound.currency}); legSources: ${r.outbound.source}/${r.inbound.source}`));
  return { MET, accepted, rejected, results };
}
if (typeof window !== "undefined") {
  window.debugCheckPair = debugCheckPair;
}
var CACHE_DURATION = 60 * 60 * 1e3;
var CACHE_KEY_PREFIX = "ryanair_fare_cache_";
var FLIGHT_CACHE_PREFIX = "ryanair_flight_cache_";
var LAST_METRICS = null;
function getLastMetrics() {
  return LAST_METRICS;
}
var RATE_LIMIT_CONFIG = {
  baseDelay: 300,
  // Podstawowe opóźnienie 300ms między requestami (szybsze domyślnie)
  jitterRange: 200,
  // Losowy jitter ±200ms (200-600ms total)
  retryDelay: 2e3,
  // Opóźnienie po błędzie 409/429
  maxRetries: 2,
  // Maksymalna liczba prób przy błędzie
  maxParallelRequests: 6
  // Maksymalna liczba równoległych requestów do Ryanair (sterowana przez semaphore)
};
function configureRateLimit(config) {
  if (config.baseDelay !== void 0) RATE_LIMIT_CONFIG.baseDelay = config.baseDelay;
  if (config.jitterRange !== void 0) RATE_LIMIT_CONFIG.jitterRange = config.jitterRange;
  if (config.retryDelay !== void 0) RATE_LIMIT_CONFIG.retryDelay = config.retryDelay;
  if (config.maxRetries !== void 0) RATE_LIMIT_CONFIG.maxRetries = config.maxRetries;
  if (config.maxParallelRequests !== void 0) RATE_LIMIT_CONFIG.maxParallelRequests = config.maxParallelRequests;
  if (config.maxParallelRequests !== void 0) console.log("\u2699\uFE0F Rate limit parallelism updated:", RATE_LIMIT_CONFIG.maxParallelRequests);
  console.log("\u2699\uFE0F Rate limit config updated:", RATE_LIMIT_CONFIG);
}
async function smartDelay(isRetry = false) {
  const jitter = Math.random() * RATE_LIMIT_CONFIG.jitterRange * 2 - RATE_LIMIT_CONFIG.jitterRange;
  const delay = isRetry ? RATE_LIMIT_CONFIG.retryDelay : RATE_LIMIT_CONFIG.baseDelay + jitter;
  await new Promise((resolve) => setTimeout(resolve, Math.max(100, delay)));
}
function createMetrics() {
  return {
    apiCalls: 0,
    // łączna liczba zapytań HTTP do backendu
    fareFinderCalls: 0,
    // ile z nich to wywołania FareFinder
    totalDays: 0,
    // ile dni analizowaliśmy w sumie
    daysFromCache: 0,
    // ile dni poszło z cache (bez HTTP)
    daysFetched: 0
    // ile dni pobrano z API
  };
}
function timeStrToMinutes(t) {
  if (!t || typeof t !== "string") return null;
  const parts = t.split(":");
  if (parts.length !== 2) return null;
  const hh = parseInt(parts[0], 10);
  const mm = parseInt(parts[1], 10);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  return hh * 60 + mm;
}
function isTimeBetween(timeStr, fromStr, toStr) {
  if (!timeStr) return false;
  const t = timeStrToMinutes(timeStr);
  if (t === null) return false;
  const from = timeStrToMinutes(fromStr || "00:00");
  const to = timeStrToMinutes(toStr || "23:59");
  if (from === null || to === null) return false;
  if (from <= to) {
    return t >= from && t <= to;
  } else {
    return t >= from || t <= to;
  }
}
function applyTimeFiltersToFlights(flights, filters = {}) {
  if (!filters) return flights;
  const { departureFrom, departureTo, arrivalFrom, arrivalTo } = filters;
  if (!departureFrom && !departureTo && !arrivalFrom && !arrivalTo) return flights;
  return flights.filter((f) => {
    const depOk = departureFrom || departureTo ? isTimeBetween(f.departure, departureFrom, departureTo) : true;
    const arrOk = arrivalFrom || arrivalTo ? isTimeBetween(f.arrival, arrivalFrom, arrivalTo) : true;
    return depOk && arrOk;
  });
}
function isDateMatchingDays(dateStr, daysArray) {
  if (!daysArray || daysArray.length !== 7) return true;
  const d = new Date(dateStr);
  if (!d || Number.isNaN(d.getTime())) return true;
  const dow = d.getDay();
  const idx = dow === 0 ? 6 : dow - 1;
  return !!daysArray[idx];
}
function daysArrayToWeekdayList(daysArray) {
  if (!Array.isArray(daysArray) || daysArray.length !== 7) return null;
  const names = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
  const sel = [];
  for (let i = 0; i < 7; i++) if (daysArray[i]) sel.push(names[i]);
  return sel.length > 0 ? sel.join(",") : null;
}
function getCacheKey(params) {
  const { origin, destination, dateFrom, dateTo, tripType = "oneway", adults = 1 } = params;
  return `${CACHE_KEY_PREFIX}${origin}-${destination}-${dateFrom}-${dateTo}-${tripType}-${adults}`;
}
function getFlightCacheKey(origin, destination, date, adults = 1) {
  return `${FLIGHT_CACHE_PREFIX}${origin}-${destination}-${date}-${adults}`;
}
async function getFlightsFromCache(origin, destination, date, adults = 1) {
  try {
    const cacheKey = getFlightCacheKey(origin, destination, date, adults);
    const response = await fetch(`${BACKEND_API}/cache/${encodeURIComponent(cacheKey)}`);
    const result = await response.json();
    if (!result.data) {
      return null;
    }
    const flights = result.data.flights || result.data;
    if (Array.isArray(flights)) {
      return flights.map((f) => ({
        ...f,
        source: f.source || "CACHE",
        origin: f.origin || origin,
        destination: f.destination || destination,
        originName: f.originName || null,
        destinationName: f.destinationName || null
      }));
    }
    return flights;
  } catch (e) {
    console.warn("B\u0142\u0105d odczytu cache lot\xF3w:", e);
    return null;
  }
}
async function saveFlightsToCache(origin, destination, date, flights, adults = 1) {
  try {
    const cacheKey = getFlightCacheKey(origin, destination, date, adults);
    const res = await fetch(`${BACKEND_API}/cache`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cache_key: cacheKey,
        data: { flights },
        ttl: 86400
        // 24 godziny
      })
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      console.warn("B\u0142\u0105d zapisu cache lot\xF3w (HTTP):", res.status, t);
    } else {
      console.log(`\u{1F4BE} [API] Zapisano loty do cache: ${cacheKey} (${flights?.length || 0})`);
    }
  } catch (e) {
    console.warn("B\u0142\u0105d zapisu cache lot\xF3w:", e);
  }
}
async function getFromCache(cacheKey) {
  try {
    console.log(`\u{1F50D} Sprawdzam cache dla klucza: ${cacheKey}`);
    const response = await fetch(`${BACKEND_API}/cache/${encodeURIComponent(cacheKey)}`);
    if (!response.ok && response.status >= 500) {
      throw new Error(`Cache backend error ${response.status}`);
    }
    const result = await response.json();
    if (!result.data) {
      console.log("\u274C Brak danych w cache");
      return null;
    }
    const ageSeconds = result.age_seconds || 0;
    const ageMinutes = Math.round(ageSeconds / 60);
    console.log(`\u{1F4E6} Znaleziono w cache (wiek: ${ageMinutes} min, limit: ${Math.round(CACHE_DURATION / 6e4)} min)`);
    const pricesMap = new Map(result.data.prices);
    console.log(`\u2705 Cache aktualny - zwracam ${pricesMap.size} pozycji`);
    return { data: pricesMap, age_seconds: ageSeconds };
  } catch (e) {
    console.warn("B\u0142\u0105d odczytu cache:", e);
    return null;
  }
}
async function saveToCache(cacheKey, pricesMap) {
  try {
    const res = await fetch(`${BACKEND_API}/cache`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cache_key: cacheKey,
        data: { prices: Array.from(pricesMap.entries()) },
        ttl: 3600
        // 1 godzina
      })
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      console.warn("B\u0142\u0105d zapisu cache (HTTP):", res.status, t);
    } else {
      console.log(`\u{1F4BE} [API] Zapisano do cache: ${cacheKey} (${pricesMap.size} pozycji)`);
    }
  } catch (e) {
    console.warn("B\u0142\u0105d zapisu cache:", e);
  }
}
var EXCHANGE_RATES = {
  PLN: 1,
  EUR: 4.35,
  // Fallback - będzie zaktualizowane z NBP
  GBP: 5.15,
  USD: 4.05,
  CZK: 0.18,
  HUF: 0.011,
  SEK: 0.39,
  NOK: 0.38,
  DKK: 0.58
};
async function fetchExchangeRates() {
  try {
    console.log("Pobieram kursy walut z NBP...");
    const response = await fetch("https://api.nbp.pl/api/exchangerates/tables/A?format=json");
    if (!response.ok) {
      throw new Error(`NBP API error: ${response.status}`);
    }
    const data = await response.json();
    const rates = data[0].rates;
    const newRates = { PLN: 1 };
    rates.forEach((rate) => {
      newRates[rate.code] = rate.mid;
    });
    try {
      const responseB = await fetch("https://api.nbp.pl/api/exchangerates/tables/B?format=json");
      if (responseB.ok) {
        const dataB = await responseB.json();
        const ratesB = dataB[0].rates;
        ratesB.forEach((rate) => {
          newRates[rate.code] = rate.mid;
        });
      }
    } catch (err) {
      console.log("Tabela B (waluty egzotyczne) niedost\u0119pna");
    }
    EXCHANGE_RATES = newRates;
    console.log("Kursy walut zaktualizowane z NBP:", EXCHANGE_RATES);
    return EXCHANGE_RATES;
  } catch (error) {
    console.error("B\u0142\u0105d pobierania kurs\xF3w z NBP:", error);
    console.log("U\u017Cywam kurs\xF3w domy\u015Blnych");
    return EXCHANGE_RATES;
  }
}
fetchExchangeRates();
setInterval(fetchExchangeRates, 60 * 60 * 1e3);
function convertToPLN(amount, currency) {
  if (!amount || !currency) return null;
  const rate = EXCHANGE_RATES[currency.toUpperCase()] || 1;
  return Math.round(amount * rate * 100) / 100;
}
async function searchFlights(params, metrics) {
  const {
    origin,
    destination,
    dateOut,
    adults = 1,
    teens = 0,
    children = 0,
    infants = 0
  } = params;
  const searchParams = new URLSearchParams({
    ADT: String(adults),
    TEEN: String(teens),
    CHD: String(children),
    INF: String(infants),
    Origin: origin,
    Destination: destination,
    DateOut: dateOut,
    RoundTrip: "false",
    IncludeConnectingFlights: "false",
    promoCode: "",
    ToUs: "AGREED"
  });
  try {
    await smartDelay();
    const response = await safeRyanairFetch(
      `${BACKEND_API}/ryanair/search?${searchParams}`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Accept-Language": "pl"
        }
      }
    );
    if (metrics) metrics.apiCalls += 1;
    if (!response.ok) {
      throw new Error(`B\u0142\u0105d API: ${response.status}`);
    }
    const data = await response.json();
    const parsed = parseFlights(data);
    const annotated = parsed.map((f) => ({
      ...f,
      origin,
      destination,
      originName: null,
      destinationName: null
    }));
    return annotated;
  } catch (error) {
    console.error("B\u0142\u0105d wyszukiwania:", error);
    if (error?.hardBlocked) throw error;
    throw error;
  }
}
function generateDateRange(dateFrom, dateTo) {
  const start = new Date(dateFrom);
  const end = new Date(dateTo);
  const dates = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    dates.push(`${yyyy}-${mm}-${dd}`);
  }
  return dates;
}
async function searchFlightsRange(params, externalMetrics = null) {
  const METRICS = externalMetrics || createMetrics();
  const { origin, destination, dateFrom, dateTo, maxPrice, adults = 1, departureFrom, departureTo, arrivalFrom, arrivalTo, departureDays } = params;
  console.log(`Szukam lot\xF3w jednokierunkowych: ${dateFrom} - ${dateTo}, max cena: ${maxPrice || "brak"}`);
  if (!externalMetrics) {
    await ensureBackendUp();
  }
  const availableDates = await getAvailableDates(origin, destination);
  let allPossibleDates;
  if (availableDates && availableDates.length > 0) {
    const userDateFrom = new Date(dateFrom);
    const userDateTo = new Date(dateTo);
    allPossibleDates = availableDates.filter((dateStr) => {
      const d = new Date(dateStr);
      if (!d || d < userDateFrom || d > userDateTo) return false;
      if (departureDays && Array.isArray(departureDays) && departureDays.length === 7) {
        const dow = d.getDay();
        const idx = dow === 0 ? 6 : dow - 1;
        return !!departureDays[idx];
      }
      return true;
    });
    console.log(`\u26A1 OPTYMALIZACJA: Sprawdzam tylko ${allPossibleDates.length} dni z lotami (zamiast wszystkich dni w zakresie)`);
  } else {
    console.log(`\u26A0\uFE0F Brak danych o dost\u0119pno\u015Bci - sprawdzam wszystkie dni w zakresie`);
    allPossibleDates = generateDateRange(dateFrom, dateTo);
    if (departureDays && Array.isArray(departureDays) && departureDays.length === 7) {
      allPossibleDates = allPossibleDates.filter((dt) => {
        const d = new Date(dt);
        const dow = d.getDay();
        const idx = dow === 0 ? 6 : dow - 1;
        return !!departureDays[idx];
      });
    }
  }
  const cachedDates = [];
  const uncachedDates = [];
  for (const date of allPossibleDates) {
    const cached = await getFlightsFromCache(origin, destination, date, adults);
    if (cached !== null) {
      cachedDates.push(date);
    } else {
      uncachedDates.push(date);
    }
  }
  console.log(`\u{1F4CA} Status cache: ${cachedDates.length} dni w cache, ${uncachedDates.length} brakuj\u0105cych`);
  let cheapDatesOnly = null;
  let usedFareFinder = false;
  if (maxPrice && uncachedDates.length === 0) {
    console.log(`\u{1F4BE} Wszystkie dni w cache - filtruj\u0119 lokalnie po cenie \u2264 ${maxPrice} PLN (bez FareFinder)`);
    cheapDatesOnly = new Set(cachedDates);
    usedFareFinder = false;
  } else if (maxPrice && uncachedDates.length > 0) {
    console.log(`\u{1F50D} Pr\xF3buj\u0119 optymalizacji przez FareFinder (brakuje ${uncachedDates.length} dni)...`);
    const result = await getMonthlyFaresOneWay({
      origin,
      destination,
      dateFrom,
      dateTo,
      adults,
      outboundDays: departureDays
    }, METRICS);
    usedFareFinder = true;
    if (result.size > 0) {
      cheapDatesOnly = /* @__PURE__ */ new Set();
      for (const [date, price] of result.entries()) {
        if (price <= maxPrice) {
          cheapDatesOnly.add(date);
        }
      }
      console.log(`\u{1F3AF} OPTYMALIZACJA FareFinder: Znaleziono ${cheapDatesOnly.size} tanich dni (max ${maxPrice} PLN)`);
    } else {
      console.log(`\u26A0\uFE0F FareFinder nie zwr\xF3ci\u0142 danych - wyszukuj\u0119 wszystkie dni i filtruj\u0119 lokalnie`);
      cheapDatesOnly = null;
      usedFareFinder = false;
    }
  }
  let datesToSearch;
  if (maxPrice && cheapDatesOnly !== null) {
    if (usedFareFinder) {
      const farefinderDates = Array.from(cheapDatesOnly);
      console.log(`\u{1F3AF} FareFinder wskaza\u0142 ${farefinderDates.length} tanich dni - sprawdzam cache przed wywo\u0142aniem API...`);
      const cachedFarefinderDates = [];
      const uncachedFarefinderDates = [];
      for (const date of farefinderDates) {
        const cached = await getFlightsFromCache(origin, destination, date, adults);
        if (cached !== null) {
          cachedFarefinderDates.push(date);
        } else {
          uncachedFarefinderDates.push(date);
        }
      }
      console.log(`\u{1F4CA} FareFinder: ${cachedFarefinderDates.length} dni w cache, ${uncachedFarefinderDates.length} do pobrania`);
      datesToSearch = farefinderDates;
    } else {
      datesToSearch = cachedDates;
      console.log(`\u{1F4BE} Tryb cache: filtruj\u0119 ${datesToSearch.length} dni z cache po cenie`);
    }
  } else {
    datesToSearch = allPossibleDates;
    console.log(`\u{1F4C5} Tryb normalny: szukam wszystkich ${datesToSearch.length} dni${maxPrice ? " i filtruj\u0119 po cenie" : ""}`);
  }
  console.log(`\u{1F4C5} Sprawdzam ${datesToSearch.length} dni...`);
  const results = [];
  const datesToFetch = [];
  let cachedCount = 0;
  for (const date of datesToSearch) {
    const cachedFlights = await getFlightsFromCache(origin, destination, date, adults);
    if (cachedFlights !== null) {
      let flightsToAdd = cachedFlights.map((f) => ({ ...f, source: "CACHE" }));
      if (maxPrice) {
        flightsToAdd = cachedFlights.filter((f) => {
          const price = f.priceInPLN || convertToPLN(f.price, f.currency);
          return price && price <= maxPrice;
        });
        if (flightsToAdd.length < cachedFlights.length) {
          console.log(`\u{1F4BE}\u{1F4B0} ${date}: ${cachedFlights.length} lot\xF3w w cache, ${flightsToAdd.length} po filtrze \u2264${maxPrice} PLN`);
        }
      }
      const withDates = flightsToAdd.map((f) => ({ ...f, searched_date: date }));
      const filteredWithDates = applyTimeFiltersToFlights(withDates, { departureFrom, departureTo, arrivalFrom, arrivalTo });
      results.push(...filteredWithDates);
      if (filteredWithDates.length !== withDates.length) {
        console.log(`\u23F1\uFE0F Filtr godzinowy zastosowany (${withDates.length} -> ${filteredWithDates.length}) dla ${date}`);
      }
      cachedCount++;
    } else {
      datesToFetch.push(date);
    }
  }
  if (cachedCount > 0) {
    console.log(`\u{1F4BE} U\u017Cyto cache dla ${cachedCount} dni, pobieranie ${datesToFetch.length} pozosta\u0142ych...`);
  }
  if (datesToFetch.length > 0) {
    const estimatedTime = Math.round(datesToFetch.length * (RATE_LIMIT_CONFIG.baseDelay / 1e3));
    console.log(`\u23F1\uFE0F Szacowany czas pobierania: ~${estimatedTime}s (${RATE_LIMIT_CONFIG.baseDelay}ms + losowy jitter mi\u0119dzy requestami)`);
  }
  for (let i = 0; i < datesToFetch.length; i++) {
    const d = datesToFetch[i];
    if (i > 0) {
      await smartDelay();
    }
    let retries = 0;
    let success = false;
    while (!success && retries <= RATE_LIMIT_CONFIG.maxRetries) {
      try {
        const res = await searchFlights({ origin, destination, dateOut: d, adults }, METRICS);
        const resWithSource = res.map((f) => ({ ...f, source: "API" }));
        await saveFlightsToCache(origin, destination, d, resWithSource, adults);
        let flightsToAdd = resWithSource;
        if (maxPrice) {
          flightsToAdd = res.filter((f) => {
            const price = f.priceInPLN || convertToPLN(f.price, f.currency);
            return price && price <= maxPrice;
          });
          if (flightsToAdd.length < res.length) {
            console.log(`\u{1F4B0} ${d}: ${res.length} lot\xF3w w cache, ${flightsToAdd.length} po filtrze \u2264${maxPrice} PLN`);
          }
        }
        const withDates = flightsToAdd.map((f) => ({ ...f, searched_date: d }));
        const filteredWithDates = applyTimeFiltersToFlights(withDates, { departureFrom, departureTo, arrivalFrom, arrivalTo });
        results.push(...filteredWithDates);
        if (filteredWithDates.length !== withDates.length) {
          console.log(`\u23F1\uFE0F Filtr godzinowy zastosowany (${withDates.length} -> ${filteredWithDates.length}) dla ${d}`);
        }
        success = true;
      } catch (error) {
        if (error?.hardBlocked) {
          throw error;
        }
        const is429 = error.message?.includes("429") || error.message?.includes("Too Many Requests");
        const is409 = error.message?.includes("409") || error.message?.includes("declined");
        if ((is429 || is409) && retries < RATE_LIMIT_CONFIG.maxRetries) {
          retries++;
          console.warn(`\u26A0\uFE0F Rate limit/declined dla ${d}, pr\xF3ba ${retries}/${RATE_LIMIT_CONFIG.maxRetries}...`);
          await smartDelay(true);
        } else {
          console.warn(`Brak lot\xF3w dla daty ${d}:`, error.message);
          success = true;
        }
      }
    }
  }
  METRICS.totalDays = datesToSearch.length;
  METRICS.daysFromCache = cachedCount;
  METRICS.daysFetched = datesToFetch.length;
  if (!externalMetrics) {
    LAST_METRICS = {
      ...METRICS,
      percentFromCache: METRICS.totalDays > 0 ? Math.round(METRICS.daysFromCache / METRICS.totalDays * 100) : 0,
      percentFromApi: METRICS.totalDays > 0 ? Math.round(METRICS.daysFetched / METRICS.totalDays * 100) : 0
    };
  }
  console.log(`\u2705 Znaleziono \u0142\u0105cznie ${results.length} lot\xF3w (${cachedCount} z cache, ${datesToFetch.length} z API). API calls: ${METRICS.apiCalls} (FareFinder: ${METRICS.fareFinderCalls})`);
  return results;
}
async function getMonthlyFares(params, metrics) {
  const { origin, destination, outFrom, outTo, stayDaysMin, stayDaysMax, adults = 1, departureFrom = "00:00", departureTo = "23:59", returnArrivalFrom = "00:00", returnArrivalTo = "23:59", outboundDays = null, inboundDays = null } = params;
  const cacheKey = getCacheKey({
    origin,
    destination,
    dateFrom: outFrom,
    dateTo: outTo,
    tripType: "round",
    adults
  });
  const cached = await getFromCache(cacheKey);
  if (cached) {
    const ageMinutes = Math.round(cached.age_seconds / 60);
    console.log(`\u{1F4BE} CACHE HIT: U\u017Cywam zapisanych cen dla ${origin}\u2192${destination} (${ageMinutes} min temu)`);
    return { prices: cached.data, raw: null };
  }
  try {
    const url = `${BACKEND_API}/ryanair/farfinder`;
    const queryParams = new URLSearchParams({
      departureAirportIataCode: origin,
      arrivalAirportIataCode: destination,
      outboundDepartureDateFrom: outFrom,
      outboundDepartureDateTo: outTo,
      inboundDepartureDateFrom: outFrom,
      // użyj tego samego zakresu
      inboundDepartureDateTo: outTo,
      durationFrom: stayDaysMin,
      durationTo: stayDaysMax,
      adultPaxCount: adults,
      market: "pl-pl",
      searchMode: "ALL"
    });
    if (departureFrom) queryParams.set("outboundDepartureTimeFrom", departureFrom);
    if (departureTo) queryParams.set("outboundDepartureTimeTo", departureTo);
    if (returnArrivalFrom) queryParams.set("inboundDepartureTimeFrom", returnArrivalFrom);
    if (returnArrivalTo) queryParams.set("inboundDepartureTimeTo", returnArrivalTo);
    const outboundList = daysArrayToWeekdayList(outboundDays);
    const inboundList = daysArrayToWeekdayList(inboundDays);
    if (outboundList) queryParams.set("outboundDepartureDaysOfWeek", outboundList);
    if (inboundList) queryParams.set("inboundDepartureDaysOfWeek", inboundList);
    console.log(`\u{1F4CA} Pobieram ceny miesi\u0119czne: ${origin}\u2192${destination}`);
    await smartDelay();
    const response = await safeRyanairFetch(`${url}?${queryParams}`);
    if (metrics) {
      metrics.apiCalls += 1;
      metrics.fareFinderCalls += 1;
    }
    if (!response.ok) {
      throw new Error(`FareFinder API error: ${response.status}`);
    }
    const data = await response.json();
    if (data.fares && data.fares.length > 0) {
      console.log("\u{1F4CA} Przyk\u0142adowa struktura fare:", JSON.stringify(data.fares[0], null, 2));
    }
    const datePrice = /* @__PURE__ */ new Map();
    if (data.fares && Array.isArray(data.fares)) {
      data.fares.forEach((fare, index) => {
        const outDate = fare.outbound?.departureDate?.split("T")[0] || fare.outbound?.date?.split("T")[0] || fare.departureDate?.split("T")[0];
        const inDate = fare.inbound?.departureDate?.split("T")[0] || fare.inbound?.date?.split("T")[0] || fare.arrivalDate?.split("T")[0];
        const rawOutPrice = fare.outbound?.price?.value ?? fare.outbound?.price ?? fare.price?.outbound ?? 0;
        const outCurrency = fare.outbound?.price?.currencyCode ?? fare.outbound?.price?.currency ?? fare.price?.currency ?? "PLN";
        const outPricePLN = convertToPLN(Number(rawOutPrice) || 0, outCurrency) || Number(rawOutPrice) || 0;
        const rawInPrice = fare.inbound?.price?.value ?? fare.inbound?.price ?? fare.price?.inbound ?? 0;
        const inCurrency = fare.inbound?.price?.currencyCode ?? fare.inbound?.price?.currency ?? fare.price?.currency ?? "PLN";
        const inPricePLN = convertToPLN(Number(rawInPrice) || 0, inCurrency) || Number(rawInPrice) || 0;
        const totalPrice = outPricePLN + inPricePLN;
        if (outDate && inDate) {
          const key = `${outDate}|${inDate}`;
          if (!datePrice.has(key) || datePrice.get(key) > totalPrice) {
            datePrice.set(key, totalPrice);
          }
        } else {
          console.warn(`\u26A0\uFE0F Nie mo\u017Cna wyci\u0105gn\u0105\u0107 dat z fare[${index}]:`, fare);
        }
      });
    }
    console.log(`\u{1F4CA} Znaleziono ${datePrice.size} kombinacji dat z cenami`);
    await saveToCache(cacheKey, datePrice);
    console.log(`\u{1F4BE} Zapisano ceny do cache (wa\u017Cne przez 1h)`);
    return { prices: datePrice, raw: data };
  } catch (error) {
    console.error("B\u0142\u0105d pobierania cen miesi\u0119cznych:", error);
    if (error?.hardBlocked) throw error;
    return { prices: /* @__PURE__ */ new Map(), raw: null };
  }
}
async function getMonthlyFaresOneWay(params, metrics) {
  const { origin, destination, dateFrom, dateTo, adults = 1, departureFrom = "00:00", departureTo = "23:59", outboundDays = null } = params;
  const cacheKey = getCacheKey({
    origin,
    destination,
    dateFrom,
    dateTo,
    tripType: "oneway",
    adults
  });
  const cached = await getFromCache(cacheKey);
  if (cached) {
    const ageMinutes = Math.round(cached.age_seconds / 60);
    console.log(`\u{1F4BE} CACHE HIT: U\u017Cywam zapisanych cen dla ${origin}\u2192${destination} (jednokierunkowe, ${ageMinutes} min temu)`);
    return cached.data;
  }
  try {
    const url = `${BACKEND_API}/ryanair/oneWayFares`;
    const queryParams = new URLSearchParams({
      departureAirportIataCode: origin,
      arrivalAirportIataCode: destination,
      outboundDepartureDateFrom: dateFrom,
      outboundDepartureDateTo: dateTo,
      outboundDepartureTimeFrom: departureFrom,
      outboundDepartureTimeTo: departureTo,
      adultPaxCount: adults,
      market: "pl-pl",
      searchMode: "ALL"
    });
    const outboundList = daysArrayToWeekdayList(outboundDays);
    if (outboundList) queryParams.set("outboundDepartureDaysOfWeek", outboundList);
    console.log(`\u{1F4CA} Pobieram ceny miesi\u0119czne (jednokierunkowe): ${origin}\u2192${destination}`);
    await smartDelay();
    const response = await safeRyanairFetch(`${url}?${queryParams}`);
    if (metrics) {
      metrics.apiCalls += 1;
      metrics.fareFinderCalls += 1;
    }
    if (!response.ok) {
      throw new Error(`FareFinder API error: ${response.status}`);
    }
    const data = await response.json();
    const datePrice = /* @__PURE__ */ new Map();
    if (data.fares && Array.isArray(data.fares)) {
      data.fares.forEach((fare) => {
        const outDate = fare.outbound?.departureDate?.split("T")[0];
        const rawOutPrice = fare.outbound?.price?.value ?? fare.outbound?.price ?? 0;
        const outCurrency = fare.outbound?.price?.currencyCode ?? fare.outbound?.price?.currency ?? "PLN";
        const outPrice = convertToPLN(Number(rawOutPrice) || 0, outCurrency) || Number(rawOutPrice) || 0;
        if (outDate && outPrice > 0) {
          if (!datePrice.has(outDate) || datePrice.get(outDate) > outPrice) {
            datePrice.set(outDate, outPrice);
          }
        }
      });
    }
    console.log(`\u{1F4CA} Znaleziono ${datePrice.size} dni z cenami`);
    await saveToCache(cacheKey, datePrice);
    console.log(`\u{1F4BE} Zapisano ceny do cache (wa\u017Cne przez 1h)`);
    return datePrice;
  } catch (error) {
    console.error("B\u0142\u0105d pobierania cen miesi\u0119cznych (jednokierunkowe):", error);
    if (error?.hardBlocked) throw error;
    return /* @__PURE__ */ new Map();
  }
}
async function getMonthlyFaresForRoute(params) {
  return await getMonthlyFaresOneWay(params);
}
async function searchRoundTripRange(params) {
  const {
    origin,
    destination,
    outFrom,
    outTo,
    stayDaysMin,
    stayDaysMax,
    maxPrice,
    adults = 1,
    allowDifferentReturnAirport = false,
    availableReturnAirports = null,
    departureFrom,
    // outbound departure HH:MM
    departureTo,
    arrivalFrom,
    // outbound arrival HH:MM
    arrivalTo,
    returnDepartureFrom,
    // inbound departure HH:MM (departure from dest)
    returnDepartureTo,
    returnArrivalFrom,
    // inbound arrival HH:MM (arrival at origin)
    returnArrivalTo,
    departureDays,
    // array of booleans for Mon..Sun
    returnDays
  } = params;
  console.log(`Szukam round-trip: ${outFrom} - ${outTo}, pobyt ${stayDaysMin}-${stayDaysMax} dni, max cena: ${maxPrice || "brak"}`);
  let returnAirports = [origin];
  if (allowDifferentReturnAirport && availableReturnAirports && availableReturnAirports.length > 0) {
    returnAirports = availableReturnAirports;
    console.log(`\u2194\uFE0F MULTI-AIRPORT: Kombinuj\u0119 z ${returnAirports.length} lotniskami powrotu: ${returnAirports.join(", ")}`);
  }
  await ensureBackendUp();
  const METRICS = createMetrics();
  const dateFromObj = new Date(outFrom);
  const dateToObj = new Date(outTo);
  const totalDays = Math.ceil((dateToObj - dateFromObj) / (1e3 * 60 * 60 * 24)) + 1;
  const useFareFinderOptimization = maxPrice && totalDays > 14;
  if (useFareFinderOptimization) {
    if (allowDifferentReturnAirport) {
      console.log(`\u{1F4CA} Zakres: ${totalDays} dni \u2192 OPTYMALIZACJA FareFinder aktywna (multi-airport: ${returnAirports.length} lotnisk powrotu)`);
    } else {
      console.log(`\u{1F4CA} Zakres: ${totalDays} dni \u2192 OPTYMALIZACJA FareFinder aktywna (du\u017Cy zakres)`);
    }
  } else if (maxPrice) {
    console.log(`\u{1F4CA} Zakres: ${totalDays} dni \u2192 Tryb bezpo\u015Bredni (ma\u0142y zakres, optymalizacja FareFinder pomini\u0119ta)`);
  }
  let monthlyPrices = /* @__PURE__ */ new Map();
  let monthlyRawData = null;
  let cheapCombinations = /* @__PURE__ */ new Set();
  if (useFareFinderOptimization) {
    if (allowDifferentReturnAirport) {
      console.log("\u{1F3AF} Multi-airport: Pobieram miesi\u0119czne ceny ONE-WAY (nie round-trip)");
      const outMap = await getMonthlyFaresOneWay({
        origin,
        destination,
        dateFrom: outFrom,
        dateTo: outTo,
        adults,
        departureFrom,
        departureTo,
        outboundDays: departureDays
      }, METRICS);
      const inMapByAirport = /* @__PURE__ */ new Map();
      for (const returnAirport of returnAirports) {
        const inMap = await getMonthlyFaresOneWay({
          origin: destination,
          destination: returnAirport,
          dateFrom: outFrom,
          dateTo: outTo,
          adults,
          departureFrom: returnDepartureFrom,
          departureTo: returnDepartureTo,
          arrivalFrom: returnArrivalFrom,
          arrivalTo: returnArrivalTo,
          outboundDays: returnDays
        }, METRICS);
        if (inMap.size > 0) {
          inMapByAirport.set(returnAirport, inMap);
        }
      }
      const allPairs = [];
      for (const [outDate, outPrice] of outMap.entries()) {
        const outDateObj = new Date(outDate);
        for (const [returnAirport, inMap] of inMapByAirport.entries()) {
          for (const [inDate, inPrice] of inMap.entries()) {
            const inDateObj = new Date(inDate);
            const stayDays = Math.floor((inDateObj - outDateObj) / (24 * 60 * 60 * 1e3));
            if (stayDays >= stayDaysMin && stayDays <= stayDaysMax && inDateObj > outDateObj) {
              const totalPrice = outPrice + inPrice;
              const key = `${outDate}|${inDate}|${returnAirport}`;
              if (totalPrice <= maxPrice) {
                cheapCombinations.add(key);
                allPairs.push({ outDate, inDate, returnAirport, outPrice, inPrice, totalPrice });
              }
            }
          }
        }
      }
      console.log(`\u{1F3AF} OPTYMALIZACJA (multi-airport): Znaleziono ${cheapCombinations.size} tanich kombinacji (max ${maxPrice} PLN)`);
      if (cheapCombinations.size > 0) {
        console.log(`   Przyk\u0142ady: ${allPairs.slice(0, 3).map((p) => `${p.outDate}\u2192${p.inDate} (${p.returnAirport}): ${p.totalPrice} PLN`).join(", ")}`);
      }
    } else {
      const result = await getMonthlyFares({
        origin,
        destination,
        outFrom,
        outTo,
        stayDaysMin,
        stayDaysMax,
        adults,
        departureFrom,
        departureTo,
        returnArrivalFrom,
        returnArrivalTo
      }, METRICS);
      monthlyPrices = result.prices;
      monthlyRawData = result.raw;
      if (monthlyPrices.size > 0) {
        for (const [key, price] of monthlyPrices.entries()) {
          if (price <= maxPrice) {
            cheapCombinations.add(key);
          }
        }
        console.log(`\u{1F3AF} OPTYMALIZACJA: Znaleziono ${cheapCombinations.size} tanich kombinacji (max ${maxPrice} PLN)`);
      }
    }
  }
  let oneWayCandidatePairs = [];
  if (useFareFinderOptimization && cheapCombinations.size === 0) {
    console.log("\u26A0\uFE0F Brak tanich par z roundTripFares \u2013 pr\xF3buj\u0119 kombinacji z miesi\u0119cznych one-way (outbound + inbound).");
    const outMap = await getMonthlyFaresOneWay({
      origin,
      destination,
      dateFrom: outFrom,
      dateTo: outTo,
      adults,
      departureFrom,
      departureTo,
      outboundDays: departureDays
    }, METRICS);
    const inMapByAirport = /* @__PURE__ */ new Map();
    for (const returnAirport of returnAirports) {
      const inMap = await getMonthlyFaresOneWay({
        origin: destination,
        destination: returnAirport,
        dateFrom: outFrom,
        dateTo: outTo,
        adults,
        departureFrom: returnDepartureFrom,
        departureTo: returnDepartureTo,
        arrivalFrom: returnArrivalFrom,
        arrivalTo: returnArrivalTo,
        outboundDays: returnDays
      }, METRICS);
      if (inMap.size > 0) {
        inMapByAirport.set(returnAirport, inMap);
      }
    }
    if (outMap.size > 0 && inMapByAirport.size > 0) {
      const candidateMargin = params.oneWayCandidateMargin || 1.3;
      const outDates = Array.from(outMap.keys()).sort();
      for (const [returnAirport, inMap] of inMapByAirport.entries()) {
        const inDates = Array.from(inMap.keys()).sort();
        const inSet = new Set(inDates);
        for (const od of outDates) {
          const oDate = new Date(od);
          for (let stay = stayDaysMin; stay <= stayDaysMax; stay++) {
            const candInDate = new Date(oDate);
            candInDate.setDate(candInDate.getDate() + (stay - 1));
            const yyyy = candInDate.getFullYear();
            const mm = String(candInDate.getMonth() + 1).padStart(2, "0");
            const dd = String(candInDate.getDate()).padStart(2, "0");
            const id = `${yyyy}-${mm}-${dd}`;
            if (!inSet.has(id)) continue;
            const total = (outMap.get(od) || 0) + (inMap.get(id) || 0);
            if (total > 0 && (!maxPrice || total <= maxPrice * candidateMargin)) {
              oneWayCandidatePairs.push({
                outDate: od,
                inDate: id,
                approxTotalPLN: total,
                stayDays: stay,
                returnAirport
                // Dodaj info o lotnisku powrotu
              });
            }
          }
        }
      }
      oneWayCandidatePairs.sort((a, b) => a.approxTotalPLN - b.approxTotalPLN);
      console.log(`\u{1F4CA} Znaleziono ${oneWayCandidatePairs.length} mo\u017Cliwych par do sprawdzenia (wszystkie lotniska razem).`);
      const neededOutDates = new Set(oneWayCandidatePairs.map((p) => p.outDate).filter((d) => {
        if (!departureDays || !Array.isArray(departureDays) || departureDays.length !== 7) return true;
        return isDateMatchingDays(d, departureDays);
      }));
      const neededInDates = new Set(oneWayCandidatePairs.map((p) => p.inDate).filter((d) => {
        if (!returnDays || !Array.isArray(returnDays) || returnDays.length !== 7) return true;
        return isDateMatchingDays(d, returnDays);
      }));
      const outboundByDate = /* @__PURE__ */ new Map();
      let cachedOut = 0, fetchedOut = 0;
      let outErrorsInARow = 0;
      let outApiCallCount = 0;
      for (const d of neededOutDates) {
        if (outErrorsInARow >= 3) {
          console.warn("\u{1F6D1} Circuit breaker: Zbyt wiele b\u0142\u0119d\xF3w z rz\u0119du dla lot\xF3w TAM \u2013 przerywam dalsze pobieranie, aby unikn\u0105\u0107 blokady IP.");
          console.warn("   \u{1F4A1} Spr\xF3buj ponownie za kilka minut lub zmniejsz zakres dat.");
          break;
        }
        const cached = await getFlightsFromCache(origin, destination, d, adults);
        if (cached !== null) {
          const cachedWithSource = cached.map((f) => ({ ...f, source: "CACHE" }));
          const filteredCached = applyTimeFiltersToFlights(cachedWithSource, { departureFrom, departureTo });
          outboundByDate.set(d, filteredCached);
          cachedOut++;
          outErrorsInARow = 0;
          continue;
        }
        if (outApiCallCount > 0) {
          await smartDelay();
        }
        outApiCallCount++;
        let retries = 0;
        let success = false;
        while (!success && retries <= RATE_LIMIT_CONFIG.maxRetries) {
          try {
            const res = await searchFlights({ origin, destination, dateOut: d, adults }, METRICS);
            const resWithSource = res.map((f) => ({ ...f, source: "API" }));
            await saveFlightsToCache(origin, destination, d, resWithSource, adults);
            const filteredRes = applyTimeFiltersToFlights(resWithSource, { departureFrom, departureTo });
            outboundByDate.set(d, filteredRes);
            fetchedOut++;
            outErrorsInARow = 0;
            success = true;
          } catch (e) {
            if (e?.hardBlocked) {
              throw e;
            }
            const is429 = e.message?.includes("429") || e.message?.includes("Too Many Requests");
            const is409 = e.message?.includes("409") || e.message?.includes("declined");
            if ((is429 || is409) && retries < RATE_LIMIT_CONFIG.maxRetries) {
              retries++;
              console.warn(`  \u26A0\uFE0F ${origin}\u2192${destination} rate limit/declined, pr\xF3ba ${retries}/${RATE_LIMIT_CONFIG.maxRetries}...`);
              await smartDelay(true);
            } else {
              console.warn(`\u274C B\u0142\u0105d pobrania lot\xF3w TAM dla ${d}:`, e.message);
              outboundByDate.set(d, []);
              outErrorsInARow++;
              success = true;
            }
          }
        }
      }
      const inboundByDateAndAirport = /* @__PURE__ */ new Map();
      let cachedIn = 0, fetchedIn = 0;
      let inErrorsInARow = 0;
      let inApiCallCount = 0;
      for (const d of neededInDates) {
        if (inErrorsInARow >= 3) {
          console.warn("\u{1F6D1} Circuit breaker: Zbyt wiele b\u0142\u0119d\xF3w z rz\u0119du dla lot\xF3w POWR\xD3T \u2013 przerywam dalsze pobieranie, aby unikn\u0105\u0107 blokady IP.");
          console.warn("   \u{1F4A1} Spr\xF3buj ponownie za kilka minut lub zmniejsz zakres dat.");
          break;
        }
        const flightsByAirport = /* @__PURE__ */ new Map();
        let airportCallsInThisDate = 0;
        for (const returnAirport of returnAirports) {
          const cached = await getFlightsFromCache(destination, returnAirport, d, adults);
          if (cached !== null) {
            const cachedWithSource = cached.map((f) => ({ ...f, source: "CACHE" }));
            const filteredCached = applyTimeFiltersToFlights(cachedWithSource, { arrivalFrom: returnArrivalFrom, arrivalTo: returnArrivalTo });
            flightsByAirport.set(returnAirport, filteredCached);
            cachedIn++;
            inErrorsInARow = 0;
            continue;
          }
          if (inApiCallCount > 0 || airportCallsInThisDate > 0) {
            await smartDelay();
          }
          inApiCallCount++;
          airportCallsInThisDate++;
          let retries = 0;
          let success = false;
          while (!success && retries <= RATE_LIMIT_CONFIG.maxRetries) {
            try {
              const res = await searchFlights({ origin: destination, destination: returnAirport, dateOut: d, adults }, METRICS);
              const resWithSource = res.map((f) => ({ ...f, source: "API" }));
              await saveFlightsToCache(destination, returnAirport, d, resWithSource, adults);
              const filteredRes = applyTimeFiltersToFlights(resWithSource, { arrivalFrom: returnArrivalFrom, arrivalTo: returnArrivalTo });
              flightsByAirport.set(returnAirport, filteredRes);
              fetchedIn++;
              inErrorsInARow = 0;
              success = true;
            } catch (e) {
              if (e?.hardBlocked) {
                throw e;
              }
              const is429 = e.message?.includes("429") || e.message?.includes("Too Many Requests");
              const is409 = e.message?.includes("409") || e.message?.includes("declined");
              if ((is429 || is409) && retries < RATE_LIMIT_CONFIG.maxRetries) {
                retries++;
                console.warn(`  \u26A0\uFE0F ${destination}\u2192${returnAirport} rate limit/declined, pr\xF3ba ${retries}/${RATE_LIMIT_CONFIG.maxRetries}...`);
                await smartDelay(true);
              } else {
                console.warn(`\u274C B\u0142\u0105d pobrania lot\xF3w POWR\xD3T ${destination}\u2192${returnAirport} dla ${d}:`, e.message);
                flightsByAirport.set(returnAirport, []);
                inErrorsInARow++;
                success = true;
              }
            }
          }
        }
        inboundByDateAndAirport.set(d, flightsByAirport);
      }
      const combos = [];
      let rejectedByTime2 = 0, rejectedByPrice = 0, rejectedByStayDays = 0;
      for (const p of oneWayCandidatePairs) {
        const outs = (outboundByDate.get(p.outDate) || []).filter((f) => f.priceInPLN != null && f.departure && f.arrival);
        const flightsByAirport = inboundByDateAndAirport.get(p.inDate);
        if (!flightsByAirport) {
          console.log(`   \u26A0\uFE0F Brak lot\xF3w POWR\xD3T dla daty ${p.inDate}`);
          continue;
        }
        if (outs.length === 0) {
          console.log(`   \u26A0\uFE0F Brak lot\xF3w TAM dla daty ${p.outDate}`);
          continue;
        }
        const returnAirport = p.returnAirport;
        const insFlights = flightsByAirport.get(returnAirport);
        if (!insFlights) {
          console.log(`   \u26A0\uFE0F Brak lot\xF3w POWR\xD3T dla lotniska ${returnAirport} w dacie ${p.inDate}`);
          continue;
        }
        const ins = (insFlights || []).filter((f) => f.priceInPLN != null && f.departure && f.arrival);
        if (ins.length === 0) continue;
        for (const outFlight of outs) {
          for (const inFlight of ins) {
            const outArrivalTime = /* @__PURE__ */ new Date(`${outFlight.date}T${outFlight.arrival}:00`);
            const inDepartureTime = /* @__PURE__ */ new Date(`${inFlight.date}T${inFlight.departure}:00`);
            const timeDiffMs = inDepartureTime - outArrivalTime;
            const timeDiffHours = timeDiffMs / (1e3 * 60 * 60);
            if (timeDiffHours < 7) {
              rejectedByTime2++;
              console.log(`   \u274C ODRZUCONO (czas<7h) [cheapCombin]: out ${outFlight.date} ${outFlight.arrival} (arr) - in ${inFlight.date} ${inFlight.departure} (dep); diff ${timeDiffHours.toFixed(2)}h; outPrice ${outFlight.priceInPLN}, inPrice ${inFlight.priceInPLN}; origin ${outFlight.origin} -> ${outFlight.destination} / return ${inFlight.origin}->${inFlight.destination} (returnAirport=${returnAirport})`);
              continue;
            }
            const total = (outFlight.priceInPLN || 0) + (inFlight.priceInPLN || 0);
            if (maxPrice && total > maxPrice) {
              rejectedByPrice++;
              console.log(`   \u274C ODRZUCONO (cena>max) [cheapCombin]: out ${outFlight.date} ${outFlight.arrival} + in ${inFlight.date} ${inFlight.departure} -> total ${total} PLN > ${maxPrice} PLN; origin ${outFlight.origin} -> ${outFlight.destination}; returnAirport=${returnAirport}`);
              if (p.outDate === "2025-12-15" && p.inDate === "2025-12-18" && returnAirport === "POZ") {
                console.log(`   \u{1F50D} LCJ\u2192AGP\u2192POZ (15\u219218): ${outFlight.priceInPLN} + ${inFlight.priceInPLN} = ${total} PLN > ${maxPrice} PLN \u274C`);
              }
              continue;
            }
            combos.push({
              outbound: outFlight,
              inbound: inFlight,
              totalPriceInPLN: total,
              stayDays: p.stayDays,
              outDate: p.outDate,
              inDate: p.inDate,
              returnAirport,
              originAirport: outFlight.origin,
              originName: outFlight.originName || "",
              returnName: inFlight.destinationName || "",
              source: outFlight.source === "API" && inFlight.source === "API" ? "API" : outFlight.source === "CACHE" && inFlight.source === "CACHE" ? "CACHE" : "MIXED"
            });
            console.log(`   \u2705 Zaakceptowano [cheapCombin]: ${outFlight.origin}->${outFlight.destination} ${p.outDate} (${outFlight.arrival}) + ${inFlight.origin}->${inFlight.destination} ${p.inDate} (${inFlight.departure}) = ${total} PLN; legSources: ${outFlight.source || "UNKNOWN"}/${inFlight.source || "UNKNOWN"}; comboSource: ${outFlight.source === "API" && inFlight.source === "API" ? "API" : outFlight.source === "CACHE" && inFlight.source === "CACHE" ? "CACHE" : "MIXED"}`);
          }
        }
      }
      combos.sort((a, b) => a.totalPriceInPLN - b.totalPriceInPLN);
      console.log(`\u{1F4CA} \u0141\u0105czenie: ${oneWayCandidatePairs.length} par \u2192 ${combos.length} kombinacji`);
      if (rejectedByTime2 > 0 || rejectedByPrice > 0) {
        console.log(`   \u274C Odrzucono: ${rejectedByTime2} (< 7h), ${rejectedByPrice} (cena > ${maxPrice})`);
      }
      const totalInboundRequests = neededInDates.size * returnAirports.length;
      METRICS.totalDays = neededOutDates.size + totalInboundRequests;
      METRICS.daysFromCache = cachedOut + cachedIn;
      METRICS.daysFetched = fetchedOut + fetchedIn;
      LAST_METRICS = {
        ...METRICS,
        percentFromCache: METRICS.totalDays > 0 ? Math.round(METRICS.daysFromCache / METRICS.totalDays * 100) : 0,
        percentFromApi: METRICS.totalDays > 0 ? Math.round(METRICS.daysFetched / METRICS.totalDays * 100) : 0
      };
      if (combos.length > 0) {
        console.log(`\u2705 Round-trip (one-way optymalizacja): gotowe ${combos.length} par \u2264 ${maxPrice} PLN. API calls: ${METRICS.apiCalls} (FareFinder: ${METRICS.fareFinderCalls})`);
        if (returnAirports.length > 1) {
          console.log(`   \u{1F4CA} Multi-airport: ${neededOutDates.size} dni TAM + ${neededInDates.size} dni \xD7 ${returnAirports.length} lotnisk = ${METRICS.totalDays} zapyta\u0144 total`);
        }
        return combos;
      } else {
        const estimatedApiCalls = oneWayCandidatePairs.length * 2;
        if (maxPrice && estimatedApiCalls > 20) {
          LAST_METRICS = {
            ...METRICS,
            percentFromCache: METRICS.totalDays > 0 ? Math.round(METRICS.daysFromCache / METRICS.totalDays * 100) : 0,
            percentFromApi: METRICS.totalDays > 0 ? Math.round(METRICS.daysFetched / METRICS.totalDays * 100) : 0,
            skippedFullScan: true,
            note: `Brak potwierdzonych par <= maxPrice w Fallback 1, pe\u0142ny skan (${estimatedApiCalls} API calls) zbyt du\u017Cy.`
          };
          console.log(`\u{1F6D1} Brak par <= ${maxPrice} PLN w Fallback 1, pe\u0142ny skan wymaga\u0142by ~${estimatedApiCalls} API calls \u2013 SKIP.`);
          return [];
        }
        console.log(`\u26A0\uFE0F Brak par <= ${maxPrice} PLN w Fallback 1 (monthly estimates), ale spr\xF3buj\u0119 pe\u0142ny skan (${estimatedApiCalls} API calls).`);
      }
    } else {
      console.log("\u26A0\uFE0F Miesi\u0119czne one-way zwr\xF3ci\u0142y puste dane \u2013 przechodz\u0119 do trybu pe\u0142nego.");
    }
  }
  if (useFareFinderOptimization && cheapCombinations.size === 0) {
    const estimatedFullScanCalls = totalDays * returnAirports.length * 2;
    const threshold = returnAirports.length > 1 ? 50 : 100;
    if (estimatedFullScanCalls > threshold) {
      LAST_METRICS = {
        ...METRICS,
        percentFromCache: METRICS.totalDays > 0 ? Math.round(METRICS.daysFromCache / METRICS.totalDays * 100) : 0,
        percentFromApi: METRICS.totalDays > 0 ? Math.round(METRICS.daysFetched / METRICS.totalDays * 100) : 0,
        skippedFullScan: true,
        note: `Brak tanich par w FareFinder, pe\u0142ny skan (${estimatedFullScanCalls} API calls) przekracza limit ${threshold}.`
      };
      console.log(`\u{1F6D1} Brak par <= ${maxPrice} PLN w FareFinder, pe\u0142ny skan wymaga\u0142by ~${estimatedFullScanCalls} API calls (limit: ${threshold}) \u2013 SKIP.`);
      return [];
    }
    console.log(`\u26A0\uFE0F Brak par <= ${maxPrice} PLN w FareFinder (monthly estimates), ale zakres ma\u0142y (${estimatedFullScanCalls} API calls) \u2013 pr\xF3buj\u0119 pe\u0142ny skan.`);
  }
  let outboundFlights = [];
  let outCached = 0, outFetched = 0;
  if (cheapCombinations.size > 0) {
    const cheapOutDates = /* @__PURE__ */ new Set();
    for (const combo of cheapCombinations) {
      const parts = combo.split("|");
      const outDate = parts[0];
      if (departureDays && Array.isArray(departureDays) && departureDays.length === 7) {
        if (isDateMatchingDays(outDate, departureDays)) {
          cheapOutDates.add(outDate);
        }
      } else {
        cheapOutDates.add(outDate);
      }
    }
    console.log(`\u{1F3AF} Szukam lot\xF3w TAM tylko dla ${cheapOutDates.size} tanich dni: ${Array.from(cheapOutDates).join(", ")}`);
    console.log(`\u{1F4CA} Oszcz\u0119dno\u015B\u0107: ${totalDays - cheapOutDates.size} dni pomini\u0119to dzi\u0119ki FareFinder`);
    let apiCallCount = 0;
    for (const date of cheapOutDates) {
      const cachedFlights = await getFlightsFromCache(origin, destination, date, adults);
      if (cachedFlights !== null) {
        console.log(`  \u2705 ${date}: ${cachedFlights.length} lot\xF3w z cache`);
        const cachedWithSource = cachedFlights.map((f) => ({ ...f, source: "CACHE" }));
        outboundFlights.push(...cachedWithSource);
        outCached++;
        continue;
      }
      if (apiCallCount > 0) {
        await smartDelay();
      }
      apiCallCount++;
      let retries = 0;
      let success = false;
      while (!success && retries <= RATE_LIMIT_CONFIG.maxRetries) {
        try {
          const flights = await searchFlights({
            origin,
            destination,
            dateOut: date,
            adults
          }, METRICS);
          console.log(`  \u{1F4E1} ${date}: ${flights.length} lot\xF3w z API`);
          const flightsWithSource = flights.map((f) => ({ ...f, source: "API" }));
          await saveFlightsToCache(origin, destination, date, flightsWithSource, adults);
          outboundFlights.push(...flightsWithSource);
          outFetched++;
          success = true;
        } catch (error) {
          if (error?.hardBlocked) {
            throw error;
          }
          const is429 = error.message?.includes("429") || error.message?.includes("Too Many Requests");
          const is409 = error.message?.includes("409") || error.message?.includes("declined");
          if ((is429 || is409) && retries < RATE_LIMIT_CONFIG.maxRetries) {
            retries++;
            console.warn(`  \u26A0\uFE0F Rate limit/declined, pr\xF3ba ${retries}/${RATE_LIMIT_CONFIG.maxRetries}...`);
            await smartDelay(true);
          } else {
            console.warn(`  \u274C ${date}: ${error.message}`);
            success = true;
          }
        }
      }
    }
  } else {
    outboundFlights = await searchFlightsRange({
      origin,
      destination,
      dateFrom: outFrom,
      dateTo: outTo,
      adults,
      departureFrom,
      departureTo,
      arrivalFrom,
      arrivalTo,
      departureDays
    }, METRICS);
    outboundFlights = outboundFlights.map((f) => ({ ...f, source: f.source || "CACHE" }));
  }
  console.log(`Znaleziono ${outboundFlights.length} lot\xF3w TAM`);
  let inboundFlights = [];
  let inCached = 0, inFetched = 0;
  if (cheapCombinations.size > 0) {
    const cheapInPairs = /* @__PURE__ */ new Map();
    for (const combo of cheapCombinations) {
      const parts = combo.split("|");
      const inDate = parts[1];
      const returnAirport = parts.length === 3 ? parts[2] : origin;
      if (returnDays && Array.isArray(returnDays) && returnDays.length === 7) {
        if (!isDateMatchingDays(inDate, returnDays)) {
          continue;
        }
      }
      if (!cheapInPairs.has(returnAirport)) {
        cheapInPairs.set(returnAirport, /* @__PURE__ */ new Set());
      }
      cheapInPairs.get(returnAirport).add(inDate);
    }
    const totalInDates = Array.from(cheapInPairs.values()).reduce((sum, set) => sum + set.size, 0);
    console.log(`\u{1F3AF} Szukam lot\xF3w POWR\xD3T dla ${cheapInPairs.size} lotnisk (${totalInDates} unikalnych dni razem)`);
    console.log(`\u{1F4CA} Oszcz\u0119dno\u015B\u0107: ${totalDays - totalInDates} dni pomini\u0119to dzi\u0119ki FareFinder`);
    let apiCallCount = 0;
    for (const [returnAirport, dates] of cheapInPairs.entries()) {
      for (const date of dates) {
        const cachedFlights = await getFlightsFromCache(destination, returnAirport, date, adults);
        if (cachedFlights !== null) {
          console.log(`  \u2705 ${date} (\u2192${returnAirport}): ${cachedFlights.length} lot\xF3w z cache`);
          const cachedWithSource = cachedFlights.map((f) => ({ ...f, source: "CACHE" }));
          inboundFlights.push(...cachedWithSource);
          inCached++;
          continue;
        }
        if (apiCallCount > 0) {
          await smartDelay();
        }
        apiCallCount++;
        let retries = 0;
        let success = false;
        while (!success && retries <= RATE_LIMIT_CONFIG.maxRetries) {
          try {
            const flights = await searchFlights({
              origin: destination,
              destination: returnAirport,
              dateOut: date,
              adults
            }, METRICS);
            console.log(`  \u{1F4E1} ${date} (\u2192${returnAirport}): ${flights.length} lot\xF3w z API`);
            const flightsWithSource = flights.map((f) => ({ ...f, source: "API" }));
            await saveFlightsToCache(destination, returnAirport, date, flightsWithSource, adults);
            inboundFlights.push(...flightsWithSource);
            inFetched++;
            success = true;
          } catch (error) {
            if (error?.hardBlocked) {
              throw error;
            }
            const is429 = error.message?.includes("429") || error.message?.includes("Too Many Requests");
            const is409 = error.message?.includes("409") || error.message?.includes("declined");
            if ((is429 || is409) && retries < RATE_LIMIT_CONFIG.maxRetries) {
              retries++;
              console.warn(`  \u26A0\uFE0F Rate limit/declined, pr\xF3ba ${retries}/${RATE_LIMIT_CONFIG.maxRetries}...`);
              await smartDelay(true);
            } else {
              console.warn(`  \u274C ${date} (\u2192${returnAirport}): ${error.message}`);
              success = true;
            }
          }
        }
      }
    }
  } else {
    for (const returnAirport of returnAirports) {
      const flights = await searchFlightsRange({
        origin: destination,
        destination: returnAirport,
        dateFrom: outFrom,
        dateTo: outTo,
        adults,
        departureFrom: returnDepartureFrom,
        departureTo: returnDepartureTo,
        arrivalFrom: returnArrivalFrom,
        arrivalTo: returnArrivalTo,
        departureDays: returnDays
      }, METRICS);
      inboundFlights.push(...flights.map((f) => ({ ...f, source: f.source || "CACHE" })));
    }
  }
  console.log(`Znaleziono ${inboundFlights.length} lot\xF3w POWR\xD3T`);
  const combinations = [];
  let rejectedByTime = 0;
  let rejectedByStay = 0;
  let rejectedByCombo = 0;
  for (const outFlight of outboundFlights) {
    for (const inFlight of inboundFlights) {
      if (!outFlight.departure || !outFlight.arrival || !inFlight.departure || !inFlight.arrival) continue;
      const outDate = new Date(outFlight.date);
      const inDate = new Date(inFlight.date);
      const diffTime = inDate - outDate;
      const dateDiff = Math.round(diffTime / (1e3 * 60 * 60 * 24));
      const stayDays = dateDiff + 1;
      const outArrivalTime = /* @__PURE__ */ new Date(`${outFlight.date}T${outFlight.arrival}:00`);
      const inDepartureTime = /* @__PURE__ */ new Date(`${inFlight.date}T${inFlight.departure}:00`);
      const timeDiffMs = inDepartureTime - outArrivalTime;
      const timeDiffHours = timeDiffMs / (1e3 * 60 * 60);
      if (timeDiffHours < 7) {
        rejectedByTime++;
        console.log(`   \u274C ODRZUCONO (czas<7h) [fullScan]: out ${outFlight.date} ${outFlight.arrival} (arr) - in ${inFlight.date} ${inFlight.departure} (dep); diff ${timeDiffHours.toFixed(2)}h; outPrice ${outFlight.priceInPLN}, inPrice ${inFlight.priceInPLN}; origin ${outFlight.origin} -> return ${inFlight.origin}`);
        continue;
      }
      if (stayDays >= stayDaysMin && stayDays <= stayDaysMax) {
        const totalPriceInPLN = (outFlight.priceInPLN || 0) + (inFlight.priceInPLN || 0);
        if (totalPriceInPLN === 0) {
          continue;
        }
        if (maxPrice && totalPriceInPLN > maxPrice) {
          rejectedByCombo++;
          console.log(`   \u274C ODRZUCONO (cena>max) [fullScan]: out ${outFlight.date} ${outFlight.arrival} + in ${inFlight.date} ${inFlight.departure} -> total ${totalPriceInPLN} PLN > ${maxPrice}; origin ${outFlight.origin} -> return ${inFlight.origin}`);
          continue;
        }
        combinations.push({
          outbound: outFlight,
          inbound: inFlight,
          totalPriceInPLN,
          // tylko cena w PLN
          stayDays,
          // używaj stayDays (1=ten sam dzień), nie dateDiff
          outDate: outFlight.date,
          inDate: inFlight.date,
          originAirport: outFlight.origin,
          returnAirport: inFlight.destination,
          originName: outFlight.originName || "",
          returnName: inFlight.destinationName || "",
          source: outFlight.source === "API" && inFlight.source === "API" ? "API" : outFlight.source === "CACHE" && inFlight.source === "CACHE" ? "CACHE" : "MIXED"
        });
        console.log(`   \u2705 Zaakceptowano [fullScan]: ${outFlight.origin}->${outFlight.destination} ${outFlight.date} (${outFlight.arrival}) + ${inFlight.origin}->${inFlight.destination} ${inFlight.date} (${inFlight.departure}) = ${totalPriceInPLN} PLN; legSources: ${outFlight.source || "UNKNOWN"}/${inFlight.source || "UNKNOWN"}; comboSource: ${outFlight.source === "API" && inFlight.source === "API" ? "API" : outFlight.source === "CACHE" && inFlight.source === "CACHE" ? "CACHE" : "MIXED"}`);
        console.log(`   \u2705 Zaakceptowano [fullScan]: ${outFlight.origin}->${outFlight.destination} ${outFlight.date} (${outFlight.arrival}) + ${inFlight.origin}->${inFlight.destination} ${inFlight.date} (${inFlight.departure}) = ${totalPriceInPLN} PLN; source: ${outFlight.source || "UNKNOWN"}/${inFlight.source || "UNKNOWN"}`);
      } else {
        rejectedByStay++;
        console.log(`   \u274C ODRZUCONO (pobyt poza zakresem) [fullScan]: out ${outFlight.date} -> in ${inFlight.date} = ${stayDays} dni; allowed ${stayDaysMin}-${stayDaysMax}; origin ${outFlight.origin}`);
      }
    }
  }
  console.log(`\u{1F4CA} \u0141\u0105czenie: ${outboundFlights.length} TAM \xD7 ${inboundFlights.length} POWR\xD3T = ${outboundFlights.length * inboundFlights.length} mo\u017Cliwo\u015Bci`);
  console.log(`   \u274C Odrzucono: ${rejectedByCombo} (cena > ${maxPrice || "\u221E"}), ${rejectedByTime} (< 7h), ${rejectedByStay} (poza zakresem pobytu)`);
  console.log(`   \u2705 Zaakceptowano: ${combinations.length} kombinacji`);
  combinations.sort((a, b) => {
    if (!a.totalPriceInPLN) return 1;
    if (!b.totalPriceInPLN) return -1;
    return a.totalPriceInPLN - b.totalPriceInPLN;
  });
  let filtered = combinations;
  if (cheapCombinations.size > 0 && METRICS.totalDays === 0) {
    METRICS.totalDays = outCached + outFetched + (inCached + inFetched);
    METRICS.daysFromCache = outCached + inCached;
    METRICS.daysFetched = outFetched + inFetched;
  }
  LAST_METRICS = {
    ...METRICS,
    percentFromCache: METRICS.totalDays > 0 ? Math.round(METRICS.daysFromCache / METRICS.totalDays * 100) : 0,
    percentFromApi: METRICS.totalDays > 0 ? Math.round(METRICS.daysFetched / METRICS.totalDays * 100) : 0
  };
  if (useFareFinderOptimization) {
    const daysSearched = outCached + outFetched + (inCached + inFetched);
    const possibleDaysWithoutOptimization = totalDays * 2;
    const savedDays = possibleDaysWithoutOptimization - daysSearched;
    const savedPercent = possibleDaysWithoutOptimization > 0 ? Math.round(savedDays / possibleDaysWithoutOptimization * 100) : 0;
    console.log(`\u{1F4B0} Oszcz\u0119dno\u015B\u0107 FareFinder: ${savedDays}/${possibleDaysWithoutOptimization} dni (${savedPercent}%) - dzi\u0119ki optymalizacji pomini\u0119to ${savedDays} zapyta\u0144`);
  }
  console.log(`Znaleziono ${filtered.length} kombinacji round-trip. API calls: ${LAST_METRICS.apiCalls} (FareFinder: ${LAST_METRICS.fareFinderCalls}), dni: ${LAST_METRICS.totalDays} (${LAST_METRICS.daysFromCache} cache, ${LAST_METRICS.daysFetched} API)`);
  return filtered;
}
function parseFlights(data, tripIndex = 0) {
  const flights = [];
  if (!data.trips || !data.trips[tripIndex]) {
    return flights;
  }
  const trip = data.trips[tripIndex];
  for (const dateEntry of trip.dates || []) {
    for (const flight of dateEntry.flights || []) {
      if (!flight.time || flight.time.length < 2) continue;
      const departureTime = flight.time[0];
      const arrivalTime = flight.time[1];
      const flightInfo = {
        date: departureTime.substring(0, 10),
        // "2025-12-01"
        flightNumber: flight.flightNumber || "",
        departure: departureTime.substring(11, 16),
        // "08:30"
        arrival: arrivalTime.substring(11, 16),
        // "09:50"
        duration: flight.duration || "",
        price: null,
        currency: data.currency || "PLN",
        priceInPLN: null,
        // Będzie wyliczone poniżej
        source: "API",
        // default when parsing actual API search results
        faresLeft: flight.faresLeft || 0,
        infantsLeft: flight.infantsLeft || 0,
        operatedBy: flight.operatedBy || "Ryanair"
      };
      if (flight.regularFare && flight.regularFare.fares && flight.regularFare.fares.length > 0) {
        flightInfo.price = flight.regularFare.fares[0].amount;
        const convertedPrice = convertToPLN(flightInfo.price, flightInfo.currency);
        flightInfo.priceInPLN = convertedPrice !== null ? convertedPrice : flightInfo.price || 0;
      } else if (flight.price && typeof flight.price === "number") {
        flightInfo.price = flight.price;
        flightInfo.priceInPLN = convertToPLN(flightInfo.price, flightInfo.currency) || flightInfo.price;
      } else {
        flightInfo.price = 0;
        flightInfo.priceInPLN = 0;
      }
      flights.push(flightInfo);
    }
  }
  return flights;
}
async function getAirports(market = "pl") {
  try {
    const response = await safeRyanairFetch(`${BACKEND_API}/ryanair/airports?market=${market}`, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });
    if (!response.ok) {
      throw new Error("Nie uda\u0142o si\u0119 pobra\u0107 listy lotnisk");
    }
    const airports = await response.json();
    return airports;
  } catch (error) {
    console.error("B\u0142\u0105d pobierania lotnisk:", error);
    if (error?.hardBlocked) throw error;
    return [];
  }
}
async function getRoutes(origin, market = "pl-pl") {
  try {
    const response = await safeRyanairFetch(`${BACKEND_API}/ryanair/routes?origin=${origin}&market=${market}`, {
      method: "GET",
      headers: { "Accept": "application/json" }
    });
    if (!response.ok) {
      console.warn(`Nie uda\u0142o si\u0119 pobra\u0107 routes dla ${origin} (status: ${response.status})`);
      return [];
    }
    const data = await response.json();
    return data.destinations || [];
  } catch (e) {
    console.error("B\u0142\u0105d getRoutes:", e);
    if (e?.hardBlocked) throw e;
    return [];
  }
}
async function getAirportCategories(market = "pl") {
  try {
    const response = await safeRyanairFetch(`${BACKEND_API}/ryanair/airport-categories?market=${market}`, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });
    if (!response.ok) {
      throw new Error("Nie uda\u0142o si\u0119 pobra\u0107 kategorii lotnisk");
    }
    const categories = await response.json();
    return categories;
  } catch (error) {
    console.error("B\u0142\u0105d pobierania kategorii:", error);
    if (error?.hardBlocked) throw error;
    return [];
  }
}
async function getAvailableDestinations(origin, market = "pl-pl") {
  try {
    const response = await safeRyanairFetch(`${BACKEND_API}/ryanair/routes?origin=${origin}&market=${market}`, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });
    if (!response.ok) {
      throw new Error(`Nie uda\u0142o si\u0119 pobra\u0107 po\u0142\u0105cze\u0144 z ${origin}`);
    }
    const routes = await response.json();
    const directRoutes = routes.filter((route) => !route.connectingAirport);
    console.log(`\u2708\uFE0F Dost\u0119pne po\u0142\u0105czenia z ${origin}: ${directRoutes.length} bezpo\u015Brednich, ${routes.length - directRoutes.length} z przesiadk\u0105`);
    return routes;
  } catch (error) {
    console.error(`B\u0142\u0105d pobierania po\u0142\u0105cze\u0144 z ${origin}:`, error);
    if (error?.hardBlocked) throw error;
    return [];
  }
}
async function getAvailableDates(origin, destination, market = "pl-pl") {
  try {
    await smartDelay();
    const response = await safeRyanairFetch(
      `${BACKEND_API}/ryanair/availableDates?origin=${origin}&destination=${destination}&market=${market}`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json"
        }
      }
    );
    if (!response.ok) {
      console.warn(`\u26A0\uFE0F Nie uda\u0142o si\u0119 pobra\u0107 dost\u0119pnych dat dla ${origin}\u2192${destination}, status ${response.status}`);
      return null;
    }
    const data = await response.json();
    if (data.error) {
      console.warn(`\u26A0\uFE0F B\u0142\u0105d dost\u0119pno\u015Bci dat ${origin}\u2192${destination}: ${data.error}`);
      return null;
    }
    console.log(`\u{1F4C5} Dost\u0119pne daty ${origin}\u2192${destination}: ${data.count} dni${data.cached ? " (cache)" : ""}`);
    return data.dates || [];
  } catch (error) {
    console.error(`\u274C B\u0142\u0105d pobierania dost\u0119pnych dat ${origin}\u2192${destination}:`, error);
    if (error?.hardBlocked) throw error;
    return null;
  }
}
async function searchAnyDestination(params, priceLimit = null) {
  const { origin, dateFrom, dateTo, adults = 1, market = "pl-pl", departureFrom = "00:00", departureTo = "23:59" } = params;
  console.log("\u{1F50D} searchAnyDestination wywo\u0142ane:", params);
  try {
    const cacheKey = `any:${origin}:${dateFrom}:${dateTo}:${adults}:${market}:${priceLimit ?? "null"}`;
    if (globalThis.__anyDestCache && globalThis.__anyDestCache.has(cacheKey)) {
      const entry = globalThis.__anyDestCache.get(cacheKey);
      if (entry.expires > Date.now()) {
        if (entry.result) {
          console.log("\u{1F4BE} searchAnyDestination cache hit:", cacheKey);
          if (entry.result.fares && Array.isArray(entry.result.fares)) {
            entry.result.fares = entry.result.fares.map((far) => ({
              ...far,
              flights: Array.isArray(far.flights) ? far.flights.map((x) => ({ ...x, source: x.source || "CACHE" })) : far.flights
            }));
          }
          return entry.result;
        }
      } else {
        globalThis.__anyDestCache.delete(cacheKey);
      }
    }
    const queryParams = new URLSearchParams({
      departureAirportIataCode: origin,
      outboundDepartureDateFrom: dateFrom,
      outboundDepartureDateTo: dateTo,
      outboundDepartureTimeFrom: departureFrom,
      outboundDepartureTimeTo: departureTo,
      adultPaxCount: adults,
      market,
      searchMode: "ALL"
    });
    if (priceLimit) queryParams.set("maxPrice", String(priceLimit));
    await smartDelay();
    console.log("\u{1F4E1} Wysy\u0142am zapytanie do backend:", `${BACKEND_API}/ryanair/anyDestination?${queryParams}`);
    const response = await safeRyanairFetch(
      `${BACKEND_API}/ryanair/anyDestination?${queryParams}`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json"
        }
      }
    );
    if (!response.ok) {
      throw new Error(`B\u0142\u0105d API: ${response.status}`);
    }
    const data = await response.json();
    console.log("\u{1F4E6} Otrzymane dane z backend:", data);
    const destinations = {};
    if (data.fares && Array.isArray(data.fares)) {
      console.log("\u{1F50D} Parsuj\u0119", data.fares.length, "fare'\xF3w");
      data.fares.forEach((fare, index) => {
        console.log(`Fare ${index}:`, JSON.stringify(fare).substring(0, 200));
        const dest = fare.outbound?.arrivalAirport?.iataCode;
        const rawPriceObj = fare.outbound?.price;
        const price = (rawPriceObj?.value ?? rawPriceObj?.amount) || 0;
        const date = fare.outbound?.departureDate?.split("T")[0];
        console.log(`  Dest: ${dest}, Price: ${price}, Date: ${date}`);
        if (dest && price > 0) {
          if (!destinations[dest]) {
            destinations[dest] = {
              destination: dest,
              destinationName: fare.outbound?.arrivalAirport?.name || dest,
              minPrice: convertToPLN(price, rawPriceObj?.currencyCode || rawPriceObj?.currency || "PLN") || price,
              flights: []
            };
          }
          destinations[dest].minPrice = Math.min(destinations[dest].minPrice, convertToPLN(price, rawPriceObj?.currencyCode || rawPriceObj?.currency || "PLN") || price);
          const currency = rawPriceObj?.currencyCode || rawPriceObj?.currency || "PLN";
          const flightObj = {
            date,
            price,
            currency,
            priceInPLN: convertToPLN(price, currency),
            originAirport: origin,
            source: fare.source || "API",
            departure: fare.outbound?.departureTime?.split("T")?.[1]?.slice(0, 5) || fare.outbound?.time || null,
            arrival: fare.outbound?.arrivalTime?.split("T")?.[1]?.slice(0, 5) || null
          };
          if (departureFrom || departureTo) {
            if (isTimeBetween(flightObj.departure, departureFrom, departureTo)) {
              destinations[dest].flights.push(flightObj);
            }
          } else {
            destinations[dest].flights.push(flightObj);
          }
        } else {
          console.log(`  \u26A0\uFE0F Pomin\u0119to fare - dest: ${dest}, price: ${price}`);
        }
      });
    } else {
      console.log("\u26A0\uFE0F Brak fares w odpowiedzi:", data);
    }
    const result = Object.values(destinations);
    try {
      if (!globalThis.__anyDestCache) globalThis.__anyDestCache = /* @__PURE__ */ new Map();
      globalThis.__anyDestCache.set(cacheKey, { result, expires: Date.now() + 30 * 60 * 1e3 });
    } catch (e) {
    }
    console.log("\u2705 searchAnyDestination zwraca:", result.length, "destynacji");
    return result;
  } catch (error) {
    console.error("B\u0142\u0105d wyszukiwania ANY destination:", error);
    if (error?.hardBlocked) throw error;
    return [];
  }
}
export {
  configureRateLimit,
  debugCheckPair,
  getAirportCategories,
  getAirports,
  getAvailableDates,
  getAvailableDestinations,
  getLastMetrics,
  getMonthlyFaresForRoute,
  getRoutes,
  getRyanairLimiterStatus,
  isRyanairBlocked,
  resetRyanairLimiter,
  safeRyanairFetch,
  searchAnyDestination,
  searchFlights,
  searchFlightsRange,
  searchRoundTripRange
};
