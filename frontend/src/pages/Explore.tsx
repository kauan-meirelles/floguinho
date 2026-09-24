import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Crown, Heart, Search } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPost, errorMessage } from "@/lib/api";
import type { FollowOut, PostOut, UserPublic } from "@/lib/types";
import UserAvatar from "@/components/UserAvatar";
import VerifiedBadge from "@/components/VerifiedBadge";
import PostDetailModal from "@/components/PostDetailModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Explorar: busca de flogs + as últimas fotos da rede.
export default function Explore() {
  const qc = useQueryClient();
  const [term, setTerm] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [selectedPost, setSelectedPost] = useState<PostOut | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const usersQuery = useQuery({
    queryKey: ["explore", submitted],
    queryFn: () => apiGet<UserPublic[]>(`/users?q=${encodeURIComponent(submitted)}`),
  });
  const photosQuery = useQuery({
    queryKey: ["explore-posts"],
    queryFn: () => apiGet<PostOut[]>("/posts?limit=18"),
  });

  const followMut = useMutation({
    mutationFn: (username: string) => apiPost<FollowOut>(`/users/${encodeURIComponent(username)}/follow`),
    onSuccess: () => qc.invalidateQueries(),
    onError: (e) => toast.error(errorMessage(e)),
  });

  const openPost = (post: PostOut) => {
    setSelectedPost(post);
    setModalOpen(true);
  };

  return (
    <div className="px-4 py-4">
      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(term.trim());
        }}
      >
        <Input
          data-testid="explore-search-input"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="achar um flog..."
          className="h-10 border-[#174450] bg-[#12343E] placeholder:text-[#5E818C]"
        />
        <Button
          type="submit"
          size="icon"
          data-testid="explore-search-button"
          aria-label="Buscar"
          className="h-10 w-10 shrink-0 bg-[#FF6600] text-white hover:bg-[#ff7d1f]"
        >
          <Search className="h-4 w-4" />
        </Button>
      </form>

      <div className="space-y-2 pt-4" data-testid="explore-user-list">
        {usersQuery.data?.map((u) => (
          <div
            key={u.id}
            data-testid={`explore-user-card-${u.username}`}
            className="flex items-center gap-3 rounded-xl border border-[#174450] bg-[#12343E]/70 p-3"
          >
            <Link to={`/u/${u.username}`} aria-label={`flog de ${u.username}`}>
              <UserAvatar src={u.avatar_url} username={u.username} size={44} />
            </Link>
            <div className="min-w-0 flex-1 leading-tight">
              <Link
                to={`/u/${u.username}`}
                className="flex items-center gap-1 text-sm font-extrabold text-[#FF7A1A] hover:underline"
              >
                {u.username}
                {u.is_owner && <Crown className="h-3.5 w-3.5 text-[#FF6B00]" aria-label="dono da rede" />}
                {u.verified && <VerifiedBadge />}
              </Link>
              <p className="truncate text-xs text-[#96B8C2]">
                {u.display_name} · {u.fans_count} fãs
              </p>
            </div>
            <Button
              size="sm"
              data-testid={`explore-follow-button-${u.username}`}
              disabled={followMut.isPending}
              onClick={() => followMut.mutate(u.username)}
              className={
                u.is_following
                  ? "border border-[#FF6600] bg-transparent text-[#FF7A1A] hover:bg-[#FF6600]/10"
                  : "bg-[#FF6600] font-extrabold text-white hover:bg-[#ff7d1f]"
              }
            >
              {u.is_following ? "é fã ✓" : "virar fã"}
            </Button>
          </div>
        ))}
        {usersQuery.data?.length === 0 && (
          <p className="py-6 text-center text-sm text-[#5E818C]">
            nenhum flog com "{submitted}"... chama essa pessoa pra rede!
          </p>
        )}
      </div>

      <h2 className="pt-6 pb-2 text-sm font-extrabold tracking-wide text-[#B5CBD3] uppercase">
        últimas fotos
      </h2>
      <div className="grid grid-cols-3 gap-1.5" data-testid="explore-photo-grid">
        {photosQuery.data?.map((p) => (
          <motion.button
            key={p.id}
            data-testid={`explore-grid-photo-${p.id}`}
            whileTap={{ scale: 0.95 }}
            onClick={() => openPost(p)}
            className="block overflow-hidden rounded-sm"
            aria-label={`foto de ${p.username}`}
          >
            <img
              src={p.photo_url}
              alt={`foto de ${p.username}`}
              loading="lazy"
              className="aspect-square w-full object-cover"
            />
          </motion.button>
        ))}
      </div>

      <PostDetailModal post={selectedPost} open={modalOpen} onOpenChange={setModalOpen} />
      <p className="flex items-center justify-center gap-1 pt-6 pb-4 text-xs text-[#5E818C]">
        <Heart className="h-3 w-3" aria-hidden="true" /> quem posta foto, ganha fã
      </p>
    </div>
  );
}
