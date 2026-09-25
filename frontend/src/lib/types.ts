// Espelhos manuais dos modelos Pydantic (backend/models/*) — nada infere entre Python e TS.
// Ao mudar um modelo no backend, mude o par aqui na mesma edição.

export interface Me {
  id: string;
  username: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
  bio: string;
  is_owner: boolean;
  verified: boolean;
}

export interface UserPublic {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string;
  is_owner: boolean;
  verified: boolean;
  fans_count: number;
  migos_count: number;
  fotos_count: number;
  is_following: boolean;
}

export interface CommentOut {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  text: string;
  created_at: string;
}

export interface PostOut {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  photo_url: string;
  caption: string;
  filter_name: string;
  is_owner: boolean;
  verified: boolean;
  created_at: string;
  likes_count: number;
  liked_by_me: boolean;
  comments: CommentOut[];
}

export interface LikeOut {
  liked: boolean;
  likes_count: number;
}

export interface FollowOut {
  following: boolean;
  fans_count: number;
}

export interface UploadOut {
  url: string;
}

// Interfaces de Mensagens e Chats atualizadas e expandidas:
export interface MessageOut {
  id: string;
  from_username: string;
  to_username: string;
  text: string;
  photo_url: string | null;
  created_at: string;
}

export interface ThreadOut {
  other: string;
  display_name: string;
  avatar_url: string | null;
  verified: boolean;
  messages: MessageOut[];
}

export interface ConversationOut {
  username: string;
  display_name: string;
  avatar_url: string | null;
  last_text: string;
  last_at: string;
  unread_count: number;
}

export interface UnreadOut {
  count: number;
}