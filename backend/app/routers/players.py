from fastapi import APIRouter, HTTPException, Query, status

from app.config import settings
from app.dependencies import CurrentUserId, ServiceClient
from app.models.schemas import GameLogEntry, PlayerGameLogResponse, PlayerSearchResult
from app.services.nba_data import (
    get_player_name,
    get_recent_game_logs,
    search_players,
    sync_player_cache,
)

router = APIRouter()


@router.get("/search", response_model=list[PlayerSearchResult])
async def search(
    q: str = Query(..., min_length=2, description="Player name search query"),
    _user_id: CurrentUserId = "",
    supabase: ServiceClient = None,  # type: ignore[assignment]
) -> list[PlayerSearchResult]:
    results = search_players(q, supabase)
    if not results:
        sync_player_cache(supabase)
        results = search_players(q, supabase)
    return [PlayerSearchResult(**r) for r in results]


@router.get("/{player_id}/gamelog", response_model=PlayerGameLogResponse)
async def get_game_log(
    player_id: int,
    last_n: int = Query(default=settings.default_last_n_games, ge=1, le=82),
    _user_id: CurrentUserId = "",
    supabase: ServiceClient = None,  # type: ignore[assignment]
) -> PlayerGameLogResponse:
    logs = get_recent_game_logs(player_id, supabase, last_n=last_n)
    if not logs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No game logs found for player {player_id}",
        )

    player_name = get_player_name(player_id, supabase)
    games = [GameLogEntry(**g) for g in logs]

    return PlayerGameLogResponse(
        nba_player_id=player_id,
        player_name=player_name,
        games=games,
        total_games=len(games),
    )


@router.post("/sync-cache", status_code=status.HTTP_200_OK)
async def sync_cache(
    _user_id: CurrentUserId = "",
    supabase: ServiceClient = None,  # type: ignore[assignment]
) -> dict[str, int]:
    """Manually trigger a refresh of the player cache from nba_api."""
    count = sync_player_cache(supabase)
    return {"players_synced": count}
