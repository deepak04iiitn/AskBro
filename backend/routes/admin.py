from fastapi import APIRouter, Depends

from controllers.admin_controller import admin_login, admin_verify_otp, get_admin_metrics
from middleware.admin_auth import get_admin_user
from schemas.admin import AdminLoginRequest, AdminMetrics, AdminOTPRequest, AdminTokenResponse

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/auth/login")
async def admin_login_route(req: AdminLoginRequest):
    return await admin_login(req)


@router.post("/auth/verify-otp", response_model=AdminTokenResponse)
async def admin_verify_otp_route(req: AdminOTPRequest):
    return await admin_verify_otp(req)


@router.get("/metrics", response_model=AdminMetrics)
async def admin_metrics_route(_: dict = Depends(get_admin_user)):
    return await get_admin_metrics()
