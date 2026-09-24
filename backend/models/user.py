"""User models — Pydantic v2. Keep the TS mirrors in frontend/src/lib/types.ts in sync."""

from typing import Optional

from pydantic import BaseModel, EmailStr, Field

USERNAME_PATTERN = r"^[A-Za-z0-9_.]{3,20}$"


class SignupRequest(BaseModel):
    username: str = Field(min_length=3, max_length=20, pattern=USERNAME_PATTERN)
    email: EmailStr
    password: str = Field(min_length=6, max_length=72)
    avatar_url: Optional[str] = Field(default=None, max_length=500)


class LoginRequest(BaseModel):
    username: str
    password: str


class UpdateProfileRequest(BaseModel):
    display_name: Optional[str] = Field(default=None, min_length=1, max_length=40)
    bio: Optional[str] = Field(default=None, max_length=200)
    avatar_url: Optional[str] = Field(default=None, max_length=500)


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6, max_length=72)


class MeOut(BaseModel):
    id: str
    username: str
    display_name: str
    email: str
    avatar_url: Optional[str] = None
    bio: str = ""
    is_owner: bool = False
    verified: bool = False


class UserPublic(BaseModel):
    id: str
    username: str
    display_name: str
    avatar_url: Optional[str] = None
    bio: str = ""
    is_owner: bool = False
    verified: bool = False
    fans_count: int = 0
    migos_count: int = 0
    fotos_count: int = 0
    is_following: bool = False
   
