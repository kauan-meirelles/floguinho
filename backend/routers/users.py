"""Users: busca, perfil com contadores (Fãs/Migos/Fotos), editar perfil, senha e follow."""

import re
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from lib.db import db
from models import ChangePasswordRequest, UpdateProfileRequest, UserPublic
from routers.auth import hash_password, me_out, require_user, verify_password

router = APIRouter()


async def _counts(user_id: str) -> tuple[int, int, int]:
    fans = await db.follows.count_documents({"following_id": user_id})
    migos = await db.follows.count_documents({"follower_id": user_id})
    fotos = await db.posts.count_documents({"user_id": user_id})
    return fans, migos, fotos


def _public(doc: dict, fans: int, migos: int, fotos: int, is_following: bool) -> UserPublic:
    return UserPublic(
        id=doc["id"],
        username=doc["username"],
        display_name=doc.get("display_name") or doc["username"],
        avatar_url=doc.get("avatar_url"),
        bio=doc.get("bio", ""),
        is_owner=doc.get("is_owner", False),
        verified=doc.get("verified", False),
        fans_count=fans,
        migos_count=migos,
        fotos_count=fotos,
        is_following=is_following,
    )


@router.get("/users", response_model=list[UserPublic])
async def list_users(q: str = "", me: dict = Depends(require_user)):
    query: dict = {}
    term = q.strip().lower()
    if term:
        esc = re.escape(term)
        query = {
            "$or": [
                {"username_lower": {"$regex": esc, "$options": "i"}},
                {"display_name": {"$regex": esc, "$options": "i"}},
            ]
        }
    docs = await db.users.find(query).to_list(300)
    following_ids = set(await db.follows.distinct("following_id", {"follower_id": me["id"]}))
    out = []
    for doc in docs:
        fans, migos, fotos = await _counts(doc["id"])
        out.append(_public(doc, fans, migos, fotos, doc["id"] in following_ids))
    out.sort(key=lambda u: (-u.fans_count, u.username.lower()))
    return out


@router.put("/users/me", response_model=dict)
async def update_me(input: UpdateProfileRequest, me: dict = Depends(require_user)):
    updates = input.model_dump(exclude_unset=True)
    if updates.get("avatar_url") == "":
        updates["avatar_url"] = None
    if updates:
        await db.users.update_one({"id": me["id"]}, {"$set": updates})
    doc = await db.users.find_one({"id": me["id"]})
    return me_out(doc).model_dump()


@router.post("/users/password")
async def change_password(input: ChangePasswordRequest, me: dict = Depends(require_user)):
    if not verify_password(input.current_password, me.get("password_hash", "")):
        raise HTTPException(status_code=400, detail="senha atual incorreta")
    await db.users.update_one(
        {"id": me["id"]}, {"$set": {"password_hash": hash_password(input.new_password)}}
    )
    return {"ok": True}


@router.get("/users/{username}", response_model=UserPublic)
async def get_profile(username: str, me: dict = Depends(require_user)):
    doc = await db.users.find_one({"username_lower": username.lower()})
    if not doc:
        raise HTTPException(status_code=404, detail="flog não encontrado")
    fans, migos, fotos = await _counts(doc["id"])
    is_following = bool(
        await db.follows.find_one({"follower_id": me["id"], "following_id": doc["id"]})
    )
    return _public(doc, fans, migos, fotos, is_following)


@router.post("/users/{username}/verify")
async def toggle_verify(username: str, me: dict = Depends(require_user)):
    """O dono da rede dá/tira o selinho de flog verificado."""
    if not me.get("is_owner", False):
        raise HTTPException(status_code=403, detail="só o dono da rede pode dar o selo")
    doc = await db.users.find_one({"username_lower": username.lower()})
    if not doc:
        raise HTTPException(status_code=404, detail="flog não encontrado")
    if doc["id"] == me["id"]:
        raise HTTPException(status_code=400, detail="o dono já nasce verificado kk")
    new_value = not doc.get("verified", False)
    await db.users.update_one({"id": doc["id"]}, {"$set": {"verified": new_value}})
    return {"verified": new_value}


@router.post("/users/{username}/follow", response_model=dict)
async def toggle_follow(username: str, me: dict = Depends(require_user)):
    doc = await db.users.find_one({"username_lower": username.lower()})
    if not doc:
        raise HTTPException(status_code=404, detail="flog não encontrado")
    if doc["id"] == me["id"]:
        raise HTTPException(status_code=400, detail="você não pode ser fã de si mesmo kk")
    existing = await db.follows.find_one({"follower_id": me["id"], "following_id": doc["id"]})
    if existing:
        await db.follows.delete_one({"_id": existing["_id"]})
        following = False
    else:
        await db.follows.insert_one(
            {
                "id": uuid.uuid4().hex,
                "follower_id": me["id"],
                "following_id": doc["id"],
                "created_at": datetime.now(timezone.utc),
            }
        )
        following = True
    fans = await db.follows.count_documents({"following_id": doc["id"]})
    return {"following": following, "fans_count": fans}