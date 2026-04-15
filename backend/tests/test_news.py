import json
import pytest
from unittest.mock import patch, AsyncMock

MOCK_ARTICLES = [
    {
        "id": 1,
        "published_date": 1713200000,
        "title": "Bitcoin hits new high",
        "url": "https://example.com/article1",
        "image_url": "https://example.com/img1.jpg",
        "body": "Bitcoin surged past...",
        "tags": "BTC,Bitcoin",
        "categories": "BTC",
    },
    {
        "id": 2,
        "published_date": 1713100000,
        "title": "Ethereum update",
        "url": "https://example.com/article2",
        "image_url": "",
        "body": "Ethereum developers...",
        "tags": "ETH,Ethereum",
        "categories": "ETH",
    },
]


@pytest.mark.asyncio
async def test_get_all_news(client, fake_redis):
    await fake_redis.set("news:all", json.dumps(MOCK_ARTICLES))

    res = await client.get("/api/news")
    assert res.status_code == 200
    articles = res.json()
    assert len(articles) == 2
    assert articles[0]["title"] == "Bitcoin hits new high"


@pytest.mark.asyncio
async def test_get_news_by_coin(client, fake_redis):
    await fake_redis.set("news:coin:BTC", json.dumps([MOCK_ARTICLES[0]]))

    res = await client.get("/api/news", params={"coin": "BTC"})
    assert res.status_code == 200
    articles = res.json()
    assert len(articles) == 1
    assert "Bitcoin" in articles[0]["title"]
