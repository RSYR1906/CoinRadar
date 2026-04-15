import pytest
from tests.conftest import auth_header


@pytest.mark.asyncio
async def test_register(client):
    res = await client.post("/api/auth/register", json={"username": "alice", "password": "password123"})
    assert res.status_code == 201
    data = res.json()
    assert data["username"] == "alice"
    assert "id" in data


@pytest.mark.asyncio
async def test_register_duplicate(client):
    await client.post("/api/auth/register", json={"username": "bob", "password": "password123"})
    res = await client.post("/api/auth/register", json={"username": "bob", "password": "password123"})
    assert res.status_code == 400
    assert "already taken" in res.json()["detail"]


@pytest.mark.asyncio
async def test_register_short_username(client):
    res = await client.post("/api/auth/register", json={"username": "ab", "password": "password123"})
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_register_short_password(client):
    res = await client.post("/api/auth/register", json={"username": "charlie", "password": "short"})
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_login(client):
    await client.post("/api/auth/register", json={"username": "dave", "password": "password123"})
    res = await client.post("/api/auth/login", json={"username": "dave", "password": "password123"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["username"] == "dave"
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_bad_password(client):
    await client.post("/api/auth/register", json={"username": "eve", "password": "password123"})
    res = await client.post("/api/auth/login", json={"username": "eve", "password": "wrongpassword"})
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_login_nonexistent_user(client):
    res = await client.post("/api/auth/login", json={"username": "nobody", "password": "password123"})
    assert res.status_code == 401
