import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ImagePlus, Send, X } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPost, apiPostForm, errorMessage } from "@/lib/api";
import type { Me, MessageOut, ThreadOut, UploadOut } from "@/lib/types";
import { retroTime } from "@/lib/time";
import UserAvatar from "@/components/UserAvatar";
import VerifiedBadge from "@/components/VerifiedBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Conversa com um flog: bolhas de recado (minhas laranja à direita), foto anexada, polling 4s.
export default function ChatThread() {
  const { username = "" } = useParams();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);

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

  // Anexar foto: sobe na hora e guarda a URL até enviar o recado.
  const pickFile = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const { url } = await apiPostForm<UploadOut>("/uploads", form);
      setPhotoUrl(url);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setUploading(false);
    }
  };

  const sendMut = useMutation({
    mutationFn: () =>
      apiPost<MessageOut>("/messages", {
        to_username: username,
        text,
        photo_url: photoUrl || null,
      }),
    onSuccess: () => {
      setText("");
      setPhotoUrl("");
      qc.invalidateQueries({ queryKey: ["thread", username] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const meUsername = meQuery.data?.username ?? "";
  const canSend = (text.trim().length > 0 || photoUrl.length > 0) && !sendMut.isPending && !uploading;

  // Tratamento seguro para o nome de exibição
  const otherUser = threadQuery.data?.other as { display_name?: string } | string | undefined;
  const displayName = typeof otherUser === "object" && otherUser !== null ? (otherUser.display_name ?? username) : (otherUser ?? username);

  return (
    <div className="flex min-h-[calc(100svh-8.5rem)] flex-col lg:min-h-[70svh]">
      <header className="sticky top-14 z-20 flex items-center gap-3 border-b border-[#174450] bg-[#081B20]/90 px-4 py-2 backdrop-blur-md lg:top-0 lg:rounded-t-2xl">
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
                "max-w-[80%] overflow-hidden rounded-2xl text-sm",
                mine
                  ? "self-end bg-[#FF6600] text-white"
                  : "self-start border border-[#174450] bg-[#12343E] text-[#E7F1F3]",
              )}
            >
              {m.photo_url && (
                <img
                  src={m.photo_url}
                  alt="foto no recado"
                  data-testid={`chat-message-photo-${m.id}`}
                  loading="lazy"
                  className="max-h-64 w-full object-cover"
                />
              )}
              <div className="px-3 py-2">
                {m.text && <p className="break-words">{m.text}</p>}
                <p
                  className={cn(
                    "pt-0.5 text-right text-[10px]",
                    mine ? "text-white/70" : "text-[#5E818C]",
                  )}
                >
                  {retroTime(m.created_at)}
                </p>
              </div>
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

      <div className="sticky bottom-20 space-y-2 bg-[#0C232A] py-2 lg:bottom-0 lg:rounded-b-2xl">
        {photoUrl && (
          <div className="relative mx-4 w-fit" data-testid="chat-photo-preview">
            <img
              src={photoUrl}
              alt="prévia do anexo"
              className="h-20 w-20 rounded-lg border border-[#174450] object-cover"
            />
            <button
              type="button"
              data-testid="chat-photo-remove"
              aria-label="Remover foto anexada"
              onClick={() => setPhotoUrl("")}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#D91B5C] text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <form
          className="flex items-center gap-2 px-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSend) sendMut.mutate();
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            data-testid="chat-file-input"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void pickFile(file);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            size="icon"
            variant="outline"
            data-testid="chat-attach-button"
            aria-label="Anexar foto"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="h-10 w-10 shrink-0 border-[#FF6600] text-[#FF7A1A] hover:bg-[#FF6600]/10"
          >
            <ImagePlus className="h-4 w-4" />
          </Button>
          <Input
            data-testid="chat-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={uploading ? "carregando foto..." : `recado para ${username}...`}
            maxLength={500}
            className="h-10 border-[#174450] bg-[#12343E] text-white placeholder:text-[#5E818C]"
          />
          <Button
            type="submit"
            size="icon"
            data-testid="chat-send-button"
            aria-label="Enviar recado"
            disabled={!canSend}
            className="h-10 w-10 shrink-0 bg-[#FF6600] text-white hover:bg-[#ff7d1f]"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}