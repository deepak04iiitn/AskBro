"""
Rate limiting using slowapi (in-memory sliding window, keyed by client IP).

Limits are driven entirely from env vars:
  RATE_LIMIT_AUTH   login / create workspace / forgot-code
  RATE_LIMIT_ADMIN  admin login + OTP verify
  RATE_LIMIT_API    authenticated API reads

Document upload is never decorated — large files need time and the
user explicitly requested no upload interference.

Format: "<count>/<period>"  e.g. "30/minute", "5/second", "200/hour"
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

from config.env import settings

# Single shared instance — imported by main.py and route files
limiter = Limiter(key_func=get_remote_address)

AUTH_LIMIT  = settings.RATE_LIMIT_AUTH
ADMIN_LIMIT = settings.RATE_LIMIT_ADMIN
API_LIMIT   = settings.RATE_LIMIT_API
