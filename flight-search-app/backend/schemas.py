"""
Pydantic schemas - walidacja danych API
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime, date


# ============================================
# USER SCHEMAS
# ============================================

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str


# ============================================
# SEARCH HISTORY SCHEMAS
# ============================================

class SearchHistoryCreate(BaseModel):
    origin: str = Field(..., min_length=3, max_length=3)
    destination: str = Field(..., min_length=3, max_length=3)
    date_out: date
    date_in: Optional[date] = None
    adults: int = Field(default=1, ge=1, le=10)
    flights_found: int = 0
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    avg_price: Optional[float] = None

class SearchHistoryResponse(SearchHistoryCreate):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================
# PRICE ALERT SCHEMAS
# ============================================

class PriceAlertCreate(BaseModel):
    origin: str = Field(..., min_length=3, max_length=3)
    destination: str = Field(..., min_length=3, max_length=3)
    date_out: date
    max_price: float = Field(..., gt=0)

class PriceAlertResponse(PriceAlertCreate):
    id: int
    user_id: int
    is_active: bool
    created_at: datetime
    triggered_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================
# FLIGHT SCHEMAS
# ============================================

class FlightBase(BaseModel):
    origin: str
    destination: str
    flight_date: date
    flight_number: str
    departure_time: str
    arrival_time: str
    price: float
    currency: str = "PLN"

class FavoriteFlightCreate(FlightBase):
    pass

class FavoriteFlightResponse(FlightBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
