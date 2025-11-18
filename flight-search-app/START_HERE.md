# 🎉 GOTOWE! Instrukcja uruchomienia

## ✅ Co zostało zrobione?

Stworzyłem kompletną aplikację webową do wyszukiwania lotów Ryanair:

### 📁 Struktura
```
flight-search-app/
├── backend/          # FastAPI + PostgreSQL (tylko baza danych)
├── frontend/         # React + Vite (zapytania do Ryanair bezpośrednio)
├── README.md         # Pełna dokumentacja
├── POSTGRESQL_SETUP.md   # Jak zainstalować bazę
├── OPTIMIZATION_LOG.md   # 🆕 Log optymalizacji (5.11.2025)
└── INSTALL_AFTER_OPTIMIZATION.md  # 🆕 Instalacja po optymalizacji
```

### 🧹 **OPTYMALIZACJA (5.11.2025)**
- ✅ Usunięto **40+ niepotrzebnych plików testowych** z głównego katalogu
- ✅ Usunięto **duplikaty kodu** (FlightList_new.jsx)
- ✅ Usunięto **nieużywane zależności** (requests, react-router-dom, @tanstack/react-query)
- ✅ Projekt jest teraz **czysty i zoptymalizowany**!

📖 Szczegóły: **OPTIMIZATION_LOG.md**

### 🎯 Architektura

**Frontend** → wysyła requesty → **Ryanair API** (bezpośrednio!)
      ↓
   zapisuje historię
      ↓
**Backend** (FastAPI)
      ↓
**PostgreSQL** (historia, ulubione, alerty)

**Dlaczego tak?**
✅ Każdy użytkownik ma własne cookies - brak limitów
✅ Requesty z różnych IP - Ryanair nie blokuje
✅ Backend lekki - tylko baza danych
✅ Zawsze aktualne dane

---

## 🚀 JAK URUCHOMIĆ? (3 kroki)

### Krok 1️⃣: PostgreSQL

**OPCJA A - Neon.tech (NAJŁATWIEJSZE, 30 sekund):**
1. Wejdź na: https://neon.tech
2. Sign up (GitHub/Google)
3. Create project → Skopiuj Connection String
4. Gotowe!

**OPCJA B - Lokalnie (Windows):**
1. Pobierz: https://www.postgresql.org/download/windows/
2. Zainstaluj (ustaw hasło!)
3. Otwórz pgAdmin → Create Database: `flightdb`

👉 Szczegóły: **POSTGRESQL_SETUP.md**

### Krok 2️⃣: Backend

```powershell
cd backend

# Skopiuj i edytuj .env
copy .env.example .env
notepad .env
# Ustaw DATABASE_URL=postgresql://user:pass@host:5432/flightdb

# Uruchom (automatycznie zainstaluje pakiety)
.\start.ps1
```

Backend będzie na: **http://localhost:8000**
Dokumentacja API: **http://localhost:8000/docs**

### Krok 3️⃣: Frontend

```powershell
# NOWY TERMINAL!
cd frontend

# Uruchom (automatycznie zainstaluje npm packages)
.\start.ps1
```

Frontend będzie na: **http://localhost:3000**

---

## 🎮 GOTOWE! Jak używać?

1. **Otwórz:** http://localhost:3000
2. **Zarejestruj się** (prawym górnym rogu)
3. **Wpisz trasę:** np. WAW → VIE, data: 2025-12-01
4. **Kliknij "Szukaj Lotów"**
5. **Zobacz wyniki!** 🎉

### Funkcje:
- ⭐ **Dodaj do ulubionych** - zapisz ciekawy lot
- 🔔 **Ustaw alert** - powiadom gdy cena spadnie
- 📊 **Historia** - przeglądaj poprzednie wyszukiwania

---

## 🐛 Co jeśli coś nie działa?

### Backend nie startuje:
```powershell
# Sprawdź czy PostgreSQL działa
services.msc  # Znajdź "postgresql"

# Sprawdź połączenie
python -c "import psycopg2; psycopg2.connect('postgresql://...')"
```

### Frontend nie startuje:
```powershell
# Usuń i zainstaluj ponownie
rm -r node_modules
npm install
```

### Brak lotów:
- Sprawdź czy kody IATA są poprawne (WAW, POZ, VIE, etc.)
- Sprawdź konsolę przeglądarki (F12)
- Ryanair może nie mieć lotów na tej trasie

---

## 📚 Co dalej?

### TODO List (możesz dodać):
- [ ] Wyszukiwanie w obie strony
- [ ] Wyszukiwanie całego miesiąca
- [ ] Email notifications dla alertów
- [ ] Porównywanie cen z różnych dat
- [ ] Dark mode
- [ ] Aplikacja mobilna

### Deployment:
- **Backend:** Railway, Render, Heroku
- **Frontend:** Vercel, Netlify
- **Baza:** Neon, Supabase, Heroku Postgres

Instrukcje w **README.md**

---

## 💡 Jak to działa?

1. **Wyszukiwanie:**
   - Frontend wysyła request do `https://www.ryanair.com/api/booking/v4/...`
   - Używa cookies z domeny ryanair.com
   - Parsuje odpowiedź i wyświetla loty

2. **Zapisywanie:**
   - Po wyszukiwaniu Frontend zapisuje statystyki do NASZEGO backendu
   - Backend zapisuje do PostgreSQL
   - Tylko historia/ulubione/alerty - nie same loty!

3. **Bezpieczeństwo:**
   - Hasła hashowane (bcrypt)
   - JWT tokens
   - CORS zabezpieczony
   - SQLAlchemy ORM (brak SQL injection)

---

## 📖 Dokumentacja

- **README.md** - pełna dokumentacja
- **POSTGRESQL_SETUP.md** - setup bazy danych
- **backend/README.md** - szczegóły backendu
- **http://localhost:8000/docs** - Swagger API docs

---

## 🎯 Kluczowe Pliki

### Backend:
- `main.py` - Główna aplikacja FastAPI, wszystkie endpointy
- `models.py` - Tabele bazy danych (User, SearchHistory, etc.)
- `auth.py` - JWT autentykacja
- `database.py` - Konfiguracja PostgreSQL

### Frontend:
- `src/App.jsx` - Główny komponent aplikacji
- `src/api/ryanair.js` - **Requesty do Ryanair** (bezpośrednio!)
- `src/api/backend.js` - Requesty do naszego backendu
- `src/components/SearchForm.jsx` - Formularz wyszukiwania
- `src/components/FlightList.jsx` - Lista wyników

---

## 🤝 Potrzebujesz pomocy?

1. Sprawdź **README.md**
2. Sprawdź **POSTGRESQL_SETUP.md**
3. Zobacz logi w terminalu
4. Sprawdź konsolę przeglądarki (F12)

---

## 🎉 SUKCES!

Masz teraz:
✅ Działającą wyszukiwarkę lotów
✅ Rejestrację i logowanie
✅ Historię wyszukiwań
✅ Ulubione loty
✅ Alerty cenowe
✅ Nowoczesny UI
✅ Bezpośrednie połączenie z Ryanair API
✅ Własny backend z bazą danych

**Miłego wyszukiwania tanich lotów! 🛫**

---

**P.S.** Ta aplikacja nie jest oficjalnie powiązana z Ryanair.
Używaj odpowiedzialnie i zgodnie z regulaminem.
