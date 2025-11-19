/**
 * Ryanair API Client
 * Używa proxy backendowego aby ominąć CORS
 */

// Używaj jednego źródła prawdy: VITE_API_URL powinno wskazywać na bazę z sufiksem /api
// np. VITE_API_URL=http://localhost:8000/api
const BACKEND_API = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/+$/, '');
const BACKEND_ROOT = BACKEND_API.replace(/\/api$/, '');

// Globalny twardy limiter i wyłącznik awaryjny (circuit breaker) dla WSZYSTKICH wywołań /ryanair/*
// Parametry limitera – wracamy do miękkiego opóźnienia sterowanego smartDelay
const RYANAIR_LIMIT = {
  concurrency: 0 // informacyjne; kolejkowanie wyłączone, używamy smartDelay jak wcześniej
};

const RYANAIR_BLOCK_KEY = 'ryanair_hard_blocked';
let _ryanairState = {
  blocked: false,
  chain: Promise.resolve(),
  errorsInRow: 0
};

// Przy starcie przywróć stan blokady z localStorage
try {
  const persisted = localStorage.getItem(RYANAIR_BLOCK_KEY);
  if (persisted === 'true') {
    _ryanairState.blocked = true;
    console.warn('🛑 Ryanair API w stanie BLOKADY (przywrócono z localStorage). Wstrzymuję wszystkie wywołania do czasu ręcznego resetu.');
  }
} catch {}

function _markRyanairBlocked(reason = 'Wykryto blokadę po stronie Ryanair', status) {
  _ryanairState.blocked = true;
  try { localStorage.setItem(RYANAIR_BLOCK_KEY, 'true'); } catch {}
  const err = new Error(`Ryanair zablokował ruch API. ${reason}. Zresetuj router i kliknij „Odblokuj” w aplikacji.`);
  err.name = 'RyanairHardBlockError';
  err.hardBlocked = true;
  if (status) err.status = status;
  console.warn('🛑 [HARD BLOCK] Zatrzymuję wszystkie zapytania do /ryanair/* aż do ręcznego resetu.', { status });
  throw err;
}

function _isRyanairUrl(url) {
  try {
    const u = typeof url === 'string' ? new URL(url, window.location.origin) : url;
    return typeof url === 'string' ? url.includes('/ryanair/') : (u.pathname || '').includes('/ryanair/');
  } catch {
    return String(url).includes('/ryanair/');
  }
}

// Globalne szeregowanie – sterowane semaphorem, ze wsparciem dla maxParallelRequests
// To pozwala wykonywać wiele requestów równolegle, ale nadal kontrolujemy opóźnienia
let _activeRequests = 0;
const _waitingResolvers = [];
async function _enqueue(fn) {
  if (_ryanairState.blocked) {
    return _markRyanairBlocked('Stan blokady aktywny');
  }

  await new Promise(resolve => {
    const tryTake = () => {
      if (_ryanairState.blocked) return resolve(_markRyanairBlocked('Stan blokady aktywny'));
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

export function isRyanairBlocked() {
  return !!_ryanairState.blocked;
}

export function getRyanairLimiterStatus() {
  return {
    blocked: _ryanairState.blocked,
    errorsInRow: _ryanairState.errorsInRow,
    note: 'Globalna kolejka + miękki delay 600±200ms; CB po 3x 429/409/403'
  };
}

export function resetRyanairLimiter() {
  _ryanairState.blocked = false;
  try { localStorage.removeItem(RYANAIR_BLOCK_KEY); } catch {}
  console.log('✅ Odblokowano limiter Ryanair (ręczny reset).');
}

// Publiczny, bezpieczny wrapper na fetch dla wywołań /ryanair/*
export async function safeRyanairFetch(url, options = {}) {
  if (!_isRyanairUrl(url)) {
    // Nie dotyczy – zwykły fetch
    return fetch(url, options);
  }
  return _enqueue(async () => {
    if (_ryanairState.blocked) {
      return _markRyanairBlocked('Stan blokady aktywny');
    }

    // Retry pętla dla 429/409/403 z odstępem 2s (RATE_LIMIT_CONFIG.retryDelay)
    let attempt = 0;
    while (true) {
      const res = await fetch(url, options);
      if (res && (res.status === 429 || res.status === 409 || res.status === 403)) {
        _ryanairState.errorsInRow += 1;
        if (_ryanairState.errorsInRow >= 3) { // próg CB
          _markRyanairBlocked(`HTTP ${res.status}`, res.status);
        }
        if (attempt < (RATE_LIMIT_CONFIG.maxRetries || 0)) {
          attempt += 1;
          await new Promise(r => setTimeout(r, RATE_LIMIT_CONFIG.retryDelay || 2000));
          continue;
        }
        return res; // po retry oddaj odpowiedź (wyżej może być obsłużone)
      }

      // Reset licznika błędów na udanym 2xx/3xx
      if (res && res.ok) {
        _ryanairState.errorsInRow = 0;
      }

      // Proste wykrywanie blokady w ciele JSON
      try {
        if (res && res.ok && res.headers.get('content-type')?.includes('application/json')) {
          const cloned = res.clone();
          const body = await cloned.json().catch(() => null);
          if (body && (body.error?.includes?.('blocked') || body.message?.includes?.('blocked'))) {
            _ryanairState.errorsInRow += 1;
            if (_ryanairState.errorsInRow >= 3) {
              _markRyanairBlocked('Odpowiedź API sygnalizuje blokadę');
            }
          }
        }
      } catch {}
      return res;
    }
  });
}

async function ensureBackendUp() {
  try {
    const res = await fetch(`${BACKEND_ROOT}/health`, { method: 'GET' });
    if (!res.ok) throw new Error(`Backend health ${res.status}`);
    return true;
  } catch (e) {
    console.error('Backend (cache/proxy) niedostępny:', e);
    throw new Error('Backend niedostępny – włącz serwer (http://localhost:8000) zanim zaczniesz szukać.');
  }
}

/**
 * Debug helper: sprawdź jedną, konkretną parę dat (outDate + inDate dla returnAirport)
 * Zwraca szczegóły o lotach TAM/POWRÓT, przyczynach odrzucenia i akceptowanych kombinacjach
 * Do użycia w devtools: window.debugCheckPair({ origin, destination, outDate, inDate, returnAirport, adults, maxPrice })
 */
export async function debugCheckPair({ origin, destination, outDate, inDate, returnAirport, adults = 1, maxPrice = 9999 }) {
  const MET = { apiCalls: 0, fareFinderCalls: 0 };

  // Pobierz TAM (cache lub api)
  const cachedOut = await getFlightsFromCache(origin, destination, outDate, adults);
  let outFlights = cachedOut !== null ? cachedOut.map(f => ({ ...f, source: 'CACHE' })) : null;
  if (!outFlights) {
    MET.apiCalls += 1; // We'll mark an API call here
    outFlights = (await searchFlights({ origin, destination, dateOut: outDate, adults }, MET)).map(f => ({ ...f, source: 'API' }));
  }

  // Pobierz POWRÓT (cache lub api)
  const cachedIn = await getFlightsFromCache(destination, returnAirport, inDate, adults);
  let inFlights = cachedIn !== null ? cachedIn.map(f => ({ ...f, source: 'CACHE' })) : null;
  if (!inFlights) {
    MET.apiCalls += 1;
    inFlights = (await searchFlights({ origin: destination, destination: returnAirport, dateOut: inDate, adults }, MET)).map(f => ({ ...f, source: 'API' }));
  }

  const debugOut = outFlights.filter(f => f.priceInPLN != null && f.departure && f.arrival);
  const debugIn = inFlights.filter(f => f.priceInPLN != null && f.departure && f.arrival);

  const results = [];
  for (const out of debugOut) {
    for (const inbound of debugIn) {
      const outArrival = new Date(`${out.date}T${out.arrival}:00`);
      const inDeparture = new Date(`${inbound.date}T${inbound.departure}:00`);
      const diffH = (inDeparture - outArrival) / (1000 * 60 * 60);
      const total = (out.priceInPLN || 0) + (inbound.priceInPLN || 0);
      const reasons = [];
      if (diffH < 7) reasons.push('czas<7h');
      if (total > maxPrice) reasons.push('cena>max');
      const stayDays = Math.round((new Date(inbound.date) - new Date(out.date)) / (1000 * 60 * 60 * 24)) + 1;
      if (stayDays < 1) reasons.push('pobyt<1');
      results.push({ outbound: out, inbound, totalPriceInPLN: total, timeDiffHours: diffH, stayDays, accepted: reasons.length === 0, reasons });
    }
  }

  const accepted = results.filter(r => r.accepted);
  const rejected = results.filter(r => !r.accepted);

  console.log(`🔍 debugCheckPair: ${origin}->${destination} ${outDate} + ${destination}->${returnAirport} ${inDate}`);
  console.log(`   Out flights: ${debugOut.length}, In flights: ${debugIn.length}, Total pairs: ${results.length}`);
  console.log(`   Accepted: ${accepted.length}, Rejected: ${rejected.length}`);
  rejected.slice(0, 20).forEach(r => console.log(`   ❌ Rejected: ${r.outbound.date} ${r.outbound.arrival} + ${r.inbound.date} ${r.inbound.departure} -> ${r.totalPriceInPLN} PLN; outPrice=${r.outbound.priceInPLN} (${r.outbound.price} ${r.outbound.currency}), inPrice=${r.inbound.priceInPLN} (${r.inbound.price} ${r.inbound.currency}); reasons: ${r.reasons.join(', ')}`));
  accepted.slice(0, 20).forEach(r => console.log(`   ✅ Accepted: ${r.outbound.date} ${r.outbound.arrival} + ${r.inbound.date} ${r.inbound.departure} -> ${r.totalPriceInPLN} PLN; outPrice=${r.outbound.priceInPLN} (${r.outbound.price} ${r.outbound.currency}), inPrice=${r.inbound.priceInPLN} (${r.inbound.price} ${r.inbound.currency}); legSources: ${r.outbound.source}/${r.inbound.source}`));

  return { MET, accepted, rejected, results };
}

// Przydatne dla deva — expose do okna (devtools)
if (typeof window !== 'undefined') {
  window.debugCheckPair = debugCheckPair;
}
/**
 * Cache dla cen miesięcznych z FareFinder - używa localStorage aby przetrwać odświeżenie
 * Struktura: { "WAW-AGP-2024-12-01-2024-12-31-round-2": { prices: [[date, price], ...], timestamp: 1234567890 } }
 */
const CACHE_DURATION = 60 * 60 * 1000; // 1 godzina w milisekundach
const CACHE_KEY_PREFIX = 'ryanair_fare_cache_';
const FLIGHT_CACHE_PREFIX = 'ryanair_flight_cache_';

// Ostatnie metryki wyszukiwania (udostępniane do UI)
let LAST_METRICS = null;
export function getLastMetrics() {
  return LAST_METRICS;
}

// Konfiguracja opóźnień między requestami (anty-rate-limit)
const RATE_LIMIT_CONFIG = {
  baseDelay: 300,        // Podstawowe opóźnienie 300ms między requestami (szybsze domyślnie)
  jitterRange: 200,      // Losowy jitter ±200ms (200-600ms total)
  retryDelay: 2000,      // Opóźnienie po błędzie 409/429
  maxRetries: 2,         // Maksymalna liczba prób przy błędzie
  maxParallelRequests: 6 // Maksymalna liczba równoległych requestów do Ryanair (sterowana przez semaphore)
};

/**
 * Eksportowana funkcja do dostosowania konfiguracji rate limiting
 * (opcjonalnie, jeśli użytkownik chce dostosować opóźnienia)
 */
export function configureRateLimit(config) {
  if (config.baseDelay !== undefined) RATE_LIMIT_CONFIG.baseDelay = config.baseDelay;
  if (config.jitterRange !== undefined) RATE_LIMIT_CONFIG.jitterRange = config.jitterRange;
  if (config.retryDelay !== undefined) RATE_LIMIT_CONFIG.retryDelay = config.retryDelay;
  if (config.maxRetries !== undefined) RATE_LIMIT_CONFIG.maxRetries = config.maxRetries;
  if (config.maxParallelRequests !== undefined) RATE_LIMIT_CONFIG.maxParallelRequests = config.maxParallelRequests;
  if (config.maxParallelRequests !== undefined) console.log('⚙️ Rate limit parallelism updated:', RATE_LIMIT_CONFIG.maxParallelRequests);
  console.log('⚙️ Rate limit config updated:', RATE_LIMIT_CONFIG);
}

/**
 * Inteligentne opóźnienie z losowym jitterem (zapobiega rate limiting)
 */
async function smartDelay(isRetry = false) {
  const jitter = Math.random() * RATE_LIMIT_CONFIG.jitterRange * 2 - RATE_LIMIT_CONFIG.jitterRange;
  const delay = isRetry
    ? RATE_LIMIT_CONFIG.retryDelay
    : RATE_LIMIT_CONFIG.baseDelay + jitter;

  await new Promise(resolve => setTimeout(resolve, Math.max(100, delay)));
}

function createMetrics() {
  return {
    apiCalls: 0,             // łączna liczba zapytań HTTP do backendu
    fareFinderCalls: 0,      // ile z nich to wywołania FareFinder
    totalDays: 0,            // ile dni analizowaliśmy w sumie
    daysFromCache: 0,        // ile dni poszło z cache (bez HTTP)
    daysFetched: 0,          // ile dni pobrano z API
  };
}

// Convert 'HH:MM' -> minutes from midnight
function timeStrToMinutes(t) {
  if (!t || typeof t !== 'string') return null;
  const parts = t.split(':');
  if (parts.length !== 2) return null;
  const hh = parseInt(parts[0], 10);
  const mm = parseInt(parts[1], 10);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  return hh * 60 + mm;
}

// Check whether a 'HH:MM' string is within inclusive time range from->to
function isTimeBetween(timeStr, fromStr, toStr) {
  if (!timeStr) return false;
  const t = timeStrToMinutes(timeStr);
  if (t === null) return false;
  const from = timeStrToMinutes(fromStr || '00:00');
  const to = timeStrToMinutes(toStr || '23:59');
  if (from === null || to === null) return false;
  if (from <= to) {
    return t >= from && t <= to;
  } else {
    // wrap-around (e.g., from 22:00 to 03:00)
    return t >= from || t <= to;
  }
}

// Apply time filters to a list of flights: filters = { departureFrom, departureTo, arrivalFrom, arrivalTo }
function applyTimeFiltersToFlights(flights, filters = {}) {
  if (!filters) return flights;
  const { departureFrom, departureTo, arrivalFrom, arrivalTo } = filters;
  if (!departureFrom && !departureTo && !arrivalFrom && !arrivalTo) return flights;
  return flights.filter(f => {
    const depOk = departureFrom || departureTo ? isTimeBetween(f.departure, departureFrom, departureTo) : true;
    const arrOk = arrivalFrom || arrivalTo ? isTimeBetween(f.arrival, arrivalFrom, arrivalTo) : true;
    return depOk && arrOk;
  });
}

// Apply day-of-week filter to flights based on `filters.departureDays` (array of booleans Mon->Sun)
function isDateMatchingDays(dateStr, daysArray) {
  if (!daysArray || daysArray.length !== 7) return true; // default all
  const d = new Date(dateStr);
  if (!d || Number.isNaN(d.getTime())) return true;
  const dow = d.getDay(); // 0 = Sunday
  // Convert to Mon index 0..6 where 0 = Monday, but our daysArray uses Mon first index 0
  const idx = (dow === 0) ? 6 : (dow - 1);
  return !!daysArray[idx];
}

function applyDayFiltersToFlights(flights, filters = {}) {
  const { departureDays, returnDays } = filters;
  if (!departureDays && !returnDays) return flights;
  return flights.filter(f => {
    const dateStr = f.searched_date || f.date;
    if (!dateStr) return true;
    // For single flights use departureDays; for round trip legs we may pass both
    if (departureDays && !returnDays) {
      return isDateMatchingDays(dateStr, departureDays);
    }
    if (returnDays && !departureDays) {
      return isDateMatchingDays(dateStr, returnDays);
    }
    return true;
  });
}

// Convert boolean days array (Mon..Sun) to Ryanair weekday list string 'MONDAY,TUESDAY'
function daysArrayToWeekdayList(daysArray) {
  if (!Array.isArray(daysArray) || daysArray.length !== 7) return null;
  const names = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];
  const sel = [];
  for (let i=0;i<7;i++) if (daysArray[i]) sel.push(names[i]);
  return sel.length > 0 ? sel.join(',') : null;
}

/**
 * Generuj klucz cache dla zapytania
 */
function getCacheKey(params) {
  const { origin, destination, dateFrom, dateTo, tripType = 'oneway', adults = 1 } = params;
  return `${CACHE_KEY_PREFIX}${origin}-${destination}-${dateFrom}-${dateTo}-${tripType}-${adults}`;
}

/**
 * Generuj klucz cache dla szczegółowych lotów na konkretny dzień
 */
function getFlightCacheKey(origin, destination, date, adults = 1) {
  return `${FLIGHT_CACHE_PREFIX}${origin}-${destination}-${date}-${adults}`;
}

/**
 * Pobierz loty z cache (backend PostgreSQL) dla konkretnego dnia
 */
async function getFlightsFromCache(origin, destination, date, adults = 1) {
  try {
    const cacheKey = getFlightCacheKey(origin, destination, date, adults);
    const response = await fetch(`${BACKEND_API}/cache/${encodeURIComponent(cacheKey)}`);
    const result = await response.json();

    if (!result.data) {
      return null;
    }

    const flights = result.data.flights || result.data;
    // Oznacz wszystkie loty zwrócone z cache jako CACHE
    if (Array.isArray(flights)) {
      return flights.map(f => ({
        ...f,
        source: f.source || 'CACHE',
        origin: f.origin || origin,
        destination: f.destination || destination,
        originName: f.originName || null,
        destinationName: f.destinationName || null
      }));
    }
    return flights;
  } catch (e) {
    console.warn('Błąd odczytu cache lotów:', e);
    return null;
  }
}

/**
 * Zapisz loty do cache (backend PostgreSQL) dla konkretnego dnia
 */
async function saveFlightsToCache(origin, destination, date, flights, adults = 1) {
  try {
    const cacheKey = getFlightCacheKey(origin, destination, date, adults);
    const res = await fetch(`${BACKEND_API}/cache`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
          cache_key: cacheKey,
          data: { flights },
          ttl: 86400  // 24 godziny
      })
    });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      console.warn('Błąd zapisu cache lotów (HTTP):', res.status, t);
    } else {
      console.log(`💾 [API] Zapisano loty do cache: ${cacheKey} (${flights?.length || 0})`);
    }
  } catch (e) {
    console.warn('Błąd zapisu cache lotów:', e);
  }
}

