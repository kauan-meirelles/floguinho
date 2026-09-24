"""Multipart uploads → backend/uploads/, servidos de volta em /api/uploads/{name}."""

import re
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from fastapi.responses import FileResponse

from models import UploadOut
from routers.auth import require_user

router = APIRouter()

UPLOADS_DIR = Path(__file__).resolve().parent.parent / "uploads"
MAX_BYTES = 10 * 1024 * 1024  # 10MB
ALLOWED_TYPES = {"image/jpeg": ".jpg", "image/png": ".png", "image/gif": ".gif", "image/webp": ".webp"}
SAFE_NAME = re.compile(r"^[a-f0-9]{32}\.(jpg|png|gif|webp)$")


@router.post("/uploads", response_model=UploadOut)
async def upload(file: UploadFile, me: dict = Depends(require_user)):
    ext = ALLOWED_TYPES.get(file.content_type or "")
    if not ext:
        raise HTTPException(status_code=400, detail="só aceitamos jpg, png, gif ou webp")
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="arquivo vazio")
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="arquivo grande demais (máx 10MB)")
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    name = uuid.uuid4().hex + ext
    (UPLOADS_DIR / name).write_bytes(data)
    return UploadOut(url=f"/api/uploads/{name}")


@router.get("/uploads/{name}")
async def serve_upload(name: str):
    if not SAFE_NAME.match(name):
        raise HTTPException(status_code=404, detail="arquivo não encontrado")
    path = UPLOADS_DIR / name
    if not path.is_file():
        raise HTTPException(status_code=404, detail="arquivo não encontrado")
    return FileResponse(path)