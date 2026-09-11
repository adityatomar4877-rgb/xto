import asyncio
from contextlib import asynccontextmanager
from datetime import datetime, timezone
import json
import logging
import os
import time
from typing import Dict, Any, Optional

import httpx
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Response, status
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import router as api_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("xto.backend")

# Server start timestamp for uptime calculation
_server_start_time = time.time()

# Background Keep-Alive status tracking (for Render / cloud hosting)
_keepalive_stats: Dict[str, Any] = {
    "enabled": False,
    "target_url": None,
    "interval_seconds": 600,
    "last_ping_time": None,
    "last_status_code": None,
    "total_pings": 0,
    "last_error": None,
    "status": "IDLE",
}


async def _render_keepalive_worker():
    """Background worker that periodically pings the public URL to keep Render free tier awake.
    
    Render free instances spin down after 15 minutes of HTTP inactivity.
    Render automatically sets RENDER_EXTERNAL_URL (e.g. https://your-service.onrender.com).
    This worker pings /healthz every 10 minutes (600s) to guarantee zero downtime.
    """
    target_url = (
        os.getenv("RENDER_EXTERNAL_URL")
        or os.getenv("KEEPALIVE_URL")
        or os.getenv("APP_URL")
    )
    interval = int(os.getenv("KEEPALIVE_INTERVAL_SECONDS", "600"))  # Default 10 min (Render spins down at 15 min)

    if not target_url:
        logger.info(
            "Render keep-alive worker: RENDER_EXTERNAL_URL / KEEPALIVE_URL not set. "
            "If deploying on Render, set RENDER_EXTERNAL_URL or add an UptimeRobot monitor to prevent spindown."
        )
        _keepalive_stats["status"] = "UNCONFIGURED_LOCAL"
        return

    target_url = target_url.rstrip("/")
    ping_url = f"{target_url}/healthz"
    _keepalive_stats["enabled"] = True
    _keepalive_stats["target_url"] = ping_url
    _keepalive_stats["interval_seconds"] = interval
    _keepalive_stats["status"] = "ACTIVE"

    logger.info(f"Render keep-alive worker activated. Pinging {ping_url} every {interval}s to prevent spindown.")

    # Allow server 20 seconds to boot up before initial ping
    await asyncio.sleep(20)

    async with httpx.AsyncClient(timeout=15.0) as client:
        while True:
            try:
                resp = await client.get(
                    ping_url,
                    headers={"User-Agent": "XTO-Render-KeepAlive/1.0 (+https://github.com/adityatomar4877-rgb/xto)"},
                )
                _keepalive_stats["last_ping_time"] = datetime.now(timezone.utc).isoformat()
                _keepalive_stats["last_status_code"] = resp.status_code
                _keepalive_stats["total_pings"] += 1
                _keepalive_stats["last_error"] = None
                _keepalive_stats["status"] = "ACTIVE"
                logger.info(f"[Render KeepAlive] Ping successful to {ping_url} (HTTP {resp.status_code})")
            except Exception as exc:
                _keepalive_stats["last_error"] = str(exc)
                _keepalive_stats["status"] = "PING_FAILED"
                logger.warning(f"[Render KeepAlive] Ping failed to {ping_url}: {exc}")

            await asyncio.sleep(interval)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI application lifespan manager for startup and graceful shutdown."""
    logger.info("XTO Cyber Decision Digital Twin backend starting up...")
    keepalive_task = asyncio.create_task(_render_keepalive_worker())
    try:
        yield
    finally:
        logger.info("Shutting down background tasks...")
        keepalive_task.cancel()
        try:
            await keepalive_task
        except asyncio.CancelledError:
            pass
        logger.info("XTO backend shutdown complete.")


app = FastAPI(
    title="XTO — Cyber Decision Digital Twin",
    description="MUJ HACKX 4.0 CyberSecurity & Defence System PS #13 — Security Digital Twin for Threat Vector Assessment. 'Simulate the attack. Change the defense. Prove what stopped it.'",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS middleware allowing development and production frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


# ── Render & Cloud Platform Health Checks ───────────────────────────────────

@app.api_route("/healthz", methods=["GET", "HEAD"], tags=["Health"])
@app.api_route("/health", methods=["GET", "HEAD"], tags=["Health"])
def platform_health_check(response: Response):
    """Cloud platform health check endpoint (compatible with Render, Railway, Fly.io, Kubernetes, and UptimeRobot).
    
    Supports both GET and HEAD requests.
    Returns HTTP 200 with server diagnostics and keep-alive status.
    """
    uptime_sec = round(time.time() - _server_start_time, 2)
    uptime_formatted = f"{int(uptime_sec // 3600)}h {int((uptime_sec % 3600) // 60)}m {int(uptime_sec % 60)}s"

    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["X-Service-Name"] = "XTO-Digital-Twin"

    return {
        "status": "healthy",
        "service": "XTO — Cyber Decision Digital Twin",
        "version": "1.0.0-hackx",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "uptime": {
            "seconds": uptime_sec,
            "human_readable": uptime_formatted,
        },
        "render_keepalive": _keepalive_stats,
        "platform": {
            "render_detected": bool(os.getenv("RENDER")),
            "render_service_id": os.getenv("RENDER_SERVICE_ID"),
            "render_external_url": os.getenv("RENDER_EXTERNAL_URL"),
        },
    }


@app.api_route("/ping", methods=["GET", "HEAD"], tags=["Health"])
def ping_pong(response: Response):
    """Ultra-lightweight ping endpoint for uptime monitors (UptimeRobot, cron-job.org, BetterStack)."""
    response.headers["Cache-Control"] = "no-cache"
    return {"status": "pong", "timestamp": datetime.now(timezone.utc).isoformat()}


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


@app.api_route("/", methods=["GET", "HEAD"], tags=["Root"])
def root():
    return {
        "product": "XTO — Cyber Decision Digital Twin",
        "tagline": "Simulate the attack. Change the defense. Prove what stopped it.",
        "hackathon": "MUJ HACKX 4.0 PS #13",
        "docs": "/docs",
        "health": "/healthz",
        "api_health": "/api/health",
        "ping": "/ping",
        "topology": "/api/twin",
    }


if __name__ == "__main__":
    import uvicorn
    # Respect dynamic PORT from Render, Railway, or Docker environment
    port = int(os.getenv("PORT", os.getenv("XTO_PORT", "9229")))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
