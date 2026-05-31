"""Admin JWT middleware — separate from user JWTs."""

import time
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from config.env import settings

_admin_bearer = HTTPBearer(scheme_name="AdminBearer")

# ── In-memory OTP store  {email: {otp, expires_at}} ──────────────────────────
_otp_store: dict[str, dict] = {}

# ── Active user tracker  {user_id: last_seen_epoch} ──────────────────────────
_active_users: dict[str, dict] = {}  # user_id -> {email, last_seen}


def store_otp(email: str, otp: str, ttl_seconds: int = 300) -> None:
    _otp_store[email] = {
        "otp": otp,
        "expires_at": time.time() + ttl_seconds,
    }


def verify_otp(email: str, otp: str) -> bool:
    record = _otp_store.get(email)
    if not record:
        return False
    if time.time() > record["expires_at"]:
        del _otp_store[email]
        return False
    if record["otp"] != otp:
        return False
    del _otp_store[email]
    return True


def create_admin_token() -> str:
    payload = {
        "sub": "admin",
        "is_admin": True,
        "exp": datetime.now(timezone.utc) + timedelta(hours=8),
    }
    return jwt.encode(payload, settings.ADMIN_JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


async def get_admin_user(
    credentials: HTTPAuthorizationCredentials = Depends(_admin_bearer),
) -> dict:
    exc = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Admin auth required")
    try:
        payload = jwt.decode(credentials.credentials, settings.ADMIN_JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        if not payload.get("is_admin"):
            raise exc
        return {"sub": "admin"}
    except JWTError:
        raise exc


def record_user_activity(user_id: str, email: str) -> None:
    """Call from auth middleware to track active users."""
    _active_users[user_id] = {"email": email, "last_seen": time.time()}


def get_active_users(window_seconds: int = 900) -> list[dict]:
    """Return users seen within the last window_seconds (default 15 min)."""
    cutoff = time.time() - window_seconds
    return [
        {"user_id": uid, "email": info["email"], "last_seen": info["last_seen"]}
        for uid, info in _active_users.items()
        if info["last_seen"] >= cutoff
    ]