/**
 * Pobierz z cache (backend PostgreSQL)
 */
async function getFromCache(cacheKey) {
  try {
    console.log(`🔍 Sprawdzam cache dla klucza: ${cacheKey}`);
    const response = await fetch(`${BACKEND_API}/cache/${encodeURIComponent(cacheKey)}`);

    // Jeśli backend offline – rzuć błąd
    if (!response.ok && response.status >= 500) {
      throw new Error(`Cache backend error ${response.status}`);
    }

    const result = await response.json();

    if (!result.data) {
      console.log('❌ Brak danych w cache');
      return null;
    }

    const ageSeconds = result.age_seconds || 0;
    const ageMinutes = Math.round(ageSeconds / 60);

    console.log(`📦 Znaleziono w cache (wiek: ${ageMinutes} min, limit: ${Math.round(CACHE_DURATION / 60000)} min)`);

    // Konwertuj z powrotem na Map
    const pricesMap = new Map(result.data.prices);
    console.log(`✅ Cache aktualny - zwracam ${pricesMap.size} pozycji`);
    return { data: pricesMap, age_seconds: ageSeconds };
  } catch (e) {
    console.warn('Błąd odczytu cache:', e);
    return null;
  }
}

/**
 * Zapisz do cache (backend PostgreSQL)
 */
async function saveToCache(cacheKey, pricesMap) {
  try {
    const res = await fetch(`${BACKEND_API}/cache`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cache_key: cacheKey,
        data: { prices: Array.from(pricesMap.entries()) },
        ttl: 3600  // 1 godzina
      })
    });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      console.warn('Błąd zapisu cache (HTTP):', res.status, t);
    } else {
      console.log(`💾 [API] Zapisano do cache: ${cacheKey} (${pricesMap.size} pozycji)`);
    }
  } catch (e) {
    console.warn('Błąd zapisu cache:', e);
  }
}

/**
 * Kursy walut (pobierane automatycznie z NBP API)
 * Bazowe: 1 EUR = X PLN, 1 GBP = X PLN itd.
 */
let EXCHANGE_RATES = {
  PLN: 1,
  EUR: 4.35,  // Fallback - będzie zaktualizowane z NBP
  GBP: 5.15,
  USD: 4.05,
  CZK: 0.18,
  HUF: 0.011,
  SEK: 0.39,
  NOK: 0.38,
  DKK: 0.58
};

/**
 * Pobierz aktualne kursy walut z NBP API
 */
async function fetchExchangeRates() {
  try {
    console.log('Pobieram kursy walut z NBP...');

    // NBP API - tabela A (kursy średnie walut obcych)
    const response = await fetch('https://api.nbp.pl/api/exchangerates/tables/A?format=json');

    if (!response.ok) {
      throw new Error(`NBP API error: ${response.status}`);
    }

    const data = await response.json();
    const rates = data[0].rates;

    // Zaktualizuj kursy
    const newRates = { PLN: 1 };

    rates.forEach(rate => {
      newRates[rate.code] = rate.mid;
    });

    // Dla walut, których nie ma w tabeli A, spróbuj tabeli B (waluty egzotyczne)
    try {
      const responseB = await fetch('https://api.nbp.pl/api/exchangerates/tables/B?format=json');
      if (responseB.ok) {
        const dataB = await responseB.json();
        const ratesB = dataB[0].rates;
        ratesB.forEach(rate => {
          newRates[rate.code] = rate.mid;
        });
      }
    } catch (err) {
      console.log('Tabela B (waluty egzotyczne) niedostępna');
    }

    EXCHANGE_RATES = newRates;
    console.log('Kursy walut zaktualizowane z NBP:', EXCHANGE_RATES);

    return EXCHANGE_RATES;
  } catch (error) {
    console.error('Błąd pobierania kursów z NBP:', error);
    console.log('Używam kursów domyślnych');
    return EXCHANGE_RATES;
  }
}

// Pobierz kursy przy starcie aplikacji
fetchExchangeRates();

// Odświeżaj kursy co godzinę
setInterval(fetchExchangeRates, 60 * 60 * 1000);

/**
 * Konwertuj walutę na PLN
 */
function convertToPLN(amount, currency) {
  if (!amount || !currency) return null;
  const rate = EXCHANGE_RATES[currency.toUpperCase()] || 1;
  return Math.round(amount * rate * 100) / 100; // Zaokrąglij do 2 miejsc
}

/**
 * Wyszukaj loty w jedną stronę (przez backend proxy)
 */
