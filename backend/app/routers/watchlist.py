from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.schemas import NoteUpdate, WatchlistEntryCreate
from app.services.watchlist_service import (
    add_to_watchlist,
    get_user_watchlist,
    remove_from_watchlist,
    update_note,
)

router = APIRouter(prefix="/api/watchlist", tags=["watchlist"])


@router.get("")
async def list_watchlist(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_user_watchlist(db, user.id)


@router.post("", status_code=201)
async def add_entry(
    body: WatchlistEntryCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    entry = await add_to_watchlist(
        db, user.id, body.crypto_id, body.symbol, body.name, body.logo_url, body.user_notes
    )
    return {"message": "Added to watchlist", "id": entry.id}


@router.delete("/{entry_id}")
async def remove_entry(
    entry_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    removed = await remove_from_watchlist(db, user.id, entry_id)
    if not removed:
        raise HTTPException(status_code=404, detail="Entry not found")
    return {"message": "Removed from watchlist"}


@router.patch("/{entry_id}/note")
async def update_entry_note(
    entry_id: int,
    body: NoteUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    updated = await update_note(db, user.id, entry_id, body.note)
    if not updated:
        raise HTTPException(status_code=404, detail="Entry not found")
    return {"message": "Note updated"}
