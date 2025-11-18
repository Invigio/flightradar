-- =========================================
-- Baza Danych Lotnisk Ryanair
-- =========================================
-- Struktura: Countries → Cities → Airports
-- Pełna normalizacja danych

-- 1. TABELA KRAJÓW
CREATE TABLE IF NOT EXISTS countries (
    code VARCHAR(2) PRIMARY KEY,              -- "pl", "de", "gb"
    iso3code VARCHAR(3) NOT NULL,             -- "POL", "DEU", "GBR"
    name VARCHAR(100) NOT NULL,               -- "Polska", "Niemcy"
    currency VARCHAR(3) NOT NULL,             -- "PLN", "EUR", "GBP"
    default_airport_code VARCHAR(3),          -- "WAW", "FRA", "STN"
    schengen BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_countries_name ON countries(name);

-- 2. TABELA MIAST
CREATE TABLE IF NOT EXISTS cities (
    code VARCHAR(50) PRIMARY KEY,             -- "WARSAW", "KRAKOW"
    name VARCHAR(100) NOT NULL,               -- "Warsaw", "Kraków"
    country_code VARCHAR(2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    FOREIGN KEY (country_code) REFERENCES countries(code) ON DELETE CASCADE
);

CREATE INDEX idx_cities_name ON cities(name);
CREATE INDEX idx_cities_country ON cities(country_code);

-- 3. TABELA LOTNISK
CREATE TABLE IF NOT EXISTS airports (
    code VARCHAR(3) PRIMARY KEY,              -- IATA: "WAW", "KRK"
    name VARCHAR(200) NOT NULL,               -- "Warsaw Chopin"
    seo_name VARCHAR(200),                    -- "warsaw-chopin"

    -- Relacje
    city_code VARCHAR(50) NOT NULL,
    country_code VARCHAR(2) NOT NULL,

    -- Lokalizacja
    latitude FLOAT,
    longitude FLOAT,

    -- Dodatkowe informacje
    region VARCHAR(100),                      -- "Mazowieckie"
    timezone VARCHAR(50),                     -- "Europe/Warsaw"
    base BOOLEAN DEFAULT FALSE,               -- Lotnisko bazowe Ryanair

    -- Aliasy (JSON array)
    aliases JSONB DEFAULT '[]'::jsonb,

    -- Metadane
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_synced TIMESTAMP WITH TIME ZONE,     -- Ostatnia synchronizacja

    FOREIGN KEY (city_code) REFERENCES cities(code) ON DELETE CASCADE,
    FOREIGN KEY (country_code) REFERENCES countries(code) ON DELETE CASCADE
);

CREATE INDEX idx_airports_name ON airports(name);
CREATE INDEX idx_airports_city ON airports(city_code);
CREATE INDEX idx_airports_country ON airports(country_code);
CREATE INDEX idx_airports_base ON airports(base) WHERE base = TRUE;
CREATE INDEX idx_airports_location ON airports(latitude, longitude);

-- 4. TRIGGERY DLA AUTOMATYCZNEGO UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_countries_updated_at BEFORE UPDATE ON countries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cities_updated_at BEFORE UPDATE ON cities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_airports_updated_at BEFORE UPDATE ON airports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. PRZYKŁADOWE ZAPYTANIA

-- Wszystkie lotniska w Polsce
-- SELECT a.*, c.name as city_name, co.name as country_name
-- FROM airports a
-- JOIN cities c ON a.city_code = c.code
-- JOIN countries co ON a.country_code = co.code
-- WHERE a.country_code = 'pl';

-- Lotniska bazowe w strefie Schengen
-- SELECT a.*, co.name as country_name
-- FROM airports a
-- JOIN countries co ON a.country_code = co.code
-- WHERE a.base = TRUE AND co.schengen = TRUE;

-- Szukaj lotnisk po nazwie (fuzzy search)
-- SELECT a.*, c.name as city_name
-- FROM airports a
-- JOIN cities c ON a.city_code = c.code
-- WHERE LOWER(a.name) LIKE LOWER('%warsz%')
--    OR LOWER(c.name) LIKE LOWER('%warsz%');
