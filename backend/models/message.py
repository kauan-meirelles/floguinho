"""Chat models — keep the TS mirrors in frontend/src/lib/types.ts in sync."""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class MessageCreate(BaseModel):
    to_username: str
    text: str = Field(min_length=1, max_length=500)


class MessageOut(BaseModel):
    id: str
    from_id: Optional[str] = None
    from_username: str
    to_id: Optional[str] = None
    to_username: str
    text: str
    read: bool = False
    created_at: datetime


class ThreadOut(BaseModel):
    peer_username: Optional[str] = None
    peer_display_name: Optional[str] = None
    peer_avatar_url: Optional[str] = None
    verified: bool = False
    last_message: Optional[str] = None
    last_message_at: Optional[datetime] = None
    unread_count: int = 0
    messages: List[MessageOut] = []
    
    # Compatibilidade com o campo 'other' enviado pela rota antiga
    other: Optional[str] = None
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None

    def model_post_init(self, __context) -> None:
        if not self.peer_username and self.other:
            self.peer_username = self.other
        if not self.peer_display_name and self.display_name:
            self.peer_display_name = self.display_name
        if not self.peer_avatar_url and self.avatar_url:
            self.peer_avatar_url = self.avatar_url


class ConversationOut(BaseModel):
    peer_username: Optional[str] = None
    peer_display_name: Optional[str] = None
    peer_avatar_url: Optional[str] = None
    verified: bool = False
    messages: List[MessageOut] = []
    
    # Propriedades de compatibilidade para a rota de conversas
    username: Optional[str] = None
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    last_text: Optional[str] = None
    last_at: Optional[datetime] = None
    unread_count: int = 0

    def model_post_init(self, __context) -> None:
        if not self.peer_username and self.username:
            self.peer_username = self.username
        if not self.peer_display_name and self.display_name:
            self.peer_display_name = self.display_name
        if not self.peer_avatar_url and self.avatar_url:
            self.peer_avatar_url = self.avatar_url


class UnreadOut(BaseModel):
    unread_count: int