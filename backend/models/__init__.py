from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

class StatusCheck(BaseModel):
    status: str = "ok"
    timestamp: datetime

# Esquemas de Autenticação
class SignupRequest(BaseModel):
    username: str
    display_name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

class MeOut(BaseModel):
    id: str
    username: str
    display_name: str
    email: str
    avatar_url: str | None = None
    bio: str | None = None
    is_owner: bool = False
    verified: bool = False

# Esquemas de Perfil e Utilizadores
class UserPublic(BaseModel):
    id: str
    username: str
    display_name: str
    avatar_url: str | None = None
    bio: str | None = None
    is_owner: bool = False
    verified: bool = False
    fans_count: int = 0
    migos_count: int = 0
    fotos_count: int = 0
    is_following: bool = False

class UpdateProfileRequest(BaseModel):
    display_name: str | None = None
    bio: str | None = None
    avatar_url: str | None = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

# Esquemas de Posts e Comentários
class PostCreate(BaseModel):
    photo_url: str
    caption: str
    filter_name: str = "normal"

class PostOut(BaseModel):
    id: str
    user_id: str
    username: str
    display_name: str | None = None
    avatar_url: str | None = None
    photo_url: str
    caption: str
    filter_name: str
    is_owner: bool = False
    likes_count: int = 0
    liked_by_me: bool = False
    comments_count: int = 0
    created_at: datetime

class CommentCreate(BaseModel):
    text: str

class CommentOut(BaseModel):
    id: str
    post_id: str
    user_id: str
    username: str
    avatar_url: str | None = None
    text: str
    created_at: datetime

class LikeOut(BaseModel):
    liked: bool
    likes_count: int

# Esquemas de Mensagens (Chat)
class MessageCreate(BaseModel):
    to_username: str
    text: str

class MessageOut(BaseModel):
    id: str
    from_id: str
    from_username: str
    to_id: str
    to_username: str
    text: str
    read: bool
    created_at: datetime

class ThreadOut(BaseModel):
    peer_username: str
    peer_display_name: str
    peer_avatar_url: str | None = None
    last_message: str
    last_message_at: datetime
    unread_count: int

class ConversationOut(BaseModel):
    peer_username: str
    peer_display_name: str
    peer_avatar_url: str | None = None
    messages: list[MessageOut]

# Esquema de Uploads
class UploadOut(BaseModel):
    url: str