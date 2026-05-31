"""Thin wrapper around the Resend REST API for sending transactional email."""

import httpx
from config.env import settings
from utils.logger import get_logger

logger = get_logger(__name__)


async def send_otp_email(to_email: str, otp: str) -> bool:
    """Send a 6-digit OTP to the given address. Returns True on success."""
    payload = {
        "from": "AskBro Admin <onboarding@resend.dev>",
        "to": [to_email],
        "subject": "Your AskBro Admin OTP",
        "html": f"""
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#f7f5f2;border-radius:12px;">
          <h2 style="color:#111110;margin-bottom:8px;">AskBro Admin Login</h2>
          <p style="color:#4a4845;">Your one-time password is:</p>
          <div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#4361ee;margin:24px 0;text-align:center;">
            {otp}
          </div>
          <p style="color:#7a7874;font-size:13px;">This OTP expires in 5 minutes. Do not share it.</p>
        </div>
        """,
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                "https://api.resend.com/emails",
                json=payload,
                headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
            )
            resp.raise_for_status()
            return True
    except Exception as exc:
        logger.error("Failed to send OTP email", error=str(exc), to=to_email)
        return False
