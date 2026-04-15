from fastapi import APIRouter, Query

from app.services.crypto_service import (
    get_crypto_details,
    get_cryptos_paginated,
    get_market_tickers,
    get_trending,
    search_cryptos,
)

router = APIRouter(prefix="/api/cryptos", tags=["cryptos"])


@router.get("")
async def list_cryptos(page: int = Query(1, ge=1), size: int = Query(20, ge=1, le=100)):
    return await get_cryptos_paginated(page, size)


@router.get("/search")
async def search(q: str = Query(..., min_length=1)):
    results = await search_cryptos(q)
    return {"results": results}


@router.get("/trending")
async def trending():
    return await get_trending()


@router.get("/{coin_id}")
async def details(coin_id: str):
    data = await get_crypto_details(coin_id)
    if not data:
        return {"error": "Coin not found"}
    return data


@router.get("/{coin_id}/tickers")
async def tickers(coin_id: str):
    return await get_market_tickers(coin_id)
