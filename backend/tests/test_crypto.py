import json
import pytest
from unittest.mock import patch, AsyncMock

MOCK_CRYPTO_LIST = [
    {
        "id": "bitcoin",
        "symbol": "btc",
        "name": "Bitcoin",
        "image": "https://example.com/btc.png",
        "current_price": 65000,
        "market_cap": 1280000000000,
        "price_change_percentage_24h": 2.5,
    },
    {
        "id": "ethereum",
        "symbol": "eth",
        "name": "Ethereum",
        "image": "https://example.com/eth.png",
        "current_price": 3500,
        "market_cap": 420000000000,
        "price_change_percentage_24h": -1.2,
    },
]


@pytest.mark.asyncio
async def test_list_cryptos(client, fake_redis):
    await fake_redis.set("crypto:list", json.dumps(MOCK_CRYPTO_LIST))

    res = await client.get("/api/cryptos", params={"page": 1, "size": 10})
    assert res.status_code == 200
    data = res.json()
    assert data["page"] == 1
    assert data["total"] == 2
    assert len(data["cryptos"]) == 2
    assert data["cryptos"][0]["id"] == "bitcoin"


@pytest.mark.asyncio
async def test_list_cryptos_pagination(client, fake_redis):
    await fake_redis.set("crypto:list", json.dumps(MOCK_CRYPTO_LIST))

    res = await client.get("/api/cryptos", params={"page": 1, "size": 1})
    data = res.json()
    assert len(data["cryptos"]) == 1
    assert data["total_pages"] == 2

    res2 = await client.get("/api/cryptos", params={"page": 2, "size": 1})
    data2 = res2.json()
    assert data2["cryptos"][0]["id"] == "ethereum"


@pytest.mark.asyncio
async def test_search_cryptos(client, fake_redis):
    await fake_redis.set("crypto:list", json.dumps(MOCK_CRYPTO_LIST))

    res = await client.get("/api/cryptos/search", params={"q": "bit"})
    assert res.status_code == 200
    results = res.json()["results"]
    assert len(results) == 1
    assert results[0]["id"] == "bitcoin"


@pytest.mark.asyncio
async def test_search_no_match(client, fake_redis):
    await fake_redis.set("crypto:list", json.dumps(MOCK_CRYPTO_LIST))

    res = await client.get("/api/cryptos/search", params={"q": "dogecoin"})
    assert res.status_code == 200
    assert len(res.json()["results"]) == 0


@pytest.mark.asyncio
async def test_coin_detail(client, fake_redis):
    detail = {"id": "bitcoin", "name": "Bitcoin", "market_data": {"current_price": {"usd": 65000}}}
    await fake_redis.set("crypto:detail:bitcoin", json.dumps(detail))

    res = await client.get("/api/cryptos/bitcoin")
    assert res.status_code == 200
    assert res.json()["id"] == "bitcoin"


@pytest.mark.asyncio
async def test_coin_detail_not_found(client, fake_redis):
    with patch("app.services.crypto_service._fetch", new_callable=AsyncMock, side_effect=Exception("not found")):
        res = await client.get("/api/cryptos/nonexistent")
        assert res.status_code == 200
        assert res.json() == {} or "error" in res.json()
