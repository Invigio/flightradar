/**
 * FlightList - wyświetla wyniki wyszukiwania
 * Obsługuje zarówno single flights jak i round-trip combinations
 */
import { useState, useMemo, useEffect } from 'react';
import { Plane, Clock, Star, Bell, ArrowUpDown, Calendar } from 'lucide-react';
import { useFlightStore, useAuthStore } from '../store';
import { favorites, priceAlerts } from '../api/backend';
import toast from 'react-hot-toast';

export default function FlightList() {
  const { flights, isLoading, error, searchParams, metrics } = useFlightStore();
  const { isAuthenticated } = useAuthStore();
  const [savingFavorite, setSavingFavorite] = useState(null);
  const [sortBy, setSortBy] = useState('date'); // 'date' | 'price'
  const [displayCount, setDisplayCount] = useState(20); // Ile lotów pokazać

  // Reset paginacji gdy zmienia się lista lotów
  useEffect(() => {
    setDisplayCount(20);
  }, [flights]);

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 20);
  };

  const handleAddFavorite = async (flight) => {
    if (!isAuthenticated) {
      toast.error('Zaloguj się, aby dodać do ulubionych');
      return;
    }

    setSavingFavorite(flight.flightNumber);

    try {
      await favorites.add({
        origin: searchParams.origin.toUpperCase(),
        destination: searchParams.destination.toUpperCase(),
        flight_date: flight.date,
        flight_number: flight.flightNumber,
        departure_time: flight.departure,
        arrival_time: flight.arrival,
        price: flight.price,
        currency: flight.currency
      });

      toast.success('Dodano do ulubionych!');
    } catch (error) {
      console.error('Błąd dodawania do ulubionych:', error);
      if (error.response?.status === 400) {
        toast.error('Ten lot jest już w ulubionych');
      } else {
        toast.error('Nie udało się dodać do ulubionych');
      }
    } finally {
      setSavingFavorite(null);
    }
  };

  const handleCreateAlert = async (flight) => {
    if (!isAuthenticated) {
      toast.error('Zaloguj się, aby utworzyć alert');
      return;
    }

    const maxPrice = prompt('Powiadom mnie gdy cena spadnie poniżej (PLN):', flight.price);
    if (!maxPrice) return;

    try {
      await priceAlerts.create({
        origin: searchParams.origin.toUpperCase(),
        destination: searchParams.destination.toUpperCase(),
        date_out: flight.date,
        max_price: parseFloat(maxPrice)
      });

      toast.success('Alert cenowy utworzony!');
    } catch (error) {
      console.error('Błąd tworzenia alertu:', error);
      toast.error('Nie udało się utworzyć alertu');
    }
  };

  // ⚠️ WSZYSTKIE HOOKI MUSZĄ BYĆ NA GÓRZE - przed jakimikolwiek warunkami early return!
  // Sprawdź czy to round-trip combinations (mają outbound/inbound)
  const isRoundTrip = flights.length > 0 && flights[0]?.outbound && flights[0]?.inbound;

  // Sortowanie lotów
  const sortedFlights = useMemo(() => {
    if (flights.length === 0) return [];

    const flightsCopy = [...flights];

    if (sortBy === 'price') {
      // Sortuj po cenie (rosnąco)
      return flightsCopy.sort((a, b) => {
        const priceA = isRoundTrip ? a.totalPriceInPLN : a.price;
        const priceB = isRoundTrip ? b.totalPriceInPLN : b.price;
        return priceA - priceB;
      });
    } else {
      // Sortuj po dacie (domyślnie)
      return flightsCopy.sort((a, b) => {
        const dateA = isRoundTrip ? a.outbound.date : a.date;
        const dateB = isRoundTrip ? b.outbound.date : b.date;
        return new Date(dateA) - new Date(dateB);
      });
    }
  }, [flights, sortBy, isRoundTrip]);

  // Flights do wyświetlenia (z paginacją)
  const displayedFlights = useMemo(() => {
    return sortedFlights.slice(0, displayCount);
  }, [sortedFlights, displayCount]);

  const hasMore = displayCount < sortedFlights.length;

  // Oblicz statystyki
  const stats = useMemo(() => {
    if (sortedFlights.length === 0) return null;

    const prices = isRoundTrip
      ? sortedFlights.filter(f => f.totalPriceInPLN).map(f => f.totalPriceInPLN)
      : sortedFlights.filter(f => f.price).map(f => f.price);

    if (prices.length === 0) return null;

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)
    };
  }, [sortedFlights, isRoundTrip]);

  // Teraz możemy mieć warunki early return
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Wyszukiwanie lotów...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800 font-semibold">❌ Błąd: {error}</p>
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
        <p className="text-yellow-800 font-semibold text-lg">⚠️ Brak lotów dla wybranych parametrów.</p>
        <p className="text-yellow-700 mt-2">Spróbuj zmienić daty, lotnisko lub kraj wylotu.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Panel metryk zapytań */}
      {metrics && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-700">
            <div>
              <span className="font-semibold">Zapytania API:</span>{' '}
              <span>{metrics.apiCalls}</span>
              {typeof metrics.fareFinderCalls === 'number' && metrics.fareFinderCalls > 0 && (
                <span className="text-gray-500"> (FareFinder: {metrics.fareFinderCalls})</span>
              )}
            </div>
            <div>
              <span className="font-semibold">Dni z cache:</span>{' '}
              <span>{metrics.daysFromCache}/{metrics.totalDays}</span>
            </div>
            <div>
              <span className="font-semibold">Dni z API:</span>{' '}
              <span>{metrics.daysFetched}/{metrics.totalDays}</span>
            </div>
            <div className="ml-auto">
              <span className="font-semibold">Cache vs API:</span>{' '}
              <span>{metrics.percentFromCache}% cache / {metrics.percentFromApi}% API</span>
            </div>
          </div>
        </div>
      )}
      {/* Statystyki */}
      {stats && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">📊 Statystyki cenowe</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-blue-100 text-sm">Najtańszy</p>
              <p className="text-2xl font-bold">{stats.min.toFixed(2)} PLN</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Średnia</p>
              <p className="text-2xl font-bold">{stats.avg} PLN</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Najdroższy</p>
              <p className="text-2xl font-bold">{stats.max.toFixed(2)} PLN</p>
            </div>
          </div>
        </div>
      )}

      {/* Lista lotów */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            ✈️ Znaleziono {flights.length} {isRoundTrip ? 'kombinacji' : 'lotów'}
          </h3>

          {/* Przyciski sortowania */}
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('date')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                sortBy === 'date'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Sortuj po dacie
            </button>
            <button
              onClick={() => setSortBy('price')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                sortBy === 'price'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              <ArrowUpDown className="w-4 h-4" />
              Sortuj po cenie
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {isRoundTrip ? (
            // Wyświetl jako połączone karty (jak Kiwi)
            displayedFlights.map((combo, index) => (
              <RoundTripCard
                key={index}
                combo={combo}
                onAddFavorite={handleAddFavorite}
                onCreateAlert={handleCreateAlert}
                isAuthenticated={isAuthenticated}
                savingFavorite={savingFavorite}
              />
            ))
          ) : (
            // Wyświetl jako pojedyncze loty
            displayedFlights.map((flight, index) => (
              <SingleFlightCard
                key={index}
                flight={flight}
                onAddFavorite={handleAddFavorite}
                onCreateAlert={handleCreateAlert}
                isAuthenticated={isAuthenticated}
                savingFavorite={savingFavorite}
              />
            ))
          )}
        </div>

        {/* Przycisk "Pokaż więcej" */}
        {hasMore && (
          <div className="p-4 bg-gray-50 border-t text-center">
            <button
              onClick={handleLoadMore}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Pokaż więcej ({displayCount} / {sortedFlights.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Komponent dla pojedynczego lotu
function SingleFlightCard({ flight, onAddFavorite, onCreateAlert, isAuthenticated, savingFavorite }) {
  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      {/* Pokaż nazwę lotniska gdy dostępna (dla country search) */}
      {flight.originAirport && (
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded">
            🛫 Z lotniska: {flight.originAirport} {flight.originName && `(${flight.originName})`}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        {/* Lewa strona - info o locie */}
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-2xl font-bold text-gray-900">
              {flight.departure}
            </span>
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 border-t-2 border-gray-300"></div>
              <Plane className="w-5 h-5 text-gray-400" />
              <div className="flex-1 border-t-2 border-gray-300"></div>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {flight.arrival}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="font-medium">{flight.flightNumber}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {flight.duration}
            </span>
            <span>📅 {flight.date}</span>
            <span className="text-gray-500">{flight.operatedBy}</span>
          </div>

          {flight.faresLeft > 0 && flight.faresLeft <= 5 && (
            <div className="mt-2 inline-block px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">
              ⚠️ Tylko {flight.faresLeft} miejsc!
            </div>
          )}
        </div>

        {/* Prawa strona - cena i akcje */}
        <div className="ml-6 text-right">
          {flight.price ? (
            <>
              <div className="mb-2">
                {/* Cena w oryginalnej walucie */}
                <div className="text-3xl font-bold text-blue-600">
                  {flight.price.toFixed(2)} {flight.currency}
                </div>

                {/* Przeliczenie na PLN (jeśli inna waluta) */}
                {flight.currency !== 'PLN' && flight.priceInPLN && (
                  <div className="text-lg text-gray-600 mt-1">
                    ≈ {flight.priceInPLN.toFixed(2)} PLN
                  </div>
                )}
              </div>

              {isAuthenticated && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onAddFavorite(flight)}
                    disabled={savingFavorite === flight.flightNumber}
                    className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors text-sm font-medium flex items-center gap-1"
                    title="Dodaj do ulubionych"
                  >
                    <Star className="w-4 h-4" />
                    {savingFavorite === flight.flightNumber ? '...' : 'Ulubione'}
                  </button>

                  <button
                    onClick={() => onCreateAlert(flight)}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors text-sm font-medium flex items-center gap-1"
                    title="Ustaw alert cenowy"
                  >
                    <Bell className="w-4 h-4" />
                    Alert
                  </button>
                </div>
              )}
            </>
          ) : (
            <span className="text-gray-500">Brak ceny</span>
          )}
        </div>
      </div>
    </div>
  );
}

// Komponent dla round-trip (jak Kiwi)
function RoundTripCard({ combo, onAddFavorite, onCreateAlert, isAuthenticated, savingFavorite }) {
  const { outbound, inbound, totalPriceInPLN, stayDays } = combo;

  // Defensywne sprawdzenie - jeśli totalPriceInPLN jest null/undefined/0, oblicz ręcznie
  const finalPrice = totalPriceInPLN ||
    ((outbound.priceInPLN || 0) + (inbound.priceInPLN || 0)) ||
    0;

  // Jeśli nie ma ceny, nie wyświetlaj karty (lub pokaż placeholder)
  if (finalPrice === 0) {
    console.warn('⚠️ RoundTripCard: Brak ceny dla kombinacji', { outbound, inbound });
    return null; // Nie wyświetlaj kombinacji bez ceny
  }

  // Oblicz różnicę dat (0 = ten sam dzień, 1 = następny dzień, itd.)
  const outDate = new Date(outbound.date);
  const inDate = new Date(inbound.date);
  const dateDiff = Math.round((inDate - outDate) / (1000 * 60 * 60 * 24));

  // Jeśli ten sam dzień lub następny - pokaż godziny, w innym przypadku noce
  const stayLabel = dateDiff === 0
    ? `${stayDays} ${stayDays === 1 ? 'godzina' : stayDays <= 4 ? 'godziny' : 'godzin'}`
    : `${dateDiff} ${dateDiff === 1 ? 'noc' : dateDiff <= 4 ? 'noce' : 'nocy'}`;


  // Lotnisko powrotu (destination z lotu POWRÓT)
  const returnAirport = combo.returnAirport || inbound.destination;
  const originAirport = combo.originAirport || outbound.origin;
  const originName = combo.originName || '';
  const returnName = combo.returnName || '';
  // ZAWSZE pokazuj oba kody i nazwy lotnisk (wylot i powrót), nawet jeśli są identyczne
  return (
    <div className="p-6 hover:bg-gray-50 transition-colors border-l-4 border-blue-500">
      {/* Nagłówek w stylu Kiwi: kody lotnisk, strzałka, nazwy */}
      <div className="mb-3 flex flex-col gap-1">
        <div className="flex items-center gap-2 text-lg font-bold">
          <span className="text-purple-700">{originAirport}</span>
          <span className="text-gray-400 text-xl">→</span>
          <span className="text-orange-700">{returnAirport}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{originName}</span>
          <span className="text-gray-300">→</span>
          <span>{returnName}</span>
        </div>
        {/* DEBUG: pokaż pełny obiekt combo */}
        <pre style={{fontSize: '10px', color: '#888', background: '#f8f8ff', padding: '4px', borderRadius: '4px', marginTop: '4px', maxWidth: '100%', overflowX: 'auto'}}>
          {JSON.stringify(combo, null, 2)}
        </pre>
      </div>

      {/* Nagłówek z długością pobytu i ceną */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm">
          <span className="font-semibold text-gray-700">Pobyt: {stayLabel}</span>
        </div>
        <div className="text-right">
          {/* Łączna cena ZAWSZE w PLN (bo waluty mogą być różne) */}
          <div className="text-3xl font-bold text-blue-600">
            {finalPrice.toFixed(2)} PLN
          </div>
          {/* Pokaż składowe ceny w oryginalnych walutach */}
          <div className="text-sm text-gray-500 mt-1">
            ({(outbound.price || 0).toFixed(2)} {outbound.currency || '?'} + {(inbound.price || 0).toFixed(2)} {inbound.currency || '?'})
          </div>
        </div>
      </div>

      {/* Lot TAM */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">✈️ TAM</span>
          <span className="text-sm text-gray-600">📅 {outbound.date}</span>
          <span className="text-xs text-gray-500">
            {outbound.origin} → {outbound.destination}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold text-gray-900">{outbound.departure}</span>
            <div className="flex items-center gap-2">
              <div className="w-12 border-t-2 border-gray-300"></div>
              <Plane className="w-5 h-5 text-blue-500" />
              <div className="w-12 border-t-2 border-gray-300"></div>
            </div>
            <span className="text-xl font-bold text-gray-900">{outbound.arrival}</span>
          </div>
          <div className="text-sm text-gray-600">
            <div>{outbound.flightNumber}</div>
            <div className="text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {outbound.duration}
            </div>
          </div>
        </div>
      </div>

      {/* Lot POWRÓT */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">🏠 POWRÓT</span>
          <span className="text-sm text-gray-600">📅 {inbound.date}</span>
          <span className="text-xs text-gray-500">
            {inbound.origin} → {inbound.destination}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold text-gray-900">{inbound.departure}</span>
            <div className="flex items-center gap-2">
              <div className="w-12 border-t-2 border-gray-300"></div>
              <Plane className="w-5 h-5 text-green-500 transform rotate-180" />
              <div className="w-12 border-t-2 border-gray-300"></div>
            </div>
            <span className="text-xl font-bold text-gray-900">{inbound.arrival}</span>
          </div>
          <div className="text-sm text-gray-600">
            <div>{inbound.flightNumber}</div>
            <div className="text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {inbound.duration}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