export async function searchFlights(params, metrics) {
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
    RoundTrip: 'false',
    IncludeConnectingFlights: 'false',
    promoCode: '',
    ToUs: 'AGREED'
  });

  try {
    // Miękki limiter (600±200ms) jak wcześniej
    await smartDelay();
    // Circuit breaker nadal aktywny w safeRyanairFetch
    const response = await safeRyanairFetch(
      `${BACKEND_API}/ryanair/search?${searchParams}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'pl'
        }
      }
    );

    if (metrics) metrics.apiCalls += 1;

    if (!response.ok) {
      throw new Error(`Błąd API: ${response.status}`);
    }

    const data = await response.json();
    // Parse and annotate with origin/destination so callers can rely on these fields
    const parsed = parseFlights(data);
    const annotated = parsed.map(f => ({
      ...f,
      origin: origin,
      destination: destination,
      originName: null,
      destinationName: null
    }));
    return annotated;
  } catch (error) {
    console.error('Błąd wyszukiwania:', error);
    if (error?.hardBlocked) throw error; // propaguj blokadę
    throw error;
  }
}

/**
 * Generuje tablicę dat (YYYY-MM-DD) między dateFrom i dateTo (inclusive)
 */
function generateDateRange(dateFrom, dateTo) {
  const start = new Date(dateFrom);
  const end = new Date(dateTo);
  const dates = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
  }
  return dates;
}

/**
 * Wyszukaj loty dla zakresu dat (one-way) - bezpośrednio z przeglądarki
 */
/**
 * Wyszukaj loty jednokierunkowe dla zakresu dat (z opcjonalną optymalizacją i cache)
 * @param {object} params - parametry wyszukiwania
 * @param {object} externalMetrics - opcjonalne zewnętrzne metryki (dla round-trip)
 */
export async function searchFlightsRange(params, externalMetrics = null) {
  const METRICS = externalMetrics || createMetrics();
  const { origin, destination, dateFrom, dateTo, maxPrice, adults = 1, departureFrom, departureTo, arrivalFrom, arrivalTo, departureDays } = params;

  console.log(`Szukam lotów jednokierunkowych: ${dateFrom} - ${dateTo}, max cena: ${maxPrice || 'brak'}`);

  // Szybki health-check – jeśli backend jest offline, nie ma sensu próbować cache ani Ryanair
  if (!externalMetrics) {
    await ensureBackendUp();
  }

  // ⚡ OPTYMALIZACJA #1: Najpierw sprawdź dostępne daty (tylko dni z lotami)
  // To znacznie przyspieszy wyszukiwanie - zamiast sprawdzać każdy dzień,
  // pytamy tylko o te na które faktycznie są loty
  const availableDates = await getAvailableDates(origin, destination);

  let allPossibleDates;

  if (availableDates && availableDates.length > 0) {
    // ✅ Mamy listę dostępnych dat - użyj tylko ich (filtruj do zakresu użytkownika)
    const userDateFrom = new Date(dateFrom);
    const userDateTo = new Date(dateTo);

    allPossibleDates = availableDates.filter(dateStr => {
      const d = new Date(dateStr);
      if (!d || d < userDateFrom || d > userDateTo) return false;
      if (departureDays && Array.isArray(departureDays) && departureDays.length === 7) {
        // convert date to day-of-week and check
        const dow = d.getDay(); // 0=Sunday
        const idx = (dow === 0) ? 6 : (dow - 1); // 0=Mon
        return !!departureDays[idx];
      }
      return true;
    });

    console.log(`⚡ OPTYMALIZACJA: Sprawdzam tylko ${allPossibleDates.length} dni z lotami (zamiast wszystkich dni w zakresie)`);
  } else {
    // ⚠️ Brak danych o dostępności (błąd API lub nowa trasa) - generuj wszystkie daty
    console.log(`⚠️ Brak danych o dostępności - sprawdzam wszystkie dni w zakresie`);
    allPossibleDates = generateDateRange(dateFrom, dateTo);
      if (departureDays && Array.isArray(departureDays) && departureDays.length === 7) {
        allPossibleDates = allPossibleDates.filter(dt => {
          const d = new Date(dt);
          const dow = d.getDay();
          const idx = (dow === 0) ? 6 : (dow - 1);
          return !!departureDays[idx];
        });
      }
  }

  // Sprawdź najpierw ile dni mamy już w cache
  const cachedDates = [];
  const uncachedDates = [];

  for (const date of allPossibleDates) {
    const cached = await getFlightsFromCache(origin, destination, date, adults);
    // WAŻNE: rozróżnij brak wpisu (null) od wpisu z pustą listą ([])
    if (cached !== null) {
      cachedDates.push(date);
    } else {
      uncachedDates.push(date);
    }
  }

  console.log(`📊 Status cache: ${cachedDates.length} dni w cache, ${uncachedDates.length} brakujących`);

  // OPTYMALIZACJA dla lotów jednokierunkowych:
  // 1. Jeśli wszystko w cache - filtruj lokalnie po cenie
  // 2. Jeśli brakuje dni - spróbuj FareFinder (może nie zadziałać dla wszystkich tras)
  // 3. Jeśli FareFinder zawiedzie - pobierz wszystkie dni i filtruj lokalnie

  let cheapDatesOnly = null;
  let usedFareFinder = false;

  if (maxPrice && uncachedDates.length === 0) {
    // Wszystko w cache - po prostu filtruj lokalnie, NIE pytaj API o nic
    console.log(`💾 Wszystkie dni w cache - filtruję lokalnie po cenie ≤ ${maxPrice} PLN (bez FareFinder)`);
    cheapDatesOnly = new Set(cachedDates); // Użyj wszystkich z cache, filtr będzie później
    usedFareFinder = false;
  } else if (maxPrice && uncachedDates.length > 0) {
    // Są dni do pobrania - spróbuj FareFinder dla optymalizacji
    console.log(`🔍 Próbuję optymalizacji przez FareFinder (brakuje ${uncachedDates.length} dni)...`);

    const result = await getMonthlyFaresOneWay({
      origin,
      destination,
      dateFrom,
      dateTo,
      adults
      , outboundDays: departureDays
    }, METRICS);

    usedFareFinder = true;

    if (result.size > 0) {
      cheapDatesOnly = new Set();

      for (const [date, price] of result.entries()) {
        if (price <= maxPrice) {
          cheapDatesOnly.add(date);
        }
      }

      console.log(`🎯 OPTYMALIZACJA FareFinder: Znaleziono ${cheapDatesOnly.size} tanich dni (max ${maxPrice} PLN)`);
    } else {
      // FareFinder zwrócił 0 wyników - może nie działać dla tej trasy/zakresu
      console.log(`⚠️ FareFinder nie zwrócił danych - wyszukuję wszystkie dni i filtruję lokalnie`);
      cheapDatesOnly = null; // Brak danych z FareFinder - szukaj wszystkich
      usedFareFinder = false;
    }
  }

  // Ustal które dni faktycznie przeszukujemy
  let datesToSearch;

  if (maxPrice && cheapDatesOnly !== null) {
    // Użyliśmy FareFinder i mamy dane, LUB wszystko było w cache
    if (usedFareFinder) {
      // FareFinder wskazał tanie dni - ale NAJPIERW sprawdź cache!
      const farefinderDates = Array.from(cheapDatesOnly);
      console.log(`🎯 FareFinder wskazał ${farefinderDates.length} tanich dni - sprawdzam cache przed wywołaniem API...`);

      // Sprawdź które z dni wskazanych przez FareFinder są już w cache
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

      console.log(`📊 FareFinder: ${cachedFarefinderDates.length} dni w cache, ${uncachedFarefinderDates.length} do pobrania`);

      // datesToSearch będzie zawierać WSZYSTKIE dni z FareFinder (zarówno z cache jak i do pobrania)
      datesToSearch = farefinderDates;
    } else {
      // Wszystko w cache - sprawdź wszystkie i filtruj po cenie
      datesToSearch = cachedDates;
      console.log(`💾 Tryb cache: filtruję ${datesToSearch.length} dni z cache po cenie`);
    }
  } else {
    // Brak optymalizacji lub FareFinder nie zadziałał - szukaj wszystkich
    datesToSearch = allPossibleDates;
    console.log(`📅 Tryb normalny: szukam wszystkich ${datesToSearch.length} dni${maxPrice ? ' i filtruję po cenie' : ''}`);
  }

  console.log(`📅 Sprawdzam ${datesToSearch.length} dni...`);

  // Sprawdź które dni są w cache i które trzeba pobrać
  const results = [];
  const datesToFetch = [];
  let cachedCount = 0;

  for (const date of datesToSearch) {
    const cachedFlights = await getFlightsFromCache(origin, destination, date, adults);
    if (cachedFlights !== null) {
      // Filtruj po cenie jeśli trzeba
      // Oznacz jako CACHE
      let flightsToAdd = cachedFlights.map(f => ({ ...f, source: 'CACHE' }));
      if (maxPrice) {
        flightsToAdd = cachedFlights.filter(f => {
          const price = f.priceInPLN || convertToPLN(f.price, f.currency);
          return price && price <= maxPrice;
        });
        if (flightsToAdd.length < cachedFlights.length) {
          console.log(`💾💰 ${date}: ${cachedFlights.length} lotów w cache, ${flightsToAdd.length} po filtrze ≤${maxPrice} PLN`);
        }
      }

      const withDates = flightsToAdd.map(f => ({ ...f, searched_date: date }));
      // Zastosuj filtr czasowy jeśli podano
      const filteredWithDates = applyTimeFiltersToFlights(withDates, { departureFrom, departureTo, arrivalFrom, arrivalTo });
      results.push(...filteredWithDates);
      if (filteredWithDates.length !== withDates.length) {
        console.log(`⏱️ Filtr godzinowy zastosowany (${withDates.length} -> ${filteredWithDates.length}) dla ${date}`);
      }
      cachedCount++;
    } else {
      // Brak w cache - trzeba pobrać
      datesToFetch.push(date);
    }
  }

  if (cachedCount > 0) {
    console.log(`💾 Użyto cache dla ${cachedCount} dni, pobieranie ${datesToFetch.length} pozostałych...`);
  }

  if (datesToFetch.length > 0) {
    const estimatedTime = Math.round(datesToFetch.length * (RATE_LIMIT_CONFIG.baseDelay / 1000));
    console.log(`⏱️ Szacowany czas pobierania: ~${estimatedTime}s (${RATE_LIMIT_CONFIG.baseDelay}ms + losowy jitter między requestami)`);
  }

  // Pobierz tylko te dni, których nie ma w cache
  for (let i = 0; i < datesToFetch.length; i++) {
    const d = datesToFetch[i];

    // Inteligentne opóźnienie przed każdym requestem (oprócz pierwszego)
    if (i > 0) {
      await smartDelay();
    }

    let retries = 0;
    let success = false;

    while (!success && retries <= RATE_LIMIT_CONFIG.maxRetries) {
      try {
        const res = await searchFlights({ origin, destination, dateOut: d, adults }, METRICS);

        // Oznacz jako API i zapisz WSZYSTKIE loty do cache (bez filtrowania)
        const resWithSource = res.map(f => ({ ...f, source: 'API' }));
        await saveFlightsToCache(origin, destination, d, resWithSource, adults);

        // Ale do wyników dodaj TYLKO te które spełniają warunek ceny
        let flightsToAdd = resWithSource;
        if (maxPrice) {
          flightsToAdd = res.filter(f => {
            const price = f.priceInPLN || convertToPLN(f.price, f.currency);
            return price && price <= maxPrice;
          });
          if (flightsToAdd.length < res.length) {
            console.log(`💰 ${d}: ${res.length} lotów w cache, ${flightsToAdd.length} po filtrze ≤${maxPrice} PLN`);
          }
        }

        const withDates = flightsToAdd.map(f => ({ ...f, searched_date: d }));
        const filteredWithDates = applyTimeFiltersToFlights(withDates, { departureFrom, departureTo, arrivalFrom, arrivalTo });
        results.push(...filteredWithDates);
        if (filteredWithDates.length !== withDates.length) {
          console.log(`⏱️ Filtr godzinowy zastosowany (${withDates.length} -> ${filteredWithDates.length}) dla ${d}`);
        }
        success = true;
      } catch (error) {
        if (error?.hardBlocked) { throw error; }
        const is429 = error.message?.includes('429') || error.message?.includes('Too Many Requests');
        const is409 = error.message?.includes('409') || error.message?.includes('declined');

        if ((is429 || is409) && retries < RATE_LIMIT_CONFIG.maxRetries) {
          retries++;
          console.warn(`⚠️ Rate limit/declined dla ${d}, próba ${retries}/${RATE_LIMIT_CONFIG.maxRetries}...`);
          await smartDelay(true); // Większe opóźnienie przy retry
        } else {
          console.warn(`Brak lotów dla daty ${d}:`, error.message);
          success = true; // Przerwij retry loop
        }
      }
    }
  }

  // Uzupełnij metryki i zapisz globalnie
  METRICS.totalDays = datesToSearch.length;
  METRICS.daysFromCache = cachedCount;
  METRICS.daysFetched = datesToFetch.length;

  // Zapisz tylko jeśli to nie są zewnętrzne metryki (dla one-way standalone)
  if (!externalMetrics) {
    LAST_METRICS = {
      ...METRICS,
      percentFromCache: METRICS.totalDays > 0 ? Math.round((METRICS.daysFromCache / METRICS.totalDays) * 100) : 0,
      percentFromApi: METRICS.totalDays > 0 ? Math.round((METRICS.daysFetched / METRICS.totalDays) * 100) : 0,
    };
  }

  console.log(`✅ Znaleziono łącznie ${results.length} lotów (${cachedCount} z cache, ${datesToFetch.length} z API). API calls: ${METRICS.apiCalls} (FareFinder: ${METRICS.fareFinderCalls})`);
  return results;
}

/**
 * Pobierz ceny dla całego miesiąca (używa Ryanair FareFinder API)
 * To jest masywna optymalizacja - 1 request zamiast 30+!
 * Z CACHE: jeśli już pobieraliśmy te dane w ciągu ostatniej godziny, zwróć z cache (localStorage)
 */
async function getMonthlyFares(params, metrics) {
  const { origin, destination, outFrom, outTo, stayDaysMin, stayDaysMax, adults = 1, departureFrom = '00:00', departureTo = '23:59', returnArrivalFrom = '00:00', returnArrivalTo = '23:59', outboundDays = null, inboundDays = null } = params;

  // Sprawdź cache
  const cacheKey = getCacheKey({
    origin,
    destination,
    dateFrom: outFrom,
    dateTo: outTo,
    tripType: 'round',
    adults
  });

    const cached = await getFromCache(cacheKey);
  if (cached) {
      const ageMinutes = Math.round(cached.age_seconds / 60);
    console.log(`💾 CACHE HIT: Używam zapisanych cen dla ${origin}→${destination} (${ageMinutes} min temu)`);
    return { prices: cached.data, raw: null };
  }

  try {
    // Endpoint FareFinder - zwraca najtańsze ceny dla całego zakresu
    const url = `${BACKEND_API}/ryanair/farfinder`;

    const queryParams = new URLSearchParams({
      departureAirportIataCode: origin,
      arrivalAirportIataCode: destination,
      outboundDepartureDateFrom: outFrom,
      outboundDepartureDateTo: outTo,
      inboundDepartureDateFrom: outFrom, // użyj tego samego zakresu
      inboundDepartureDateTo: outTo,
      durationFrom: stayDaysMin,
      durationTo: stayDaysMax,
      adultPaxCount: adults,
      market: 'pl-pl',
      searchMode: 'ALL'
    });
    if (departureFrom) queryParams.set('outboundDepartureTimeFrom', departureFrom);
    if (departureTo) queryParams.set('outboundDepartureTimeTo', departureTo);
    if (returnArrivalFrom) queryParams.set('inboundDepartureTimeFrom', returnArrivalFrom);
    if (returnArrivalTo) queryParams.set('inboundDepartureTimeTo', returnArrivalTo);
    const outboundList = daysArrayToWeekdayList(outboundDays);
    const inboundList = daysArrayToWeekdayList(inboundDays);
    if (outboundList) queryParams.set('outboundDepartureDaysOfWeek', outboundList);
    if (inboundList) queryParams.set('inboundDepartureDaysOfWeek', inboundList);

    console.log(`📊 Pobieram ceny miesięczne: ${origin}→${destination}`);

    // Miękki limiter (600±200ms)
    await smartDelay();
  // Do not force confirm=true here — keep confirm optional (default backend=false)
  const response = await safeRyanairFetch(`${url}?${queryParams}`);
  if (metrics) { metrics.apiCalls += 1; metrics.fareFinderCalls += 1; }

    if (!response.ok) {
      throw new Error(`FareFinder API error: ${response.status}`);
    }

    const data = await response.json();

    // DEBUG: Pokaż pierwszy fare żeby zobaczyć strukturę
    if (data.fares && data.fares.length > 0) {
      console.log('📊 Przykładowa struktura fare:', JSON.stringify(data.fares[0], null, 2));
    }

    // Wyciągnij daty i ceny
    const datePrice = new Map();

    if (data.fares && Array.isArray(data.fares)) {
      data.fares.forEach((fare, index) => {
        // Różne możliwe ścieżki do dat (API może zwracać różne struktury)
        const outDate = fare.outbound?.departureDate?.split('T')[0]
                     || fare.outbound?.date?.split('T')[0]
                     || fare.departureDate?.split('T')[0];

        const inDate = fare.inbound?.departureDate?.split('T')[0]
                    || fare.inbound?.date?.split('T')[0]
                    || fare.arrivalDate?.split('T')[0];

        // Extract raw numeric values and currencies, then convert to PLN
        const rawOutPrice = fare.outbound?.price?.value ?? fare.outbound?.price ?? fare.price?.outbound ?? 0;
        const outCurrency = fare.outbound?.price?.currencyCode ?? fare.outbound?.price?.currency ?? fare.price?.currency ?? 'PLN';
        const outPricePLN = convertToPLN(Number(rawOutPrice) || 0, outCurrency) || Number(rawOutPrice) || 0;

        const rawInPrice = fare.inbound?.price?.value ?? fare.inbound?.price ?? fare.price?.inbound ?? 0;
        const inCurrency = fare.inbound?.price?.currencyCode ?? fare.inbound?.price?.currency ?? fare.price?.currency ?? 'PLN';
        const inPricePLN = convertToPLN(Number(rawInPrice) || 0, inCurrency) || Number(rawInPrice) || 0;

        const totalPrice = outPricePLN + inPricePLN;

        if (outDate && inDate) {
          const key = `${outDate}|${inDate}`;

          // Zachowaj najtańszą kombinację dla tej pary dat
          if (!datePrice.has(key) || datePrice.get(key) > totalPrice) {
            datePrice.set(key, totalPrice);
          }
        } else {
          console.warn(`⚠️ Nie można wyciągnąć dat z fare[${index}]:`, fare);
        }
      });
    }

    console.log(`📊 Znaleziono ${datePrice.size} kombinacji dat z cenami`);

    // Zapisz do cache (localStorage)
      await saveToCache(cacheKey, datePrice);
    console.log(`💾 Zapisano ceny do cache (ważne przez 1h)`);

  return { prices: datePrice, raw: data }; // Zwróć też surowe dane

  } catch (error) {
    console.error('Błąd pobierania cen miesięcznych:', error);
    if (error?.hardBlocked) throw error;
    return { prices: new Map(), raw: null }; // Zwróć pustą mapę - fallback do normalnego wyszukiwania
  }
}

/**
 * Pobierz ceny dla lotów JEDNOKIERUNKOWYCH (uproszczona wersja)
 * Używa summary.price z FareFinder API dla samych lotów tam
 * Z CACHE: jeśli już pobieraliśmy te dane w ciągu ostatniej godziny, zwróć z cache
 */
async function getMonthlyFaresOneWay(params, metrics) {
  const { origin, destination, dateFrom, dateTo, adults = 1, departureFrom = '00:00', departureTo = '23:59', outboundDays = null } = params;

  // Sprawdź cache
  const cacheKey = getCacheKey({
    origin,
    destination,
    dateFrom,
    dateTo,
    tripType: 'oneway',
    adults
  });

    const cached = await getFromCache(cacheKey);
  if (cached) {
      const ageMinutes = Math.round(cached.age_seconds / 60);
    console.log(`💾 CACHE HIT: Używam zapisanych cen dla ${origin}→${destination} (jednokierunkowe, ${ageMinutes} min temu)`);
    return cached.data;
  }

  try {
    const url = `${BACKEND_API}/ryanair/oneWayFares`;

    // Dla jednokierunkowego: używamy właściwego API oneWayFares
    const queryParams = new URLSearchParams({
      departureAirportIataCode: origin,
      arrivalAirportIataCode: destination,
      outboundDepartureDateFrom: dateFrom,
      outboundDepartureDateTo: dateTo,
      outboundDepartureTimeFrom: departureFrom,
      outboundDepartureTimeTo: departureTo,
      adultPaxCount: adults,
      market: 'pl-pl',
      searchMode: 'ALL'
    });
    const outboundList = daysArrayToWeekdayList(outboundDays);
    if (outboundList) queryParams.set('outboundDepartureDaysOfWeek', outboundList);

    console.log(`📊 Pobieram ceny miesięczne (jednokierunkowe): ${origin}→${destination}`);

    // Miękki limiter (600±200ms)
    await smartDelay();
    // Do not force confirm=true here — keep confirm optional (default backend=false)
  const response = await safeRyanairFetch(`${url}?${queryParams}`);
  if (metrics) { metrics.apiCalls += 1; metrics.fareFinderCalls += 1; }

    if (!response.ok) {
      throw new Error(`FareFinder API error: ${response.status}`);
    }

    const data = await response.json();

    // Dla jednokierunkowego: interesuje nas tylko cena outbound
    const datePrice = new Map();

    if (data.fares && Array.isArray(data.fares)) {
      data.fares.forEach((fare) => {
        const outDate = fare.outbound?.departureDate?.split('T')[0];
        const rawOutPrice = fare.outbound?.price?.value ?? fare.outbound?.price ?? 0;
        const outCurrency = fare.outbound?.price?.currencyCode ?? fare.outbound?.price?.currency ?? 'PLN';
        const outPrice = convertToPLN(Number(rawOutPrice) || 0, outCurrency) || Number(rawOutPrice) || 0;

        if (outDate && outPrice > 0) {
          // Zachowaj najtańszą cenę dla tej daty
          if (!datePrice.has(outDate) || datePrice.get(outDate) > outPrice) {
            datePrice.set(outDate, outPrice);
          }
        }
      });
    }

    console.log(`📊 Znaleziono ${datePrice.size} dni z cenami`);

    // Zapisz do cache (localStorage)
    await saveToCache(cacheKey, datePrice);
    console.log(`💾 Zapisano ceny do cache (ważne przez 1h)`);

    return datePrice;

  } catch (error) {
    console.error('Błąd pobierania cen miesięcznych (jednokierunkowe):', error);
    if (error?.hardBlocked) throw error;
    return new Map(); // Zwróć pustą mapę - fallback
  }
}

// Wrapper exported for other modules
export async function getMonthlyFaresForRoute(params) {
  return await getMonthlyFaresOneWay(params);
}

/**
 * Wyszukaj loty w dwie strony dla zakresów z długością pobytu
 */
export async function searchRoundTripRange(params) {
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
    departureFrom, // outbound departure HH:MM
    departureTo,
    arrivalFrom, // outbound arrival HH:MM
    arrivalTo,
    returnDepartureFrom, // inbound departure HH:MM (departure from dest)
    returnDepartureTo,
    returnArrivalFrom, // inbound arrival HH:MM (arrival at origin)
    returnArrivalTo,
    departureDays, // array of booleans for Mon..Sun
    returnDays
  } = params;

  console.log(`Szukam round-trip: ${outFrom} - ${outTo}, pobyt ${stayDaysMin}-${stayDaysMax} dni, max cena: ${maxPrice || 'brak'}`);

  // Lista lotnisk powrotu
  let returnAirports = [origin]; // Domyślnie tylko origin

  if (allowDifferentReturnAirport && availableReturnAirports && availableReturnAirports.length > 0) {
    returnAirports = availableReturnAirports; // Wszystkie lotniska z kraju
    console.log(`↔️ MULTI-AIRPORT: Kombinuję z ${returnAirports.length} lotniskami powrotu: ${returnAirports.join(', ')}`);
  }

  // Szybki health-check przed wywołaniem cache/API
  await ensureBackendUp();

  // Metryki round-trip
  const METRICS = createMetrics();

  // Oblicz liczbę dni w zakresie
  const dateFromObj = new Date(outFrom);
  const dateToObj = new Date(outTo);
  const totalDays = Math.ceil((dateToObj - dateFromObj) / (1000 * 60 * 60 * 24)) + 1;

  // 🎯 ADAPTIVE THRESHOLD: Użyj FareFinder tylko dla dużych zakresów (>14 dni) z maxPrice
  // Dla małych zakresów (≤14 dni) bezpośrednie zapytania są szybsze i prostsze
  // UWAGA: Multi-airport obsługiwany przez Fallback 1 (getMonthlyFaresOneWay dla każdego lotniska)
  const useFareFinderOptimization = maxPrice && totalDays > 14;

  if (useFareFinderOptimization) {
    if (allowDifferentReturnAirport) {
      console.log(`📊 Zakres: ${totalDays} dni → OPTYMALIZACJA FareFinder aktywna (multi-airport: ${returnAirports.length} lotnisk powrotu)`);
    } else {
      console.log(`📊 Zakres: ${totalDays} dni → OPTYMALIZACJA FareFinder aktywna (duży zakres)`);
    }
  } else if (maxPrice) {
    console.log(`📊 Zakres: ${totalDays} dni → Tryb bezpośredni (mały zakres, optymalizacja FareFinder pominięta)`);
  }

  // OPTYMALIZACJA: Jeśli podano maxPrice i zakres jest DUŻY, najpierw pobierz ceny dla całego miesiąca
  let monthlyPrices = new Map();
  let monthlyRawData = null; // surowe dane z FareFinder (zachowuję dla debugowania; NIE wykorzystuję ich do tworzenia syntetycznych kombinacji)
  let cheapCombinations = new Set(); // Zbiór tanich PAR dat: "2025-12-02|2025-12-10"

  if (useFareFinderOptimization) {
    // MULTI-AIRPORT: Zawsze używaj one-way, nie round-trip (bo powrót do innego lotniska)
    if (allowDifferentReturnAirport) {
      console.log('🎯 Multi-airport: Pobieram miesięczne ceny ONE-WAY (nie round-trip)');
      // Pobierz miesięczne ceny dla TAM (origin → destination)
      const outMap = await getMonthlyFaresOneWay({
        origin,
        destination,
        dateFrom: outFrom,
        dateTo: outTo,
        adults,
        departureFrom, departureTo,
        outboundDays: departureDays
      }, METRICS);

      // Pobierz miesięczne ceny dla POWRÓT - dla KAŻDEGO lotniska powrotu
      const inMapByAirport = new Map(); // Map<returnAirport, Map<date, price>>
      for (const returnAirport of returnAirports) {
        const inMap = await getMonthlyFaresOneWay({
          origin: destination,
          destination: returnAirport,
          dateFrom: outFrom,
          dateTo: outTo,
          adults
        ,departureFrom: returnDepartureFrom, departureTo: returnDepartureTo
        ,arrivalFrom: returnArrivalFrom, arrivalTo: returnArrivalTo
        ,outboundDays: returnDays
        }, METRICS);
        if (inMap.size > 0) {
          inMapByAirport.set(returnAirport, inMap);
        }
      }

      // Kombinuj wszystkie możliwe pary (outbound + każde lotnisko powrotu)
      const allPairs = [];
      for (const [outDate, outPrice] of outMap.entries()) {
        const outDateObj = new Date(outDate);
        for (const [returnAirport, inMap] of inMapByAirport.entries()) {
          for (const [inDate, inPrice] of inMap.entries()) {
            const inDateObj = new Date(inDate);
            const stayDays = Math.floor((inDateObj - outDateObj) / (24 * 60 * 60 * 1000));
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

      console.log(`🎯 OPTYMALIZACJA (multi-airport): Znaleziono ${cheapCombinations.size} tanich kombinacji (max ${maxPrice} PLN)`);
      if (cheapCombinations.size > 0) {
        // Zapisz pierwsze 3 dla debugowania
        console.log(`   Przykłady: ${allPairs.slice(0, 3).map(p => `${p.outDate}→${p.inDate} (${p.returnAirport}): ${p.totalPrice} PLN`).join(', ')}`);
      }
    } else {
      // STANDARDOWY (single airport return): używaj round-trip
      const result = await getMonthlyFares({
        origin,
        destination,
        outFrom,
        outTo,
        stayDaysMin,
        stayDaysMax,
        adults
        ,departureFrom, departureTo
        ,returnArrivalFrom, returnArrivalTo
      }, METRICS);

      monthlyPrices = result.prices;
      monthlyRawData = result.raw;

      // Zapamiętaj dokładne PARY dat które są tanie (nie pojedyncze dni!)
      if (monthlyPrices.size > 0) {
        for (const [key, price] of monthlyPrices.entries()) {
          if (price <= maxPrice) {
            cheapCombinations.add(key); // Dodaj całą parę: "outDate|inDate"
          }
        }

        console.log(`🎯 OPTYMALIZACJA: Znaleziono ${cheapCombinations.size} tanich kombinacji (max ${maxPrice} PLN)`);
      }
    }
  }

  // Fallback 1: jeśli brak tanich kombinacji z roundTripFares (i używaliśmy FareFinder), spróbuj zsumować one-way miesięczne
  let oneWayCandidatePairs = [];
  if (useFareFinderOptimization && cheapCombinations.size === 0) {
    console.log('⚠️ Brak tanich par z roundTripFares – próbuję kombinacji z miesięcznych one-way (outbound + inbound).');
    // Pobierz miesięczne ceny dla TAM
      const outMap = await getMonthlyFaresOneWay({
      origin,
      destination,
      dateFrom: outFrom,
      dateTo: outTo,
      adults
        ,departureFrom, departureTo
        ,outboundDays: departureDays
    }, METRICS);

    // Pobierz miesięczne ceny dla POWRÓT - dla KAŻDEGO lotniska powrotu
    const inMapByAirport = new Map(); // Map<returnAirport, Map<date, price>>
    for (const returnAirport of returnAirports) {
        const inMap = await getMonthlyFaresOneWay({
        origin: destination,
        destination: returnAirport,
        dateFrom: outFrom,
        dateTo: outTo,
        adults
          ,departureFrom: returnDepartureFrom, departureTo: returnDepartureTo
          ,arrivalFrom: returnArrivalFrom, arrivalTo: returnArrivalTo
          ,outboundDays: returnDays
      }, METRICS);
      if (inMap.size > 0) {
        inMapByAirport.set(returnAirport, inMap);
      }
    }

    if (outMap.size > 0 && inMapByAirport.size > 0) {
      const candidateMargin = params.oneWayCandidateMargin || 1.3; // Domyślnie 30% buffer
      // Zbuduj pary w dozwolonym zakresie pobytu, filtruj po sumie <= maxPrice
      const outDates = Array.from(outMap.keys()).sort();

      // Dla każdego lotniska powrotu
      for (const [returnAirport, inMap] of inMapByAirport.entries()) {
        const inDates = Array.from(inMap.keys()).sort();
        const inSet = new Set(inDates);

        for (const od of outDates) {
          const oDate = new Date(od);
          for (let stay = stayDaysMin; stay <= stayDaysMax; stay++) {
            const candInDate = new Date(oDate);
            candInDate.setDate(candInDate.getDate() + (stay - 1)); // stayDays = dateDiff+1
            const yyyy = candInDate.getFullYear();
            const mm = String(candInDate.getMonth() + 1).padStart(2, '0');
            const dd = String(candInDate.getDate()).padStart(2, '0');
            const id = `${yyyy}-${mm}-${dd}`;
            if (!inSet.has(id)) continue;
            const total = (outMap.get(od) || 0) + (inMap.get(id) || 0); // Zakładamy PLN (market pl-pl)
            // Filtruj tylko oczywiste przepłacone pary (z dużym marginesem)
            // Miesięczne ceny to oszacowania - rzeczywiste mogą być niższe!
            if (total > 0 && (!maxPrice || total <= maxPrice * candidateMargin)) {
              oneWayCandidatePairs.push({
                outDate: od,
                inDate: id,
                approxTotalPLN: total,
                stayDays: stay,
                returnAirport: returnAirport // Dodaj info o lotnisku powrotu
              });
            }
          }
        }
      }

      // Posortuj po najniższej sumie
      oneWayCandidatePairs.sort((a, b) => a.approxTotalPLN - b.approxTotalPLN);

      console.log(`📊 Znaleziono ${oneWayCandidatePairs.length} możliwych par do sprawdzenia (wszystkie lotniska razem).`);

      // Zbierz unikalne daty do pobrania
      const neededOutDates = new Set(oneWayCandidatePairs.map(p => p.outDate).filter(d => {
        if (!departureDays || !Array.isArray(departureDays) || departureDays.length !== 7) return true;
        return isDateMatchingDays(d, departureDays);
      }));
      const neededInDates = new Set(oneWayCandidatePairs.map(p => p.inDate).filter(d => {
        if (!returnDays || !Array.isArray(returnDays) || returnDays.length !== 7) return true;
        return isDateMatchingDays(d, returnDays);
      }));

      // Pobierz/odczytaj z cache loty dla tych dat (TAM)
      const outboundByDate = new Map();
      let cachedOut = 0, fetchedOut = 0;
      let outErrorsInARow = 0;
      let outApiCallCount = 0; // Licznik tylko dla API calls
      for (const d of neededOutDates) {
        if (outErrorsInARow >= 3) {
          console.warn('🛑 Circuit breaker: Zbyt wiele błędów z rzędu dla lotów TAM – przerywam dalsze pobieranie, aby uniknąć blokady IP.');
          console.warn('   💡 Spróbuj ponownie za kilka minut lub zmniejsz zakres dat.');
          break;
        }

        // Sprawdź cache NAJPIERW (bez opóźnienia)
        const cached = await getFlightsFromCache(origin, destination, d, adults);
        if (cached !== null) {
          const cachedWithSource = cached.map(f => ({ ...f, source: 'CACHE' }));
          const filteredCached = applyTimeFiltersToFlights(cachedWithSource, { departureFrom, departureTo, arrivalFrom, arrivalTo });
          outboundByDate.set(d, filteredCached);
          cachedOut++;
          outErrorsInARow = 0;
          continue; // Przejdź do następnej daty (bez delay)
        }

        // Brak w cache - potrzebne API call
        // Opóźnienie TYLKO przed API (oprócz pierwszego API call)
        if (outApiCallCount > 0) {
          await smartDelay();
        }
        outApiCallCount++;

        // Retry logic dla 429/409
        let retries = 0;
        let success = false;

        while (!success && retries <= RATE_LIMIT_CONFIG.maxRetries) {
          try {
            const res = await searchFlights({ origin, destination, dateOut: d, adults }, METRICS);
            const resWithSource = res.map(f => ({ ...f, source: 'API' }));
            await saveFlightsToCache(origin, destination, d, resWithSource, adults);
            const filteredRes = applyTimeFiltersToFlights(resWithSource, { departureFrom, departureTo, arrivalFrom, arrivalTo });
            outboundByDate.set(d, filteredRes);
            fetchedOut++;
            outErrorsInARow = 0;
            success = true;
          } catch (e) {
            if (e?.hardBlocked) { throw e; }
            const is429 = e.message?.includes('429') || e.message?.includes('Too Many Requests');
            const is409 = e.message?.includes('409') || e.message?.includes('declined');

            if ((is429 || is409) && retries < RATE_LIMIT_CONFIG.maxRetries) {
              retries++;
              console.warn(`  ⚠️ ${origin}→${destination} rate limit/declined, próba ${retries}/${RATE_LIMIT_CONFIG.maxRetries}...`);
              await smartDelay(true); // Dłuższe opóźnienie (2s)
            } else {
              console.warn(`❌ Błąd pobrania lotów TAM dla ${d}:`, e.message);
              outboundByDate.set(d, []);
              outErrorsInARow++;
              success = true; // Kończymy próby
            }
          }
        }
      }

      // Pobierz/odczytaj z cache loty dla tych dat (POWRÓT) - dla WSZYSTKICH returnAirports
      // Struktura: inboundByDateAndAirport = Map<date, Map<returnAirport, flights[]>>
      const inboundByDateAndAirport = new Map();
      let cachedIn = 0, fetchedIn = 0;
      let inErrorsInARow = 0;
      let inApiCallCount = 0;

      for (const d of neededInDates) {
        if (inErrorsInARow >= 3) {
          console.warn('🛑 Circuit breaker: Zbyt wiele błędów z rzędu dla lotów POWRÓT – przerywam dalsze pobieranie, aby uniknąć blokady IP.');
          console.warn('   💡 Spróbuj ponownie za kilka minut lub zmniejsz zakres dat.');
          break;
        }

        const flightsByAirport = new Map();
        let airportCallsInThisDate = 0; // Licznik dla tej daty

        // Pobierz loty dla KAŻDEGO lotniska powrotu
        for (const returnAirport of returnAirports) {
          // Sprawdź cache
          const cached = await getFlightsFromCache(destination, returnAirport, d, adults);
          if (cached !== null) {
            const cachedWithSource = cached.map(f => ({ ...f, source: 'CACHE' }));
            const filteredCached = applyTimeFiltersToFlights(cachedWithSource, { arrivalFrom: returnArrivalFrom, arrivalTo: returnArrivalTo });
            flightsByAirport.set(returnAirport, filteredCached);
            cachedIn++;
            inErrorsInARow = 0;
            continue;
          }

          // Brak w cache - API call
          // WAŻNE: Delay PRZED KAŻDYM API call (również pierwszym w nowej dacie!)
          if (inApiCallCount > 0 || airportCallsInThisDate > 0) {
            await smartDelay();
          }
          inApiCallCount++;
          airportCallsInThisDate++;

          // Retry logic dla 429/409
          let retries = 0;
          let success = false;

          while (!success && retries <= RATE_LIMIT_CONFIG.maxRetries) {
            try {
              const res = await searchFlights({ origin: destination, destination: returnAirport, dateOut: d, adults }, METRICS);
              const resWithSource = res.map(f => ({ ...f, source: 'API' }));
              await saveFlightsToCache(destination, returnAirport, d, resWithSource, adults);
              const filteredRes = applyTimeFiltersToFlights(resWithSource, { arrivalFrom: returnArrivalFrom, arrivalTo: returnArrivalTo });
              flightsByAirport.set(returnAirport, filteredRes);
              fetchedIn++;
              inErrorsInARow = 0;
              success = true;
            } catch (e) {
              if (e?.hardBlocked) { throw e; }
              const is429 = e.message?.includes('429') || e.message?.includes('Too Many Requests');
              const is409 = e.message?.includes('409') || e.message?.includes('declined');

              if ((is429 || is409) && retries < RATE_LIMIT_CONFIG.maxRetries) {
                retries++;
                console.warn(`  ⚠️ ${destination}→${returnAirport} rate limit/declined, próba ${retries}/${RATE_LIMIT_CONFIG.maxRetries}...`);
                await smartDelay(true); // Dłuższe opóźnienie (2s)
              } else {
                console.warn(`❌ Błąd pobrania lotów POWRÓT ${destination}→${returnAirport} dla ${d}:`, e.message);
                flightsByAirport.set(returnAirport, []);
                inErrorsInARow++;
                success = true; // Kończymy próby
              }
            }
          }
        }

        inboundByDateAndAirport.set(d, flightsByAirport);
      }

      // Zbuduj kombinacje sprawdzając pary lot TAM × lot POWRÓT dla ODPOWIEDNIEGO lotniska powrotu
      const combos = [];
      let rejectedByTime = 0, rejectedByPrice = 0, rejectedByStayDays = 0;

      for (const p of oneWayCandidatePairs) {
        const outs = (outboundByDate.get(p.outDate) || []).filter(f => f.priceInPLN != null && f.departure && f.arrival);

        // Pobierz loty powrotne dla daty
        const flightsByAirport = inboundByDateAndAirport.get(p.inDate);
        if (!flightsByAirport) {
          console.log(`   ⚠️ Brak lotów POWRÓT dla daty ${p.inDate}`);
          continue;
        }
        if (outs.length === 0) {
          console.log(`   ⚠️ Brak lotów TAM dla daty ${p.outDate}`);
          continue;
        }

        // Pobierz loty dla KONKRETNEGO lotniska powrotu z pary
        const returnAirport = p.returnAirport;
        const insFlights = flightsByAirport.get(returnAirport);
        if (!insFlights) {
          console.log(`   ⚠️ Brak lotów POWRÓT dla lotniska ${returnAirport} w dacie ${p.inDate}`);
          continue;
        }

        const ins = (insFlights || []).filter(f => f.priceInPLN != null && f.departure && f.arrival);
        if (ins.length === 0) continue;

        // Sprawdź WSZYSTKIE kombinacje (lot TAM × lot POWRÓT z tego lotniska)
        for (const outFlight of outs) {
          for (const inFlight of ins) {
            // Walidacja czasowa: powrót musi być ≥7h po PRZYLOCIE TAM
            const outArrivalTime = new Date(`${outFlight.date}T${outFlight.arrival}:00`);
            const inDepartureTime = new Date(`${inFlight.date}T${inFlight.departure}:00`);
            const timeDiffMs = inDepartureTime - outArrivalTime;
            const timeDiffHours = timeDiffMs / (1000 * 60 * 60);

            if (timeDiffHours < 7) {
              rejectedByTime++;
              console.log(`   ❌ ODRZUCONO (czas<7h) [cheapCombin]: out ${outFlight.date} ${outFlight.arrival} (arr) - in ${inFlight.date} ${inFlight.departure} (dep); diff ${timeDiffHours.toFixed(2)}h; outPrice ${outFlight.priceInPLN}, inPrice ${inFlight.priceInPLN}; origin ${outFlight.origin} -> ${outFlight.destination} / return ${inFlight.origin}->${inFlight.destination} (returnAirport=${returnAirport})`);
              continue; // Pomiń - za mało czasu między przylotem a powrotem
            }

            const total = (outFlight.priceInPLN || 0) + (inFlight.priceInPLN || 0);
            if (maxPrice && total > maxPrice) {
              rejectedByPrice++;
              console.log(`   ❌ ODRZUCONO (cena>max) [cheapCombin]: out ${outFlight.date} ${outFlight.arrival} + in ${inFlight.date} ${inFlight.departure} -> total ${total} PLN > ${maxPrice} PLN; origin ${outFlight.origin} -> ${outFlight.destination}; returnAirport=${returnAirport}`);
              // Debug dla par LCJ→AGP→POZ
              if (p.outDate === '2025-12-15' && p.inDate === '2025-12-18' && returnAirport === 'POZ') {
                console.log(`   🔍 LCJ→AGP→POZ (15→18): ${outFlight.priceInPLN} + ${inFlight.priceInPLN} = ${total} PLN > ${maxPrice} PLN ❌`);
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
              returnAirport: returnAirport,
              originAirport: outFlight.origin,
              originName: outFlight.originName || '',
              returnName: inFlight.destinationName || ''
              , source: (outFlight.source === 'API' && inFlight.source === 'API') ? 'API' : (outFlight.source === 'CACHE' && inFlight.source === 'CACHE') ? 'CACHE' : 'MIXED'
            });
            console.log(`   ✅ Zaakceptowano [cheapCombin]: ${outFlight.origin}->${outFlight.destination} ${p.outDate} (${outFlight.arrival}) + ${inFlight.origin}->${inFlight.destination} ${p.inDate} (${inFlight.departure}) = ${total} PLN; legSources: ${outFlight.source || 'UNKNOWN'}/${inFlight.source || 'UNKNOWN'}; comboSource: ${(outFlight.source === 'API' && inFlight.source === 'API') ? 'API' : (outFlight.source === 'CACHE' && inFlight.source === 'CACHE') ? 'CACHE' : 'MIXED'}`);
          }
        }
      }

      combos.sort((a, b) => a.totalPriceInPLN - b.totalPriceInPLN);

      console.log(`📊 Łączenie: ${oneWayCandidatePairs.length} par → ${combos.length} kombinacji`);
      if (rejectedByTime > 0 || rejectedByPrice > 0) {
        console.log(`   ❌ Odrzucono: ${rejectedByTime} (< 7h), ${rejectedByPrice} (cena > ${maxPrice})`);
      }

      // Uzupełnij metryki (unikalne dni × lotniska dla multi-airport)
      // Dla multi-airport: liczba zapytań = outbound dni + (inbound dni × liczba lotnisk)
      const totalInboundRequests = neededInDates.size * returnAirports.length;
      METRICS.totalDays = neededOutDates.size + totalInboundRequests;
      METRICS.daysFromCache = cachedOut + cachedIn;
      METRICS.daysFetched = fetchedOut + fetchedIn;
      LAST_METRICS = {
        ...METRICS,
        percentFromCache: METRICS.totalDays > 0 ? Math.round((METRICS.daysFromCache / METRICS.totalDays) * 100) : 0,
        percentFromApi: METRICS.totalDays > 0 ? Math.round((METRICS.daysFetched / METRICS.totalDays) * 100) : 0,
      };

      if (combos.length > 0) {
        console.log(`✅ Round-trip (one-way optymalizacja): gotowe ${combos.length} par ≤ ${maxPrice} PLN. API calls: ${METRICS.apiCalls} (FareFinder: ${METRICS.fareFinderCalls})`);
        if (returnAirports.length > 1) {
          console.log(`   📊 Multi-airport: ${neededOutDates.size} dni TAM + ${neededInDates.size} dni × ${returnAirports.length} lotnisk = ${METRICS.totalDays} zapytań total`);
        }
        return combos;
      } else {
        // Miesięczne ceny są OSZACOWANIAMI - rzeczywiste mogą być niższe!
        // Pozwól na pełny skan dla małej liczby dat (< 10 dni)
        const estimatedApiCalls = oneWayCandidatePairs.length * 2; // outbound + inbound dla każdej pary
        if (maxPrice && estimatedApiCalls > 20) {
          LAST_METRICS = {
            ...METRICS,
            percentFromCache: METRICS.totalDays > 0 ? Math.round((METRICS.daysFromCache / METRICS.totalDays) * 100) : 0,
            percentFromApi: METRICS.totalDays > 0 ? Math.round((METRICS.daysFetched / METRICS.totalDays) * 100) : 0,
            skippedFullScan: true,
            note: `Brak potwierdzonych par <= maxPrice w Fallback 1, pełny skan (${estimatedApiCalls} API calls) zbyt duży.`
          };
          console.log(`🛑 Brak par <= ${maxPrice} PLN w Fallback 1, pełny skan wymagałby ~${estimatedApiCalls} API calls – SKIP.`);
          return [];
        }
        console.log(`⚠️ Brak par <= ${maxPrice} PLN w Fallback 1 (monthly estimates), ale spróbuję pełny skan (${estimatedApiCalls} API calls).`);
      }
    } else {
      console.log('⚠️ Miesięczne one-way zwróciły puste dane – przechodzę do trybu pełnego.');
    }
  }

  // SMART GUARD: Jeśli FareFinder nie znalazł tanich kombinacji, sprawdź czy pełny skan jest bezpieczny
  // Miesięczne ceny są OSZACOWANIAMI - rzeczywiste mogą być niższe!
  // Ale nie rób pełnego skanu dla dużych zakresów (chroni przed rate limiting)
  if (useFareFinderOptimization && cheapCombinations.size === 0) {
    const estimatedFullScanCalls = totalDays * returnAirports.length * 2; // out + in dla każdego lotniska i dnia
    const threshold = returnAirports.length > 1 ? 50 : 100; // Niższy limit dla multi-airport

    if (estimatedFullScanCalls > threshold) {
      LAST_METRICS = {
        ...METRICS,
        percentFromCache: METRICS.totalDays > 0 ? Math.round((METRICS.daysFromCache / METRICS.totalDays) * 100) : 0,
        percentFromApi: METRICS.totalDays > 0 ? Math.round((METRICS.daysFetched / METRICS.totalDays) * 100) : 0,
        skippedFullScan: true,
        note: `Brak tanich par w FareFinder, pełny skan (${estimatedFullScanCalls} API calls) przekracza limit ${threshold}.`
      };
      console.log(`🛑 Brak par <= ${maxPrice} PLN w FareFinder, pełny skan wymagałby ~${estimatedFullScanCalls} API calls (limit: ${threshold}) – SKIP.`);
      return [];
    }

    console.log(`⚠️ Brak par <= ${maxPrice} PLN w FareFinder (monthly estimates), ale zakres mały (${estimatedFullScanCalls} API calls) – próbuję pełny skan.`);
  }

  // 1. Wyszukaj loty TAM
  let outboundFlights = [];
  let outCached = 0, outFetched = 0;

  if (cheapCombinations.size > 0) {
    // OPTYMALIZACJA AKTYWNA: wyciągnij unikalne daty wylotu z tanich kombinacji
    const cheapOutDates = new Set();
    for (const combo of cheapCombinations) {
      // Format: "outDate|inDate" (standard) lub "outDate|inDate|returnAirport" (multi-airport)
      const parts = combo.split('|');
      const outDate = parts[0];
      // Apply departureDays filter if provided
      if (departureDays && Array.isArray(departureDays) && departureDays.length === 7) {
        if (isDateMatchingDays(outDate, departureDays)) {
          cheapOutDates.add(outDate);
        }
      } else {
        cheapOutDates.add(outDate);
      }
    }

    console.log(`🎯 Szukam lotów TAM tylko dla ${cheapOutDates.size} tanich dni: ${Array.from(cheapOutDates).join(', ')}`);
    console.log(`📊 Oszczędność: ${totalDays - cheapOutDates.size} dni pominięto dzięki FareFinder`);

    let apiCallCount = 0; // Licznik tylko dla API calls (nie cache)
    for (const date of cheapOutDates) {
      // Sprawdź cache NAJPIERW (bez opóźnienia - cache jest szybki!)
      const cachedFlights = await getFlightsFromCache(origin, destination, date, adults);
      if (cachedFlights !== null) {
        console.log(`  ✅ ${date}: ${cachedFlights.length} lotów z cache`);
        const cachedWithSource = cachedFlights.map(f => ({ ...f, source: 'CACHE' }));
        outboundFlights.push(...cachedWithSource);
        outCached++;
        continue; // Przejdź do następnej daty (bez delay)
      }

      // Brak w cache - potrzebne API call
      // Opóźnienie TYLKO przed API (oprócz pierwszego API call)
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
          console.log(`  📡 ${date}: ${flights.length} lotów z API`);
          const flightsWithSource = flights.map(f => ({ ...f, source: 'API' }));
          await saveFlightsToCache(origin, destination, date, flightsWithSource, adults);
          outboundFlights.push(...flightsWithSource);
          outFetched++;
          success = true;
        } catch (error) {
          if (error?.hardBlocked) { throw error; }
          const is429 = error.message?.includes('429') || error.message?.includes('Too Many Requests');
          const is409 = error.message?.includes('409') || error.message?.includes('declined');

          if ((is429 || is409) && retries < RATE_LIMIT_CONFIG.maxRetries) {
            retries++;
            console.warn(`  ⚠️ Rate limit/declined, próba ${retries}/${RATE_LIMIT_CONFIG.maxRetries}...`);
            await smartDelay(true);
          } else {
            console.warn(`  ❌ ${date}: ${error.message}`);
            success = true;
          }
        }
      }
    }
  } else {
    // Normalny tryb: szukaj wszystkich dni
    outboundFlights = await searchFlightsRange({
      origin,
      destination,
      dateFrom: outFrom,
      dateTo: outTo,
      adults
      ,departureFrom, departureTo
      ,arrivalFrom, arrivalTo
      ,departureDays
    }, METRICS); // Przekaż METRICS
    // Upewnij się, że każde lot ma oznaczenie źródła
    outboundFlights = outboundFlights.map(f => ({ ...f, source: f.source || 'CACHE' }));
  }

  console.log(`Znaleziono ${outboundFlights.length} lotów TAM`);

  // 2. Wyszukaj loty POWRÓT
  let inboundFlights = [];
  let inCached = 0, inFetched = 0;

  if (cheapCombinations.size > 0) {
    // OPTYMALIZACJA AKTYWNA: wyciągnij unikalne pary (inDate, returnAirport) z tanich kombinacji
    const cheapInPairs = new Map(); // Map<returnAirport, Set<inDate>>

    for (const combo of cheapCombinations) {
      const parts = combo.split('|');
      const inDate = parts[1];
      // Multi-airport: parts[2] = returnAirport, standardowy: brak parts[2] → używamy origin
      const returnAirport = parts.length === 3 ? parts[2] : origin;

      // Apply returnDays filter if provided
      if (returnDays && Array.isArray(returnDays) && returnDays.length === 7) {
        if (!isDateMatchingDays(inDate, returnDays)) {
          continue; // skip this inDate because it's not in selected return days
        }
      }
      if (!cheapInPairs.has(returnAirport)) {
        cheapInPairs.set(returnAirport, new Set());
      }
      cheapInPairs.get(returnAirport).add(inDate);
    }

    const totalInDates = Array.from(cheapInPairs.values()).reduce((sum, set) => sum + set.size, 0);
    console.log(`🎯 Szukam lotów POWRÓT dla ${cheapInPairs.size} lotnisk (${totalInDates} unikalnych dni razem)`);
    console.log(`📊 Oszczędność: ${totalDays - totalInDates} dni pominięto dzięki FareFinder`);

    let apiCallCount = 0; // Licznik tylko dla API calls (nie cache)

    for (const [returnAirport, dates] of cheapInPairs.entries()) {
      for (const date of dates) {
        // Sprawdź cache NAJPIERW (bez opóźnienia - cache jest szybki!)
        const cachedFlights = await getFlightsFromCache(destination, returnAirport, date, adults);
        if (cachedFlights !== null) {
          console.log(`  ✅ ${date} (→${returnAirport}): ${cachedFlights.length} lotów z cache`);
          const cachedWithSource = cachedFlights.map(f => ({ ...f, source: 'CACHE' }));
          inboundFlights.push(...cachedWithSource);
          inCached++;
          continue; // Przejdź do następnej daty (bez delay)
        }

        // Brak w cache - potrzebne API call
        // Opóźnienie TYLKO przed API (oprócz pierwszego API call)
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
            }, METRICS); // Przekaż METRICS
            console.log(`  📡 ${date} (→${returnAirport}): ${flights.length} lotów z API`);
            const flightsWithSource = flights.map(f => ({ ...f, source: 'API' }));
            await saveFlightsToCache(destination, returnAirport, date, flightsWithSource, adults);
            inboundFlights.push(...flightsWithSource);
            inFetched++;
            success = true;
          } catch (error) {
            if (error?.hardBlocked) { throw error; }
            const is429 = error.message?.includes('429') || error.message?.includes('Too Many Requests');
            const is409 = error.message?.includes('409') || error.message?.includes('declined');

            if ((is429 || is409) && retries < RATE_LIMIT_CONFIG.maxRetries) {
              retries++;
              console.warn(`  ⚠️ Rate limit/declined, próba ${retries}/${RATE_LIMIT_CONFIG.maxRetries}...`);
              await smartDelay(true);
            } else {
              console.warn(`  ❌ ${date} (→${returnAirport}): ${error.message}`);
              success = true;
            }
          }
        }
      }
    }
  } else {
    // Normalny tryb: szukaj wszystkich dni dla WSZYSTKICH lotnisk powrotu
    for (const returnAirport of returnAirports) {
      const flights = await searchFlightsRange({
        origin: destination,
        destination: returnAirport,
        dateFrom: outFrom,
        dateTo: outTo,
        adults
        ,departureFrom: returnDepartureFrom, departureTo: returnDepartureTo
        ,arrivalFrom: returnArrivalFrom, arrivalTo: returnArrivalTo
        ,departureDays: returnDays
      }, METRICS); // Przekaż METRICS
      // Upewnij się, że każde lot ma oznaczenie źródła
      inboundFlights.push(...flights.map(f => ({ ...f, source: f.source || 'CACHE' })));
    }
  }

  console.log(`Znaleziono ${inboundFlights.length} lotów POWRÓT`);

  // 3. Połącz lokalnie sprawdzając różnicę dni i walidując czas (≥7h między przylotem a powrotem)
  const combinations = [];
  let rejectedByTime = 0;
  let rejectedByStay = 0;
  let rejectedByCombo = 0;

  for (const outFlight of outboundFlights) {
    for (const inFlight of inboundFlights) {
      // Require valid time fields (defensive)
      if (!outFlight.departure || !outFlight.arrival || !inFlight.departure || !inFlight.arrival) continue;
      const outDate = new Date(outFlight.date);
      const inDate = new Date(inFlight.date);

      // Oblicz różnicę dni (rzeczywistą różnicę dat)
      const diffTime = inDate - outDate;
      const dateDiff = Math.round(diffTime / (1000 * 60 * 60 * 24));

      // stayDays = długość pobytu od użytkownika (1 dzień = ten sam dzień)
      // dateDiff = różnica dat (0 = ten sam dzień, 1 = następny dzień)
      // Więc: stayDays = dateDiff + 1
      const stayDays = dateDiff + 1;

      // WALIDACJA CZASOWA: powrót musi być ≥7h po PRZYLOCIE TAM
      const outArrivalTime = new Date(`${outFlight.date}T${outFlight.arrival}:00`);
      const inDepartureTime = new Date(`${inFlight.date}T${inFlight.departure}:00`);
      const timeDiffMs = inDepartureTime - outArrivalTime;
      const timeDiffHours = timeDiffMs / (1000 * 60 * 60);

      if (timeDiffHours < 7) {
        rejectedByTime++;
        console.log(`   ❌ ODRZUCONO (czas<7h) [fullScan]: out ${outFlight.date} ${outFlight.arrival} (arr) - in ${inFlight.date} ${inFlight.departure} (dep); diff ${timeDiffHours.toFixed(2)}h; outPrice ${outFlight.priceInPLN}, inPrice ${inFlight.priceInPLN}; origin ${outFlight.origin} -> return ${inFlight.origin}`);
        continue; // Pomiń - za mało czasu między przylotem a powrotem
      }

      // Sprawdź czy mieści się w zakresie pobytu
      if (stayDays >= stayDaysMin && stayDays <= stayDaysMax) {
        // Cena przeliczona na PLN (zawsze sumujemy w PLN!)
        const totalPriceInPLN = (outFlight.priceInPLN || 0) + (inFlight.priceInPLN || 0);

        // Pomiń kombinacje bez ceny (0 PLN oznacza brak danych o cenie)
        if (totalPriceInPLN === 0) {
          continue;
        }

        // FILTR CENY: jeśli użyto maxPrice, sprawdź czy ta konkretna kombinacja lotów mieści się w budżecie
        // WAŻNE: nie używamy cheapCombinations do odrzucania (bo FareFinder zwraca najtańsze pary dni,
        // ale w konkretne godziny mogą być droższe loty). Zamiast tego filtrujemy po realnej cenie.
        if (maxPrice && totalPriceInPLN > maxPrice) {
          rejectedByCombo++; // rejectedByPrice byłoby lepsze, ale zostawiamy nazwę dla zgodności z logami
          console.log(`   ❌ ODRZUCONO (cena>max) [fullScan]: out ${outFlight.date} ${outFlight.arrival} + in ${inFlight.date} ${inFlight.departure} -> total ${totalPriceInPLN} PLN > ${maxPrice}; origin ${outFlight.origin} -> return ${inFlight.origin}`);
          continue;
        }

        combinations.push({
          outbound: outFlight,
          inbound: inFlight,
          totalPriceInPLN,  // tylko cena w PLN
          stayDays: stayDays,  // używaj stayDays (1=ten sam dzień), nie dateDiff
          outDate: outFlight.date,
          inDate: inFlight.date,
          originAirport: outFlight.origin,
          returnAirport: inFlight.destination,
          originName: outFlight.originName || '',
          returnName: inFlight.destinationName || ''
          , source: (outFlight.source === 'API' && inFlight.source === 'API') ? 'API' : (outFlight.source === 'CACHE' && inFlight.source === 'CACHE') ? 'CACHE' : 'MIXED'
        });
        console.log(`   ✅ Zaakceptowano [fullScan]: ${outFlight.origin}->${outFlight.destination} ${outFlight.date} (${outFlight.arrival}) + ${inFlight.origin}->${inFlight.destination} ${inFlight.date} (${inFlight.departure}) = ${totalPriceInPLN} PLN; legSources: ${outFlight.source || 'UNKNOWN'}/${inFlight.source || 'UNKNOWN'}; comboSource: ${(outFlight.source === 'API' && inFlight.source === 'API') ? 'API' : (outFlight.source === 'CACHE' && inFlight.source === 'CACHE') ? 'CACHE' : 'MIXED'}`);
        console.log(`   ✅ Zaakceptowano [fullScan]: ${outFlight.origin}->${outFlight.destination} ${outFlight.date} (${outFlight.arrival}) + ${inFlight.origin}->${inFlight.destination} ${inFlight.date} (${inFlight.departure}) = ${totalPriceInPLN} PLN; source: ${outFlight.source || 'UNKNOWN'}/${inFlight.source || 'UNKNOWN'}`);
      } else {
        rejectedByStay++;
        console.log(`   ❌ ODRZUCONO (pobyt poza zakresem) [fullScan]: out ${outFlight.date} -> in ${inFlight.date} = ${stayDays} dni; allowed ${stayDaysMin}-${stayDaysMax}; origin ${outFlight.origin}`);
      }
    }
  }

  console.log(`📊 Łączenie: ${outboundFlights.length} TAM × ${inboundFlights.length} POWRÓT = ${outboundFlights.length * inboundFlights.length} możliwości`);
  console.log(`   ❌ Odrzucono: ${rejectedByCombo} (cena > ${maxPrice || '∞'}), ${rejectedByTime} (< 7h), ${rejectedByStay} (poza zakresem pobytu)`);
  console.log(`   ✅ Zaakceptowano: ${combinations.length} kombinacji`);

  // 4. Sortuj od najtańszego (według ceny w PLN)
  combinations.sort((a, b) => {
    if (!a.totalPriceInPLN) return 1;
    if (!b.totalPriceInPLN) return -1;
    return a.totalPriceInPLN - b.totalPriceInPLN;
  });

  // Synthetic fallback removed: we only return combinations created from actual API results

  // Już przefiltrowane w pętli powyżej, więc nie trzeba ponownie
  let filtered = combinations;

  // Uzupełnij metryki globalnie - ZAWSZE na końcu round-trip
  // Dla trybu cheapCombinations zlicz dni ręcznie (jeśli nie były już policzone przez searchFlightsRange)
  if (cheapCombinations.size > 0 && METRICS.totalDays === 0) {
    METRICS.totalDays = (outCached + outFetched) + (inCached + inFetched);
    METRICS.daysFromCache = outCached + inCached;
    METRICS.daysFetched = outFetched + inFetched;
  }
  // Dla searchFlightsRange metryki już są w METRICS (przekazane)

  LAST_METRICS = {
    ...METRICS,
    percentFromCache: METRICS.totalDays > 0 ? Math.round((METRICS.daysFromCache / METRICS.totalDays) * 100) : 0,
    percentFromApi: METRICS.totalDays > 0 ? Math.round((METRICS.daysFetched / METRICS.totalDays) * 100) : 0,
  };

  // Podsumowanie oszczędności FareFinder
  if (useFareFinderOptimization) {
    const daysSearched = (outCached + outFetched) + (inCached + inFetched);
    const possibleDaysWithoutOptimization = totalDays * 2; // TAM + POWRÓT
    const savedDays = possibleDaysWithoutOptimization - daysSearched;
    const savedPercent = possibleDaysWithoutOptimization > 0 ? Math.round((savedDays / possibleDaysWithoutOptimization) * 100) : 0;

    console.log(`💰 Oszczędność FareFinder: ${savedDays}/${possibleDaysWithoutOptimization} dni (${savedPercent}%) - dzięki optymalizacji pominięto ${savedDays} zapytań`);
  }

  console.log(`Znaleziono ${filtered.length} kombinacji round-trip. API calls: ${LAST_METRICS.apiCalls} (FareFinder: ${LAST_METRICS.fareFinderCalls}), dni: ${LAST_METRICS.totalDays} (${LAST_METRICS.daysFromCache} cache, ${LAST_METRICS.daysFetched} API)`);
  return filtered;
}/**
 * Wyszukaj loty w obie strony
 */
/**
 * Parsuj odpowiedź z Ryanair API
 */
function parseFlights(data, tripIndex = 0) {
  const flights = [];

  if (!data.trips || !data.trips[tripIndex]) {
    return flights;
  }

  const trip = data.trips[tripIndex];

  for (const dateEntry of trip.dates || []) {
    for (const flight of dateEntry.flights || []) {
      if (!flight.time || flight.time.length < 2) continue;

      const departureTime = flight.time[0]; // "2025-12-01T08:30:00.000"
      const arrivalTime = flight.time[1];

      const flightInfo = {
        date: departureTime.substring(0, 10), // "2025-12-01"
        flightNumber: flight.flightNumber || '',
        departure: departureTime.substring(11, 16), // "08:30"
        arrival: arrivalTime.substring(11, 16), // "09:50"
        duration: flight.duration || '',
        price: null,
        currency: data.currency || 'PLN',
        priceInPLN: null, // Będzie wyliczone poniżej
        source: 'API', // default when parsing actual API search results
        faresLeft: flight.faresLeft || 0,
        infantsLeft: flight.infantsLeft || 0,
        operatedBy: flight.operatedBy || 'Ryanair'
      };

      // Cena z regularFare
      if (flight.regularFare && flight.regularFare.fares && flight.regularFare.fares.length > 0) {
        flightInfo.price = flight.regularFare.fares[0].amount;
        const convertedPrice = convertToPLN(flightInfo.price, flightInfo.currency);
        // Jeśli konwersja się nie powiodła (null), użyj oryginalnej ceny lub 0
        flightInfo.priceInPLN = convertedPrice !== null ? convertedPrice : (flightInfo.price || 0);
      } else if (flight.price && typeof flight.price === 'number') {
        // Fallback: bezpośrednia cena w obiekcie flight
        flightInfo.price = flight.price;
        flightInfo.priceInPLN = convertToPLN(flightInfo.price, flightInfo.currency) || flightInfo.price;
      } else {
        // Brak ceny - ustaw na 0 (lub null jeśli chcesz odfiltrować takie loty)
        flightInfo.price = 0;
        flightInfo.priceInPLN = 0;
      }

      flights.push(flightInfo);
    }
  }

  return flights;
}

/**
 * Pobierz listę lotnisk
 */
export async function getAirports(market = 'pl') {
  try {
    const response = await safeRyanairFetch(`${BACKEND_API}/ryanair/airports?market=${market}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Nie udało się pobrać listy lotnisk');
    }

    const airports = await response.json();
    return airports;
  } catch (error) {
    console.error('Błąd pobierania lotnisk:', error);
    if (error?.hardBlocked) throw error;
    return [];
  }
}

