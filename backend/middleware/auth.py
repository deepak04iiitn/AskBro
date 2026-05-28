from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from config.env import settings
from schemas.user import CurrentUser

_bearer = HTTPBearer()


# ── Token creation ────────────────────────────────────────────────────────────

def create_access_token(data: dict) -> str:
    payload = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload["exp"] = expire
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


# ── Token validation dependency ───────────────────────────────────────────────

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> CurrentUser:
    """
    FastAPI dependency — extracts and validates the Bearer JWT on every
    protected route. Returns a CurrentUser with decoded claims.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        user_id: str = payload.get("sub")
        email: str = payload.get("email")
        workspace_id: str = payload.get("workspace_id")
        workspace_code: str = payload.get("workspace_code")
        role: str = payload.get("role")

        if not all([user_id, email, workspace_id, workspace_code, role]):
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    return CurrentUser(
        id=user_id,
        email=email,
        workspace_id=workspace_id,
        workspace_code=workspace_code,
        role=role,
    )
