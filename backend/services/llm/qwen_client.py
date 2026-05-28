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

_CHAT_PATH = "/chat/completions"


def _longest_partial_prefix(text: str, tag: str) -> int:
    """Return the length of the longest suffix of *text* that is a prefix of *tag*.

    Used to detect a tag that was split across two consecutive SSE tokens so we
    can buffer the ambiguous tail and re-evaluate on the next token.
    """
    for n in range(min(len(tag) - 1, len(text)), 0, -1):
        if tag.startswith(text[-n:]):
            return n
    return 0


async def stream_completion(
    user_message: str,
    system_prompt: str,
) -> AsyncGenerator[str, None]:
    """
    Yield text tokens from the LLM as they stream in, with <think> blocks stripped.

    Qwen3 (and similar reasoning models) prepend a <think>…</think> block to
    every response.  Those tokens are internal chain-of-thought and must not be
    shown to users.  We filter them out here via a lightweight state machine that
    handles tags split across consecutive SSE tokens.

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

    in_think = False   # currently inside a <think> block
    tag_buf = ""       # partial tag chars held over from the previous token

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
                    if not token:
                        continue
                except (json.JSONDecodeError, KeyError, IndexError):
                    logger.warning("Malformed SSE chunk", raw=data)
                    continue

                # Prepend any buffered partial-tag bytes from the last iteration
                text = tag_buf + token
                tag_buf = ""
                out: list[str] = []

                while text:
                    if in_think:
                        close = text.find("</think>")
                        if close >= 0:
                            in_think = False
                            text = text[close + len("</think>"):]
                            # Drop leading newlines that follow the think block
                            text = text.lstrip("\n")
                        else:
                            # Buffer a possible partial </think> at the tail
                            partial = _longest_partial_prefix(text, "</think>")
                            if partial:
                                tag_buf = text[-partial:]
                            text = ""   # discard think-block content
                    else:
                        open_pos = text.find("<think>")
                        if open_pos >= 0:
                            out.append(text[:open_pos])
                            in_think = True
                            text = text[open_pos + len("<think>"):]
                        else:
                            partial = _longest_partial_prefix(text, "<think>")
                            if partial:
                                out.append(text[:-partial])
                                tag_buf = text[-partial:]
                            else:
                                out.append(text)
                            text = ""

                result = "".join(out)
                if result:
                    yield result

    # If the stream ended while still inside a think block the model was cut off
    # before it could produce an answer (token budget exhausted mid-think).
    if in_think:
        logger.warning("Stream ended inside <think> block — model ran out of tokens")
        yield "⚠ The model ran out of space while reasoning. Try a shorter question or increase LLM_MAX_TOKENS."
