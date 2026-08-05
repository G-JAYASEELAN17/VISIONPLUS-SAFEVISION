from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.db.database import get_db
from app.models.user import User

# auto_error=False: in DEV_MODE we want to allow requests with NO
# Authorization header at all to still reach get_current_user, where we
# short-circuit to the demo admin. Real-mode behavior (missing/invalid
# token -> 401) is preserved below.
bearer_scheme = HTTPBearer(auto_error=False)


def _get_or_create_dev_admin(db: Session) -> User:
    """Fetch (or lazily create) the standing Demo Administrator account
    used for DEV_MODE. Kept as a real row in the `users` table so every
    downstream query (chat history, audit trails, etc.) works normally."""
    user = db.query(User).filter(User.email == settings.DEV_ADMIN_EMAIL).first()
    if user:
        return user
    user = User(
        full_name=settings.DEV_ADMIN_NAME,
        email=settings.DEV_ADMIN_EMAIL,
        password=hash_password("dev-mode-no-login"),  # unusable random-ish password; login stays disabled by convention, not by this hash
        role="admin",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    # ── DEV MODE: bypass auth entirely, always resolve to the demo admin ──
    if settings.DEV_MODE:
        return _get_or_create_dev_admin(db)

    # ── Normal auth path (unchanged) ───────────────────────────────────────
    exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise exc

    token = credentials.credentials

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            raise exc
    except JWTError:
        raise exc

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise exc
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Role-gate for admin-only operations. `User.role` and JWT `role`
    claim already existed in the codebase but nothing actually checked
    them — this is the first real enforcement point. Applied to
    destructive routes (camera/video deletion) as the initial rollout;
    extend to more routes as needed.

    NOTE: in DEV_MODE the demo admin's role is "admin" (see
    _get_or_create_dev_admin), so this passes transparently in dev."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This action requires an administrator role",
        )
    return current_user
