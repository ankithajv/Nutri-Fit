from __future__ import annotations

import bcrypt
from datetime import datetime, timedelta, timezone
from typing import Any
from jose import JWTError, jwt
from config import settings

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a bcrypt hash."""
    try:
        pw_bytes = plain_password.encode("utf-8")[:72]
        hash_bytes = hashed_password.encode("utf-8") if isinstance(hashed_password, str) else hashed_password
        return bcrypt.checkpw(pw_bytes, hash_bytes)
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt."""
    pw_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pw_bytes, salt).decode("utf-8")

def create_access_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    """Generate a JWT token with subject and expiration."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> dict[str, Any] | None:
    """Decode and validate a JWT access token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
