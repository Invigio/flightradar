"""
Optymalizacja zapytań do bazy danych - pomocnicze funkcje
"""
from sqlalchemy.orm import Session
from typing import List, Dict
from models import Country, City, Airport


def batch_get_countries(db: Session, country_codes: List[str]) -> Dict[str, Country]:
    """
    Pobiera wiele krajów w jednym zapytaniu (zamiast N osobnych)
    Zwraca dict: {code: Country}
    """
    if not country_codes:
        return {}

    countries = db.query(Country).filter(Country.code.in_(country_codes)).all()
    return {c.code: c for c in countries}


def batch_get_cities(db: Session, city_codes: List[str]) -> Dict[str, City]:
    """
    Pobiera wiele miast w jednym zapytaniu
    Zwraca dict: {code: City}
    """
    if not city_codes:
        return {}

    cities = db.query(City).filter(City.code.in_(city_codes)).all()
    return {c.code: c for c in cities}


def batch_get_airports(db: Session, airport_codes: List[str]) -> Dict[str, Airport]:
    """
    Pobiera wiele lotnisk w jednym zapytaniu
    Zwraca dict: {code: Airport}
    """
    if not airport_codes:
        return {}

    airports = db.query(Airport).filter(Airport.code.in_(airport_codes)).all()
    return {a.code: a for a in airports}


def get_or_create_country(db: Session, country_data: dict, cache: Dict[str, Country] = None) -> Country:
    """
    Pobiera lub tworzy kraj (z opcjonalnym cache'm)
    """
    country_code = country_data.get("code", "").lower()

    # Sprawdź cache
    if cache and country_code in cache:
        return cache[country_code]

    # Sprawdź DB
    country = db.query(Country).filter(Country.code == country_code).first()

    if not country:
        # Utwórz nowy
        country = Country(
            code=country_code,
            iso3code=country_data.get("iso3code", ""),
            name=country_data.get("name", ""),
            currency=country_data.get("currency", "EUR"),
            default_airport_code=country_data.get("defaultAirportCode"),
            schengen=country_data.get("schengen", False)
        )
        db.add(country)
        db.flush()

    # Dodaj do cache
    if cache is not None:
        cache[country_code] = country

    return country


def get_or_create_city(db: Session, city_data: dict, country_code: str, cache: Dict[str, City] = None) -> City:
    """
    Pobiera lub tworzy miasto (z opcjonalnym cache'm)
    """
    city_code = city_data.get("code", "").upper()

    # Sprawdź cache
    if cache and city_code in cache:
        return cache[city_code]

    # Sprawdź DB
    city = db.query(City).filter(City.code == city_code).first()

    if not city:
        # Utwórz nowy
        city = City(
            code=city_code,
            name=city_data.get("name", ""),
            country_code=country_code
        )
        db.add(city)
        db.flush()

    # Dodaj do cache
    if cache is not None:
        cache[city_code] = city

    return city
