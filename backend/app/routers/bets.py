from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, HTTPException, Query, status

from app.dependencies import CurrentUserId, ServiceClient
from app.models.schemas import (
    BetCreate,
    BetResponse,
    BetUpdate,
    ParlayCreate,
    ParlayResponse,
)

router = APIRouter()


# ── Individual Bets ──────────────────────────────────────────────

@router.post("", response_model=BetResponse, status_code=status.HTTP_201_CREATED)
async def create_bet(
    body: BetCreate,
    user_id: CurrentUserId,
    supabase: ServiceClient,
) -> BetResponse:
    row = body.model_dump(exclude_unset=True)
    row["user_id"] = user_id
    result = supabase.table("bets").insert(row).execute()
    return BetResponse(**result.data[0])


@router.get("", response_model=list[BetResponse])
async def list_bets(
    user_id: CurrentUserId,
    supabase: ServiceClient,
    result_filter: Literal["pending", "won", "lost"] | None = Query(
        default=None, alias="status", description="Filter by bet result"
    ),
    limit: int = Query(default=50, ge=1, le=200),
) -> list[BetResponse]:
    query = (
        supabase.table("bets")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(limit)
    )
    if result_filter:
        query = query.eq("result", result_filter)

    data = query.execute()
    return [BetResponse(**row) for row in data.data]


@router.patch("/{bet_id}", response_model=BetResponse)
async def update_bet(
    bet_id: str,
    body: BetUpdate,
    user_id: CurrentUserId,
    supabase: ServiceClient,
) -> BetResponse:
    updates = body.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )

    if "result" in updates and updates["result"] in ("won", "lost"):
        updates["settled_at"] = datetime.now(timezone.utc).isoformat()

        existing = (
            supabase.table("bets")
            .select("stake, odds")
            .eq("id", bet_id)
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )
        if existing.data:
            bet = existing.data[0]
            if updates["result"] == "won" and bet.get("stake") and bet.get("odds"):
                updates["payout"] = _calculate_payout(
                    float(bet["stake"]), int(bet["odds"])
                )
            elif updates["result"] == "lost":
                updates["payout"] = 0.0

    result = (
        supabase.table("bets")
        .update(updates)
        .eq("id", bet_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bet not found")
    return BetResponse(**result.data[0])


# ── Parlays ──────────────────────────────────────────────────────

@router.post("/parlays", response_model=ParlayResponse, status_code=status.HTTP_201_CREATED)
async def create_parlay(
    body: ParlayCreate,
    user_id: CurrentUserId,
    supabase: ServiceClient,
) -> ParlayResponse:
    if not body.bet_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one bet leg is required",
        )

    parlay_row: dict = {"user_id": user_id, "status": "active"}
    if body.name:
        parlay_row["name"] = body.name
    if body.stake is not None:
        parlay_row["stake"] = body.stake

    parlay_result = supabase.table("parlays").insert(parlay_row).execute()
    parlay = parlay_result.data[0]

    leg_rows = [
        {"parlay_id": parlay["id"], "bet_id": bid}
        for bid in body.bet_ids
    ]
    supabase.table("parlay_legs").insert(leg_rows).execute()

    bets_result = (
        supabase.table("bets")
        .select("*")
        .in_("id", body.bet_ids)
        .execute()
    )

    return ParlayResponse(
        **parlay,
        legs=[BetResponse(**b) for b in bets_result.data],
    )


@router.get("/parlays", response_model=list[ParlayResponse])
async def list_parlays(
    user_id: CurrentUserId,
    supabase: ServiceClient,
    limit: int = Query(default=20, ge=1, le=100),
) -> list[ParlayResponse]:
    parlays = (
        supabase.table("parlays")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )

    results: list[ParlayResponse] = []
    for p in parlays.data:
        legs = (
            supabase.table("parlay_legs")
            .select("bet_id")
            .eq("parlay_id", p["id"])
            .execute()
        )
        bet_ids = [leg["bet_id"] for leg in legs.data]
        bets_data: list[dict] = []
        if bet_ids:
            bets_data = (
                supabase.table("bets")
                .select("*")
                .in_("id", bet_ids)
                .execute()
            ).data

        results.append(
            ParlayResponse(
                **p,
                legs=[BetResponse(**b) for b in bets_data],
            )
        )

    return results


def _calculate_payout(stake: float, american_odds: int) -> float:
    """Calculate payout from stake and American odds."""
    if american_odds > 0:
        return stake + stake * (american_odds / 100.0)
    return stake + stake * (100.0 / abs(american_odds))
