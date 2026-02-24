from fastapi import APIRouter, HTTPException, status

from app.dependencies import CurrentUserId, ServiceClient
from app.models.schemas import AnalysisRequest, AnalysisResult
from app.services.nba_data import extract_stat_values, get_player_name, get_recent_game_logs
from app.services.probability import (
    build_projection,
    calculate_hit_rate,
    compute_confidence,
    compute_model_probability,
)

router = APIRouter()


@router.post("/analyze", response_model=AnalysisResult)
async def analyze_bet(
    body: AnalysisRequest,
    _user_id: CurrentUserId = "",
    supabase: ServiceClient = None,  # type: ignore[assignment]
) -> AnalysisResult:
    game_logs = get_recent_game_logs(body.player_id, supabase, last_n=15)
    if len(game_logs) < 3:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Not enough game data to analyze (need at least 3 games)",
        )

    values = extract_stat_values(game_logs, body.category)
    player_name = get_player_name(body.player_id, supabase)

    hit_rate = calculate_hit_rate(values, body.line, body.direction)
    projected = build_projection(values)
    model_prob = compute_model_probability(projected, body.line, body.direction, values)
    confidence = compute_confidence(hit_rate, model_prob, len(values))

    return AnalysisResult(
        player_id=body.player_id,
        player_name=player_name,
        category=body.category,
        line=body.line,
        direction=body.direction,
        hit_rate=round(hit_rate, 4),
        model_probability=round(model_prob, 4),
        projected_value=round(projected, 1),
        confidence_score=round(confidence, 4),
        last_n_games=len(values),
        recent_values=values[:10],
    )
