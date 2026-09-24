from pydantic import BaseModel
from datetime import datetime

class StatusCheck(BaseModel):
    id: str | None = None
    status: str
    timestamp: datetime | None = None

class SignupRequest(BaseModel):
    username: str
    email: str
    password: str
    avatar_url: str | None = None

class LoginRequest(BaseModel):
    username: str
    password: str

class MeOut(BaseModel):
    id: str
    username: str
    display_name: str
    email: str
    avatar_url: str | None = None
    bio: str
    is_owner: bool

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

class UpdateProfileRequest(BaseModel):
    display_name: str | None = None
    bio: str | None = None
    avatar_url: str | None = None

class UserPublic(BaseModel):
    id: str
    username: str
    display_name: str
    avatar_url: str | None = None
    bio: str | None = None
    is_owner: bool = False
    fans_count: int = 0
    migos_count: int = 0
    fotos_count: int = 0
    is_following: bool = False
    created_at: datetime | None = None

class PostCreate(BaseModel):
    caption: str | None = None
    photo_url: str
    filter_name: str = "normal"

class CommentCreate(BaseModel):
    text: str

class CommentOut(BaseModel):
    id: str
    post_id: str
    user_id: str
    username: str
    display_name: str
    avatar_url: str | None = None
    text: str
    created_at: datetime

class PostOut(BaseModel):
    id: str
    user_id: str
    username: str
    display_name: str
    avatar_url: str | None = None
    photo_url: str
    caption: str | None = None
    filter_name: str = "normal"
    is_owner: bool = False
    created_at: datetime
    likes_count: int
    liked_by_me: bool
    comments: list[CommentOut] = []

class LikeOut(BaseModel):
    liked: bool
    likes_count: int

class UploadOut(BaseModel):
    url: str