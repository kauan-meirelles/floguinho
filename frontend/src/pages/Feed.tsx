import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Camera } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { Me, PostOut, UserPublic } from "@/lib/types";
import UserAvatar from "@/components/UserAvatar";
import VerifiedBadge from "@/components/VerifiedBadge";
import PostCard from "@/components/PostCard";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Feed: a faixa de floguinhos em destaque + o fluxo das fotos mais recentes.
export default function Feed() {
  const meQuery = useQuery({ queryKey: ["me"], queryFn: () => apiGet<Me>("/auth/me"), retry: false });
  const usersQuery = useQuery({
    queryKey: ["users", ""],
    queryFn: () => apiGet<UserPublic[]>("/users"),
  });
  const feedQuery = useQuery({
    queryKey: ["feed"],
    queryFn: () => apiGet<PostOut[]>("/posts?limit=30"),
  });

  return (
    <div>
      <div className="flex gap-3 overflow-x-auto px-4 py-3" data-testid="feed-stories-strip">
        {usersQuery.data?.slice(0, 12).map((u) => (
          <Link
            key={u.id}
            to={`/u/${u.username}`}
            data-testid={`feed-story-${u.username}`}
            className="flex w-14 shrink-0 flex-col items-center gap-1"
          >
            <UserAvatar src={u.avatar_url} username={u.username} size={48} ring={u.is_owner} />
            <span className="w-full truncate text-center text-[10px] text-[#B5CBD3]">{u.username}</span>
          </Link>
        ))}
      </div>

      {feedQuery.isError && (
        <div className="mx-4 rounded-xl border border-[#174450] bg-[#12343E] p-4 text-center text-sm text-[#B5CBD3]">
          não rolou carregar o feed — o flogão tá fora do ar
          <Button
            variant="outline"
            size="sm"
            data-testid="feed-retry-button"
            onClick={() => feedQuery.refetch()}
            className="ml-2 border-[#FF6B00] text-[#FF7A1A]"
          >
            tentar de novo
          </Button>
        </div>
      )}

      {feedQuery.isPending && (
        <div className="space-y-4 p-4">
          {[0, 1].map((i) => (
            <div key={i} className="animate-pulse space-y-2 rounded-xl bg-[#0F2D35] p-3">
              <div className="h-10 w-1/2 rounded bg-[#174450]" />
              <div className="aspect-square w-full rounded bg-[#174450]/70" />
              <div className="h-4 w-2/3 rounded bg-[#174450]" />
            </div>
          ))}
        </div>
      )}

      {feedQuery.data?.length === 0 && (
        <div className="mx-4 rounded-xl border border-[#174450] bg-[#12343E] p-6 text-center">
          <p className="text-sm text-[#B5CBD3]">nenhuma foto ainda — seja você o primeiro a postar!</p>
          <Link
            to="/create"
            data-testid="feed-empty-create-link"
            className={cn(
              buttonVariants(),
              "mt-3 bg-[#FF6600] text-xs font-extrabold uppercase text-white hover:bg-[#ff7d1f]",
            )}
          >
            postar minha primeira foto
          </Link>
        </div>
      )}

      <div data-testid="feed-post-list">
        {feedQuery.data?.map((post) => (
          <PostCard key={post.id} post={post} meId={meQuery.data?.id ?? ""} />
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 py-6 text-[#5E818C]">
        <Camera className="h-4 w-4" aria-hidden="true" />
        <span className="text-xs">floguinho © 2006 — todos os flogs reservados</span>
      </div>
    </div>
  );
}