import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiPost, errorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ChangePasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const mut = useMutation({
    mutationFn: () =>
      apiPost<{ ok: boolean }>("/users/password", {
        current_password: currentPassword,
        new_password: newPassword,
      }),
    onSuccess: () => {
      qc.invalidateQueries();
      toast("senha mudada! na próxima use a nova ☺");
      setCurrentPassword("");
      setNewPassword("");
      onOpenChange(false);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm border-[#174450] bg-[#0F2D35]">
        <DialogHeader>
          <DialogTitle className="font-brand text-lg font-extrabold text-[#FF7A1A]">
            Mudar Senha
          </DialogTitle>
          <DialogDescription className="text-sm text-[#7A9CA5]">
            mínimo de 6 dígitos, nada de "123456"... ou pode, mas depois não chora
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-3 pt-1"
          onSubmit={(e) => {
            e.preventDefault();
            if (!mut.isPending) mut.mutate();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="current-password" className="text-[#FF7A1A]">
              Senha atual
            </Label>
            <Input
              id="current-password"
              type="password"
              data-testid="change-password-current-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-password" className="text-[#FF7A1A]">
              Nova senha
            </Label>
            <Input
              id="new-password"
              type="password"
              data-testid="change-password-new-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
          <Button
            type="submit"
            data-testid="change-password-save-button"
            disabled={mut.isPending}
            className="w-full bg-[#FF6600] font-extrabold text-white hover:bg-[#ff7d1f]"
          >
            Salvar senha
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}