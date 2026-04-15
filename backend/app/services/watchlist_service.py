import logging

from sqlalchemy import and_, select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.watchlist import WatchlistEntry
from app.services.crypto_service import get_crypto_list

logger = logging.getLogger(__name__)


async def get_user_watchlist(db: AsyncSession, user_id: int) -> list[dict]:
    """Get the user's watchlist entries with live price data from cache."""
    result = await db.execute(
        select(WatchlistEntry).where(WatchlistEntry.user_id == user_id)
    )
    entries = result.scalars().all()

    # Fetch current prices to enrich watchlist entries
    all_cryptos = await get_crypto_list()
    price_map = {c["id"]: c for c in all_cryptos}

    enriched = []
    for e in entries:
        live = price_map.get(e.crypto_id, {})
        enriched.append({
            "id": e.id,
            "crypto_id": e.crypto_id,
            "symbol": e.symbol,
            "name": e.name,
            "logo_url": e.logo_url,
            "user_notes": e.user_notes,
            "current_price": live.get("current_price"),
            "market_cap": live.get("market_cap"),
            "price_change_percentage_24h": live.get("price_change_percentage_24h"),
            "added_at": e.added_at.isoformat() if e.added_at else None,
        })
    return enriched


async def add_to_watchlist(
    db: AsyncSession, user_id: int, crypto_id: str, symbol: str, name: str,
    logo_url: str = "", user_notes: str = ""
) -> WatchlistEntry:
    # Check for duplicate
    result = await db.execute(
        select(WatchlistEntry).where(
            and_(WatchlistEntry.user_id == user_id, WatchlistEntry.crypto_id == crypto_id)
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        return existing

    entry = WatchlistEntry(
        user_id=user_id,
        crypto_id=crypto_id,
        symbol=symbol,
        name=name,
        logo_url=logo_url,
        user_notes=user_notes,
    )
    db.add(entry)
    await db.flush()
    await db.refresh(entry)
    return entry


async def remove_from_watchlist(db: AsyncSession, user_id: int, entry_id: int) -> bool:
    result = await db.execute(
        delete(WatchlistEntry).where(
            and_(WatchlistEntry.id == entry_id, WatchlistEntry.user_id == user_id)
        )
    )
    return result.rowcount > 0


async def update_note(db: AsyncSession, user_id: int, entry_id: int, note: str) -> bool:
    result = await db.execute(
        select(WatchlistEntry).where(
            and_(WatchlistEntry.id == entry_id, WatchlistEntry.user_id == user_id)
        )
    )
    entry = result.scalar_one_or_none()
    if entry is None:
        return False
    entry.user_notes = note
    await db.flush()
    return True
