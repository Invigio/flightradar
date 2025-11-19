/**
 * SearchForm - główny formularz wyszukiwania lotów
 * Requesty idą bezpośrednio do Ryanair API
 */
import React, { useState, useEffect } from 'react';
import { Search, Calendar, Users, Plane, MapPin } from 'lucide-react';
import { searchFlightsRange, searchRoundTripRange, getLastMetrics, isRyanairBlocked, resetRyanairLimiter, debugCheckPair } from '../api/ryanair';
import { searchAnyDestination } from '../api/ryanair';
import { searchHistory } from '../api/backend';
import {
  getAllAirports,
  groupAirportsByCountry,
  getFilteredDestinations,
  formatAirportsForSelect,
  searchAirports,
  getRoutesFromAirport
} from '../api/airports';
import { getMonthlyFaresForRoute } from '../api/ryanair';
import { minutesToTime, timeToMinutes } from '../utils/time';
import { useFlightStore } from '../store';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

export default function SearchForm() {
  // Pobierz setter do ustawiania wyników lotów w globalnym store
  const setFlights = useFlightStore(state => state.setFlights);
  const setStoreMetrics = useFlightStore(state => state.setMetrics);
  // Stan dla parametrów ostatniego wyszukiwania
  const [searchParams, setSearchParams] = useState(null);
  // Stan dla błędów wyszukiwania
  const [error, setError] = useState(null);
  // Stan ładowania wyników wyszukiwania
  const [loading, setLoading] = useState(false);
  // Stan dla maksymalnej liczby dni pobytu
  const [stayDaysMax, setStayDaysMax] = useState(7);
  // Stan dla minimalnej liczby dni pobytu
  const [stayDaysMin, setStayDaysMin] = useState(1);
  // Time filters (HH:MM)
  const [departureFrom, setDepartureFrom] = useState('00:00');
  const [departureTo, setDepartureTo] = useState('23:59');
  const [returnArrivalFrom, setReturnArrivalFrom] = useState('00:00');
  const [arrivalFrom, setArrivalFrom] = useState('00:00');
  const [arrivalTo, setArrivalTo] = useState('23:59');
  const [returnArrivalTo, setReturnArrivalTo] = useState('23:59');
  // Helpers: imported from utils/time
  const [arrivalFromMin, setArrivalFromMin] = useState(0);
  const [arrivalToMin, setArrivalToMin] = useState(23*60+59);
  // Sliders internal state (minutes from midnight)
  const [departureFromMin, setDepartureFromMin] = useState(0);
  const [returnDepartureFrom, setReturnDepartureFrom] = useState('00:00');
  const [returnDepartureTo, setReturnDepartureTo] = useState('23:59');
  const [departureToMin, setDepartureToMin] = useState(23*60+59);
  const [returnArrivalFromMin, setReturnArrivalFromMin] = useState(0);
  const [returnDepartureFromMin, setReturnDepartureFromMin] = useState(0);
  const [returnDepartureToMin, setReturnDepartureToMin] = useState(23*60+59);
  const [returnArrivalToMin, setReturnArrivalToMin] = useState(23*60+59);

  // Sync minutes to HH:MM when time inputs change
  useEffect(() => {
    const df = timeToMinutes(departureFrom);
    const dt = timeToMinutes(departureTo);
    const rf = timeToMinutes(returnArrivalFrom);
    const rt = timeToMinutes(returnArrivalTo);
    if (departureFromMin !== df) setDepartureFromMin(df);
    const af = timeToMinutes(arrivalFrom);
    const at = timeToMinutes(arrivalTo);
    if (arrivalFromMin !== af) setArrivalFromMin(af);
    if (arrivalToMin !== at) setArrivalToMin(at);
    if (departureToMin !== dt) setDepartureToMin(dt);
    if (returnArrivalFromMin !== rf) setReturnArrivalFromMin(rf);
    if (returnArrivalToMin !== rt) setReturnArrivalToMin(rt);
  }, [departureFrom, departureTo, arrivalFrom, arrivalTo, returnArrivalFrom, returnArrivalTo]);

  // Sync HH:MM to minutes when slider inputs change
  useEffect(() => {
    const dfStr = minutesToTime(departureFromMin);
    const dtStr = minutesToTime(departureToMin);
    const rfStr = minutesToTime(returnArrivalFromMin);
    const afStr = minutesToTime(arrivalFromMin);
    const atStr = minutesToTime(arrivalToMin);
    if (arrivalFrom !== afStr) setArrivalFrom(afStr);
    if (arrivalTo !== atStr) setArrivalTo(atStr);
    const rtStr = minutesToTime(returnArrivalToMin);
    if (departureFrom !== dfStr) setDepartureFrom(dfStr);
    const rdf = timeToMinutes(returnDepartureFrom);
    const rdt = timeToMinutes(returnDepartureTo);
    if (returnDepartureFromMin !== rdf) setReturnDepartureFromMin(rdf);
    if (returnDepartureToMin !== rdt) setReturnDepartureToMin(rdt);
    // sync minutes -> strings for return departure too
    const rdfStr = minutesToTime(returnDepartureFromMin);
    const rdtStr = minutesToTime(returnDepartureToMin);
    if (returnDepartureFrom !== rdfStr) setReturnDepartureFrom(rdfStr);
    if (returnDepartureTo !== rdtStr) setReturnDepartureTo(rdtStr);
    if (departureTo !== dtStr) setDepartureTo(dtStr);
    if (returnArrivalFrom !== rfStr) setReturnArrivalFrom(rfStr);
    if (returnArrivalTo !== rtStr) setReturnArrivalTo(rtStr);
  }, [departureFromMin, departureToMin, returnArrivalFromMin, returnArrivalToMin, arrivalFromMin, arrivalToMin, returnDepartureFromMin, returnDepartureToMin]);

  // compute slider background gradient for range inputs
  function rangeTrackStyle(minVal, maxVal) {
    const minPct = (minVal / 1439) * 100;
    const maxPct = (maxVal / 1439) * 100;
    const color = '#2563EB'; // blue-600
    const bg = `linear-gradient(90deg, #E5E7EB ${minPct}%, ${color} ${minPct}%, ${color} ${maxPct}%, #E5E7EB ${maxPct}%)`;
    return { background: bg };
  }
  function rangeLabel(minVal, maxVal) {
    if (minVal === 0 && maxVal === 1439) return 'Cały dzień';
    return `od ${minutesToTime(minVal)} do ${minutesToTime(maxVal)}`;
  }
  function setRangeFullDay(which) {
    switch (which) {
      case 'departure':
        setDepartureFromMin(0);
        setDepartureToMin(1439);
        setDepartureFrom('00:00');
        setDepartureTo('23:59');
        break;
      case 'arrival':
        setArrivalFromMin(0);
        setArrivalToMin(1439);
        setArrivalFrom('00:00');
        setArrivalTo('23:59');
        break;
      case 'returnDeparture':
        setReturnDepartureFromMin(0);
        setReturnDepartureToMin(1439);
        setReturnDepartureFrom('00:00');
        setReturnDepartureTo('23:59');
        break;
      case 'returnArrival':
        setReturnArrivalFromMin(0);
        setReturnArrivalToMin(1439);
        setReturnArrivalFrom('00:00');
        setReturnArrivalTo('23:59');
        break;
      default:
        break;
    }
  }
  // Days of week filters: array of booleans for Mon..Sun indexes 1..7 (Date.getDay() -> 0..6 with 0=Sunday)
  const [departureDays, setDepartureDays] = useState([true, true, true, true, true, true, true]); // Mon-Sun default true
  const [returnDays, setReturnDays] = useState([true, true, true, true, true, true, true]); // Mon-Sun default true
  // Day toggles (Mon..Sun boolean arrays) - allow arbitrary selection via buttons
    // Stan dla metryk
    const [metrics, setMetrics] = useState(null);
    // Tymczasowa deklaracja autoryzacji (do poprawy na hook/store)
    const isAuthenticated = true;
    // Stan dla lotniska powrotu
    const [returnFrom, setReturnFrom] = useState("");

  // Stan dla postępu wyszukiwania (czy trwa submit)
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Stan dla liczby dorosłych
  const [adults, setAdults] = useState(1);
  // Stan dla maksymalnej ceny
  const [maxPrice, setMaxPrice] = useState('');
  // Aggressive FareFinder mode: larger margin when deriving candidates from monthly one-way estimates
  const [aggressiveMode, setAggressiveMode] = useState(false);
  // Debug pair inputs
  const [debugOutDate, setDebugOutDate] = useState('');
  const [debugInDate, setDebugInDate] = useState('');
  const [debugReturnAirport, setDebugReturnAirport] = useState('');
  // Confirmation removed - we no longer verify prices via Search API
  // KLUCZOWE: tripType musi być zadeklarowany PRZED jakimkolwiek użyciem (np. w useEffect)
  const [tripType, setTripType] = useState('oneway'); // 'oneway' | 'round'
  // Stany dla dat wylotu i powrotu
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  // Stany dla lotnisk
  const [allAirports, setAllAirports] = useState([]);
  const [airportsLoading, setAirportsLoading] = useState(true);
  const [groupedAirports, setGroupedAirports] = useState({});

  // Stany dla wyboru (dwuetapowy proces jak na Ryanair)
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [availableDestinations, setAvailableDestinations] = useState([]); // Filtrowane cele
  const [loadingDestinations, setLoadingDestinations] = useState(false);

  // NOWOŚĆ: Wyszukiwanie z całego kraju
  const [searchFromCountry, setSearchFromCountry] = useState(false); // Checkbox "Z całego kraju"
  const [originCountry, setOriginCountry] = useState(''); // Kod kraju (np. "pl")
  const [differentReturnAirport, setDifferentReturnAirport] = useState(true); // Domyślnie TRUE dla round-trip
  // Wymuszaj multi-airport przy zmianie typu podróży na round-trip
  useEffect(() => {
    if (tripType === 'round' && !differentReturnAirport) {
      setDifferentReturnAirport(true);
    }
  }, [tripType]);
  const [countryAvailableDestinations, setCountryAvailableDestinations] = useState([]); // Dostępne cele z kraju
  const [countryRoutesByAirport, setCountryRoutesByAirport] = useState({});
  const [countryMonthlyFaresByAirport, setCountryMonthlyFaresByAirport] = useState({});

  // Stany dla postępu wyszukiwania z wielu lotnisk
  const [searchProgress, setSearchProgress] = useState({ current: 0, total: 0, currentAirport: '' });
  const [cancelSearch, setCancelSearch] = useState(false); // Flaga do anulowania

  // Stany UI dla dropdown
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [originSearch, setOriginSearch] = useState('');
  const [destSearch, setDestSearch] = useState('');

  // Poprawiony useEffect do ładowania lotnisk
  useEffect(() => {
    async function loadAirports() {
      try {
        const airports = await getAllAirports();
        setAllAirports(airports);

        // Grupuj według krajów (dla UI)
        const grouped = groupAirportsByCountry(airports);
        setGroupedAirports(grouped);

        console.log(`✅ Załadowano ${airports.length} lotnisk z ${Object.keys(grouped).length} krajów`);
      } catch (error) {
        console.error('❌ Błąd ładowania lotnisk:', error);
        toast.error('Nie udało się załadować listy lotnisk');
      } finally {
        setAirportsLoading(false);
      }
    }
    loadAirports();
  }, []);

  // Using independent circle toggles for day-of-week selection (Mon..Sun). No start/end selectors are used.

  // Previously we synced toggles with separate start/end selectors.
  // Now we use independent circle toggles only; no select-driven day ranges.

  // Zamknij dropdowny po kliknięciu poza nimi
  useEffect(() => {
    function handleClickOutside(event) {
      if (!event.target.closest('.airport-dropdown')) {
        setShowOriginDropdown(false);
        setShowDestDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Gdy użytkownik wybierze źródło → pobierz dostępne cele (KLUCZOWA LOGIKA)
  useEffect(() => {
    async function loadAvailableDestinations() {
      if (!origin || origin.length !== 3) {
        setAvailableDestinations([]);
        return;
      }

      setLoadingDestinations(true);
      setDestination(''); // Wyczyść cel

      try {
        // To sprawdza API routes - gdzie FAKTYCZNIE są loty
        const filtered = await getFilteredDestinations(origin, allAirports);
        setAvailableDestinations(filtered);

        if (filtered.length === 0) {
          toast.error(`Brak dostępnych połączeń z ${origin}`);
        } else {
          console.log(`✅ Dostępne cele z ${origin}: ${filtered.length} lotnisk`);
        }
      } catch (error) {
        console.error('❌ Błąd pobierania dostępnych celów:', error);
        toast.error('Nie udało się pobrać dostępnych połączeń');
        setAvailableDestinations([]);
      } finally {
        setLoadingDestinations(false);
      }
    }

    loadAvailableDestinations();
  }, [origin, allAirports]);

  // Załaduj dostępne cele z całego kraju gdy wybierze się kraj
  useEffect(() => {
    async function loadCountryDestinations() {
      if (!searchFromCountry || !originCountry || allAirports.length === 0) {
        setCountryAvailableDestinations([]);
        return;
      }

      setLoadingDestinations(true);
      console.log(`🔍 Ładuję dostępne cele z wszystkich lotnisk w kraju ${originCountry}...`);

      try {
        // Pobierz wszystkie lotniska w kraju
        const countryAirports = allAirports.filter(a => a.country.code === originCountry);

        // Pobierz trasy ze wszystkich lotnisk w kraju
        const allRoutesPromises = countryAirports.map(airport => getRoutesFromAirport(airport.code));
        const allRoutesArrays = await Promise.all(allRoutesPromises);

        // Połącz wszystkie unikalne cele
        const uniqueDestinations = new Set();
        allRoutesArrays.forEach(routes => {
          routes.forEach(code => uniqueDestinations.add(code));
        });

        // Znajdź obiekty lotnisk dla tych kodów
        const destinationAirports = allAirports.filter(a => uniqueDestinations.has(a.code));

        console.log(`✅ Znaleziono ${destinationAirports.length} unikalnych celów z kraju ${originCountry}`);
        // Build map of routes by airport code for quick lookup
        const routesMap = {};
        for (let i = 0; i < countryAirports.length; i++) {
          routesMap[countryAirports[i].code] = allRoutesArrays[i] || [];
        }
        setCountryRoutesByAirport(routesMap);
        setCountryAvailableDestinations(destinationAirports);
      } catch (error) {
        console.error('❌ Błąd pobierania dostępnych celów z kraju:', error);
        setCountryAvailableDestinations([]);
        setCountryRoutesByAirport({});
        setCountryMonthlyFaresByAirport({});
      } finally {
        setLoadingDestinations(false);
      }
    }

    loadCountryDestinations();
  }, [searchFromCountry, originCountry, allAirports]);

  // Prefetch monthly fares per airport when destination and date range are set
  useEffect(() => {
    async function prefetchMonthlyFares() {
      if (!searchFromCountry || !originCountry || !destination) return;
      if (!maxPrice) return; // only prefetch monthly fares when maxPrice is set to optimize request count
      const countryAirports = allAirports.filter(a => a.country.code === originCountry);
      const map = {};
      // Limit concurrency to 6 to speed up prefetch (adjust if you see rate-limiting)
      const concurrency = 6;
      const queue = [...countryAirports];
      const workers = [];
      for (let i = 0; i < concurrency; i++) {
        workers.push((async () => {
          while (queue.length > 0) {
            const airport = queue.shift();
            try {
              const originCode = airport.code;
              // Only fetch if this airport actually has the destination route
              if (countryRoutesByAirport && countryRoutesByAirport[originCode] && !countryRoutesByAirport[originCode].includes(destination.toUpperCase())) {
                continue;
              }
              const monthly = await getMonthlyFaresForRoute({ origin: originCode, destination: destination, dateFrom, dateTo, adults, departureFrom, departureTo, arrivalFrom, arrivalTo, outboundDays: departureDays });
              // monthly is Map or object - ensure we store Map<date,price>
              map[originCode] = monthly && monthly.prices ? monthly.prices : monthly || new Map();
            } catch (e) {
              console.warn('⚠️ Prefetch monthly fares error for', airport.code, e?.message || e);
            }
          }
        })());
      }
      await Promise.all(workers);
      setCountryMonthlyFaresByAirport(map);
    }

    prefetchMonthlyFares();
  }, [searchFromCountry, originCountry, destination, dateFrom, dateTo, allAirports, countryRoutesByAirport, adults]);

  // Oblicz maksymalną długość pobytu na podstawie zakresu dat
  const getMaxStayDays = () => {
    if (!dateFrom || !dateTo) return 30; // Domyślnie 30 dni

    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    const diffTime = to - from;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Max pobyt = różnica dni + 1 (bo możesz lecieć 1.12 i wracać 31.12 = 31 dni pobytu)
    // Ale użytkownik może też wybrać dłuższy powrót niż wylot (np. wylot 1.12, powrót 31.12)
    // Więc max = ilość dni w zakresie
    return Math.max(1, diffDays + 1); // +1 bo range 1-31 to 31 dni, nie 30
  };

  const maxStayDays = getMaxStayDays();

  const handleSearch = async (e) => {
    e.preventDefault();
    // Twardy pre-check: jeśli Ryanair jest zablokowany – przerwij od razu
    if (isRyanairBlocked()) {
      setError('Ryanair zablokował ruch API. Zresetuj router i spróbuj ponownie, a następnie użyj przycisku Odblokuj.');
      toast.error('🛑 Wykryto blokadę Ryanair. Zresetuj router (zmień IP), a potem kliknij Odblokuj w aplikacji.');
      return;
    }


    console.log('🔍 handleSearch wywołane:', {
      searchFromCountry,
      originCountry,
      origin,
      destination,
      dateFrom,
      dateTo
    });

    // Walidacja - albo pojedyncze lotnisko, albo kraj
    if (searchFromCountry) {
      if (!originCountry || !destination || !dateFrom || !dateTo) {
        console.log('❌ Walidacja nie przeszła (kraj):', { originCountry, destination, dateFrom, dateTo });
        toast.error('Wypełnij wszystkie pola (kraj, cel, daty)');
        return;
      }
      console.log('✅ Walidacja OK (kraj)');
    } else {
      if (!origin || !destination || !dateFrom || !dateTo) {
        console.log('❌ Walidacja nie przeszła:', { origin, destination, dateFrom, dateTo });
        toast.error('Wypełnij wszystkie pola');
        return;
      }
      console.log('✅ Walidacja OK (lotnisko)');
    }

    if (isSubmitting) {
      console.log('Wyszukiwanie już w toku – ignoruję podwójne kliknięcie');
      return; // Zablokuj podwójne wywołanie
    }

    setIsSubmitting(true);
    setLoading(true);
    setError(null);

    try {
      let flights = [];
      let allFlightsFromCountry = [];

      // Parametry wyszukiwania dla historii
      const searchParamsForHistory = {
        origin: searchFromCountry ? originCountry.toUpperCase() + ':COUNTRY' : origin.toUpperCase(),
        destination: destination.toUpperCase(),
        dateFrom,
        dateTo,
        tripType,
        adults
      };
      setSearchParams(searchParamsForHistory);

      // Funkcja pomocnicza do mapowania kodu IATA na nazwę lotniska
      const airportNameByCode = {};
      allAirports.forEach(a => { airportNameByCode[a.code] = a.name; });

      // NOWOŚĆ: Wyszukiwanie z całego kraju
      if (searchFromCountry && originCountry) {
        console.log('🌍 Wyszukiwanie z kraju:', originCountry);
        // NOWA LOGIKA: multi-airport search przez FareFinder (ANY destination)
        const countryAirports = allAirports.filter(a => a.country.code === originCountry);
        console.log('🏙️ Lotniska w kraju:', countryAirports.length, countryAirports.map(a => a.code));
        setSearchProgress({ current: 0, total: countryAirports.length, currentAirport: '' });
        let allResults = [];
        for (let i = 0; i < countryAirports.length; i++) {
          const airport = countryAirports[i];
          console.log(`🔍 Wyszukiwanie z ${airport.code} (${airport.name})`);
          setSearchProgress({ current: i + 1, total: countryAirports.length, currentAirport: airport.code });
          if (cancelSearch) break;
          // Prefilter: use cached routes map instead of calling API again
          const routesForThisAirport = countryRoutesByAirport && countryRoutesByAirport[airport.code] ? countryRoutesByAirport[airport.code] : null;
          if (routesForThisAirport && !routesForThisAirport.includes(destination.toUpperCase())) {
            console.log(`   ⚠️ ${airport.code} nie ma połączenia do ${destination}, pomijam.`);
            continue; // skip this airport
          }
          // Additional optimization: if maxPrice is set and we have monthly fares cached, skip airports where no date <= maxPrice
          if (maxPrice && countryMonthlyFaresByAirport && countryMonthlyFaresByAirport[airport.code]) {
            try {
              const priceMap = countryMonthlyFaresByAirport[airport.code];
              // priceMap may be Map or object - normalize to iteration
              let foundCheap = false;
              if (priceMap instanceof Map) {
                for (const val of priceMap.values()) {
                  if (val <= Number(maxPrice)) { foundCheap = true; break; }
                }
              } else if (typeof priceMap === 'object') {
                for (const k in priceMap) {
                  if (Object.prototype.hasOwnProperty.call(priceMap, k) && priceMap[k] <= Number(maxPrice)) { foundCheap = true; break; }
                }
              }
              if (!foundCheap) {
                console.log(`   ⚠️ ${airport.code} nie ma dni ≤ ${maxPrice} PLN według miesięcznych cen, pomijam.`);
                continue;
              }
            } catch (e) {
              console.warn('   ⚠️ Błąd analizowania monthly fares:', e?.message || e);
            }
          }
          try {
            if (tripType === 'oneway') {
              // One-way flow: use searchAnyDestination
              const combos = await searchAnyDestination({
                origin: airport.code,
                dateFrom,
                dateTo,
                adults,
                market: 'pl-pl'
                ,departureFrom, departureTo
              }, maxPrice ? Number(maxPrice) : null);
              // MAPUJEMY na pojedyncze loty z ceną!
              combos.forEach(c => {
                if (Array.isArray(c.flights)) {
                  c.flights.forEach(flight => {
                    // sanity check: only accept fares that originate from the airport we requested
                    if (flight.originAirport && flight.originAirport !== airport.code) {
                      console.warn(`   ⚠️ Pominięto lot z innego lotniska (${flight.originAirport}) zamiast ${airport.code}`);
                      return;
                    }
                    allResults.push({
                      originAirport: airport.code,
                      originName: airport.name,
                      destination: c.destination,
                      destinationName: c.destinationName,
                      date: flight.date,
                      price: flight.price,
                      currency: flight.currency,
                      priceInPLN: flight.priceInPLN || null
                      , source: flight.source || 'CACHE'
                    });
                  });
                }
              });
            } else {
              // Round-trip flow: call searchRoundTripRange for each airport
              const combos = await searchRoundTripRange({
                origin: airport.code,
                destination: destination.toUpperCase(),
                outFrom: dateFrom,
                outTo: dateTo,
                stayDaysMin,
                stayDaysMax,
                maxPrice: maxPrice ? Number(maxPrice) : null,
                adults,
                allowDifferentReturnAirport: differentReturnAirport,
                availableReturnAirports: differentReturnAirport ? countryAirports.map(a => a.code) : null,
                oneWayCandidateMargin: aggressiveMode ? 1.5 : 1.3
                ,departureFrom, departureTo
                ,arrivalFrom, arrivalTo
                ,returnArrivalFrom, returnArrivalTo
                ,returnDepartureFrom, returnDepartureTo
                ,departureDays, returnDays
              });
              // Map returned combos into allResults (round-trip combos)
              combos.forEach(c => {
                // ensure the combo is complete (both outbound & inbound)
                if (!c.outbound || !c.inbound) return;
                // ensure times and prices are present
                if (!c.outbound.date || !c.outbound.departure || !c.inbound.date || !c.inbound.departure) return;
                if (!c.totalPriceInPLN) return;
                // attach origin info
                c.originAirport = airport.code;
                c.originName = airport.name;
                // Ensure returnAirport/returnName exist (for country flow)
                if (!c.returnAirport && c.inbound && c.inbound.destination) {
                  c.returnAirport = c.inbound.destination;
                }
                if ((!c.returnName || c.returnName === '') && c.returnAirport) {
                  c.returnName = airportNameByCode[c.returnAirport] || c.returnAirport || (c.inbound && c.inbound.destinationName) || '';
                }
                // Oznacz kombinację źródła: API jeśli obie nogi z API; CACHE jeśli obie z cache; MIXED jeśli mieszane
                c.source = c.source || ((c.outbound?.source === 'API' && c.inbound?.source === 'API') ? 'API' : (c.outbound?.source === 'CACHE' && c.inbound?.source === 'CACHE') ? 'CACHE' : 'MIXED');
                allResults.push(c);
              });
            }
          } catch (err) {
            console.error(`Błąd wyszukiwania z ${airport.code}:`, err);
          }
        }
        if (tripType === 'oneway') {
          console.log('📊 Łącznie zebrano (one-way):', allResults.length, 'lotów');
          flights = allResults.sort((a, b) => ((a.priceInPLN || a.price || Infinity) - (b.priceInPLN || b.price || Infinity)));
          setFlights(flights);
        } else {
          console.log('📊 Łącznie zebrano (round-trip):', allResults.length, 'kombinacji');
          flights = allResults.sort((a, b) => ((a.totalPriceInPLN || Infinity) - (b.totalPriceInPLN || Infinity)));
          setFlights(flights);
        }
        setSearchProgress({ current: countryAirports.length, total: countryAirports.length, currentAirport: '' });
        const metrics = getLastMetrics();
        setStoreMetrics(metrics);
      } else {
        // Oryginalna logika - pojedyncze lotnisko
        if (tripType === 'oneway') {
          flights = await searchFlightsRange({
            origin: origin.toUpperCase(),
            destination: destination.toUpperCase(),
            dateFrom: dateFrom,
            dateTo: dateTo,
            adults,
            maxPrice: maxPrice ? Number(maxPrice) : null
            ,departureFrom, departureTo
            ,arrivalFrom, arrivalTo
            ,departureDays
          });
          setFlights(flights);
          const metrics = getLastMetrics();
          setStoreMetrics(metrics);
        } else {
          // round-trip - nowy algorytm z długością pobytu
          const combinations = await searchRoundTripRange({
            origin: origin.toUpperCase(),
            destination: destination.toUpperCase(),
            outFrom: dateFrom,
            outTo: dateTo,
            stayDaysMin: stayDaysMin,
            stayDaysMax: stayDaysMax,
            maxPrice: maxPrice ? Number(maxPrice) : null, // opcjonalny filtr ceny
            adults
            ,allowDifferentReturnAirport: differentReturnAirport
            ,availableReturnAirports: differentReturnAirport && searchFromCountry ? countryAirports.map(a => a.code) : null
            ,oneWayCandidateMargin: aggressiveMode ? 1.5 : 1.3
            ,departureFrom, departureTo
            ,arrivalFrom, arrivalTo
            ,returnArrivalFrom, returnArrivalTo
            ,returnDepartureFrom, returnDepartureTo
            ,departureDays, returnDays
          });
          // Uzupełnij returnAirport i returnName jeśli nie ma (np. fallback, multi-airport)
          combinations.forEach(c => {
            if (!c.returnAirport && c.inbound && c.inbound.destination) {
              c.returnAirport = c.inbound.destination;
            }
            if ((!c.returnName || c.returnName === '') && c.returnAirport) {
              c.returnName = airportNameByCode[c.returnAirport] || c.returnAirport;
            }
            c.source = c.source || ((c.outbound?.source === 'API' && c.inbound?.source === 'API') ? 'API' : (c.outbound?.source === 'CACHE' && c.inbound?.source === 'CACHE') ? 'CACHE' : 'MIXED');
          });
          // Wyświetl jako połączone karty (jak w Kiwi)
          setFlights(combinations); // wszystkie kombinacje
          const metrics = getLastMetrics();
          setStoreMetrics(metrics); // metryki z LAST_METRICS
          flights = combinations;
        }
      } // Koniec else - pojedyncze lotnisko

      // Oblicz statystyki
      const prices = tripType === 'round'
        ? flights.filter(f => f.totalPriceInPLN != null).map(f => f.totalPriceInPLN)
        : flights.filter(f => f.price != null).map(f => f.price);
      const stats = prices.length > 0 ? {
        flights_found: flights.length,
        min_price: Math.min(...prices),
        max_price: Math.max(...prices),
        avg_price: prices.reduce((a, b) => a + b, 0) / prices.length
      } : {
        flights_found: 0,
        min_price: null,
        max_price: null,
        avg_price: null
      };

      // Zapisz do NASZEGO backendu (tylko historia) - zapisujemy zakres jako pierwszą datę
      if (isAuthenticated) {
        // Zapis historii tymczasowo wyłączony (wymaga autoryzacji JWT)
        // try {
        //   await searchHistory.save({
        //     origin: searchFromCountry ? `${originCountry.toUpperCase()}:COUNTRY` : origin.toUpperCase(),
        //     destination: destination.toUpperCase(),
        //     date_out: dateFrom,
        //     date_in: tripType === 'round' ? (returnFrom || dateFrom) : null,
        //     adults,
        //     ...stats
        //   });
        // } catch (error) {
        //   console.error('Błąd zapisu historii:', error);
        // }
      }

      if (flights.length === 0) {
        toast.error('Brak lotów na tej trasie');
      } else {
        toast.success(`Znaleziono ${flights.length} lotów!`);
      }

    } catch (error) {
      console.error('Błąd wyszukiwania:', error);
      setError(error.message);

      // Sprawdź czy to problem z blokowaniem Ryanair
      if (error.message.includes('zablokował')) {
        toast.error(error.message, { duration: 6000 });
      } else if (error.message.includes('Backend')) {
        toast.error(error.message, { duration: 5000 });
      } else {
        toast.error('Błąd wyszukiwania lotów');
      }
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleDebugPairClick = async () => {
    // Use defaults when empty
    const originCode = searchFromCountry && originCountry ? originCountry : origin;
    const defOut = debugOutDate || dateFrom;
    const defIn = debugInDate || dateTo;
    const defReturn = debugReturnAirport || (differentReturnAirport ? '' : destination);
    const outDate = prompt('Out date (YYYY-MM-DD):', defOut);
    if (!outDate) return;
    const inDate = prompt('In date (YYYY-MM-DD):', defIn);
    if (!inDate) return;
    const returnAirport = prompt('Return airport IATA (e.g. WAW):', defReturn || 'WAW');
    if (!returnAirport) return;

    try {
      console.log('🔧 Debug pair:', { origin: originCode, destination, outDate, inDate, returnAirport });
      const res = await debugCheckPair({ origin: originCode, destination: destination.toUpperCase(), outDate, inDate, returnAirport: returnAirport.toUpperCase(), adults });
      console.log('🔍 Debug result:', res);
      toast.success(`Debug finished: ${res.accepted.length} accepted, ${res.rejected.length} rejected. Sprawdź konsolę.`);
    } catch (err) {
      console.error('Błąd debugCheckPair:', err);
      toast.error(`Błąd debugCheckPair: ${err?.message || err}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 search-form">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Plane className="w-6 h-6 text-blue-600" />
        Wyszukaj Loty
      </h2>

      <form onSubmit={handleSearch} className="space-y-4">
        {/* Opcje wyszukiwania */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Opcje wyszukiwania</h3>

          {/* Checkbox: Z całego kraju */}
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={searchFromCountry}
              onChange={(e) => {
                setSearchFromCountry(e.target.checked);
                if (e.target.checked) {
                  // Jeśli włączamy tryb kraju - wyczyść pojedyncze lotnisko i ustaw kraj
                  if (origin && origin.length === 3) {
                    // Znajdź kraj dla obecnego origin
                    const airport = allAirports.find(a => a.code === origin);
                    if (airport) {
                      setOriginCountry(airport.country.code);
                    }
                  }
                } else {
                  // Wracamy do trybu pojedynczego lotniska
                  setOriginCountry('');
                }
              }}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900">
                🌍 Wyszukuj z wszystkich lotnisk w kraju
              </span>
              <p className="text-xs text-gray-600 mt-0.5">
                Np. wszystkie polskie lotniska (WAW, KRK, GDN, POZ, WMI, WRO...)
              </p>
            </div>
          </label>

          {/* Checkbox: Różne lotniska powrotu (tylko dla round-trip) */}
          {tripType === 'round' && (
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={differentReturnAirport}
                onChange={(e) => setDifferentReturnAirport(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">
                  ↔️ Powrót na różne lotniska (kombinacje)
                </span>
                <p className="text-xs text-gray-600 mt-0.5">
                  Wylot WAW→AGP→KRK, KRK→AGP→WRO itp. (automatyczne kombinacje)
                </p>
              </div>
            </label>
          )}
          {/* Checkbox: Aggressive FareFinder - expand candidate margin */}
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={aggressiveMode}
              onChange={(e) => setAggressiveMode(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900">🔎 Aggressive FareFinder</span>
              <p className="text-xs text-gray-600 mt-0.5">Zwiększ tolerancję marginesu przy zestawianiu kandydatów z miesięcznych cen.</p>
            </div>
          </label>
        </div>

        {/* Origin - WSZYSTKIE lotniska z bazy LUB wybór kraju */}
        <div className="relative airport-dropdown">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            {searchFromCountry ? 'Kraj wylotu' : 'Skąd'}
          </label>

          {searchFromCountry ? (
            /* Tryb wyboru kraju */
            <select
              value={originCountry}
              onChange={(e) => {
                setOriginCountry(e.target.value);
                setOrigin(''); // Wyczyść pojedyncze lotnisko
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Wybierz kraj...</option>
              {Object.values(groupedAirports).map(country => (
                <option key={country.code} value={country.code}>
                  {country.name} ({country.airportCount} lotnisk)
                </option>
              ))}
            </select>
          ) : (
            /* Tryb pojedynczego lotniska (oryginalny) */
            <div className="relative">
            <input
              type="text"
              value={origin || originSearch}
              onChange={(e) => {
                const val = e.target.value;
                setOriginSearch(val);
                if (val.length === 3) {
                  const code = val.toUpperCase();
                  const exists = allAirports.some(a => a.code === code);
                  setOrigin(exists ? code : '');
                } else {
                  setOrigin('');
                }
                setShowOriginDropdown(true);
              }}
              onFocus={() => setShowOriginDropdown(true)}
              placeholder="Kraj, miasto lub lotnisko"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {/* Dropdown z krajami/miastami/lotniskami */}
            {showOriginDropdown && !airportsLoading && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                <div className="p-2">
                  <p className="text-xs text-gray-500 px-2 py-1">Wybierz lotnisko wylotu</p>

                  {/* Lista krajów z lotniskami */}
                  {Object.values(groupedAirports)
                    .filter(country => {
                      if (!originSearch) return true;
                      const search = originSearch.toLowerCase();
                      return country.name.toLowerCase().includes(search) ||
                        Object.values(country.cities).some(city =>
                          city.name.toLowerCase().includes(search) ||
                          city.airports.some(apt =>
                            apt.code.toLowerCase().includes(search) ||
                            apt.name.toLowerCase().includes(search)
                          )
                        );
                    })
                    .map(country => (
                      <div key={country.code} className="mb-3">
                        <div className="px-2 py-1 bg-gray-100 text-sm font-semibold text-gray-700">
                          {country.name}
                        </div>

                        {Object.values(country.cities).map(city => (
                          <div key={city.code} className="ml-2">
                            <div className="px-2 py-1 text-xs text-gray-600 font-medium">
                              {city.name}
                            </div>

                            {city.airports.map(airport => (
                              <button
                                key={airport.code}
                                type="button"
                                onClick={() => {
                                  setOrigin(airport.code);
                                  setOriginSearch(airport.code);
                                  setShowOriginDropdown(false);
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center justify-between group"
                              >
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {airport.code} - {airport.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {city.name}, {country.name}
                                  </div>
                                </div>
                                {airport.base && (
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                    Baza Ryanair
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    ))}
                </div>
              </div>
            )}
            </div>
          )}

          {/* Pokaż wybrane */}
          {searchFromCountry && originCountry && (
            <p className="mt-1 text-sm text-green-600">
              ✓ Wybrano kraj: {groupedAirports[originCountry]?.name || originCountry.toUpperCase()}
            </p>
          )}
          {!searchFromCountry && origin && (
            <p className="mt-1 text-sm text-green-600">
              ✓ Wybrano: {origin}
            </p>
          )}
        </div>

        {/* Destination - TYLKO dostępne z origin */}
        <div className="relative airport-dropdown">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Dokąd {origin && `(dostępne z ${origin})`}
          </label>

          <div className="relative">
            <input
              type="text"
              value={destination || destSearch}
              onChange={(e) => {
                const val = e.target.value;
                setDestSearch(val);
                if (val.length === 3) {
                  const code = val.toUpperCase();
                  const exists = availableDestinations.some(a => a.code === code);
                  setDestination(exists ? code : '');
                } else {
                  setDestination('');
                }
                setShowDestDropdown(true);
              }}
              onFocus={() => setShowDestDropdown(true)}
              placeholder={
                searchFromCountry
                  ? "Wybierz cel podróży (dowolne lotnisko)"
                  : (origin ? "Wybierz cel podróży" : "Najpierw wybierz skąd")
              }
              disabled={searchFromCountry ? false : (!origin || loadingDestinations)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />

            {loadingDestinations && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Dropdown TYLKO z dostępnymi celami (lub z kraju gdy searchFromCountry) */}
            {showDestDropdown && !loadingDestinations && (
              (searchFromCountry ? countryAvailableDestinations.length > 0 : (origin && availableDestinations.length > 0)) && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                <div className="p-2">
                  {searchFromCountry ? (
                    <p className="text-xs text-blue-600 px-2 py-1 font-medium">
                      🌍 {countryAvailableDestinations.length} dostępnych celów z kraju {originCountry.toUpperCase()}
                    </p>
                  ) : (
                    <p className="text-xs text-green-600 px-2 py-1 font-medium">
                      ✈️ {availableDestinations.length} dostępnych połączeń z {origin}
                    </p>
                  )}

                  {/* Grupuj dostępne cele według krajów */}
                  {Object.entries(
                    (searchFromCountry ? countryAvailableDestinations : availableDestinations).reduce((acc, airport) => {
                      const country = airport.country.name;
                      if (!acc[country]) acc[country] = [];
                      acc[country].push(airport);
                      return acc;
                    }, {})
                  )
                  .filter(([country, airports]) => {
                    if (!destSearch) return true;
                    const search = destSearch.toLowerCase();
                    return country.toLowerCase().includes(search) ||
                      airports.some(apt =>
                        apt.code.toLowerCase().includes(search) ||
                        apt.name.toLowerCase().includes(search) ||
                        apt.city.name.toLowerCase().includes(search)
                      );
                  })
                  .map(([country, airports]) => (
                    <div key={country} className="mb-3">
                      <div className="px-2 py-1 bg-gray-100 text-sm font-semibold text-gray-700">
                        {country}
                      </div>

                      {airports.map(airport => (
                        <button
                          key={airport.code}
                          type="button"
                          onClick={() => {
                            setDestination(airport.code);
                            setDestSearch(airport.code);
                            setShowDestDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center justify-between group"
                        >
                          <div>
                            <div className="font-medium text-gray-900">
                              {airport.code} - {airport.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {airport.city.name}, {country}
                            </div>
                          </div>
                          {airport.base && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              Baza
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {destination && (
            <p className="mt-1 text-sm text-green-600">
              ✓ Wybrano: {destination}
            </p>
          )}

          {origin && !loadingDestinations && availableDestinations.length === 0 && (
            <p className="mt-1 text-sm text-red-600">
              ⚠️ Brak dostępnych połączeń z {origin}
            </p>
          )}
        </div>

        {/* Trip type */}
        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2">
            <input type="radio" name="tripType" value="oneway" checked={tripType==='oneway'} onChange={() => setTripType('oneway')} />
            <span className="ml-1">Jednokierunkowy</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="tripType" value="round" checked={tripType==='round'} onChange={() => setTripType('round')} />
            <span className="ml-1">W obie strony</span>
          </label>
        </div>

        {/* Outbound date range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Zakres dat wylotu
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              min={dateFrom || new Date().toISOString().split('T')[0]}
              className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
            <div className="mt-2 flex gap-2 items-center">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-500">Wylot</label>
                <button type="button" onClick={() => setRangeFullDay('departure')} className="text-xs text-blue-600 hover:underline">Cały dzień</button>
              </div>
              <div className="text-sm text-blue-600 mt-1">{rangeLabel(departureFromMin, departureToMin)}</div>
              {/* Removed direct time inputs - use slider for range selection */}
              <div className="mt-2 relative" style={{ height: 36 }} onDoubleClick={() => setRangeFullDay('departure')}>
                <div className="absolute inset-0 px-1 flex items-center">
                  <div className="w-full h-2 rounded bg-gray-200" style={rangeTrackStyle(departureFromMin, departureToMin)} />
                </div>
                <input type="range" min="0" max="1439" step="1" aria-label="Wylot od" aria-valuemin={0} aria-valuemax={1439} aria-valuenow={departureFromMin} value={departureFromMin} onChange={(e) => {
                  const v = Number(e.target.value);
                  if (v > departureToMin) setDepartureToMin(v);
                  setDepartureFromMin(v);
                }} className="absolute inset-0 w-full h-9 appearance-none bg-transparent dual-range" style={{ zIndex: 2 }} />
                <input type="range" min="0" max="1439" step="1" aria-label="Wylot do" aria-valuemin={0} aria-valuemax={1439} aria-valuenow={departureToMin} value={departureToMin} onChange={(e) => {
                  const v = Number(e.target.value);
                  if (v < departureFromMin) setDepartureFromMin(v);
                  setDepartureToMin(v);
                }} className="absolute inset-0 w-full h-9 appearance-none bg-transparent dual-range" style={{ zIndex: 3 }} />
                {/* moved up into a more visible label */}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-500">Przylot</label>
                <button type="button" onClick={() => setRangeFullDay('arrival')} className="text-xs text-blue-600 hover:underline">Cały dzień</button>
              </div>
              <div className="text-sm text-blue-600 mt-1">{rangeLabel(arrivalFromMin, arrivalToMin)}</div>
              {/* Removed direct time inputs - use slider for range selection */}
              <div className="mt-2 relative" style={{ height: 36 }} onDoubleClick={() => setRangeFullDay('arrival')}>
                <div className="absolute inset-0 px-1 flex items-center">
                  <div className="w-full h-2 rounded bg-gray-200" style={rangeTrackStyle(arrivalFromMin, arrivalToMin)} />
                </div>
                <input type="range" min="0" max="1439" step="1" aria-label="Przylot od" aria-valuemin={0} aria-valuemax={1439} aria-valuenow={arrivalFromMin} value={arrivalFromMin} onChange={(e) => {
                  const v = Number(e.target.value);
                  if (v > arrivalToMin) setArrivalToMin(v);
                  setArrivalFromMin(v);
                }} className="absolute inset-0 w-full h-9 appearance-none bg-transparent dual-range" style={{ zIndex: 2 }} />
                <input type="range" min="0" max="1439" step="1" aria-label="Przylot do" aria-valuemin={0} aria-valuemax={1439} aria-valuenow={arrivalToMin} value={arrivalToMin} onChange={(e) => {
                  const v = Number(e.target.value);
                  if (v < arrivalFromMin) setArrivalFromMin(v);
                  setArrivalToMin(v);
                }} className="absolute inset-0 w-full h-9 appearance-none bg-transparent dual-range" style={{ zIndex: 3 }} />
                {/* moved up into a more visible label */}
              </div>
            </div>
            {/* Days of week toggles for outbound */}
            <div className="mt-3 w-full">
              <label className="text-xs text-gray-500">Dni wylotu</label>
              <div className="flex gap-2 mt-2 items-center">
                <div className="flex gap-2 ml-4">
                  {['P', 'W', 'S', 'C', 'P', 'S', 'N'].map((label, idx) => (
                    <button key={`out-day-${idx}`} type="button" aria-pressed={departureDays[idx]} title={['Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota','Niedziela'][idx]} className={`day-selector-button rounded-full flex items-center justify-center ${departureDays[idx] ? 'active' : ''}`} onClick={() => {
                      const newDays = [...departureDays];
                      newDays[idx] = !newDays[idx];
                      setDepartureDays(newDays);
                    }}>{label}</button>
                  ))}
                </div>
                {/* Using circle toggles for day-of-week selection */}
              </div>
            </div>
            {/* Removed duplicate 'Wylot do' and 'Przylot do' columns to keep single dual-range pair per direction */}
          </div>
        </div>

        {/* Return date range (only for round-trip) */}
        {tripType === 'round' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Długość pobytu (dni)
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={stayDaysMin}
                onChange={(e) => {
                  const value = e.target.value;
                  // Pozwól na pusty string podczas edycji
                  if (value === '') {
                    setStayDaysMin('');
                  } else {
                    const num = Number(value);
                    if (num >= 1 && num <= maxStayDays) {
                      setStayDaysMin(num);
                    }
                  }
                }}
                onBlur={(e) => {
                  // Po zakończeniu edycji, jeśli puste lub < 1 to ustaw 1
                  if (e.target.value === '' || Number(e.target.value) < 1) {
                    setStayDaysMin(1);
                  }
                  // Jeśli większe niż max, ustaw max
                  if (Number(e.target.value) > maxStayDays) {
                    setStayDaysMin(maxStayDays);
                  }
                }}
                min="1"
                max={maxStayDays}
                placeholder="1"
                className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-gray-600">-</span>
              <input
                type="number"
                value={stayDaysMax}
                onChange={(e) => {
                  const value = e.target.value;
                  // Pozwól na pusty string podczas edycji
                  if (value === '') {
                    setStayDaysMax('');
                  } else {
                    const num = Number(value);
                    if (num >= 1 && num <= maxStayDays) {
                      setStayDaysMax(num);
                    }
                  }
                }}
                onBlur={(e) => {
                  // Po zakończeniu edycji, jeśli puste lub < 1 to ustaw domyślną wartość
                  const val = Number(e.target.value);
                  if (e.target.value === '' || val < 1) {
                    setStayDaysMax(Math.min(7, maxStayDays));
                  }
                  // Jeśli większe niż max, ustaw max
                  if (val > maxStayDays) {
                    setStayDaysMax(maxStayDays);
                  }
                  // Jeśli mniejsze niż min, ustaw równe min
                  if (val < stayDaysMin) {
                    setStayDaysMax(stayDaysMin);
                  }
                }}
                min={stayDaysMin || 1}
                max={maxStayDays}
                placeholder="7"
                className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-sm text-gray-500">dni (max {maxStayDays})</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Przykład: 1-1 = wylot i powrót tego samego dnia, 7-7 = dokładnie tydzień
            </p>
          </div>
        )}

        {tripType === 'round' && (
          <div className="mt-2">
            <div className="mt-2 flex gap-2 items-center">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-500">Wylot powrotny</label>
                  <button type="button" onClick={() => setRangeFullDay('returnDeparture')} className="text-xs text-blue-600 hover:underline">Cały dzień</button>
                </div>
                <div className="text-sm text-blue-600 mt-1">{rangeLabel(returnDepartureFromMin, returnDepartureToMin)}</div>
                {/* Removed direct time inputs - use slider for range selection */}
                <div className="mt-2 relative" style={{ height: 36 }} onDoubleClick={() => setRangeFullDay('returnDeparture')}>
                  <div className="absolute inset-0 px-1 flex items-center">
                    <div className="w-full h-2 rounded bg-gray-200" style={rangeTrackStyle(returnDepartureFromMin, returnDepartureToMin)} />
                  </div>
                  <input type="range" min="0" max="1439" step="1" aria-label="Powrót - wylot od" aria-valuemin={0} aria-valuemax={1439} aria-valuenow={returnDepartureFromMin} value={returnDepartureFromMin} onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v > returnDepartureToMin) setReturnDepartureToMin(v);
                    setReturnDepartureFromMin(v);
                  }} className="absolute inset-0 w-full h-9 appearance-none bg-transparent dual-range" style={{ zIndex: 2 }} />
                  <input type="range" min="0" max="1439" step="1" aria-label="Powrót - wylot do" aria-valuemin={0} aria-valuemax={1439} aria-valuenow={returnDepartureToMin} value={returnDepartureToMin} onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v < returnDepartureFromMin) setReturnDepartureFromMin(v);
                    setReturnDepartureToMin(v);
                  }} className="absolute inset-0 w-full h-9 appearance-none bg-transparent dual-range" style={{ zIndex: 3 }} />
                  {/* moved up into a more visible label */}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-500">Przylot powrotny</label>
                  <button type="button" onClick={() => setRangeFullDay('returnArrival')} className="text-xs text-blue-600 hover:underline">Cały dzień</button>
                </div>
                <div className="text-sm text-blue-600 mt-1">{rangeLabel(returnArrivalFromMin, returnArrivalToMin)}</div>
                {/* Removed direct time inputs - use slider for range selection */}
                <div className="mt-2 relative" style={{ height: 36 }} onDoubleClick={() => setRangeFullDay('returnArrival')}>
                  <div className="absolute inset-0 px-1 flex items-center">
                    <div className="w-full h-2 rounded bg-gray-200" style={rangeTrackStyle(returnArrivalFromMin, returnArrivalToMin)} />
                  </div>
                  <input type="range" min="0" max="1439" step="1" aria-label="Powrót - przylot od" aria-valuemin={0} aria-valuemax={1439} aria-valuenow={returnArrivalFromMin} value={returnArrivalFromMin} onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v > returnArrivalToMin) setReturnArrivalToMin(v);
                    setReturnArrivalFromMin(v);
                  }} className="absolute inset-0 w-full h-9 appearance-none bg-transparent dual-range" style={{ zIndex: 2 }} />
                  <input type="range" min="0" max="1439" step="1" aria-label="Powrót - przylot do" aria-valuemin={0} aria-valuemax={1439} aria-valuenow={returnArrivalToMin} value={returnArrivalToMin} onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v < returnArrivalFromMin) setReturnArrivalFromMin(v);
                    setReturnArrivalToMin(v);
                  }} className="absolute inset-0 w-full h-9 appearance-none bg-transparent dual-range" style={{ zIndex: 3 }} />
                  {/* moved up into a more visible label */}
                </div>
              </div>
              <div className="mt-3 w-full">
                <label className="text-xs text-gray-500">Dni powrotu</label>
                <div className="flex gap-2 mt-2 items-center">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-2 ml-4">
                      {['P', 'W', 'S', 'C', 'P', 'S', 'N'].map((label, idx) => (
                        <button key={`ret-day-${idx}`} type="button" aria-pressed={returnDays[idx]} title={['Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota','Niedziela'][idx]} className={`day-selector-button rounded-full flex items-center justify-center ${returnDays[idx] ? 'active' : ''}`} onClick={() => {
                          const newDays = [...returnDays];
                          newDays[idx] = !newDays[idx];
                          setReturnDays(newDays);
                        }}>{label}</button>
                      ))}
                    </div>
                  </div>
                  {/* Using circle toggles for day-of-week selection */}
                </div>
            </div>
          </div>
        </div>
        )}

        {/* Max cena (opcjonalne - optymalizacja) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max cena {tripType === 'round' ? 'łącznie' : ''} (opcjonalne)
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              min="0"
              placeholder="np. 500"
              className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-sm text-gray-500">PLN</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            ⚡ Podanie max ceny przyspiesza wyszukiwanie - sprawdzamy tylko tanie dni
          </p>
        </div>

        {/* Confirmation removed; we do not verify prices via Search API anymore */}



        {/* Adults */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Liczba osób dorosłych
          </label>
          <input
            type="number"
            value={adults}
            onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
            min={1}
            max={10}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Submit */}
        <div className="flex gap-2">
        <button
          type="submit"
          disabled={
            (searchFromCountry ? !originCountry : !origin) ||
            !destination ||
            !dateFrom ||
            !dateTo ||
            isSubmitting
          }
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          <Search className="w-5 h-5" />
          {isSubmitting ? 'Szukam...' : 'Szukaj Lotów'}
        </button>
        <button
          type="button"
          onClick={handleDebugPairClick}
          className="bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 flex items-center gap-2"
        >
          🧪 Debug pair
        </button>
        </div>

        {/* Postęp wyszukiwania z wielu lotnisk */}
        {isSubmitting && searchProgress.total > 0 && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">
                Przeszukuję lotniska: {searchProgress.current} / {searchProgress.total}
              </span>
              <button
                onClick={() => setCancelSearch(true)}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                Anuluj
              </button>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(searchProgress.current / searchProgress.total) * 100}%` }}
              />
            </div>
            {searchProgress.currentAirport && (
              <p className="text-xs text-blue-700">
                Obecnie: {searchProgress.currentAirport}
              </p>
            )}
          </div>
        )}
      </form>

      <div className="mt-4 text-sm text-gray-500">
        💡 Przykładowe kody lotnisk: WAW (Warszawa), POZ (Poznań), KRK (Kraków),
        VIE (Wiedeń), BCN (Barcelona), MAD (Madryt)
      </div>
    </div>
  );
}
