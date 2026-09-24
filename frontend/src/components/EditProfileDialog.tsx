import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiGet, apiPut, errorMessage } from "@/lib/api";
import type { Me } from "@/lib/types";
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
import { Textarea } from "@/components/ui/textarea";

export default function EditProfileDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: () => apiGet<Me>("/auth/me"),
    enabled: open,
  });

  useEffect(() => {
    if (open && meQuery.data) {
      setDisplayName(meQuery.data.display_name);
      setBio(meQuery.data.bio);
      setAvatarUrl(meQuery.data.avatar_url ?? "");
    }
  }, [open, meQuery.data]);

  const mut = useMutation({
    mutationFn: () =>
      apiPut<Me>("/users/me", {
        display_name: displayName.trim(),
        bio,
        avatar_url: avatarUrl.trim(),
      }),
    onSuccess: () => {
      qc.invalidateQueries();
      toast("perfil atualizado ♥");
      onOpenChange(false);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm border-[#174450] bg-[#0F2D35]">
        <DialogHeader>
          <DialogTitle className="font-brand text-lg font-extrabold text-[#FF7A1A]">
            Editar Perfil
          </DialogTitle>
          <DialogDescription className="text-sm text-[#7A9CA5]">
            mude como seu flog aparece pra geral
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
            <Label htmlFor="edit-display-name" className="text-[#FF7A1A]">
              Nome
            </Label>
            <Input
              id="edit-display-name"
              data-testid="edit-profile-name-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={40}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-bio" className="text-[#FF7A1A]">
              Frase do flog
            </Label>
            <Textarea
              id="edit-bio"
              data-testid="edit-profile-bio-input"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={200}
              rows={3}
              placeholder="f/f? sigo de volta..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-avatar" className="text-[#FF7A1A]">
              Foto de perfil (URL)
            </Label>
            <Input
              id="edit-avatar"
              data-testid="edit-profile-avatar-input"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              maxLength={500}
              placeholder="https://..."
            />
          </div>
          <Button
            type="submit"
            data-testid="edit-profile-save-button"
            disabled={!displayName.trim() || mut.isPending}
            className="w-full bg-[#FF6600] font-extrabold text-white hover:bg-[#ff7d1f]"
          >
            Salvar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
