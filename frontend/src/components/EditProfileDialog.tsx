import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Upload } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPost, apiPut, errorMessage } from "@/lib/api";
import type { Me, UploadOut } from "@/lib/types";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [uploading, setUploading] = useState(false);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiPost<UploadOut>("/uploads", formData);
      setAvatarUrl(res.url);
      toast("foto carregada com sucesso! ♥");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

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
            <Label className="text-[#FF7A1A]">Foto de perfil</Label>
            <Tabs defaultValue="url" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-[#0C232A]">
                <TabsTrigger
                  value="url"
                  data-testid="edit-avatar-mode-url"
                  className="flex-1 gap-1 text-xs text-[#7A9CA5] data-[state=active]:bg-[#174450] data-[state=active]:text-white"
                >
                  <Link className="h-3.5 w-3.5" /> Usar URL
                </TabsTrigger>
                <TabsTrigger
                  value="upload"
                  data-testid="edit-avatar-mode-upload"
                  className="flex-1 gap-1 text-xs text-[#7A9CA5] data-[state=active]:bg-[#174450] data-[state=active]:text-white"
                >
                  <Upload className="h-3.5 w-3.5" /> Do meu dispositivo
                </TabsTrigger>
              </TabsList>
              <TabsContent value="url" className="pt-2">
                <Input
                  id="edit-avatar"
                  data-testid="edit-profile-avatar-input"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  maxLength={500}
                  placeholder="https://..."
                />
              </TabsContent>
              <TabsContent value="upload" className="pt-2">
                <label className="flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded border border-dashed border-[#174450] bg-[#0C232A] text-xs font-semibold text-[#7A9CA5] hover:bg-[#122e37] hover:text-white">
                  <Upload className="h-4 w-4 text-[#FF7A1A]" />
                  {uploading ? "carregando..." : avatarUrl ? "foto carregada (clique para trocar)" : "escolher imagem do pc"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </label>
              </TabsContent>
            </Tabs>
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