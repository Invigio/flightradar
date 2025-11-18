/**
 * API dla lotnisk - integracja z bazą danych
 */

import { safeRyanairFetch, isRyanairBlocked } from './ryanair';
const BACKEND_API = import.meta.env.VITE_BACKEND_API || 'http://localhost:8000/api';

/**
 * Pobiera WSZYSTKIE lotniska z bazy danych (dla wyboru źródła)
 * Cache: 24h w localStorage
 */
export async function getAllAirports() {
  const cacheKey = 'all_airports_v1';
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;

    // Cache 24h
    if (age < 24 * 60 * 60 * 1000) {
      console.log('✅ Lotniska z cache (24h)');
      return data;
    }
  }

  console.log('🔄 Pobieranie lotnisk z bazy danych...');

  try {
    const response = await fetch(`${BACKEND_API}/airports?limit=1000`);
    const result = await response.json();

    if (!result.success) {
      throw new Error('Nie udało się pobrać lotnisk');
    }

    const airports = result.airports;
    console.log(`✅ Pobrano ${airports.length} lotnisk z bazy`);

    // Zapisz w cache
    localStorage.setItem(cacheKey, JSON.stringify({
      data: airports,
      timestamp: Date.now()
    }));

    return airports;
  } catch (error) {
    console.error('❌ Błąd pobierania lotnisk:', error);
    // Zwróć cache jeśli jest (nawet stary)
    if (cached) {
      const { data } = JSON.parse(cached);
      return data;
    }
    return [];
  }
}

/**
 * Grupuje lotniska według krajów
 * Używane dla dropdown "Kraj wylotu"
 */
export function groupAirportsByCountry(airports) {
  const grouped = {};

  for (const airport of airports) {
    const countryCode = airport.country.code;
    const countryName = airport.country.name;

    if (!grouped[countryCode]) {
      grouped[countryCode] = {
        code: countryCode,
        name: countryName,
        currency: airport.country.currency,
        schengen: airport.country.schengen,
        cities: {}
      };
    }

    // Grupuj po miastach w kraju
    const cityCode = airport.city.code;
    const cityName = airport.city.name;

    if (!grouped[countryCode].cities[cityCode]) {
      grouped[countryCode].cities[cityCode] = {
        code: cityCode,
        name: cityName,
        airports: []
      };
    }

    grouped[countryCode].cities[cityCode].airports.push({
      code: airport.code,
      name: airport.name,
      base: airport.base,
      coordinates: airport.coordinates
    });
  }

  return grouped;
}

/**
 * Pobiera dostępne CELE z danego źródła (przez FareFinder API)
 * To jest KLUCZOWA funkcja - sprawdza gdzie FAKTYCZNIE są loty
 *
 * NOWE: Używa FareFinder z arrivalAirportIataCode=ANY
 */
export async function getAvailableDestinations(originCode) {
  if (!originCode) {
    return [];
  }

  console.log(`🔍 Sprawdzam dostępne połączenia z ${originCode}...`);

  try {
    const response = await safeRyanairFetch(`${BACKEND_API}/ryanair/routes?origin=${originCode}&market=pl-pl`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // Nowy format: { origin: "WAW", destinations: ["VIE", "BCN", ...], count: 42 }
    const destinationCodes = data.destinations || [];

    console.log(`✅ Znaleziono ${destinationCodes.length} połączeń z ${originCode}`);
    if (destinationCodes.length > 0) {
      console.log(`   Przykłady: ${destinationCodes.slice(0, 10).join(', ')}`);
    }

    return destinationCodes;
  } catch (error) {
    console.error(`❌ Błąd pobierania połączeń z ${originCode}:`, error);
    if (error?.hardBlocked) throw error;
    return [];
  }
}/**
 * Filtruje lotniska - pokazuje TYLKO te gdzie są loty
 * Używane po wyborze źródła, aby pokazać dostępne cele
 */
export async function getFilteredDestinations(originCode, allAirports) {
  // Pobierz kody lotnisk gdzie są loty
  const availableCodes = await getAvailableDestinations(originCode);

  if (availableCodes.length === 0) {
    console.warn(`⚠️ Brak dostępnych połączeń z ${originCode}`);
    return [];
  }

  // Filtruj lotniska - zostaw tylko te gdzie są loty
  const filtered = allAirports.filter(airport =>
    availableCodes.includes(airport.code)
  );

  console.log(`✅ Dostępne cele z ${originCode}: ${filtered.length} lotnisk`);

  return filtered;
}

/**
 * Formatuje lotniska dla autocomplete/select
 */
export function formatAirportsForSelect(airports) {
  return airports.map(airport => ({
    value: airport.code,
    label: `${airport.code} - ${airport.name}`,
    city: airport.city.name,
    country: airport.country.name,
    countryCode: airport.country.code,
    base: airport.base,
    searchText: `${airport.code} ${airport.name} ${airport.city.name} ${airport.country.name}`.toLowerCase()
  }));
}

/**
 * Wyszukiwanie lotnisk po tekście (lokalnie, bez API)
 */
export function searchAirports(airports, searchText) {
  if (!searchText || searchText.length < 2) {
    return airports;
  }

  const query = searchText.toLowerCase();

  return airports.filter(airport =>
    airport.code.toLowerCase().includes(query) ||
    airport.name.toLowerCase().includes(query) ||
    airport.city.name.toLowerCase().includes(query) ||
    airport.country.name.toLowerCase().includes(query)
  );
}

/**
 * Pobiera dostępne trasy z lotniska
 * @param {string} airportCode - Kod lotniska (np. "WAW")
 * @returns {Promise<string[]>} - Tablica kodów lotnisk docelowych
 */
export async function getRoutesFromAirport(airportCode) {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  const url = `${BACKEND_URL}/api/ryanair/routes?origin=${airportCode}&market=pl-pl`;

  console.log(`🔍 Sprawdzam dostępne połączenia z ${airportCode}...`);

  try {
    const response = await safeRyanairFetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.destinations && Array.isArray(data.destinations)) {
      console.log(`✅ Znaleziono ${data.destinations.length} połączeń z ${airportCode}`);
      return data.destinations;
    }

    return [];
  } catch (error) {
    console.error(`❌ Błąd pobierania tras z ${airportCode}:`, error.message);
    if (error?.hardBlocked) throw error;
    return [];
  }
}
