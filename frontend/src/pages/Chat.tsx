import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { ConversationOut } from "@/lib/types";
import { retroTime } from "@/lib/time";
import UserAvatar from "@/components/UserAvatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Lista de conversas do chat privado, com selo de recados não lidos.
export default function Chat() {
  const convQuery = useQuery({
    queryKey: ["conversations"],
    queryFn: () => apiGet<ConversationOut[]>("/messages/conversations"),
    refetchInterval: 6000,
  });

  return (
    <div className="px-4 py-4">
      <h1 className="font-brand text-xl font-extrabold text-[#FF7A1A]">Chat</h1>
      <p className="text-xs text-[#7A9CA5]">recados privados entre flogs</p>

      {convQuery.isError && (
        <div className="mt-4 rounded-xl border border-[#174450] bg-[#12343E] p-4 text-center text-sm text-[#B5CBD3]">
          não rolou carregar as conversas
          <Button
            variant="outline"
            size="sm"
            data-testid="chat-retry-button"
            onClick={() => convQuery.refetch()}
            className="ml-2 border-[#FF6B00] text-[#FF7A1A]"
          >
            tentar de novo
          </Button>
        </div>
      )}

      <div className="space-y-2 pt-4" data-testid="chat-conversation-list">
        {convQuery.data?.map((c) => (
          <Link
            key={c.username}
            to={`/chat/${c.username}`}
            data-testid={`chat-conversation-${c.username}`}
            className="flex items-center gap-3 rounded-xl border border-[#174450] bg-[#12343E]/70 p-3 transition-transform active:scale-[0.98]"
          >
            <UserAvatar src={c.avatar_url} username={c.username} size={44} />
            <div className="min-w-0 flex-1 leading-tight">
              <p className="text-sm font-extrabold text-[#FF7A1A]">{c.username}</p>
              <p className="truncate text-xs text-[#96B8C2]">{c.last_text}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] text-[#5E818C]">{retroTime(c.last_at)}</span>
              {c.unread_count > 0 && (
                <span
                  data-testid={`chat-unread-${c.username}`}
                  className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D91B5C] px-1.5 text-[10px] font-bold text-white"
                >
                  {c.unread_count}
                </span>
              )}
            </div>
          </Link>
        ))}

        {convQuery.data?.length === 0 && (
          <div className="rounded-xl border border-[#174450] bg-[#12343E] p-6 text-center">
            <MessageCircle className="mx-auto h-6 w-6 text-[#5E818C]" aria-hidden="true" />
            <p className="pt-2 text-sm text-[#B5CBD3]">
              nenhuma conversa ainda — abre o flog de alguém e chama pra chat ♥
            </p>
            <Link
              to="/explore"
              data-testid="chat-empty-explore-link"
              className={cn(
                buttonVariants(),
                "mt-3 bg-[#FF6600] text-xs font-extrabold uppercase text-white hover:bg-[#ff7d1f]",
              )}
            >
              explorar flogs
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
