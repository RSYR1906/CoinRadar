import pytest
from unittest.mock import patch, AsyncMock
from tests.conftest import auth_header

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
async def test_add_and_list_watchlist(client):
    # Register and get token
    await client.post("/api/auth/register", json={"username": "watcher", "password": "password123"})
    login = await client.post("/api/auth/login", json={"username": "watcher", "password": "password123"})
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

    # Add entry
    with patch("app.services.watchlist_service.get_crypto_list", new_callable=AsyncMock, return_value=MOCK_CRYPTO_LIST):
        res = await client.post("/api/watchlist", json={
            "crypto_id": "bitcoin", "symbol": "btc", "name": "Bitcoin",
            "logo_url": "https://example.com/btc.png",
        }, headers=headers)
        assert res.status_code == 201
        assert res.json()["message"] == "Added to watchlist"
        entry_id = res.json()["id"]

        # List
        res = await client.get("/api/watchlist", headers=headers)
        assert res.status_code == 200
        entries = res.json()
        assert len(entries) == 1
        assert entries[0]["crypto_id"] == "bitcoin"
        assert entries[0]["current_price"] == 65000


@pytest.mark.asyncio
async def test_add_duplicate(client):
    await client.post("/api/auth/register", json={"username": "duper", "password": "password123"})
    login = await client.post("/api/auth/login", json={"username": "duper", "password": "password123"})
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

    with patch("app.services.watchlist_service.get_crypto_list", new_callable=AsyncMock, return_value=MOCK_CRYPTO_LIST):
        r1 = await client.post("/api/watchlist", json={
            "crypto_id": "bitcoin", "symbol": "btc", "name": "Bitcoin",
        }, headers=headers)
        r2 = await client.post("/api/watchlist", json={
            "crypto_id": "bitcoin", "symbol": "btc", "name": "Bitcoin",
        }, headers=headers)
        assert r1.json()["id"] == r2.json()["id"]


@pytest.mark.asyncio
async def test_delete_entry(client):
    await client.post("/api/auth/register", json={"username": "deleter", "password": "password123"})
    login = await client.post("/api/auth/login", json={"username": "deleter", "password": "password123"})
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

    with patch("app.services.watchlist_service.get_crypto_list", new_callable=AsyncMock, return_value=MOCK_CRYPTO_LIST):
        add = await client.post("/api/watchlist", json={
            "crypto_id": "ethereum", "symbol": "eth", "name": "Ethereum",
        }, headers=headers)
        entry_id = add.json()["id"]

        res = await client.delete(f"/api/watchlist/{entry_id}", headers=headers)
        assert res.status_code == 200

        entries = await client.get("/api/watchlist", headers=headers)
        assert len(entries.json()) == 0


@pytest.mark.asyncio
async def test_delete_not_found(client):
    await client.post("/api/auth/register", json={"username": "ghost", "password": "password123"})
    login = await client.post("/api/auth/login", json={"username": "ghost", "password": "password123"})
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

    res = await client.delete("/api/watchlist/9999", headers=headers)
    assert res.status_code == 404


@pytest.mark.asyncio
async def test_update_note(client):
    await client.post("/api/auth/register", json={"username": "noter", "password": "password123"})
    login = await client.post("/api/auth/login", json={"username": "noter", "password": "password123"})
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

    with patch("app.services.watchlist_service.get_crypto_list", new_callable=AsyncMock, return_value=MOCK_CRYPTO_LIST):
        add = await client.post("/api/watchlist", json={
            "crypto_id": "bitcoin", "symbol": "btc", "name": "Bitcoin",
        }, headers=headers)
        entry_id = add.json()["id"]

        res = await client.patch(f"/api/watchlist/{entry_id}/note", json={"note": "HODL"}, headers=headers)
        assert res.status_code == 200

        entries = await client.get("/api/watchlist", headers=headers)
        assert entries.json()[0]["user_notes"] == "HODL"


@pytest.mark.asyncio
async def test_watchlist_unauthorized(client):
    res = await client.get("/api/watchlist")
    assert res.status_code == 401
