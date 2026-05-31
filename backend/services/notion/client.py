"""Notion REST API client — uses httpx, no SDK."""

import httpx
from utils.logger import get_logger

logger = get_logger(__name__)

NOTION_API = "https://api.notion.com/v1"
NOTION_VERSION = "2022-06-28"


def _headers(token: str) -> dict:
    return {
        "Authorization": f"Bearer {token}",
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
    }


async def verify_token(token: str) -> dict:
    """Call /users/me — returns bot info or raises httpx.HTTPStatusError."""
    async with httpx.AsyncClient(timeout=10) as c:
        r = await c.get(f"{NOTION_API}/users/me", headers=_headers(token))
        r.raise_for_status()
        return r.json()


async def get_page(token: str, page_id: str) -> dict:
    async with httpx.AsyncClient(timeout=10) as c:
        r = await c.get(f"{NOTION_API}/pages/{page_id}", headers=_headers(token))
        r.raise_for_status()
        return r.json()


async def get_blocks(token: str, block_id: str, cursor: str | None = None) -> dict:
    params: dict = {"page_size": 100}
    if cursor:
        params["start_cursor"] = cursor
    async with httpx.AsyncClient(timeout=15) as c:
        r = await c.get(
            f"{NOTION_API}/blocks/{block_id}/children",
            headers=_headers(token),
            params=params,
        )
        r.raise_for_status()
        return r.json()
