import asyncio
import logging

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import Base, engine
from app.core.redis import close_redis
from app.routers import auth, crypto, news, watchlist, ws
from app.services.ws_manager import broadcast_prices

logging.basicConfig(level=logging.INFO)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Start the price broadcast background task
    task = asyncio.create_task(broadcast_prices())

    yield

    # Shutdown
    task.cancel()
    await close_redis()


app = FastAPI(
    title="CoinRadar API",
    description="Cryptocurrency tracker backend — Python / FastAPI",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS
origins = [o.strip() for o in settings.allowed_origins.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(crypto.router)
app.include_router(watchlist.router)
app.include_router(news.router)
app.include_router(ws.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
