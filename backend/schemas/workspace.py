from pydantic import BaseModel, EmailStr, Field


class WorkspaceCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=80)
    owner_email: EmailStr
    password: str = Field(..., min_length=6)
    member_emails: list[EmailStr] = Field(default_factory=list)


class WorkspaceCreateResponse(BaseModel):
    workspace_code: str
    message: str


class LoginRequest(BaseModel):
    workspace_code: str = Field(..., pattern=r"^WSP-[A-Z0-9]{4}$")
    email: EmailStr


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AddMemberRequest(BaseModel):
    email: EmailStr


class RemoveMemberRequest(BaseModel):
    email: EmailStr


class ChangePasswordRequest(BaseModel):
    new_password: str = Field(..., min_length=6)


class WorkspaceMemberResponse(BaseModel):
    email: str
    role: str


class ForgotCodeRequest(BaseModel):
    email: EmailStr
    password: str
