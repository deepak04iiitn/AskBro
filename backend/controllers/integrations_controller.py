"""Integrations controller — Notion."""

import re
from fastapi import HTTPException, status
from beanie import PydanticObjectId

from models.notion_integration import NotionIntegration
from schemas.integrations import (
    NotionConnectRequest,
    NotionImportRequest,
    NotionImportResponse,
    NotionStatusResponse,
)
from schemas.user import CurrentUser
from services.notion.client import get_blocks, get_page, verify_token
from services.notion.converter import block_to_md, extract_page_id, page_title
from utils.crypto import decrypt_token, encrypt_token
from utils.logger import get_logger

logger = get_logger(__name__)


async def notion_connect(req: NotionConnectRequest, current_user: CurrentUser) -> dict:
    token = req.token.strip()
    try:
        info = await verify_token(token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Notion token. Check you copied it correctly.",
        )

    ws_id = PydanticObjectId(current_user.workspace_id)
    bot_id = info.get("bot", {}).get("id") or info.get("id", "unknown")
    ws_name = (
        info.get("bot", {}).get("workspace_name")
        or info.get("name", "Notion Workspace")
    )

    encrypted = encrypt_token(token)
    existing = await NotionIntegration.find_one(NotionIntegration.workspace_id == ws_id)
    if existing:
        existing.notion_token = encrypted
        existing.bot_id = bot_id
        existing.workspace_name = ws_name
        await existing.save()
    else:
        await NotionIntegration(
            workspace_id=ws_id,
            notion_token=encrypted,
            bot_id=bot_id,
            workspace_name=ws_name,
        ).insert()

    logger.info("Notion connected", workspace_id=str(ws_id), ws_name=ws_name)
    return {"message": "Notion connected.", "workspace_name": ws_name}


async def notion_status(current_user: CurrentUser) -> NotionStatusResponse:
    ws_id = PydanticObjectId(current_user.workspace_id)
    rec = await NotionIntegration.find_one(NotionIntegration.workspace_id == ws_id)
    if not rec:
        return NotionStatusResponse(connected=False)
    return NotionStatusResponse(
        connected=True,
        workspace_name=rec.workspace_name,
        bot_id=rec.bot_id,
        connected_at=rec.connected_at,
    )


async def notion_disconnect(current_user: CurrentUser) -> dict:
    ws_id = PydanticObjectId(current_user.workspace_id)
    rec = await NotionIntegration.find_one(NotionIntegration.workspace_id == ws_id)
    if rec:
        await rec.delete()
    return {"message": "Notion disconnected."}


async def notion_import(req: NotionImportRequest, current_user: CurrentUser) -> NotionImportResponse:
    ws_id = PydanticObjectId(current_user.workspace_id)
    rec = await NotionIntegration.find_one(NotionIntegration.workspace_id == ws_id)
    if not rec:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Notion is not connected. Connect it from the Integrations panel first.",
        )

    page_id = extract_page_id(req.page_url)
    if not page_id:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not extract a page ID from that URL. Make sure it is a valid Notion page link.",
        )

    try:
        plain_token = decrypt_token(rec.notion_token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    try:
        page = await get_page(plain_token, page_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                "Could not fetch the page. Make sure you have shared it with your AskBro integration: "
                "open the page in Notion → ⋯ menu → Add connections → select your integration."
            ),
        )

    title = page_title(page)
    lines: list[str] = [f"# {title}", ""]

    async def fetch_blocks(block_id: str, depth: int = 0) -> None:
        cursor = None
        while True:
            data = await get_blocks(plain_token, block_id, cursor)
            for blk in data.get("results", []):
                md = block_to_md(blk, depth)
                if md.strip():
                    lines.append(md)
                if blk.get("has_children"):
                    await fetch_blocks(blk["id"], depth + 1)
            if not data.get("has_more"):
                break
            cursor = data.get("next_cursor")

    await fetch_blocks(page_id)

    content = "\n".join(lines)
    safe_name = re.sub(r"[^\w\s\-]", "", req.file_name.strip()).strip() or title
    file_name = f"{safe_name}.md"

    return NotionImportResponse(
        file_name=file_name,
        content=content,
        page_title=title,
        char_count=len(content),
    )
