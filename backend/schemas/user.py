from pydantic import BaseModel


class CurrentUser(BaseModel):
    """Decoded JWT claims — passed around as the authenticated user object."""

    id: str
    email: str
    workspace_id: str
    workspace_code: str
    role: str
