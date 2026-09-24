import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Crown } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { Me } from "@/lib/types";
import { endSession } from "@/lib/session";
import ChangePasswordDialog from "@/components/ChangePasswordDialog";
import EditProfileDialog from "@/components/EditProfileDialog";
import { Button } from "@/components/ui/button";

// Configurações, fiel à tela da série: pílulas laranja de seção, itens sublinhados
// e o botão rosa de Desconectar.
function Section({ title }: { title: string }) {
  return (
    <p className="rounded-full bg-[#FF6600] px-5 py-2 text-sm font-extrabold text-white" data-testid="settings-section-pill">
      {title}
    </p>
  );
}

function Row({
  label,
  value,
  onClick,
  testid,
}: {
  label: string;
  value?: string;
  onClick?: () => void;
  testid: string;
}) {
  const content = (
    <>
      <span className="text-sm font-semibold text-[#E7F1F3] underline decoration-[#FF6600]/70 underline-offset-4">
        {label}
      </span>
      <span className="flex items-center gap-1 text-xs text-[#7A9CA5]">
        {value}
        {onClick && <ChevronRight className="h-4 w-4" aria-hidden="true" />}
      </span>
    </>
  );
  return onClick ? (
    <Button
      variant="ghost"
      data-testid={testid}
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-none px-5 py-3 hover:bg-[#12343E]"
    >
      {content}
    </Button>
  ) : (
    <div data-testid={testid} className="flex w-full items-center justify-between px-5 py-3">
      {content}
    </div>
  );
}

export default function Settings() {
  const meQuery = useQuery({ queryKey: ["me"], queryFn: () => apiGet<Me>("/auth/me"), retry: false });
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  return (
    <div className="space-y-5 px-4 py-4">
      <div className="relative flex items-center justify-center pt-1">
        <Link
          to="/"
          data-testid="settings-back-link"
          aria-label="Voltar ao início"
          className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full text-[#FF7A1A] hover:bg-[#12343E]"
        >
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="font-brand text-xl font-extrabold text-[#FF7A1A]">Configurações</h1>
        {meQuery.data?.is_owner && (
          <span className="absolute right-0 flex items-center gap-1 text-[10px] font-bold text-[#FF6B00]">
            <Crown className="h-4 w-4" aria-hidden="true" /> DONO
          </span>
        )}
      </div>

      <div className="space-y-2">
        <Section title="Conta" />
        <Row label="Editar Perfil" testid="settings-edit-profile-row" onClick={() => setEditOpen(true)} />
        <Row
          label="Mudar Senha"
          testid="settings-change-password-row"
          onClick={() => setPasswordOpen(true)}
        />
        <Row
          label="Email"
          value={meQuery.data?.email ?? "carregando..."}
          testid="settings-email-row"
        />
      </div>

      <div className="space-y-2">
        <Section title="Preferências" />
        <Row label="Privacidade" value="perfil público" testid="settings-privacy-row" />
        <Row label="Sessões" value="1 ativa" testid="settings-sessions-row" />
      </div>

      <div className="space-y-2">
        <Section title="Notificações" />
        <Row label="Filtros" value="5 disponíveis" testid="settings-filters-row" />
      </div>

      <div className="flex justify-center pt-4">
        <Button
          data-testid="settings-logout-button"
          onClick={() => void endSession()}
          className="h-10 w-full max-w-48 rounded-full bg-[#D91B5C] px-8 text-sm font-extrabold text-white hover:bg-[#e5316f]"
        >
          Desconectar
        </Button>
      </div>

      <EditProfileDialog open={editOpen} onOpenChange={setEditOpen} />
      <ChangePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} />
    </div>
  );
}
