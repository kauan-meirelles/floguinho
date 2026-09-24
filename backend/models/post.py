"""Post/comment models — keep the TS mirrors in frontend/src/lib/types.ts in sync."""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class CommentCreate(BaseModel):
    text: str = Field(min_length=1, max_length=300)


class CommentOut(BaseModel):
    id: str
    user_id: str
    username: str
    avatar_url: Optional[str] = None
    text: str
    created_at: datetime


class PostCreate(BaseModel):
    photo_url: str = Field(min_length=1, max_length=1000)
    caption: str = Field(default="", max_length=500)
    filter_name: str = Field(default="normal", max_length=30)


class PostOut(BaseModel):
    id: str
    user_id: str
    username: str
    avatar_url: Optional[str] = None
    photo_url: str
    caption: str = ""
    filter_name: str = "normal"
    is_owner: bool = False
    verified: bool = False
    created_at: datetime
    likes_count: int = 0
    liked_by_me: bool = False
    comments: List[CommentOut] = []


class LikeOut(BaseModel):
    liked: bool
    likes_count: int


class FollowOut(BaseModel):
    following: bool
    fans_count: int


class UploadOut(BaseModel):
    url: str
