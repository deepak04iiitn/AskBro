"""
File validation before accepting uploads.

Checks are applied in order — fail fast on the cheapest check first:
  1. Extension allowed
  2. File size within limit
  3. MIME type matches extension (guards against renamed files)
"""

import os

from fastapi import HTTPException, UploadFile

from config.env import settings

# Maps allowed extensions to their valid MIME types
_ALLOWED_MIME_TYPES: dict[str, list[str]] = {
    "pdf":  ["application/pdf"],
    "docx": [
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
    ],
    "md":   ["text/plain", "text/markdown", "text/x-markdown"],
    "txt":  ["text/plain"],
}


def _get_extension(filename: str) -> str:
    return os.path.splitext(filename)[-1].lstrip(".").lower()


def validate_upload(file: UploadFile, size_bytes: int) -> str:
    """
    Validate an uploaded file. Returns the normalised extension on success.
    Raises HTTPException 400 on any validation failure.

    Args:
        file:       The FastAPI UploadFile object.
        size_bytes: Actual byte count of the file (read before calling this).
    """
    filename = file.filename or ""
    ext = _get_extension(filename)

    # 1. Extension check
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type '.{ext}' is not allowed. Accepted: {settings.ALLOWED_EXTENSIONS}",
        )

    # 2. Size check
    if size_bytes > settings.MAX_UPLOAD_SIZE_BYTES:
        max_mb = settings.MAX_UPLOAD_SIZE_MB
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds the {max_mb}MB size limit ({size_bytes / 1_048_576:.1f}MB uploaded).",
        )

    # 3. MIME type check (guards against e.g. an .exe renamed to .pdf)
    content_type = (file.content_type or "").split(";")[0].strip().lower()
    allowed_mimes = _ALLOWED_MIME_TYPES.get(ext, [])
    if allowed_mimes and content_type not in allowed_mimes:
        raise HTTPException(
            status_code=400,
            detail=(
                f"MIME type '{content_type}' does not match the expected type for '.{ext}'. "
                f"Expected one of: {allowed_mimes}"
            ),
        )

    return ext
