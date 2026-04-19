import json
import logging
from math import ceil

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from app.core.config import get_settings
from app.core.redis import get_redis

logger = logging.getLogger(__name__)
settings = get_settings()

CRYPTO_LIST_URL = (
    f"{settings.coingecko_base_url}/coins/markets"
    "?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true"
)
CRYPTO_DETAIL_URL = f"{settings.coingecko_base_url}/coins/{{id}}"
MARKET_TICKERS_URL = f"{settings.coingecko_base_url}/coins/{{id}}/tickers"
TRENDING_URL = f"{settings.coingecko_base_url}/search/trending"

CACHE_KEY_CRYPTO_LIST = "crypto:list"
CACHE_KEY_DETAIL = "crypto:detail:{id}"
CACHE_KEY_TICKERS = "crypto:tickers:{id}"
CACHE_KEY_TRENDING = "crypto:trending"


def _headers() -> dict:
    h = {"Accept": "application/json"}
    if settings.coingecko_api_key:
        h["x-cg-demo-api-key"] = settings.coingecko_api_key
    return h


class CoinGeckoError(Exception):
    pass


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=4),
    retry=retry_if_exception_type((httpx.HTTPStatusError, httpx.ConnectError)),
    reraise=True,
)
async def _fetch(url: str) -> dict | list:
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(url, headers=_headers())
        if resp.status_code == 429:
            raise httpx.HTTPStatusError("Rate limited", request=resp.request, response=resp)
        resp.raise_for_status()
        return resp.json()


# ── Crypto List ───────────────────────────────────────────
async def get_crypto_list() -> list[dict]:
    redis = await get_redis()
    cached = await redis.get(CACHE_KEY_CRYPTO_LIST)
    if cached:
        return json.loads(cached)

    try:
        data = await _fetch(CRYPTO_LIST_URL)
        await redis.set(CACHE_KEY_CRYPTO_LIST, json.dumps(data), ex=settings.crypto_cache_ttl)
        return data
    except Exception:
        logger.exception("Failed to fetch crypto list")
        # Return stale cache if available
        stale = await redis.get(CACHE_KEY_CRYPTO_LIST)
        return json.loads(stale) if stale else []


async def get_cryptos_paginated(page: int = 1, size: int = 20) -> dict:
    all_cryptos = await get_crypto_list()
    total = len(all_cryptos)
    total_pages = max(1, ceil(total / size))
    start = (page - 1) * size
    end = min(start + size, total)
    return {
        "cryptos": all_cryptos[start:end] if start < total else [],
        "page": page,
        "size": size,
        "total": total,
        "total_pages": total_pages,
    }


async def search_cryptos(query: str) -> list[dict]:
    all_cryptos = await get_crypto_list()
    q = query.lower()
    return [
        c
        for c in all_cryptos
        if q in c.get("name", "").lower() or q in c.get("symbol", "").lower()
    ]


# ── Crypto Details ────────────────────────────────────────
async def get_crypto_details(coin_id: str) -> dict:
    redis = await get_redis()
    key = CACHE_KEY_DETAIL.format(id=coin_id)
    cached = await redis.get(key)
    if cached:
        return json.loads(cached)

    try:
        data = await _fetch(CRYPTO_DETAIL_URL.format(id=coin_id))
        await redis.set(key, json.dumps(data), ex=settings.crypto_cache_ttl)
        return data
    except Exception:
        logger.exception("Failed to fetch details for %s", coin_id)
        stale = await redis.get(key)
        return json.loads(stale) if stale else {}


# ── Market Tickers ────────────────────────────────────────
async def get_market_tickers(coin_id: str) -> dict:
    redis = await get_redis()
    key = CACHE_KEY_TICKERS.format(id=coin_id)
    cached = await redis.get(key)
    if cached:
        return json.loads(cached)

    try:
        data = await _fetch(MARKET_TICKERS_URL.format(id=coin_id))
        await redis.set(key, json.dumps(data), ex=settings.crypto_cache_ttl)
        return data
    except Exception:
        logger.exception("Failed to fetch tickers for %s", coin_id)
        stale = await redis.get(key)
        return json.loads(stale) if stale else {}


# ── Trending ──────────────────────────────────────────────
async def get_trending() -> dict:
    redis = await get_redis()
    cached = await redis.get(CACHE_KEY_TRENDING)
    if cached:
        return json.loads(cached)

    try:
        data = await _fetch(TRENDING_URL)
        await redis.set(CACHE_KEY_TRENDING, json.dumps(data), ex=settings.crypto_cache_ttl)
        return data
    except Exception:
        logger.exception("Failed to fetch trending")
        stale = await redis.get(CACHE_KEY_TRENDING)
        return json.loads(stale) if stale else {}
