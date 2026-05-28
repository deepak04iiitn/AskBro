"""
Async streaming client for Qwen3-32B served via vLLM's OpenAI-compatible API.

Uses httpx with server-sent events (SSE) parsing so tokens are yielded
to the caller as they arrive — zero buffering delay.
"""

import json
from typing import AsyncGenerator

import httpx

from config.env import settings
from utils.logger import get_logger

logger = get_logger(__name__)

_CHAT_PATH = "/v1/chat/completions"


async def stream_completion(
    user_message: str,
    system_prompt: str,
) -> AsyncGenerator[str, None]:
    """
    Yield text tokens from the LLM as they stream in.

    Raises:
        httpx.TimeoutException: if the model takes longer than LLM_TIMEOUT_SECONDS.
        httpx.HTTPStatusError: on 4xx/5xx responses from the LLM server.
    """
    payload = {
        "model": settings.LLM_MODEL_NAME,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        "max_tokens": settings.LLM_MAX_TOKENS,
        "temperature": settings.LLM_TEMPERATURE,
        "stream": True,
    }

    headers = {
        "Authorization": f"Bearer {settings.LLM_API_KEY}",
        "Content-Type": "application/json",
    }

    url = settings.LLM_BASE_URL.rstrip("/") + _CHAT_PATH

    async with httpx.AsyncClient(timeout=settings.LLM_TIMEOUT_SECONDS) as client:
        async with client.stream("POST", url, json=payload, headers=headers) as resp:
            resp.raise_for_status()
            async for raw_line in resp.aiter_lines():
                line = raw_line.strip()
                if not line or not line.startswith("data:"):
                    continue

                data = line[len("data:"):].strip()
                if data == "[DONE]":
                    return

                try:
                    chunk = json.loads(data)
                    delta = chunk["choices"][0]["delta"]
                    token = delta.get("content", "")
                    if token:
                        yield token
                except (json.JSONDecodeError, KeyError, IndexError):
                    logger.warning("Malformed SSE chunk", raw=data)
                    continue
