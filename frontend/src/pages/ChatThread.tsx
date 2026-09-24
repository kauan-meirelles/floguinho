import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPost, errorMessage } from "@/lib/api";
import type { Me, MessageOut, ThreadOut } from "@/lib/types";
import { retroTime } from "@/lib/time";
import UserAvatar from "@/components/UserAvatar";
import VerifiedBadge from "@/components/VerifiedBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Conversa com um flog: bolhas de recado (minhas laranja à direita), polling a cada 4s.
export default function ChatThread() {
  const { username = "" } = useParams();
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const meQuery = useQuery({ queryKey: ["me"], queryFn: () => apiGet<Me>("/auth/me"), retry: false });
  const threadQuery = useQuery({
    queryKey: ["thread", username],
    queryFn: () => apiGet<ThreadOut>(`/messages/with/${encodeURIComponent(username)}`),
    refetchInterval: 4000,
  });

  const messages = threadQuery.data?.messages ?? [];
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  // ao abrir a thread o backend marca tudo como lido — atualiza o selo da aba
  useEffect(() => {
    if (threadQuery.isSuccess) {
      qc.invalidateQueries({ queryKey: ["unread"] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    }
  }, [threadQuery.isSuccess, qc]);

  const sendMut = useMutation({
    mutationFn: () => apiPost<MessageOut>("/messages", { to_username: username, text }),
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ["thread", username] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const meUsername = meQuery.data?.username ?? "";
  
  // Tratamento seguro para o nome de exibição
  const otherUser = threadQuery.data?.other as { display_name?: string } | string | undefined;
  const displayName = typeof otherUser === "object" && otherUser !== null ? (otherUser.display_name ?? username) : (otherUser ?? username);

  return (
    <div className="flex min-h-[calc(100svh-8.5rem)] flex-col">
      <header className="sticky top-14 z-20 flex items-center gap-3 border-b border-[#174450] bg-[#081B20]/90 px-4 py-2 backdrop-blur-md">
        <Link
          to="/chat"
          data-testid="chat-back-link"
          aria-label="Voltar às conversas"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#FF7A1A] hover:bg-[#12343E]"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <UserAvatar src={threadQuery.data?.avatar_url} username={username} size={36} />
        <p
          className="flex flex-1 items-center gap-1 text-sm font-extrabold text-[#FF7A1A]"
          data-testid="chat-thread-username"
        >
          {displayName}
          {threadQuery.data?.verified && <VerifiedBadge />}
        </p>
        <Link
          to={`/u/${username}`}
          data-testid="chat-thread-profile-link"
          className="text-xs text-[#7A9CA5] underline"
        >
          ver flog
        </Link>
      </header>

      <div className="flex flex-1 flex-col gap-2 px-4 py-3" data-testid="chat-thread-messages">
        {messages.map((m) => {
          const mine = m.from_username.toLowerCase() === meUsername.toLowerCase();
          return (
            <div
              key={m.id}
              data-testid={`chat-message-${m.id}`}
              className={cn(
                "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                mine
                  ? "self-end bg-[#FF6600] text-white"
                  : "self-start border border-[#174450] bg-[#12343E] text-[#E7F1F3]",
              )}
            >
              <p className="break-words">{m.text}</p>
              <p
                className={cn(
                  "pt-0.5 text-right text-[10px]",
                  mine ? "text-white/70" : "text-[#5E818C]",
                )}
              >
                {retroTime(m.created_at)}
              </p>
            </div>
          );
        })}
        {messages.length === 0 && !threadQuery.isPending && (
          <p className="py-6 text-center text-sm text-[#5E818C]">
            comece a conversa com um "f/f?" ♥
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        className="sticky bottom-20 flex items-center gap-2 bg-[#0C232A] py-2"
        onSubmit={(e) => {
          e.preventDefault();
          const t = text.trim();
          if (t && !sendMut.isPending) sendMut.mutate();
        }}
      >
        <Input
          data-testid="chat-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`recado para ${username}...`}
          maxLength={500}
          className="h-10 border-[#174450] bg-[#12343E] text-white placeholder:text-[#5E818C]"
        />
        <Button
          type="submit"
          size="icon"
          data-testid="chat-send-button"
          aria-label="Enviar recado"
          disabled={!text.trim() || sendMut.isPending}
          className="h-10 w-10 shrink-0 bg-[#FF6600] text-white hover:bg-[#ff7d1f]"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}