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


async def send_forgot_code_email(
    requester_email: str,
    workspace_name: str,
    workspace_code: str,
) -> bool:
    """Notify the admin that an owner requested their workspace code."""
    payload = {
        "from": "AskBro <onboarding@resend.dev>",
        "to": [settings.ADMIN_EMAIL],
        "subject": f"Workspace Code Request — {workspace_name}",
        "html": f"""
        <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;background:#f7f5f2;border-radius:12px;">
          <h2 style="color:#111110;margin-bottom:6px;">Workspace Code Request</h2>
          <p style="color:#7a7874;font-size:13px;margin-bottom:24px;">
            A workspace owner has requested their workspace code via AskBro.
          </p>

          <table style="width:100%;border-collapse:collapse;background:white;border-radius:8px;overflow:hidden;border:1px solid #e3e1dc;">
            <tr style="border-bottom:1px solid #e3e1dc;">
              <td style="padding:12px 16px;font-size:12px;color:#7a7874;font-weight:600;width:40%;">Requester Email</td>
              <td style="padding:12px 16px;font-size:13px;color:#111110;font-weight:600;">{requester_email}</td>
            </tr>
            <tr style="border-bottom:1px solid #e3e1dc;">
              <td style="padding:12px 16px;font-size:12px;color:#7a7874;font-weight:600;">Workspace</td>
              <td style="padding:12px 16px;font-size:13px;color:#111110;">{workspace_name}</td>
            </tr>
            <tr>
              <td style="padding:12px 16px;font-size:12px;color:#7a7874;font-weight:600;">Workspace Code</td>
              <td style="padding:12px 16px;font-size:15px;color:#4361ee;font-weight:700;letter-spacing:2px;">{workspace_code}</td>
            </tr>
          </table>

          <p style="color:#7a7874;font-size:12px;margin-top:20px;">
            Please reply to <strong>{requester_email}</strong> with their workspace code.
          </p>
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
        logger.error("Failed to send forgot-code email", error=str(exc), requester=requester_email)
        return False
