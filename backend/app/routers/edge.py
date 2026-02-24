from fastapi import APIRouter, Query

from app.dependencies import CurrentUserId, ServiceClient
from app.models.schemas import EdgeFeedResponse
from app.services.edge import generate_edge_feed

router = APIRouter()


@router.get("/feed", response_model=EdgeFeedResponse)
async def get_edge_feed(
    min_edge: float = Query(default=0.03, ge=0.0, le=0.5, description="Minimum edge threshold"),
    max_items: int = Query(default=25, ge=1, le=100, description="Max items to return"),
    _user_id: CurrentUserId = "",
    supabase: ServiceClient = None,  # type: ignore[assignment]
) -> EdgeFeedResponse:
    return await generate_edge_feed(supabase, min_edge=min_edge, max_items=max_items)
