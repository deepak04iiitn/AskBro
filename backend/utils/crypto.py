from cryptography.fernet import Fernet, InvalidToken

from config.env import settings


def _fernet() -> Fernet:
    key = settings.NOTION_ENCRYPTION_KEY
    return Fernet(key.encode() if isinstance(key, str) else key)


def encrypt_token(plaintext: str) -> str:
    return _fernet().encrypt(plaintext.encode()).decode()


def decrypt_token(ciphertext: str) -> str:
    try:
        return _fernet().decrypt(ciphertext.encode()).decode()
    except (InvalidToken, Exception) as exc:
        raise ValueError(
            "Could not decrypt the stored Notion token. "
            "Please reconnect Notion from the Integrations page."
        ) from exc
