from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


# ── Auth ──────────────────────────────────────────────────
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8, max_length=50)


class UserResponse(BaseModel):
    id: int
    username: str
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str


# ── Crypto ────────────────────────────────────────────────
class CryptoData(BaseModel):
    id: str
    symbol: str
    name: str
    image: str = Field("", alias="image")
    current_price: Decimal | None = None
    market_cap: Decimal | None = None
    price_change_percentage_24h: Decimal | None = None

    model_config = {"populate_by_name": True}


class CryptoListResponse(BaseModel):
    cryptos: list[CryptoData]
    page: int
    size: int
    total: int
    total_pages: int


# ── Watchlist ─────────────────────────────────────────────
class WatchlistEntryCreate(BaseModel):
    crypto_id: str
    symbol: str
    name: str
    logo_url: str = ""
    user_notes: str = ""


class WatchlistEntryResponse(BaseModel):
    id: int
    crypto_id: str
    symbol: str
    name: str
    logo_url: str
    user_notes: str
    current_price: Decimal | None = None
    market_cap: Decimal | None = None
    price_change_percentage_24h: Decimal | None = None
    added_at: datetime

    model_config = {"from_attributes": True}


class NoteUpdate(BaseModel):
    note: str


# ── News ──────────────────────────────────────────────────
class Article(BaseModel):
    id: int
    published_date: int
    title: str
    url: str
    image_url: str = ""
    body: str = ""
    tags: str = ""
    categories: str = ""
