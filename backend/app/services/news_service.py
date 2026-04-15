import json
import logging

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from app.core.config import get_settings
from app.core.redis import get_redis

logger = logging.getLogger(__name__)
settings = get_settings()

CACHE_KEY_NEWS_ALL = "news:all"
CACHE_KEY_NEWS_COIN = "news:coin:{symbol}"


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=4),
    retry=retry_if_exception_type((httpx.HTTPStatusError, httpx.ConnectError)),
    reraise=True,
)
async def _fetch_news(url: str) -> list[dict]:
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(url, headers={"Accept": "application/json"})
        resp.raise_for_status()
        data = resp.json()
        articles = []
        for item in data.get("Data", []):
            categories = ", ".join(
                cat.get("CATEGORY", "")
                for cat in (item.get("CATEGORY_DATA") or [])
            )
            articles.append({
                "id": item.get("ID", 0),
                "published_date": item.get("PUBLISHED_ON", 0),
                "title": item.get("TITLE", ""),
                "url": item.get("URL", ""),
                "image_url": item.get("IMAGE_URL", ""),
                "body": item.get("BODY", ""),
                "tags": item.get("KEYWORDS", ""),
                "categories": categories,
            })
        return articles


async def get_all_news() -> list[dict]:
    redis = await get_redis()
    cached = await redis.get(CACHE_KEY_NEWS_ALL)
    if cached:
        return json.loads(cached)

    try:
        url = f"{settings.cryptocompare_news_url}?lang=EN"
        articles = await _fetch_news(url)
        await redis.set(CACHE_KEY_NEWS_ALL, json.dumps(articles), ex=settings.news_cache_ttl)
        return articles
    except Exception:
        logger.exception("Failed to fetch news")
        stale = await redis.get(CACHE_KEY_NEWS_ALL)
        return json.loads(stale) if stale else []


async def get_news_for_coin(symbol: str, limit: int = 3) -> list[dict]:
    redis = await get_redis()
    key = CACHE_KEY_NEWS_COIN.format(symbol=symbol.upper())
    cached = await redis.get(key)
    if cached:
        return json.loads(cached)

    try:
        url = f"{settings.cryptocompare_news_url}?lang=EN&categories={symbol.upper()}"
        articles = await _fetch_news(url)
        articles = articles[:limit]
        await redis.set(key, json.dumps(articles), ex=settings.news_cache_ttl)
        return articles
    except Exception:
        logger.exception("Failed to fetch news for %s", symbol)
        stale = await redis.get(key)
        return json.loads(stale) if stale else []
