"""
Konfiguracja optymalizacji i wydajności
"""

# Cache settings
CACHE_SETTINGS = {
    'FLIGHT_TTL': 3600,  # 1 godzina dla lotów
    'ROUTES_TTL': 43200,  # 12 godzin dla tras
    'AIRPORTS_TTL': 86400,  # 24 godziny dla lotnisk
    'AVAILABILITY_TTL': 86400,  # 24 godziny dla dostępności
}

# Rate limiting
RATE_LIMIT = {
    'ENABLED': True,
    'BASE_DELAY': 600,  # ms
    'JITTER_RANGE': 200,  # ±200ms
    'RETRY_DELAY': 2000,  # ms
    'MAX_RETRIES': 2,
    'CIRCUIT_BREAKER_THRESHOLD': 3,  # Zatrzymaj po 3 błędach z rzędu
}

# Database optimization
DB_OPTIMIZATION = {
    'BATCH_SIZE': 100,  # Batch insert/update size
    'CONNECTION_POOL_SIZE': 5,
    'MAX_OVERFLOW': 10,
    'POOL_TIMEOUT': 30,
    'POOL_RECYCLE': 3600,  # Recycle connections po 1h
}

# API optimization
API_OPTIMIZATION = {
    'USE_HTTP2': True,
    'TIMEOUT': 30,  # sekundy
    'MAX_CONNECTIONS': 100,
    'ENABLE_COMPRESSION': True,
    'PARALLEL_REQUESTS': 3,  # Równoległe requesty (batch)
}

# Search optimization
SEARCH_OPTIMIZATION = {
    'USE_FAREFINDER': True,
    'FAREFINDER_MIN_DAYS': 14,  # Użyj FareFinder tylko dla >14 dni
    'CHECK_AVAILABILITY_FIRST': True,  # Sprawdź dostępne daty przed szukaniem
    'PROGRESSIVE_LOADING': True,
    'INITIAL_RESULTS': 20,  # Pokaż pierwsze 20 wyników
}

# Frontend optimization
FRONTEND_OPTIMIZATION = {
    'DEBOUNCE_SEARCH': 300,  # ms - opóźnienie wpisywania w search
    'VIRTUAL_SCROLL_THRESHOLD': 100,  # Użyj virtual scroll dla >100 items
    'LAZY_LOAD_IMAGES': True,
    'CACHE_EXCHANGE_RATES': True,
    'EXCHANGE_RATES_TTL': 3600000,  # 1h w ms
}
