"""
SQLAlchemy models - struktura bazy danych
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Date, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relacje
    search_history = relationship("SearchHistory", back_populates="user", cascade="all, delete-orphan")
    price_alerts = relationship("PriceAlert", back_populates="user", cascade="all, delete-orphan")
    favorites = relationship("FavoriteFlight", back_populates="user", cascade="all, delete-orphan")


class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    origin = Column(String(3), nullable=False)  # IATA code
    destination = Column(String(3), nullable=False)  # IATA code
    date_out = Column(Date, nullable=False)
    date_in = Column(Date, nullable=True)  # null dla lotów w jedną stronę
    adults = Column(Integer, default=1)
    flights_found = Column(Integer, default=0)
    min_price = Column(Float, nullable=True)
    max_price = Column(Float, nullable=True)
    avg_price = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relacja
    user = relationship("User", back_populates="search_history")


class PriceAlert(Base):
    __tablename__ = "price_alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    origin = Column(String(3), nullable=False)
    destination = Column(String(3), nullable=False)
    date_out = Column(Date, nullable=False)
    max_price = Column(Float, nullable=False)  # alert gdy cena spadnie poniżej
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    triggered_at = Column(DateTime(timezone=True), nullable=True)

    # Relacja
    user = relationship("User", back_populates="price_alerts")


class FavoriteFlight(Base):
    __tablename__ = "favorite_flights"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    origin = Column(String(3), nullable=False)
    destination = Column(String(3), nullable=False)
    flight_date = Column(Date, nullable=False)
    flight_number = Column(String(10), nullable=False)
    departure_time = Column(String(5), nullable=False)  # HH:MM
    arrival_time = Column(String(5), nullable=False)  # HH:MM
    price = Column(Float, nullable=False)
    currency = Column(String(3), default="PLN")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relacja
    user = relationship("User", back_populates="favorites")


class FlightCache(Base):
    """
    Cache dla odpowiedzi z Ryanair API (FareFinder, availability, itp.)
    Przechowuje dane w formacie JSON z TTL
    """
    __tablename__ = "flight_cache"

    id = Column(Integer, primary_key=True, index=True)
    cache_key = Column(String(255), unique=True, index=True, nullable=False)  # np. "ryanair_fare_cache_WAW-VIE-2025-12-01-2025-12-31-oneway-1"
    data = Column(JSON, nullable=False)  # Lista lotów lub mapa cen (przechowywana jako JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)  # Czas wygaśnięcia (UTC)


class Country(Base):
    """
    Kraje - normalizowana tabela
    """
    __tablename__ = "countries"

    code = Column(String(2), primary_key=True)  # "pl", "de", "gb"
    iso3code = Column(String(3), nullable=False)  # "POL", "DEU", "GBR"
    name = Column(String(100), nullable=False)  # "Polska", "Niemcy"
    currency = Column(String(3), nullable=False)  # "PLN", "EUR", "GBP"
    default_airport_code = Column(String(3), nullable=True)  # "WAW", "FRA", "STN"
    schengen = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relacje
    cities = relationship("City", back_populates="country", cascade="all, delete-orphan")
    airports = relationship("Airport", back_populates="country", cascade="all, delete-orphan")


class City(Base):
    """
    Miasta - normalizowana tabela
    """
    __tablename__ = "cities"

    code = Column(String(50), primary_key=True)  # "WARSAW", "KRAKOW"
    name = Column(String(100), nullable=False)  # "Warsaw", "Kraków"
    country_code = Column(String(2), ForeignKey("countries.code"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relacje
    country = relationship("Country", back_populates="cities")
    airports = relationship("Airport", back_populates="city", cascade="all, delete-orphan")


class Airport(Base):
    """
    Lotniska - kompletna baza danych wszystkich lotnisk Ryanair
    """
    __tablename__ = "airports"

    code = Column(String(3), primary_key=True)  # IATA code: "WAW", "KRK"
    name = Column(String(200), nullable=False)  # "Warsaw Chopin", "Kraków Balice"
    seo_name = Column(String(200), nullable=True)  # "warsaw-chopin", "krakow"

    # Relacje z miastem i krajem
    city_code = Column(String(50), ForeignKey("cities.code"), nullable=False)
    country_code = Column(String(2), ForeignKey("countries.code"), nullable=False)

    # Współrzędne geograficzne
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Dodatkowe informacje
    region = Column(String(100), nullable=True)  # "Mazowieckie", "Lesser Poland"
    timezone = Column(String(50), nullable=True)  # "Europe/Warsaw"
    base = Column(Boolean, default=False)  # Czy to lotnisko bazowe Ryanair

    # Aliasy (przechowywane jako JSON array)
    aliases = Column(JSON, default=list)  # ["WMI", "WAW"]

    # Metadane
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_synced = Column(DateTime(timezone=True), nullable=True)  # Ostatnia synchronizacja z Ryanair API

    # Relacje
    country = relationship("Country", back_populates="airports")
    city = relationship("City", back_populates="airports")

