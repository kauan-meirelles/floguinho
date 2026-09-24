import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Crown, Heart, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiDelete, apiPost, errorMessage } from "@/lib/api";
import { filterCss } from "@/lib/filters";
import { retroTime } from "@/lib/time";
import type { CommentOut, LikeOut, PostOut } from "@/lib/types";
import UserAvatar from "@/components/UserAvatar";
import VerifiedBadge from "@/components/VerifiedBadge"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// O card de foto do feed: cabeçalho, imagem filtrada, curtidas, recados e envio de recado.
export default function PostCard({ post, meId }: { post: PostOut; meId: string }) {
  const qc = useQueryClient();
  const [commentText, setCommentText] = useState("");

  const likeMut = useMutation({
    mutationFn: () => apiPost<LikeOut>(`/posts/${post.id}/like`),
    onSuccess: () => qc.invalidateQueries(),
    onError: (e) => toast.error(errorMessage(e)),
  });
  const commentMut = useMutation({
    mutationFn: (text: string) => apiPost<CommentOut>(`/posts/${post.id}/comments`, { text }),
    onSuccess: () => {
      setCommentText("");
      qc.invalidateQueries();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const deleteMut = useMutation({
    mutationFn: () => apiDelete<void>(`/posts/${post.id}`),
    onSuccess: () => {
      toast("essa saiu do seu flog");
      qc.invalidateQueries();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const sendComment = () => {
    const text = commentText.trim();
    if (text && !commentMut.isPending) commentMut.mutate(text);
  };

  const commentsList = post.comments ?? [];

  return (
    <article data-testid="feed-post-card" className="border-b border-[#174450] bg-[#0F2D35] pb-3">
      <div className="flex items-center gap-3 px-4 py-3">
        <Link to={`/u/${post.username}`} aria-label={`flog de ${post.username}`}>
          <UserAvatar src={post.avatar_url} username={post.username} size={40} />
        </Link>
        <div className="min-w-0 flex-1 leading-tight">
          <Link
            to={`/u/${post.username}`}
            className="flex items-center gap-1 text-sm font-extrabold text-[#FF7A1A] hover:underline"
          >
            {post.username}
            {post.is_owner && <Crown className="h-3.5 w-3.5 text-[#FF6B00]" aria-label="dono da rede" />}
            {post.verified && <VerifiedBadge />}
          </Link>
          <span className="text-xs text-[#7A9CA5]" data-testid="post-timestamp">
            {retroTime(post.created_at)}
          </span>
        </div>
        {post.user_id === meId && (
          <Button
            variant="ghost"
            size="icon"
            data-testid={`post-delete-button-${post.id}`}
            aria-label="Apagar foto"
            className="h-8 w-8 text-[#7A9CA5] hover:text-[#E0356B]"
            disabled={deleteMut.isPending}
            onClick={() => deleteMut.mutate()}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <img
        src={post.photo_url}
        alt={`foto de ${post.username}`}
        loading="lazy"
        style={{ filter: filterCss(post.filter_name) }}
        className="aspect-square w-full object-cover"
      />

      <div className="flex items-center gap-1 px-3 pt-2">
        <Button
          variant="ghost"
          size="icon"
          data-testid={`post-like-button-${post.id}`}
          aria-label={post.liked_by_me ? "Deixar de curtir" : "Curtir"}
          disabled={likeMut.isPending}
          onClick={() => likeMut.mutate()}
          className="h-9 w-9 text-[#96B8C2] hover:text-[#FF6B00]"
        >
          <motion.span
            key={String(post.liked_by_me)}
            className="inline-flex"
            animate={{ scale: [1, 1.35, 1] }}
            transition={{ duration: 0.25 }}
          >
            <Heart className={cn("h-5 w-5", post.liked_by_me && "fill-[#FF6B00] text-[#FF6B00]")} />
          </motion.span>
        </Button>
        <span className="text-sm font-bold text-[#C9DDE2]" data-testid={`post-likes-count-${post.id}`}>
          {post.likes_count}
        </span>
        <span className="ml-2 inline-flex items-center gap-1 text-sm text-[#7A9CA5]">
          <Heart className="h-3.5 w-3.5 rotate-3" aria-hidden="true" />
          {commentsList.length} recados
        </span>
      </div>

      {post.caption && (
        <p className="px-4 pt-1.5 text-sm text-[#E7F1F3]">
          <Link to={`/u/${post.username}`} className="font-extrabold text-[#FF7A1A]">
            {post.username}
          </Link>{" "}
          {post.caption}
        </p>
      )}

      {commentsList.length > 0 && (
        <div className="space-y-1 px-4 pt-2">
          {commentsList.map((c) => (
            <p key={c.id} className="text-sm break-words text-[#C9DDE2]">
              <Link to={`/u/${c.username}`} className="font-bold text-[#FF7A1A] hover:underline">
                {c.username}
              </Link>{" "}
              {c.text}
            </p>
          ))}
        </div>
      )}

      <form
        className="flex items-center gap-2 px-4 pt-2"
        onSubmit={(e) => {
          e.preventDefault();
          sendComment();
        }}
      >
        <Input
          data-testid={`post-comment-input-${post.id}`}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="deixe um recado..."
          maxLength={300}
          className="h-9 border-[#174450] bg-[#12343E] text-sm placeholder:text-[#5E818C]"
        />
        <Button
          type="submit"
          size="icon"
          data-testid={`post-comment-send-${post.id}`}
          aria-label="Enviar recado"
          disabled={!commentText.trim() || commentMut.isPending}
          className="h-9 w-9 shrink-0 bg-[#FF6600] text-white hover:bg-[#ff7d1f]"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </article>
  );
}