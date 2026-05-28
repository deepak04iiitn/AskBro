from fastapi import APIRouter, Depends, Form, UploadFile
from fastapi import File as FastAPIFile

from controllers.document_controller import (
    delete_document,
    get_document_status,
    list_documents,
    upload_document,
)
from middleware.auth import get_current_user
from schemas.document import (
    DocumentDeleteResponse,
    DocumentListItem,
    DocumentStatusResponse,
    DocumentUploadResponse,
)
from schemas.user import CurrentUser

router = APIRouter(prefix="/documents")


@router.post("/upload", response_model=DocumentUploadResponse, status_code=202)
async def upload_route(
    file: UploadFile = FastAPIFile(...),
    tags: str = Form(default=""),
    current_user: CurrentUser = Depends(get_current_user),
):
    return await upload_document(file, tags, current_user)


@router.get("", response_model=list[DocumentListItem])
async def list_route(
    status: str | None = None,
    current_user: CurrentUser = Depends(get_current_user),
):
    return await list_documents(current_user, status_filter=status)


@router.get("/{document_id}/status", response_model=DocumentStatusResponse)
async def status_route(
    document_id: str,
    current_user: CurrentUser = Depends(get_current_user),
):
    return await get_document_status(document_id, current_user)


@router.delete("/{document_id}", response_model=DocumentDeleteResponse)
async def delete_route(
    document_id: str,
    current_user: CurrentUser = Depends(get_current_user),
):
    return await delete_document(document_id, current_user)
