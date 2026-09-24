import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Crown, MessageCircle, Pencil } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPost, errorMessage } from "@/lib/api";
import type { FollowOut, Me, PostOut, UserPublic } from "@/lib/types";
import { filterCss } from "@/lib/filters";
import UserAvatar from "@/components/UserAvatar";
import VerifiedBadge from "@/components/VerifiedBadge";
import PostDetailModal from "@/components/PostDetailModal";
import EditProfileDialog from "@/components/EditProfileDialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Perfil do flog: avatar com anel laranja, contadores de Fãs/Migos/Fotos e a grade do álbum.
export default function Profile() {
  const { username = "" } = useParams();
  const qc = useQueryClient();
  const [selectedPost, setSelectedPost] = useState<PostOut | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const meQuery = useQuery({ queryKey: ["me"], queryFn: () => apiGet<Me>("/auth/me"), retry: false });
  const profileQuery = useQuery({
    queryKey: ["profile", username],
    queryFn: () => apiGet<UserPublic>(`/users/${encodeURIComponent(username)}`),
  });
  const postsQuery = useQuery({
    queryKey: ["profile-posts", username],
    queryFn: () => apiGet<PostOut[]>(`/posts?username=${encodeURIComponent(username)}&limit=48`),
  });

  const followMut = useMutation({
    mutationFn: () => apiPost<FollowOut>(`/users/${encodeURIComponent(username)}/follow`),
    onSuccess: () => qc.invalidateQueries(),
    onError: (e) => toast.error(errorMessage(e)),
  });

  
  const verifyMut = useMutation({
    mutationFn: () => apiPost<{ verified: boolean }>(`/users/${encodeURIComponent(username)}/verify`),
    onSuccess: (d) => {
      qc.invalidateQueries();
      toast(d.verified ? "selinho dado! ✓ o flog tá verificado" : "selinho removido");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  if (profileQuery.isPending || meQuery.isPending) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <div className="h-24 w-24 animate-pulse rounded-full bg-[#174450]" />
        <div className="h-5 w-40 animate-pulse rounded bg-[#174450]" />
      </div>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-sm text-[#B5CBD3]">flog não encontrado... a viagem no tempo mudou essa linha do tempo</p>
      </div>
    );
  }

  const profile = profileQuery.data;
  const isMe = meQuery.data?.username.toLowerCase() === profile.username.toLowerCase();

  return (
    <div>
      <div className="flex flex-col items-center px-4 pt-6 text-center">
        <UserAvatar src={profile.avatar_url} username={profile.username} size={96} />
        <h1
          className="mt-3 flex items-center gap-1.5 font-brand text-xl font-extrabold text-[#FF7A1A]"
          data-testid="profile-username"
        >
          {profile.username}
          {profile.is_owner && <Crown className="h-5 w-5 text-[#FF6B00]" aria-label="dono da rede" />}
          {profile.verified && <VerifiedBadge size={18} />}
        </h1>
        {profile.display_name !== profile.username && (
          <p className="text-sm text-[#C9DDE2]">{profile.display_name}</p>
        )}
        {profile.bio && <p className="max-w-72 pt-1 text-xs text-[#96B8C2]">{profile.bio}</p>}
      </div>

      <div
        className="mx-4 my-4 flex items-center justify-around rounded-xl border border-[#174450] bg-[#12343E]/80 py-3"
        data-testid="profile-stats"
      >
        <div className="text-center">
          <p className="text-lg font-extrabold text-[#FF7A1A]" data-testid="profile-fans-count">
            {profile.fans_count}
          </p>
          <p className="text-[11px] text-[#B5CBD3]">Fãs</p>
        </div>
        <div className="h-8 w-px bg-[#174450]" aria-hidden="true" />
        <div className="text-center">
          <p className="text-lg font-extrabold text-[#FF7A1A]" data-testid="profile-migos-count">
            {profile.migos_count}
          </p>
          <p className="text-[11px] text-[#B5CBD3]">Migos</p>
        </div>
        <div className="h-8 w-px bg-[#174450]" aria-hidden="true" />
        <div className="text-center">
          <p className="text-lg font-extrabold text-[#FF7A1A]" data-testid="profile-fotos-count">
            {profile.fotos_count}
          </p>
          <p className="text-[11px] text-[#B5CBD3]">Fotos</p>
        </div>
      </div>

      <div className="flex justify-center gap-2 px-4 pb-4">
        {isMe ? (
          <Button
            data-testid="profile-edit-button"
            onClick={() => setEditOpen(true)}
            className="bg-[#FF6600] text-xs font-extrabold uppercase tracking-wide text-white hover:bg-[#ff7d1f]"
          >
            <Pencil className="h-3.5 w-3.5" /> Editar perfil
          </Button>
        ) : (
          <>
            <Button
              data-testid="profile-follow-button"
              disabled={followMut.isPending}
              onClick={() => followMut.mutate()}
              className={
                profile.is_following
                  ? "border border-[#FF6600] bg-transparent px-6 text-xs font-extrabold uppercase tracking-wide text-[#FF7A1A] hover:bg-[#FF6600]/10"
                  : "bg-[#FF6600] px-6 text-xs font-extrabold uppercase tracking-wide text-white hover:bg-[#ff7d1f]"
              }
            >
              {profile.is_following ? "é fã ✓" : "virar fã"}
            </Button>
            <Link
              to={`/chat/${profile.username}`}
              data-testid="profile-chat-link"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "border-[#FF6600] text-xs font-extrabold uppercase tracking-wide text-[#FF7A1A] hover:bg-[#FF6600]/10",
              )}
            >
              <MessageCircle className="h-3.5 w-3.5" /> Chat
            </Link>
            {meQuery.data?.is_owner && (
              <Button
                data-testid="profile-verify-toggle"
                disabled={verifyMut.isPending}
                onClick={() => verifyMut.mutate()}
                className="border border-[#1D9BF0] bg-transparent px-4 text-xs font-extrabold uppercase tracking-wide text-[#7CC7F5] hover:bg-[#1D9BF0]/10"
              >
                <VerifiedBadge size={14} />
                {profile.verified ? "tirar selo" : "dar selo"}
              </Button>
            )}
          </>
        )}
      </div>

      <div className="border-t border-[#174450]">
        <p className="px-4 pt-3 text-sm font-extrabold text-[#B5CBD3] underline decoration-[#FF6B00] decoration-2 underline-offset-4">
          Album
        </p>
        <div className="grid grid-cols-3 gap-1.5 p-2" data-testid="profile-photo-grid">
          {postsQuery.data?.map((p) => (
            <motion.button
              key={p.id}
              data-testid={`profile-grid-photo-${p.id}`}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedPost(p);
                setModalOpen(true);
              }}
              className="block overflow-hidden rounded-sm"
              aria-label={`foto de ${p.username}: ${p.caption || "sem legenda"}`}
            >
              <img
                src={p.photo_url}
                alt={`foto de ${p.username}`}
                loading="lazy"
                style={{ filter: filterCss(p.filter_name) }}
                className="aspect-square w-full object-cover"
              />
            </motion.button>
          ))}
        </div>
        {postsQuery.data?.length === 0 && (
          <p className="py-8 text-center text-sm text-[#5E818C]">
            {isMe ? "seu álbum tá vazio — poste a primeira foto!" : "nenhuma foto nesse flog ainda"}
          </p>
        )}
      </div>

      <PostDetailModal post={selectedPost} open={modalOpen} onOpenChange={setModalOpen} />
      <EditProfileDialog open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}