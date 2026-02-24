from __future__ import annotations

import logging
from dataclasses import dataclass

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

SPORT_KEY = "basketball_nba"

MARKET_MAP: dict[str, str] = {
    "player_points": "PTS",
    "player_rebounds": "REB",
    "player_assists": "AST",
    "player_threes": "3PM",
}


@dataclass
class PropLine:
    event_id: str
    home_team: str
    away_team: str
    commence_time: str
    player_name: str
    category: str
    line: float
    over_price: float
    under_price: float
    over_implied: float
    under_implied: float
    bookmaker: str


def american_to_implied(american_odds: int) -> float:
    """Convert American odds to implied probability (0-1)."""
    if american_odds > 0:
        return 100.0 / (american_odds + 100.0)
    return abs(american_odds) / (abs(american_odds) + 100.0)


def decimal_to_implied(decimal_price: float) -> float:
    """Convert decimal odds to implied probability (0-1)."""
    if decimal_price <= 0:
        return 0.0
    return 1.0 / decimal_price


async def fetch_player_props(markets: list[str] | None = None) -> list[PropLine]:
    """Fetch current NBA player prop lines from The Odds API."""
    if markets is None:
        markets = list(MARKET_MAP.keys())

    all_props: list[PropLine] = []

    async with httpx.AsyncClient(timeout=30) as client:
        for market_key in markets:
            try:
                resp = await client.get(
                    f"{settings.odds_api_base_url}/sports/{SPORT_KEY}/events",
                    params={
                        "apiKey": settings.odds_api_key,
                        "regions": "us",
                        "markets": market_key,
                        "oddsFormat": "american",
                    },
                )
                resp.raise_for_status()
                events = resp.json()
            except Exception:
                logger.exception("Failed to fetch odds for market %s", market_key)
                continue

            category = MARKET_MAP.get(market_key, market_key)

            for event in events:
                event_id = event.get("id", "")
                home = event.get("home_team", "")
                away = event.get("away_team", "")
                commence = event.get("commence_time", "")

                for bookmaker in event.get("bookmakers", []):
                    book_name = bookmaker.get("title", "")
                    for mkt in bookmaker.get("markets", []):
                        if mkt.get("key") != market_key:
                            continue
                        outcomes = mkt.get("outcomes", [])
                        _parse_outcomes(
                            outcomes, all_props, event_id, home, away,
                            commence, category, book_name,
                        )

    return all_props


def _parse_outcomes(
    outcomes: list[dict],
    props: list[PropLine],
    event_id: str,
    home: str,
    away: str,
    commence: str,
    category: str,
    bookmaker: str,
) -> None:
    """Group over/under outcomes into PropLine objects."""
    by_player: dict[str, dict[str, dict]] = {}

    for o in outcomes:
        player = o.get("description", "")
        name = o.get("name", "").lower()
        if player and name in ("over", "under"):
            by_player.setdefault(player, {})[name] = o

    for player, sides in by_player.items():
        over = sides.get("over")
        under = sides.get("under")
        if not over or not under:
            continue

        line = float(over.get("point", 0))
        over_price = int(over.get("price", -110))
        under_price = int(under.get("price", -110))

        props.append(
            PropLine(
                event_id=event_id,
                home_team=home,
                away_team=away,
                commence_time=commence,
                player_name=player,
                category=category,
                line=line,
                over_price=float(over_price),
                under_price=float(under_price),
                over_implied=american_to_implied(over_price),
                under_implied=american_to_implied(under_price),
                bookmaker=bookmaker,
            )
        )
