import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Heart, Send } from "lucide-react";
import { toast } from "sonner";
import { apiPost, errorMessage } from "@/lib/api";
import { filterCss } from "@/lib/filters";
import { retroTime } from "@/lib/time";
import type { CommentOut, LikeOut, PostOut } from "@/lib/types";
import UserAvatar from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Lightbox da foto (abre da grade do álbum/explorar): foto grande + curtir + recados.
export default function PostDetailModal({
  post,
  open,
  onOpenChange,
}: {
  post: PostOut | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const [commentText, setCommentText] = useState("");

  const likeMut = useMutation({
    mutationFn: () => apiPost<LikeOut>(`/posts/${post?.id ?? ""}/like`),
    onSuccess: () => qc.invalidateQueries(),
    onError: (e) => toast.error(errorMessage(e)),
  });
  const commentMut = useMutation({
    mutationFn: (text: string) => apiPost<CommentOut>(`/posts/${post?.id ?? ""}/comments`, { text }),
    onSuccess: () => {
      setCommentText("");
      qc.invalidateQueries();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  if (!post) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 border-[#174450] bg-[#0F2D35] p-0 pt-6">
        <DialogTitle className="sr-only">Foto de {post.username}</DialogTitle>
        <motion.img
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          src={post.photo_url}
          alt={`foto de ${post.username}`}
          style={{ filter: filterCss(post.filter_name) }}
          className="max-h-[55svh] w-full object-contain"
        />
        <div className="flex items-center gap-2 px-4 pt-3">
          <UserAvatar src={post.avatar_url} username={post.username} size={32} />
          <div className="flex-1 leading-tight">
            <p className="text-sm font-extrabold text-[#FF7A1A]">{post.username}</p>
            <p className="text-xs text-[#7A9CA5]">{retroTime(post.created_at)}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            data-testid="modal-like-button"
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
          <span className="text-sm font-bold text-[#C9DDE2]" data-testid="modal-likes-count">
            {post.likes_count}
          </span>
        </div>
        {post.caption && <p className="px-4 pt-2 text-sm text-[#E7F1F3]">{post.caption}</p>}
        <div className="max-h-40 space-y-1 overflow-y-auto px-4 pt-2">
          {post.comments.map((c) => (
            <p key={c.id} className="text-sm break-words text-[#C9DDE2]">
              <span className="font-bold text-[#FF7A1A]">{c.username}</span> {c.text}
            </p>
          ))}
          {post.comments.length === 0 && (
            <p className="text-sm text-[#5E818C]">sem recados ainda — seja o primeiro ♥</p>
          )}
        </div>
        <form
          className="flex items-center gap-2 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            const text = commentText.trim();
            if (text && !commentMut.isPending) commentMut.mutate(text);
          }}
        >
          <Input
            data-testid="modal-comment-input"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="deixe um recado..."
            maxLength={300}
            className="h-9 border-[#174450] bg-[#12343E] text-sm placeholder:text-[#5E818C]"
          />
          <Button
            type="submit"
            size="icon"
            data-testid="modal-comment-send"
            aria-label="Enviar recado"
            disabled={!commentText.trim() || commentMut.isPending}
            className="h-9 w-9 shrink-0 bg-[#FF6600] text-white hover:bg-[#ff7d1f]"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}