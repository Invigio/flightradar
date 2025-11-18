# Instalacja PostgreSQL na Windows

## Opcja 1: Oficjalny installer (Zalecane)

1. **Pobierz PostgreSQL:**
   - Wejdź na: https://www.postgresql.org/download/windows/
   - Pobierz installer dla PostgreSQL 14+ (lub nowszy)
   - Uruchom installer

2. **Instalacja:**
   - Zainstaluj wszystkie komponenty (PostgreSQL Server, pgAdmin, Command Line Tools)
   - Ustaw hasło dla użytkownika `postgres` (ZAPAMIĘTAJ TO HASŁO!)
   - Port: 5432 (domyślny)
   - Locale: domyślny

3. **Utwórz bazę danych:**

   Otwórz **pgAdmin 4** lub **SQL Shell (psql)**:

   ```sql
   -- W pgAdmin lub psql:
   CREATE DATABASE flightdb;
   ```

   Gotowe! Twoja baza jest na: `postgresql://postgres:TWOJE_HASLO@localhost:5432/flightdb`

## Opcja 2: Docker (jeśli masz Docker)

```bash
docker run --name postgres-flight \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=flightdb \
  -p 5432:5432 \
  -d postgres:14
```

DATABASE_URL: `postgresql://postgres:postgres@localhost:5432/flightdb`

## Opcja 3: Cloud (bez instalacji lokalnie)

### Neon.tech (DARMOWY, polecam!)

1. Wejdź na: https://neon.tech
2. Zarejestruj się (GitHub/Google)
3. Utwórz projekt "flight-search"
4. Skopiuj **Connection String**
5. Wklej do `.env`:
   ```
   DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb
   ```

### Supabase (również darmowy)

1. Wejdź na: https://supabase.com
2. Utwórz projekt
3. Przejdź do Settings → Database
4. Skopiuj **Connection string** (URI)
5. Wklej do `.env`

## Testowanie połączenia

W terminalu (PowerShell):

```powershell
# Zainstaluj psycopg2 (już jest w requirements.txt)
pip install psycopg2-binary

# Test w Pythonie:
python -c "import psycopg2; conn = psycopg2.connect('postgresql://postgres:HASLO@localhost:5432/flightdb'); print('✅ Połączono!'); conn.close()"
```

## Troubleshooting

**Błąd: "connection refused"**
- Sprawdź czy PostgreSQL działa: `services.msc` → znajdź "postgresql-x64-14"
- Sprawdź port w `.env` (domyślnie 5432)

**Błąd: "password authentication failed"**
- Sprawdź hasło w `.env`
- Reset hasła w pgAdmin: prawym na postgres → Properties → Definition

**Błąd: "database does not exist"**
- Utwórz bazę w pgAdmin lub psql: `CREATE DATABASE flightdb;`
