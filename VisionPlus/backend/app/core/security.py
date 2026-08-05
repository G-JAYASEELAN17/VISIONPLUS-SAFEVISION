from datetime import datetime, timedelta

import bcrypt
from jose import jwt

from app.core.config import settings

# NOTE: passlib's CryptContext is unmaintained and breaks on bcrypt>=4.0
# (passlib expects bcrypt.__about__.__version__, which newer bcrypt removed).
# We call bcrypt directly instead, which is the currently-recommended fix.
_BCRYPT_MAX_BYTES = 72  # bcrypt silently ignores/truncates beyond this


def hash_password(password: str) -> str:
    pw_bytes = password.encode("utf-8")[:_BCRYPT_MAX_BYTES]
    return bcrypt.hashpw(pw_bytes, bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    pw_bytes = plain.encode("utf-8")[:_BCRYPT_MAX_BYTES]
    try:
        return bcrypt.checkpw(pw_bytes, hashed.encode("utf-8"))
    except ValueError:
        return False


def create_access_token(data: dict) -> str:
    payload = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload.update({"exp": expire})
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
