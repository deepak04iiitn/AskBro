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


async def send_new_testimonial_email(
    name: str,
    role: str,
    quote: str,
    stars: int,
) -> bool:
    """Notify the admin that a new testimonial is waiting for moderation."""
    star_html = "★" * stars + "☆" * (5 - stars)
    admin_url = f"{settings.FRONTEND_URL}/admin/dashboard/testimonials"
    payload = {
        "from": "AskBro <onboarding@resend.dev>",
        "to": [settings.ADMIN_EMAIL],
        "subject": f"New Testimonial Submitted — {name}",
        "html": f"""
        <div style="font-family:sans-serif;max-width:540px;margin:auto;padding:32px;background:#f7f5f2;">
          <!-- Header bar -->
          <div style="background:#111111;padding:14px 20px;margin-bottom:0;">
            <span style="color:#CC0000;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">
              ◆ AskBro Admin
            </span>
          </div>

          <!-- Red accent line -->
          <div style="height:4px;background:#CC0000;margin-bottom:24px;"></div>

          <!-- Headline -->
          <h2 style="color:#111111;font-size:22px;font-weight:800;margin:0 0 4px 0;letter-spacing:-0.5px;">
            New Testimonial Awaiting Review
          </h2>
          <p style="color:#737373;font-size:13px;margin:0 0 24px 0;">
            Someone just shared their experience with AskBro. Approve or reject it from the admin panel.
          </p>

          <!-- Testimonial card -->
          <div style="background:#ffffff;border:2px solid #111111;padding:24px;margin-bottom:24px;">
            <!-- Stars -->
            <div style="font-size:18px;color:#CC0000;letter-spacing:2px;margin-bottom:14px;">{star_html}</div>

            <!-- Quote -->
            <p style="color:#111111;font-size:15px;line-height:1.7;font-style:italic;margin:0 0 20px 0;padding-left:12px;border-left:3px solid #CC0000;">
              "{quote}"
            </p>

            <!-- Author -->
            <table style="border-collapse:collapse;width:100%;border-top:1px solid #E5E5E0;padding-top:14px;">
              <tr>
                <td style="padding-top:14px;">
                  <div style="display:inline-block;background:#111111;color:#F9F9F7;font-size:12px;font-weight:700;padding:6px 10px;letter-spacing:1px;margin-bottom:6px;">
                    {name[:2].upper()}
                  </div>
                  <p style="margin:4px 0 0 0;font-size:14px;font-weight:700;color:#111111;">{name}</p>
                  <p style="margin:2px 0 0 0;font-size:11px;color:#737373;text-transform:uppercase;letter-spacing:1.5px;">{role}</p>
                </td>
              </tr>
            </table>
          </div>

          <!-- CTA button -->
          <div style="text-align:center;margin-bottom:28px;">
            <a href="{admin_url}"
               style="display:inline-block;background:#CC0000;color:#ffffff;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:12px 28px;text-decoration:none;border:2px solid #CC0000;">
              Review in Admin Panel →
            </a>
          </div>

          <!-- Footer -->
          <div style="border-top:2px solid #111111;padding-top:14px;">
            <p style="color:#AEABA6;font-size:11px;margin:0;">
              This is an automated notification from AskBro. Only you receive this.
            </p>
          </div>
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
        logger.error("Failed to send new-testimonial email", error=str(exc), submitter=name)
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
