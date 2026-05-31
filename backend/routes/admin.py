from fastapi import APIRouter, Depends, Request

from controllers.admin_controller import admin_login, admin_verify_otp, get_admin_metrics
from middleware.admin_auth import get_admin_user
from middleware.rate_limit import limiter, ADMIN_LIMIT, API_LIMIT
from schemas.admin import AdminLoginRequest, AdminMetrics, AdminOTPRequest, AdminTokenResponse

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/auth/login")
@limiter.limit(ADMIN_LIMIT)
async def admin_login_route(request: Request, req: AdminLoginRequest):
    return await admin_login(req)


@router.post("/auth/verify-otp", response_model=AdminTokenResponse)
@limiter.limit(ADMIN_LIMIT)
async def admin_verify_otp_route(request: Request, req: AdminOTPRequest):
    return await admin_verify_otp(req)


@router.get("/metrics", response_model=AdminMetrics)
@limiter.limit(API_LIMIT)
async def admin_metrics_route(request: Request, _: dict = Depends(get_admin_user)):
    return await get_admin_metrics()
