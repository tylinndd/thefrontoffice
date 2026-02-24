from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import analysis, auth, bets, edge, players


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    yield


app = FastAPI(
    title="The Front Office API",
    description="Quantitative NBA Betting Analytics Backend",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/profile", tags=["Profile"])
app.include_router(players.router, prefix="/api/players", tags=["Players"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])
app.include_router(edge.router, prefix="/api/edge", tags=["Edge Feed"])
app.include_router(bets.router, prefix="/api/bets", tags=["Bets"])


@app.get("/api/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}
