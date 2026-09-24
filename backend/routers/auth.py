"""Auth: signup/login/logout/me. Sessions are httpOnly cookies — never tokens in JSON."""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from passlib.context import CryptContext

from lib.db import db
from models import LoginRequest, MeOut, SignupRequest

router = APIRouter()

SESSION_COOKIE = "flog_session"
SESSION_MAX_AGE = 30 * 86400  # 30 dias
_hash_ctx = CryptContext(schemes=["pbkdf2_sha256"])


def hash_password(plain: str) -> str:
    return _hash_ctx.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return _hash_ctx.verify(plain, hashed)
    except Exception:
        return False


async def current_user(request: Request) -> dict | None:
    """Resolve the session cookie to a user doc, or None."""
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        return None
    session = await db.sessions.find_one({"token": token})
    if not session:
        return None
    return await db.users.find_one({"id": session["user_id"]})


async def require_user(request: Request) -> dict:
    user = await current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="faça login para continuar")
    return user


def me_out(user: dict) -> MeOut:
    return MeOut(
        id=user["id"],
        username=user["username"],
        display_name=user.get("display_name") or user["username"],
        email=user.get("email", ""),
        avatar_url=user.get("avatar_url"),
        bio=user.get("bio", ""),
        is_owner=user.get("is_owner", False),
        verified=user.get("verified", False),
    )


async def _start_session(response: Response, user_id: str) -> None:
    token = uuid.uuid4().hex
    await db.sessions.insert_one(
        {"token": token, "user_id": user_id, "created_at": datetime.now(timezone.utc)}
    )
    response.set_cookie(
        SESSION_COOKIE,
        token,
        httponly=True,
        samesite="lax",
        path="/",
        max_age=SESSION_MAX_AGE,
    )


@router.post("/auth/signup", response_model=MeOut, status_code=201)
async def signup(input: SignupRequest, response: Response):
    username_lower = input.username.lower()
    if await db.users.find_one({"username_lower": username_lower}):
        raise HTTPException(status_code=409, detail="esse username já foi escolhido, tenta outro")
    user = {
        "id": uuid.uuid4().hex,
        "username": input.username,
        "username_lower": username_lower,
        "display_name": input.username,
        "email": input.email.lower(),
        "password_hash": hash_password(input.password),
        "avatar_url": (input.avatar_url or "").strip() or None,
        "bio": "",
        "is_owner": False,
        "created_at": datetime.now(timezone.utc),
    }
    await db.users.insert_one(user)
    await _start_session(response, user["id"])
    return me_out(user)


@router.post("/auth/login", response_model=MeOut)
async def login(input: LoginRequest, response: Response):
    user = await db.users.find_one({"username_lower": input.username.strip().lower()})
    if not user or not verify_password(input.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="username ou senha incorretos")
    await _start_session(response, user["id"])
    return me_out(user)


@router.post("/auth/logout", status_code=204)
async def logout(request: Request, response: Response):
    token = request.cookies.get(SESSION_COOKIE)
    if token:
        await db.sessions.delete_one({"token": token})
    response.delete_cookie(SESSION_COOKIE, path="/")


@router.get("/auth/me", response_model=MeOut)
async def me(user: dict = Depends(require_user)):
    return me_out(user)