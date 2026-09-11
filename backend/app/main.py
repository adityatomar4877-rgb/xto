import asyncio
import json
import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import router as api_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("xto.backend")

app = FastAPI(
    title="XTO — Cyber Decision Digital Twin",
    description="MUJ HACKX 4.0 CyberSecurity & Defence System PS #13 — Security Digital Twin for Threat Vector Assessment. 'Simulate the attack. Change the defense. Prove what stopped it.'",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware allowing development frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


# ── WebSocket for Live Simulation Streaming ─────────────────────────────────

@app.websocket("/ws/simulation/{sim_id}")
async def websocket_simulation_stream(websocket: WebSocket, sim_id: str):
    await websocket.accept()
    logger.info(f"WebSocket client connected for simulation streaming: {sim_id}")
    try:
        # Stream heartbeat or step updates
        await websocket.send_json({
            "event": "CONNECTED",
            "sim_id": sim_id,
            "message": "Live Cyber War Room simulation stream established",
        })
        while True:
            data = await websocket.receive_text()
            # Echo or process control commands
            await websocket.send_json({"event": "PONG", "payload": data})
    except WebSocketDisconnect:
        logger.info(f"WebSocket client disconnected for simulation: {sim_id}")
    except Exception as e:
        logger.error(f"WebSocket streaming error: {e}")


@app.get("/")
def root():
    return {
        "product": "XTO — Cyber Decision Digital Twin",
        "tagline": "Simulate the attack. Change the defense. Prove what stopped it.",
        "hackathon": "MUJ HACKX 4.0 PS #13",
        "docs": "/docs",
        "health": "/api/health",
        "topology": "/api/twin",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=9229, reload=True)
