from fastapi import APIRouter, Query

from app.services.news_service import get_all_news, get_news_for_coin

router = APIRouter(prefix="/api/news", tags=["news"])


@router.get("")
async def list_news(coin: str | None = Query(None)):
    if coin:
        return await get_news_for_coin(coin)
    return await get_all_news()
