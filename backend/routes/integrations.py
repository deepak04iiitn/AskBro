from fastapi import APIRouter, Depends

from controllers.integrations_controller import (
    notion_connect,
    notion_disconnect,
    notion_import,
    notion_status,
)
from middleware.auth import get_current_user
from middleware.rbac import require_owner
from schemas.integrations import (
    NotionConnectRequest,
    NotionImportRequest,
    NotionImportResponse,
    NotionStatusResponse,
)
from schemas.user import CurrentUser

router = APIRouter(prefix="/integrations", tags=["integrations"])


@router.post("/notion/connect", response_model=dict)
async def connect(req: NotionConnectRequest, current_user: CurrentUser = Depends(get_current_user)):
    return await notion_connect(req, current_user)


@router.get("/notion/status", response_model=NotionStatusResponse)
async def status(current_user: CurrentUser = Depends(get_current_user)):
    return await notion_status(current_user)


@router.delete("/notion/disconnect", response_model=dict)
async def disconnect(current_user: CurrentUser = Depends(require_owner)):
    return await notion_disconnect(current_user)


@router.post("/notion/import", response_model=NotionImportResponse)
async def import_page(req: NotionImportRequest, current_user: CurrentUser = Depends(get_current_user)):
    return await notion_import(req, current_user)
