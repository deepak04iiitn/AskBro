from fastapi import APIRouter, Depends, Form, Query, Response, UploadFile
from fastapi import File as FastAPIFile

from controllers.document_controller import (
    delete_document,
    get_document_status,
    list_documents,
    upload_document,
)
from middleware.auth import get_current_user
from schemas.document import (
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
    status: str | None = Query(default=None, description="Filter by status"),
    tags: list[str] | None = Query(default=None, description="Filter by tags (AND match)"),
    uploaded_by: str | None = Query(default=None, description="Filter by uploader user ID"),
    limit: int = Query(default=50, ge=1, le=200, description="Max results to return"),
    offset: int = Query(default=0, ge=0, description="Number of results to skip"),
    current_user: CurrentUser = Depends(get_current_user),
):
    return await list_documents(
        current_user,
        status_filter=status,
        tags=tags,
        uploaded_by=uploaded_by,
        limit=limit,
        offset=offset,
    )


@router.get("/{document_id}/status", response_model=DocumentStatusResponse)
async def status_route(
    document_id: str,
    current_user: CurrentUser = Depends(get_current_user),
):
    return await get_document_status(document_id, current_user)


@router.delete("/{document_id}", status_code=204)
async def delete_route(
    document_id: str,
    current_user: CurrentUser = Depends(get_current_user),
):
    await delete_document(document_id, current_user)
    return Response(status_code=204)
