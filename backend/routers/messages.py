"""Chat privado entre flogs: enviar (texto e/ou foto), conversas, thread e não lidas."""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from lib.db import db
from models.message import ConversationOut, MessageCreate, MessageOut, ThreadOut
from routers.auth import require_user
from routers.posts import _check_photo

router = APIRouter()


@router.post("/messages", response_model=MessageOut, status_code=201)
async def send_message(input: MessageCreate, me: dict = Depends(require_user)):
    other = await db.users.find_one({"username_lower": input.to_username.strip().lower()})
    if not other:
        raise HTTPException(status_code=404, detail="flog não encontrado")
    if other["id"] == me["id"]:
        raise HTTPException(status_code=400, detail="você não pode mandar recado pra si mesmo kk")
    photo_url = input.photo_url.strip() if input.photo_url else ""
    doc = {
        "id": uuid.uuid4().hex,
        "from_id": me["id"],
        "from_username": me["username"],
        "to_id": other["id"],
        "to_username": other["username"],
        "text": input.text.strip(),
        "photo_url": _check_photo(photo_url) if photo_url else None,
        "read": False,
        "created_at": datetime.now(timezone.utc),
    }
    await db.messages.insert_one(doc)
    return MessageOut(**doc)


@router.get("/messages/conversations", response_model=list[ConversationOut])
async def conversations(me: dict = Depends(require_user)):
    msgs = (
        await db.messages.find({"$or": [{"from_id": me["id"]}, {"to_id": me["id"]}]})
        .sort("created_at", -1)
        .to_list(3000)
    )
    convs: dict[str, dict] = {}
    for m in msgs:
        other = m["to_username"] if m["from_id"] == me["id"] else m["from_username"]
        c = convs.setdefault(
            other,
            {"last_text": m["text"] or "foto 📷", "last_at": m["created_at"], "unread": 0},
        )
        if m["to_id"] == me["id"] and not m.get("read", False):
            c["unread"] += 1
    out: list[ConversationOut] = []
    for other_username, c in convs.items():
        u = await db.users.find_one({"username_lower": other_username.lower()})
        if not u:
            continue
        out.append(
            ConversationOut(
                username=u["username"],
                display_name=u.get("display_name") or u["username"],
                avatar_url=u.get("avatar_url"),
                last_text=c["last_text"],
                last_at=c["last_at"],
                unread_count=c["unread"],
            )
        )
    out.sort(key=lambda x: x.last_at, reverse=True)
    return out


@router.get("/messages/with/{username}", response_model=ThreadOut)
async def thread(username: str, me: dict = Depends(require_user)):
    other = await db.users.find_one({"username_lower": username.lower()})
    if not other:
        raise HTTPException(status_code=404, detail="flog não encontrado")
    msgs = (
        await db.messages.find(
            {
                "$or": [
                    {"from_id": me["id"], "to_id": other["id"]},
                    {"from_id": other["id"], "to_id": me["id"]},
                ]
            }
        )
        .sort("created_at", 1)
        .to_list(1000)
    )
    # abrir a thread marca como lidas as mensagens que me foram enviadas
    await db.messages.update_many(
        {"from_id": other["id"], "to_id": me["id"], "read": False},
        {"$set": {"read": True}},
    )
    return ThreadOut(
        other=other["username"],
        display_name=other.get("display_name") or other["username"],
        avatar_url=other.get("avatar_url"),
        verified=other.get("verified", False),
        messages=[
            MessageOut(
                id=m["id"],
                from_username=m["from_username"],
                to_username=m["to_username"],
                text=m["text"],
                photo_url=m.get("photo_url"),
                created_at=m["created_at"],
            )
            for m in msgs
        ],
    )


@router.get("/messages/unread-count")
async def unread_count(me: dict = Depends(require_user)):
    return {"count": await db.messages.count_documents({"to_id": me["id"], "read": False})}