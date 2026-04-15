import asyncio
import json
import logging
from typing import Any

from fastapi import WebSocket

from app.services.crypto_service import get_crypto_list

logger = logging.getLogger(__name__)

# Connected WebSocket clients
_clients: set[WebSocket] = set()
_last_prices: dict[str, Any] = {}


async def connect(ws: WebSocket) -> None:
    await ws.accept()
    _clients.add(ws)
    logger.info("WebSocket client connected. Total: %d", len(_clients))


def disconnect(ws: WebSocket) -> None:
    _clients.discard(ws)
    logger.info("WebSocket client disconnected. Total: %d", len(_clients))


async def broadcast_prices() -> None:
    """Background task: fetch prices every 60s and broadcast diffs."""
    global _last_prices

    while True:
        try:
            cryptos = await get_crypto_list()
            current = {
                c["id"]: {
                    "id": c["id"],
                    "symbol": c.get("symbol", ""),
                    "name": c.get("name", ""),
                    "image": c.get("image", ""),
                    "current_price": c.get("current_price"),
                    "market_cap": c.get("market_cap"),
                    "price_change_percentage_24h": c.get("price_change_percentage_24h"),
                }
                for c in cryptos
            }

            if _last_prices:
                # Compute changed coins
                changes = []
                for cid, data in current.items():
                    old = _last_prices.get(cid, {})
                    if data.get("current_price") != old.get("current_price"):
                        changes.append(data)

                if changes and _clients:
                    msg = json.dumps({"type": "price_update", "data": changes})
                    dead = set()
                    for ws in _clients:
                        try:
                            await ws.send_text(msg)
                        except Exception:
                            dead.add(ws)
                    _clients.difference_update(dead)

            _last_prices = current
        except Exception:
            logger.exception("Error in price broadcast loop")

        await asyncio.sleep(60)