/**
 * Pobierz listę destynacji (IATA) dla lotniska (LOCATE)
 * @param {string} origin - kod IATA lotniska
 * @param {string} market - rynek (pl-pl domyślnie)
 * @returns {Promise<Array<string>>} lista kodów IATA destynacji (np. ["AGP", "ALC"]) lub []
 */
export async function getRoutes(origin, market = 'pl-pl') {
  try {
    const response = await safeRyanairFetch(`${BACKEND_API}/ryanair/routes?origin=${origin}&market=${market}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) {
      console.warn(`Nie udało się pobrać routes dla ${origin} (status: ${response.status})`);
      return [];
    }
    const data = await response.json();
    return data.destinations || [];
  } catch (e) {
    console.error('Błąd getRoutes:', e);
    if (e?.hardBlocked) throw e;
    return [];
  }
}

/**
 * Pobierz kategorie lotnisk
 */
export async function getAirportCategories(market = 'pl') {
  try {
    const response = await safeRyanairFetch(`${BACKEND_API}/ryanair/airport-categories?market=${market}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Nie udało się pobrać kategorii lotnisk');
    }

    const categories = await response.json();
    return categories;
  } catch (error) {
    console.error('Błąd pobierania kategorii:', error);
    if (error?.hardBlocked) throw error;
    return [];
  }
}

