from fastapi import Depends, HTTPException, status

from middleware.auth import get_current_user
from schemas.user import CurrentUser


async def require_owner(
    current_user: CurrentUser = Depends(get_current_user),
) -> CurrentUser:
    """
    Dependency that allows access only to workspace owners.
    Use on: add/remove member, change password, delete workspace endpoints.
    """
    if current_user.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the workspace owner can perform this action.",
        )
    return current_user
