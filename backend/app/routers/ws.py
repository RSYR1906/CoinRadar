from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.ws_manager import connect, disconnect

router = APIRouter()


@router.websocket("/ws/prices")
async def ws_prices(ws: WebSocket):
    await connect(ws)
    try:
        while True:
            await ws.receive_text()  # keep alive
    except WebSocketDisconnect:
        disconnect(ws)