/**
 * Pobierz dostępne połączenia z danego lotniska
 * @param {string} origin - Kod IATA lotniska wylotu (np. "WAW")
 * @param {string} market - Rynek (domyślnie "pl-pl")
 * @returns {Promise<Array>} Lista dostępnych destynacji z tego lotniska
 *
 * Przykład wyniku:
 * [
 *   {
 *     "arrivalAirport": {"code": "VIE", "name": "Vienna", "country": "Austria"},
 *     "connectingAirport": null
 *   }
 * ]
 */
export async function getAvailableDestinations(origin, market = 'pl-pl') {
  try {
    const response = await safeRyanairFetch(`${BACKEND_API}/ryanair/routes?origin=${origin}&market=${market}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Nie udało się pobrać połączeń z ${origin}`);
    }

    const routes = await response.json();

    // Zwróć tylko bezpośrednie połączenia (bez przesiadek)
    // lub wszystkie jeśli chcesz pokazać też z przesiadką
    const directRoutes = routes.filter(route => !route.connectingAirport);

    console.log(`✈️ Dostępne połączenia z ${origin}: ${directRoutes.length} bezpośrednich, ${routes.length - directRoutes.length} z przesiadką`);

    return routes; // Zwróć wszystkie (frontend zdecyduje co pokazać)
  } catch (error) {
    console.error(`Błąd pobierania połączeń z ${origin}:`, error);
    if (error?.hardBlocked) throw error;
    return [];
  }
}

