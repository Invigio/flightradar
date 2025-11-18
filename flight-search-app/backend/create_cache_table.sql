-- Utworzenie tabeli flight_cache do przechowywania cache lotów w PostgreSQL
-- Uruchom: psql -U postgres -d flight_search -f create_cache_table.sql

CREATE TABLE IF NOT EXISTS flight_cache (
    id SERIAL PRIMARY KEY,
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC'),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Indeks na cache_key dla szybkiego wyszukiwania
CREATE INDEX IF NOT EXISTS idx_flight_cache_key ON flight_cache(cache_key);

-- Indeks na expires_at dla oczyszczania wygasłych wpisów
CREATE INDEX IF NOT EXISTS idx_flight_cache_expires ON flight_cache(expires_at);

-- Wyświetl statystyki
SELECT
    'Tabela flight_cache utworzona' AS status,
    COUNT(*) AS current_entries
FROM flight_cache;
