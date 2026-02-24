from __future__ import annotations

import logging
from datetime import datetime, timezone

from supabase import Client

from app.models.schemas import EdgeFeedResponse, EdgeItem
from app.services.nba_data import (
    extract_stat_values,
    get_recent_game_logs,
    search_players,
)
from app.services.odds import PropLine, fetch_player_props
from app.services.probability import (
    build_projection,
    calculate_hit_rate,
    compute_confidence,
    compute_model_probability,
)

logger = logging.getLogger(__name__)


async def generate_edge_feed(
    supabase: Client,
    min_edge: float = 0.03,
    max_items: int = 25,
) -> EdgeFeedResponse:
    """
    Build the edge discovery feed by:
    1. Fetching live player prop markets
    2. Running the probability engine against each
    3. Ranking by absolute edge (model vs market)
    """
    props = await fetch_player_props()
    items: list[EdgeItem] = []
    analyzed = 0

    seen: set[tuple[str, str, float]] = set()

    for prop in props:
        key = (prop.player_name, prop.category, prop.line)
        if key in seen:
            continue
        seen.add(key)

        player_id = _resolve_player_id(prop.player_name, supabase)
        if player_id is None:
            continue

        game_logs = get_recent_game_logs(player_id, supabase, last_n=15)
        if len(game_logs) < 5:
            continue

        values = extract_stat_values(game_logs, prop.category)
        analyzed += 1

        for direction in ("over", "under"):
            market_prob = (
                prop.over_implied if direction == "over" else prop.under_implied
            )
            hit_rate = calculate_hit_rate(values, prop.line, direction)
            projected = build_projection(values)
            model_prob = compute_model_probability(
                projected, prop.line, direction, values
            )
            edge = model_prob - market_prob

            if abs(edge) < min_edge:
                continue

            confidence = compute_confidence(hit_rate, model_prob, len(values))

            items.append(
                EdgeItem(
                    player_name=prop.player_name,
                    nba_player_id=player_id,
                    category=prop.category,
                    line=prop.line,
                    direction=direction,
                    model_probability=round(model_prob, 4),
                    market_probability=round(market_prob, 4),
                    edge=round(edge, 4),
                    confidence_score=round(confidence, 4),
                    projected_value=round(projected, 1),
                    bookmaker=prop.bookmaker,
                )
            )

    items.sort(key=lambda x: abs(x.edge), reverse=True)

    return EdgeFeedResponse(
        items=items[:max_items],
        generated_at=datetime.now(timezone.utc),
        total_props_analyzed=analyzed,
    )


def _resolve_player_id(player_name: str, supabase: Client) -> int | None:
    """Try to find an nba_player_id from the cache by name."""
    results = search_players(player_name.split()[-1], supabase)
    if not results:
        return None

    name_lower = player_name.lower()
    for r in results:
        if r["full_name"].lower() == name_lower:
            return r["nba_player_id"]

    if len(results) == 1:
        return results[0]["nba_player_id"]

    return None
