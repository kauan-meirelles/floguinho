"""Posts: feed, criar foto, curtir, recados (comentários) e apagar."""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from lib.db import db
from models import CommentCreate, CommentOut, LikeOut, PostCreate, PostOut
from routers.auth import require_user

router = APIRouter()

ALLOWED_PHOTO_PREFIXES = ("https://", "http://", "/api/uploads/", "data:image/")


def _check_photo(url: str) -> str:
    url = url.strip()
    if not any(url.startswith(prefix) for prefix in ALLOWED_PHOTO_PREFIXES):
        raise HTTPException(status_code=400, detail="URL da foto inválida (use upload ou link http(s))")
    return url


async def _hydrate(docs: list[dict], me_id: str) -> list[PostOut]:
    if not docs:
        return []
    post_ids = [d["id"] for d in docs]
    author_ids = list({d["user_id"] for d in docs})
    verified_by_author = {
        u["id"]: u.get("verified", False)
        for u in await db.users.find({"id": {"$in": author_ids}}, {"id": 1, "verified": 1}).to_list(200)
    }
    comments = (
        await db.comments.find({"post_id": {"$in": post_ids}}).sort("created_at", 1).to_list(5000)
    )
    by_post: dict[str, list[CommentOut]] = {}
    for c in comments:
        by_post.setdefault(c["post_id"], []).append(
            CommentOut(
                id=c["id"],
                post_id=c["post_id"],
                user_id=c["user_id"],
                username=c["username"],
                display_name=c.get("display_name") or c["username"],
                avatar_url=c.get("avatar_url"),
                text=c["text"],
                created_at=c["created_at"] or datetime.now(timezone.utc),
            )
        )
    out = []
    for d in docs:
        liked_by = d.get("liked_by", [])
        p_url = d.get("photo_url") or d.get("image_url") or ""
        out.append(
            PostOut(
                id=d["id"],
                user_id=d["user_id"],
                username=d["username"],
                display_name=d.get("display_name") or d["username"],
                avatar_url=d.get("avatar_url"),
                photo_url=p_url,
                caption=d.get("caption", ""),
                filter_name=d.get("filter_name", "normal"),
                is_owner=d.get("is_owner", False),
                verified=verified_by_author.get(d["user_id"], False),
                created_at=d["created_at"] or datetime.now(timezone.utc),
                likes_count=len(liked_by),
                liked_by_me=me_id in liked_by,
                comments=by_post.get(d["id"], []),
            )
        )
    out.sort(key=lambda x: x.created_at, reverse=True)
    return out


@router.get("/posts", response_model=list[PostOut])
async def feed(username: str = "", skip: int = 0, limit: int = 20, me: dict = Depends(require_user)):
    try:
        query = {"username_lower": username.lower()} if username else {}
        docs = (
            await db.posts.find(query)
            .sort("created_at", -1)
            .skip(max(0, skip))
            .limit(min(max(1, limit), 50))
            .to_list(50)
        )
        return await _hydrate(docs, me["id"])
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/posts", response_model=PostOut, status_code=201)
async def create_post(input: PostCreate, me: dict = Depends(require_user)):
    doc = {
        "id": uuid.uuid4().hex,
        "user_id": me["id"],
        "username": me["username"],
        "username_lower": me["username_lower"],
        "display_name": me.get("display_name") or me["username"],
        "avatar_url": me.get("avatar_url"),
        "photo_url": _check_photo(input.photo_url),
        "caption": (input.caption or "").strip(),
        "filter_name": input.filter_name,
        "is_owner": me.get("is_owner", False),
        "liked_by": [],
        "created_at": datetime.now(timezone.utc),
    }
    await db.posts.insert_one(doc)
    return (await _hydrate([doc], me["id"]))[0]


@router.get("/posts/{post_id}", response_model=PostOut)
async def get_post(post_id: str, me: dict = Depends(require_user)):
    doc = await db.posts.find_one({"id": post_id})
    if not doc:
        raise HTTPException(status_code=404, detail="foto não encontrada")
    return (await _hydrate([doc], me["id"]))[0]


@router.post("/posts/{post_id}/like", response_model=LikeOut)
async def toggle_like(post_id: str, me: dict = Depends(require_user)):
    doc = await db.posts.find_one({"id": post_id})
    if not doc:
        raise HTTPException(status_code=404, detail="foto não encontrada")
    liked_by = doc.get("liked_by", [])
    liked = me["id"] in liked_by
    if liked:
        await db.posts.update_one({"id": post_id}, {"$pull": {"liked_by": me["id"]}})
    else:
        await db.posts.update_one({"id": post_id}, {"$addToSet": {"liked_by": me["id"]}})
    return LikeOut(liked=not liked, likes_count=len(liked_by) + (-1 if liked else 1))


@router.post("/posts/{post_id}/comments", response_model=CommentOut, status_code=201)
async def add_comment(post_id: str, input: CommentCreate, me: dict = Depends(require_user)):
    post = await db.posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="foto não encontrada")
    comment = {
        "id": uuid.uuid4().hex,
        "post_id": post_id,
        "user_id": me["id"],
        "username": me["username"],
        "display_name": me.get("display_name") or me["username"],
        "avatar_url": me.get("avatar_url"),
        "text": input.text.strip(),
        "created_at": datetime.now(timezone.utc),
    }
    await db.comments.insert_one(comment)
    return CommentOut(
        id=comment["id"],
        post_id=comment["post_id"],
        user_id=comment["user_id"],
        username=comment["username"],
        display_name=comment["display_name"],
        avatar_url=comment["avatar_url"],
        text=comment["text"],
        created_at=comment["created_at"],
    )


@router.delete("/posts/{post_id}", status_code=204)
async def delete_post(post_id: str, me: dict = Depends(require_user)):
    doc = await db.posts.find_one({"id": post_id})
    if not doc:
        raise HTTPException(status_code=404, detail="foto não encontrada")
    if doc["user_id"] != me["id"]:
        raise HTTPException(status_code=403, detail="só o dono do flog pode apagar essa foto")
    await db.posts.delete_one({"id": post_id})
    await db.comments.delete_many({"post_id": post_id})