/**
 * Pobierz dostępne daty dla danej trasy (optymalizacja wyszukiwania)
 *
 * Zwraca listę dat na których są dostępne loty z cenami.
 * Używa cache'owanego endpointu /api/ryanair/availableDates
 *
 * @param {string} origin - Kod IATA lotniska wylotu (np. "WAW")
 * @param {string} destination - Kod IATA lotniska przylotu (np. "ALC")
 * @param {string} market - Rynek (domyślnie "pl-pl")
 * @returns {Promise<string[]>} - Lista dat w formacie YYYY-MM-DD
 *
 * @example
 * const dates = await getAvailableDates('WAW', 'ALC');
 * // ['2025-11-07', '2025-11-08', '2025-11-09', ...]
 */
export async function getAvailableDates(origin, destination, market = 'pl-pl') {
  try {
    // Miękki limiter (600±200ms)
    await smartDelay();
    const response = await safeRyanairFetch(
      `${BACKEND_API}/ryanair/availableDates?origin=${origin}&destination=${destination}&market=${market}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.warn(`⚠️ Nie udało się pobrać dostępnych dat dla ${origin}→${destination}, status ${response.status}`);
      return null; // null = frontend przejdzie do pełnego skanowania
    }

    const data = await response.json();

    if (data.error) {
      console.warn(`⚠️ Błąd dostępności dat ${origin}→${destination}: ${data.error}`);
      return null;
    }

    console.log(`📅 Dostępne daty ${origin}→${destination}: ${data.count} dni${data.cached ? ' (cache)' : ''}`);

    return data.dates || [];
  } catch (error) {
    console.error(`❌ Błąd pobierania dostępnych dat ${origin}→${destination}:`, error);
    if (error?.hardBlocked) throw error;
    return null; // null = graceful degradation do pełnego skanowania
  }
}

/**
 * Wyszukaj loty do dowolnego kierunku (ANY destination)
 */
export async function searchAnyDestination(params, priceLimit = null) {
  // priceLimit = maximum price (PLN) — filter out fares with priceInPLN > priceLimit
  const { origin, dateFrom, dateTo, adults = 1, market = 'pl-pl', departureFrom = '00:00', departureTo = '23:59' } = params;

  console.log('🔍 searchAnyDestination wywołane:', params);

  try {
    const cacheKey = `any:${origin}:${dateFrom}:${dateTo}:${adults}:${market}:${priceLimit ?? 'null'}`;
    // Check in-memory cache
    if (globalThis.__anyDestCache && globalThis.__anyDestCache.has(cacheKey)) {
      const entry = globalThis.__anyDestCache.get(cacheKey);
      if (entry.expires > Date.now()) {
        if (entry.result) {
          console.log('💾 searchAnyDestination cache hit:', cacheKey);
          // Ensure cached flights have proper 'source' annotations
          if (entry.result.fares && Array.isArray(entry.result.fares)) {
            entry.result.fares = entry.result.fares.map(far => ({
              ...far,
              flights: Array.isArray(far.flights) ? far.flights.map(x => ({ ...x, source: x.source || 'CACHE' })) : far.flights
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
      market: market,
      searchMode: 'ALL'
    });
    if (priceLimit) queryParams.set('maxPrice', String(priceLimit));

    // Miękki limiter (600±200ms)
    await smartDelay();
    console.log('📡 Wysyłam zapytanie do backend:', `${BACKEND_API}/ryanair/anyDestination?${queryParams}`);
    const response = await safeRyanairFetch(
      `${BACKEND_API}/ryanair/anyDestination?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Błąd API: ${response.status}`);
    }

    const data = await response.json();
    console.log('📦 Otrzymane dane z backend:', data);

    // Parsuj dane - grupuj po destynacjach
    const destinations = {};
        if (data.fares && Array.isArray(data.fares)) {
      console.log('🔍 Parsuję', data.fares.length, 'fare\'ów');
      data.fares.forEach((fare, index) => {
        console.log(`Fare ${index}:`, JSON.stringify(fare).substring(0, 200));
  const dest = fare.outbound?.arrivalAirport?.iataCode;
  const rawPriceObj = fare.outbound?.price;
  const price = (rawPriceObj?.value ?? rawPriceObj?.amount) || 0;
        const date = fare.outbound?.departureDate?.split('T')[0];

        console.log(`  Dest: ${dest}, Price: ${price}, Date: ${date}`);

        // We no longer filter based on confirmation; accept all API-provided fares
        if (dest && price > 0) {
          if (!destinations[dest]) {
            destinations[dest] = {
              destination: dest,
              destinationName: fare.outbound?.arrivalAirport?.name || dest,
              minPrice: convertToPLN(price, rawPriceObj?.currencyCode || rawPriceObj?.currency || 'PLN') || price,
              flights: []
            };
          }

          destinations[dest].minPrice = Math.min(destinations[dest].minPrice, convertToPLN(price, rawPriceObj?.currencyCode || rawPriceObj?.currency || 'PLN') || price);
          const currency = rawPriceObj?.currencyCode || rawPriceObj?.currency || 'PLN';
          // Build a flight object and apply departure-time filter (outbound)
          const flightObj = {
            date,
            price,
            currency,
            priceInPLN: convertToPLN(price, currency),
            originAirport: origin,
            source: fare.source || 'API',
            departure: fare.outbound?.departureTime?.split('T')?.[1]?.slice(0,5) || fare.outbound?.time || null,
            arrival: fare.outbound?.arrivalTime?.split('T')?.[1]?.slice(0,5) || null
          };
          if (departureFrom || departureTo) {
            if (isTimeBetween(flightObj.departure, departureFrom, departureTo)) {
              destinations[dest].flights.push(flightObj);
            }
          } else {
            destinations[dest].flights.push(flightObj);
          }
        } else {
          console.log(`  ⚠️ Pominęto fare - dest: ${dest}, price: ${price}`);
        }
      });
    } else {
      console.log('⚠️ Brak fares w odpowiedzi:', data);
    }

    const result = Object.values(destinations);
    // Store in cache for 30 minutes
    try {
      if (!globalThis.__anyDestCache) globalThis.__anyDestCache = new Map();
      globalThis.__anyDestCache.set(cacheKey, { result, expires: Date.now() + 30 * 60 * 1000 });
    } catch (e) {
      // ignore cache errors
    }
    console.log('✅ searchAnyDestination zwraca:', result.length, 'destynacji');
    return result;
  } catch (error) {
    console.error('Błąd wyszukiwania ANY destination:', error);
    if (error?.hardBlocked) throw error;
    return [];
  }
}
