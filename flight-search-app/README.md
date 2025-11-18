# 🛫 Wyszukiwarka Lotów Ryanair

Nowoczesna aplikacja webowa do wyszukiwania lotów Ryanair z zapisywaniem historii, ulubionych lotów i alertami cenowymi.

## 🎯 Architektura

```
┌─────────────┐
│   Frontend  │ ──── bezpośrednie requesty ────> Ryanair API
│  (React)    │                                  (wyszukiwanie lotów)
└──────┬──────┘
       │
       │ zapisuje tylko historię/ulubione
       ↓
┌─────────────┐
│   Backend   │
│  (FastAPI)  │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│ PostgreSQL  │ (historia, ulubione, alerty)
└─────────────┘
```

**Dlaczego tak?**
- ✅ Każdy użytkownik ma własne cookies z Ryanair - brak rate limitów
- ✅ Requesty z różnych IP - Ryanair nie blokuje naszego serwera
- ✅ Backend lekki - tylko baza danych
- ✅ Dane zawsze aktualne - bezpośrednio z Ryanair

## 🚀 Szybki Start

### Wymagania

- **Python 3.9+**
- **Node.js 18+**
- **PostgreSQL 14+**

### 1. Backend

```bash
cd backend

# Zainstaluj zależności
pip install -r requirements.txt

# Skonfiguruj bazę
# (najpierw utwórz bazę w PostgreSQL)
cp .env.example .env
# Edytuj .env - ustaw DATABASE_URL

# Uruchom
python main.py
```

Backend będzie na: `http://localhost:8000`
Docs: `http://localhost:8000/docs`

### 2. Frontend

```bash
cd frontend

# Zainstaluj zależności
npm install

# Uruchom dev server
npm run dev
```

Frontend będzie na: `http://localhost:3000`

## 📋 Funkcje

### ✈️ Wyszukiwanie Lotów
- Wyszukiwanie w jedną stronę
- Wyszukiwanie w obie strony (TODO)
- Parametry: lotnisko początkowe/końcowe, data, liczba osób
- **Requesty idą bezpośrednio do Ryanair API z przeglądarki użytkownika**

### 👤 Użytkownicy
- Rejestracja
- Logowanie (JWT tokens)
- Zarządzanie profilem

### 📊 Historia Wyszukiwań
- Automatyczne zapisywanie wyszukiwań
- Statystyki cenowe (min/max/avg)
- Przeglądanie historii

### ⭐ Ulubione Loty
- Dodawanie lotów do ulubionych
- Przeglądanie ulubionych
- Usuwanie z ulubionych

### 🔔 Alerty Cenowe
- Tworzenie alertów ("powiadom gdy cena spadnie poniżej X PLN")
- Zarządzanie alertami
- Dezaktywacja/usuwanie alertów

## 🗄️ Baza Danych

### Tabele

**users**
- id, email, name, hashed_password, created_at

**search_history**
- id, user_id, origin, destination, date_out, date_in
- adults, flights_found, min_price, max_price, avg_price, created_at

**price_alerts**
- id, user_id, origin, destination, date_out, max_price
- is_active, created_at, triggered_at

**favorite_flights**
- id, user_id, origin, destination, flight_date, flight_number
- departure_time, arrival_time, price, currency, created_at

## 🔧 Technologie

### Backend
- **FastAPI** - nowoczesny framework Python
- **SQLAlchemy** - ORM
- **PostgreSQL** - baza danych
- **JWT** - autentykacja
- **Pydantic** - walidacja danych

### Frontend
- **React 18** - UI library
- **Vite** - build tool
- **TailwindCSS** - styling
- **Zustand** - state management
- **React Hot Toast** - notyfikacje
- **Lucide React** - ikony
- **Axios** - HTTP client

## 📡 API Endpoints

### Autentykacja
```
POST   /api/auth/register     - Rejestracja
POST   /api/auth/login        - Logowanie
GET    /api/auth/me           - Profil użytkownika
```

### Historia wyszukiwań
```
POST   /api/search-history         - Zapisz wyszukiwanie
GET    /api/search-history         - Lista wyszukiwań
DELETE /api/search-history/{id}    - Usuń wyszukiwanie
```

### Alerty cenowe
```
POST   /api/price-alerts           - Utwórz alert
GET    /api/price-alerts           - Lista alertów
PATCH  /api/price-alerts/{id}/deactivate  - Dezaktywuj
DELETE /api/price-alerts/{id}      - Usuń alert
```

### Ulubione
```
POST   /api/favorites         - Dodaj do ulubionych
GET    /api/favorites         - Lista ulubionych
DELETE /api/favorites/{id}    - Usuń z ulubionych
```

## 🎨 Struktura Projektu

```
flight-search-app/
├── backend/
│   ├── main.py           # Główna aplikacja FastAPI
│   ├── database.py       # Konfiguracja bazy
│   ├── models.py         # Modele SQLAlchemy
│   ├── schemas.py        # Schematy Pydantic
│   ├── auth.py           # Autentykacja JWT
│   └── requirements.txt  # Zależności Python
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── ryanair.js    # Bezpośrednie zapytania do Ryanair
│   │   │   └── backend.js    # Zapytania do naszego backendu
│   │   ├── components/
│   │   │   ├── SearchForm.jsx
│   │   │   └── FlightList.jsx
│   │   ├── store/
│   │   │   └── index.js      # Zustand store
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md (ten plik)
```

## 🐛 Znane Problemy / TODO

- [ ] Wyszukiwanie w obie strony (round-trip)
- [ ] Wyszukiwanie całego miesiąca
- [ ] Porównywanie cen z różnych dat
- [ ] Eksport historii do CSV
- [ ] Email notifications dla alertów cenowych
- [ ] Responsywność mobile (częściowo zrobiona)
- [ ] Dark mode
- [ ] Testy jednostkowe

## 🔐 Bezpieczeństwo

- Hasła hashowane (bcrypt)
- JWT tokens z expiracją
- CORS skonfigurowany
- SQL injection protection (SQLAlchemy ORM)
- XSS protection (React automatycznie)

## 📦 Deployment

### Backend (Railway/Render/Heroku)

1. Dodaj `Procfile`:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

2. Ustaw zmienne środowiskowe:
```
DATABASE_URL=postgresql://...
SECRET_KEY=...
CORS_ORIGINS=https://twoja-domena.com
```

3. Deploy!

### Frontend (Vercel/Netlify)

```bash
npm run build
# Wgraj folder dist/
```

Ustaw zmienne:
```
VITE_API_URL=https://twoj-backend.com/api
```

## 🤝 Wkład

Pull requesty mile widziane! Przed dużymi zmianami otwórz Issue.

## 📄 Licencja

MIT

## 👨‍💻 Autor

Stworzone z ❤️ dla oszczędnych podróżników!

---

**Uwaga:** Ta aplikacja nie jest oficjalnie powiązana z Ryanair.
Używaj odpowiedzialnie i zgodnie z regulaminem Ryanair.
