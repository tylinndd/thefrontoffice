from __future__ import annotations

from typing import Annotated

import jwt
from fastapi import Depends, Header, HTTPException, status
from supabase import Client, create_client

from app.config import settings

_supabase_service: Client | None = None
_supabase_anon: Client | None = None


def get_supabase_service() -> Client:
    """Supabase client authenticated with the service-role key (full DB access)."""
    global _supabase_service
    if _supabase_service is None:
        _supabase_service = create_client(settings.supabase_url, settings.supabase_service_key)
    return _supabase_service


def get_supabase_anon() -> Client:
    """Supabase client authenticated with the anon key (respects RLS)."""
    global _supabase_anon
    if _supabase_anon is None:
        _supabase_anon = create_client(settings.supabase_url, settings.supabase_anon_key)
    return _supabase_anon


async def get_current_user_id(
    authorization: Annotated[str, Header()],
) -> str:
    """Extract and verify the Supabase JWT from the Authorization header."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format",
        )
    token = authorization.removeprefix("Bearer ")
    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user_id: str | None = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token missing subject")
    return user_id


CurrentUserId = Annotated[str, Depends(get_current_user_id)]
ServiceClient = Annotated[Client, Depends(get_supabase_service)]
