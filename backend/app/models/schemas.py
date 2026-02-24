from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field


# ── Profile ──────────────────────────────────────────────────────

class ProfileCreate(BaseModel):
    team_name: str = Field(..., min_length=1, max_length=50)
    logo_description: str | None = None


class ProfileUpdate(BaseModel):
    team_name: str | None = Field(None, min_length=1, max_length=50)
    logo_url: str | None = None
    logo_description: str | None = None


class ProfileResponse(BaseModel):
    id: str
    team_name: str
    logo_url: str | None = None
    logo_description: str | None = None
    created_at: datetime
    updated_at: datetime


# ── Players ──────────────────────────────────────────────────────

class PlayerSearchResult(BaseModel):
    nba_player_id: int
    full_name: str
    team_abbreviation: str | None = None
    position: str | None = None
    is_active: bool = True


class GameLogEntry(BaseModel):
    game_id: str
    game_date: date
    matchup: str | None = None
    wl: str | None = None
    min: float | None = None
    pts: int = 0
    reb: int = 0
    ast: int = 0
    stl: int = 0
    blk: int = 0
    tov: int = 0
    fg3m: int = 0
    fg3a: int = 0
    fgm: int = 0
    fga: int = 0
    ftm: int = 0
    fta: int = 0
    plus_minus: float | None = None


class PlayerGameLogResponse(BaseModel):
    nba_player_id: int
    player_name: str
    games: list[GameLogEntry]
    total_games: int


# ── Analysis ─────────────────────────────────────────────────────

StatCategory = Literal["PTS", "REB", "AST", "3PM", "STL", "BLK", "PRA"]
Direction = Literal["over", "under"]


class AnalysisRequest(BaseModel):
    player_id: int
    category: StatCategory
    line: float
    direction: Direction


class AnalysisResult(BaseModel):
    player_id: int
    player_name: str
    category: StatCategory
    line: float
    direction: Direction
    hit_rate: float
    model_probability: float
    projected_value: float
    confidence_score: float
    last_n_games: int
    recent_values: list[float]


# ── Edge Feed ────────────────────────────────────────────────────

class EdgeItem(BaseModel):
    player_name: str
    nba_player_id: int
    category: StatCategory
    line: float
    direction: Direction
    model_probability: float
    market_probability: float
    edge: float
    confidence_score: float
    projected_value: float
    bookmaker: str | None = None


class EdgeFeedResponse(BaseModel):
    items: list[EdgeItem]
    generated_at: datetime
    total_props_analyzed: int


# ── Bets ─────────────────────────────────────────────────────────

class BetCreate(BaseModel):
    nba_player_id: int
    player_name: str
    category: StatCategory
    line: float
    direction: Direction
    model_probability: float | None = None
    market_probability: float | None = None
    edge: float | None = None
    confidence_score: float | None = None
    hit_rate: float | None = None
    odds: int | None = None
    stake: float | None = None
    game_date: date | None = None


class BetUpdate(BaseModel):
    result: Literal["pending", "won", "lost"] | None = None
    stake: float | None = None
    odds: int | None = None


class BetResponse(BaseModel):
    id: str
    user_id: str
    nba_player_id: int
    player_name: str
    category: str
    line: float
    direction: str
    model_probability: float | None = None
    market_probability: float | None = None
    edge: float | None = None
    confidence_score: float | None = None
    hit_rate: float | None = None
    result: str = "pending"
    odds: int | None = None
    stake: float | None = None
    payout: float | None = None
    game_date: date | None = None
    created_at: datetime
    settled_at: datetime | None = None


# ── Parlays ──────────────────────────────────────────────────────

class ParlayCreate(BaseModel):
    name: str | None = None
    bet_ids: list[str]
    stake: float | None = None


class ParlayResponse(BaseModel):
    id: str
    user_id: str
    name: str | None = None
    status: str = "active"
    simulated_probability: float | None = None
    market_implied_probability: float | None = None
    total_odds: int | None = None
    stake: float | None = None
    potential_payout: float | None = None
    result: str = "pending"
    legs: list[BetResponse] = []
    created_at: datetime
    settled_at: datetime | None = None
