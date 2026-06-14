from cryptography.fernet import Fernet, InvalidToken

from config.env import settings


def _fernet(key: str | None = None) -> Fernet:
    raw = key or settings.NOTION_ENCRYPTION_KEY
    return Fernet(raw.encode() if isinstance(raw, str) else raw)


def _github_fernet() -> Fernet:
    key = settings.GITHUB_ENCRYPTION_KEY or settings.NOTION_ENCRYPTION_KEY
    return _fernet(key)


def encrypt_token(plaintext: str) -> str:
    return _fernet().encrypt(plaintext.encode()).decode()


def decrypt_token(ciphertext: str) -> str:
    try:
        return _fernet().decrypt(ciphertext.encode()).decode()
    except (InvalidToken, Exception) as exc:
        raise ValueError(
            "Could not decrypt the stored token. "
            "Please reconnect from the Integrations page."
        ) from exc


def encrypt_github_token(plaintext: str) -> str:
    return _github_fernet().encrypt(plaintext.encode()).decode()


def decrypt_github_token(ciphertext: str) -> str:
    try:
        return _github_fernet().decrypt(ciphertext.encode()).decode()
    except (InvalidToken, Exception) as exc:
        raise ValueError(
            "Could not decrypt the stored GitHub token. "
            "Please reconnect GitHub from the Integrations page."
        ) from exc
