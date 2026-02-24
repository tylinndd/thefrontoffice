from fastapi import APIRouter, HTTPException, status

from app.dependencies import CurrentUserId, ServiceClient
from app.models.schemas import ProfileCreate, ProfileResponse, ProfileUpdate

router = APIRouter()


@router.get("", response_model=ProfileResponse)
async def get_profile(user_id: CurrentUserId, supabase: ServiceClient) -> ProfileResponse:
    result = (
        supabase.table("profiles")
        .select("*")
        .eq("id", user_id)
        .limit(1)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return ProfileResponse(**result.data[0])


@router.post("", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_profile(
    body: ProfileCreate,
    user_id: CurrentUserId,
    supabase: ServiceClient,
) -> ProfileResponse:
    existing = (
        supabase.table("profiles")
        .select("id")
        .eq("id", user_id)
        .limit(1)
        .execute()
    )
    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Profile already exists",
        )

    row = {"id": user_id, "team_name": body.team_name}
    if body.logo_description:
        row["logo_description"] = body.logo_description

    result = supabase.table("profiles").insert(row).execute()
    return ProfileResponse(**result.data[0])


@router.patch("", response_model=ProfileResponse)
async def update_profile(
    body: ProfileUpdate,
    user_id: CurrentUserId,
    supabase: ServiceClient,
) -> ProfileResponse:
    updates = body.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )

    result = (
        supabase.table("profiles")
        .update(updates)
        .eq("id", user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return ProfileResponse(**result.data[0])
