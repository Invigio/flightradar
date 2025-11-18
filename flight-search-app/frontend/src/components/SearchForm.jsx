/**
 * SearchForm - główny formularz wyszukiwania lotów
 * Requesty idą bezpośrednio do Ryanair API
 */
import React, { useState, useEffect } from 'react';
import { Search, Calendar, Users, Plane, MapPin } from 'lucide-react';
import { searchFlightsRange, searchRoundTripRange, getLastMetrics, isRyanairBlocked, resetRyanairLimiter } from '../api/ryanair';
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
import { useFlightStore } from '../store';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

export default function SearchForm() {
  // Pobierz setter do ustawiania wyników lotów w globalnym store
  const setFlights = useFlightStore(state => state.setFlights);
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
        setCountryAvailableDestinations(destinationAirports);
      } catch (error) {
        console.error('❌ Błąd pobierania dostępnych celów z kraju:', error);
        setCountryAvailableDestinations([]);
      } finally {
        setLoadingDestinations(false);
      }
    }

    loadCountryDestinations();
  }, [searchFromCountry, originCountry, allAirports]);

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
          try {
            const combos = await searchAnyDestination({
              origin: airport.code,
              dateFrom,
              dateTo,
              adults,
              market: 'pl-pl'
            });
            console.log(`✅ Z ${airport.code} znaleziono ${combos.length} destynacji`);
            combos.forEach(c => {
              c.originAirport = airport.code;
              c.originName = airport.name;
              // Uzupełnij returnName jeśli brakuje
              if (c.returnAirport && (!c.returnName || c.returnName === '')) {
                c.returnName = airportNameByCode[c.returnAirport] || c.returnAirport;
              }
            });
            allResults.push(...combos);
          } catch (err) {
            console.error(`Błąd wyszukiwania z ${airport.code}:`, err);
          }
        }
        console.log('📊 Łącznie zebrano:', allResults.length, 'wyników');
        flights = allResults.sort((a, b) => (a.minPrice || Infinity) - (b.minPrice || Infinity));
        setFlights(flights);
        setSearchProgress({ current: countryAirports.length, total: countryAirports.length, currentAirport: '' });
        const metrics = getLastMetrics();
        setMetrics(metrics);
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
          });
          setFlights(flights);
          const metrics = getLastMetrics();
          setMetrics(metrics);
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
          });
          // Uzupełnij returnAirport i returnName jeśli nie ma (np. fallback, multi-airport)
          combinations.forEach(c => {
            if (!c.returnAirport && c.inbound && c.inbound.destination) {
              c.returnAirport = c.inbound.destination;
            }
            if ((!c.returnName || c.returnName === '') && c.returnAirport) {
              c.returnName = airportNameByCode[c.returnAirport] || c.returnAirport;
            }
          });
          // Wyświetl jako połączone karty (jak w Kiwi)
          setFlights(combinations); // wszystkie kombinacje
          const metrics = getLastMetrics();
          setMetrics(metrics); // metryki z LAST_METRICS
          flights = combinations;
        }
      } // Koniec else - pojedyncze lotnisko

      // Oblicz statystyki
      const prices = flights.filter(f => f.price).map(f => f.price);
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

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
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

        {/* OLD Return date range - USUNIĘTE
        {tripType === 'round' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Zakres dat powrotu
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={returnFrom}
                onChange={(e) => setReturnFrom(e.target.value)}
                min={dateFrom || new Date().toISOString().split('T')[0]}
                className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="date"
                value={returnTo}
                onChange={(e) => setReturnTo(e.target.value)}
                min={returnFrom || dateFrom || new Date().toISOString().split('T')[0]}
                className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
        */}

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
