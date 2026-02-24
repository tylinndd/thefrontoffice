from __future__ import annotations

import logging
from datetime import datetime

from nba_api.stats.endpoints import PlayerGameLog
from nba_api.stats.static import players as nba_players
from supabase import Client

from app.config import settings

logger = logging.getLogger(__name__)

STAT_COLUMN_MAP: dict[str, str] = {
    "PTS": "pts",
    "REB": "reb",
    "AST": "ast",
    "3PM": "fg3m",
    "STL": "stl",
    "BLK": "blk",
    "PRA": "pra",  # calculated: pts + reb + ast
}


def search_players(query: str, supabase: Client) -> list[dict]:
    """Search the player_cache table by name (case-insensitive prefix/contains)."""
    result = (
        supabase.table("player_cache")
        .select("nba_player_id, full_name, team_abbreviation, position, is_active")
        .ilike("full_name", f"%{query}%")
        .eq("is_active", True)
        .limit(20)
        .execute()
    )
    return result.data


def sync_player_cache(supabase: Client) -> int:
    """Populate / refresh the player_cache table from nba_api static data."""
    all_players = nba_players.get_active_players()
    rows = [
        {
            "nba_player_id": p["id"],
            "full_name": p["full_name"],
            "team_abbreviation": p.get("team_abbreviation", ""),
            "position": p.get("position", ""),
            "is_active": True,
            "updated_at": datetime.utcnow().isoformat(),
        }
        for p in all_players
    ]
    if rows:
        supabase.table("player_cache").upsert(rows, on_conflict="nba_player_id").execute()
    return len(rows)


def fetch_and_cache_game_logs(
    player_id: int,
    supabase: Client,
    season: str | None = None,
) -> list[dict]:
    """Fetch a player's game log from nba_api and cache it in the game_logs table."""
    season = season or settings.nba_season
    try:
        game_log = PlayerGameLog(player_id=player_id, season=season, timeout=30)
        df = game_log.get_data_frames()[0]
    except Exception:
        logger.exception("Failed to fetch game log for player %s", player_id)
        return []

    if df.empty:
        return []

    rows: list[dict] = []
    for _, row in df.iterrows():
        rows.append(
            {
                "nba_player_id": player_id,
                "game_id": row["Game_ID"],
                "game_date": row["GAME_DATE"],
                "matchup": row.get("MATCHUP", ""),
                "wl": row.get("WL", ""),
                "min": _safe_float(row.get("MIN")),
                "pts": _safe_int(row.get("PTS")),
                "reb": _safe_int(row.get("REB")),
                "ast": _safe_int(row.get("AST")),
                "stl": _safe_int(row.get("STL")),
                "blk": _safe_int(row.get("BLK")),
                "tov": _safe_int(row.get("TOV")),
                "fg3m": _safe_int(row.get("FG3M")),
                "fg3a": _safe_int(row.get("FG3A")),
                "fgm": _safe_int(row.get("FGM")),
                "fga": _safe_int(row.get("FGA")),
                "ftm": _safe_int(row.get("FTM")),
                "fta": _safe_int(row.get("FTA")),
                "plus_minus": _safe_float(row.get("PLUS_MINUS")),
            }
        )

    if rows:
        supabase.table("game_logs").upsert(
            rows, on_conflict="nba_player_id,game_id"
        ).execute()

    return rows


def get_recent_game_logs(
    player_id: int,
    supabase: Client,
    last_n: int | None = None,
) -> list[dict]:
    """Return the most recent N game logs from cache, fetching if empty."""
    last_n = last_n or settings.default_last_n_games

    result = (
        supabase.table("game_logs")
        .select("*")
        .eq("nba_player_id", player_id)
        .order("game_date", desc=True)
        .limit(last_n)
        .execute()
    )

    if not result.data:
        fetch_and_cache_game_logs(player_id, supabase)
        result = (
            supabase.table("game_logs")
            .select("*")
            .eq("nba_player_id", player_id)
            .order("game_date", desc=True)
            .limit(last_n)
            .execute()
        )

    return result.data


def extract_stat_values(game_logs: list[dict], category: str) -> list[float]:
    """Extract the stat values for a given category from game log rows."""
    if category == "PRA":
        return [
            float(g.get("pts", 0) + g.get("reb", 0) + g.get("ast", 0))
            for g in game_logs
        ]
    col = STAT_COLUMN_MAP.get(category, category.lower())
    return [float(g.get(col, 0)) for g in game_logs]


def get_player_name(player_id: int, supabase: Client) -> str:
    """Look up a player's name from cache."""
    result = (
        supabase.table("player_cache")
        .select("full_name")
        .eq("nba_player_id", player_id)
        .limit(1)
        .execute()
    )
    if result.data:
        return result.data[0]["full_name"]

    # Fallback to nba_api static data
    info = nba_players.find_player_by_id(player_id)
    return info["full_name"] if info else f"Player {player_id}"


def _safe_int(val: object) -> int:
    try:
        return int(val)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return 0


def _safe_float(val: object) -> float | None:
    try:
        return float(val)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return None
