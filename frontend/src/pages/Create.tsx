import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link2, Upload } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPost, apiPostForm, errorMessage } from "@/lib/api";
import { FILTERS, filterCss } from "@/lib/filters";
import type { Me, PostOut, UploadOut } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Nova foto: upload do arquivo ou link, filtro retrô com prévia, legenda e postar.
export default function Create() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [filterId, setFilterId] = useState("normal");

  const meQuery = useQuery({ queryKey: ["me"], queryFn: () => apiGet<Me>("/auth/me"), retry: false });
  const preview = mode === "upload" && file ? URL.createObjectURL(file) : photoUrl.trim();

  const postMut = useMutation({
    mutationFn: async () => {
      let url = photoUrl.trim();
      if (mode === "upload") {
        if (!file) throw new Error("escolha um arquivo");
        const form = new FormData();
        form.append("file", file);
        url = (await apiPostForm<UploadOut>("/uploads", form)).url;
      }
      return apiPost<PostOut>("/posts", { photo_url: url, caption, filter_name: filterId });
    },
    onSuccess: () => {
      qc.invalidateQueries();
      toast("foto no ar! ♥");
      navigate(meQuery.data ? `/u/${meQuery.data.username}` : "/");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const hasPhoto = mode === "upload" ? !!file : !!photoUrl.trim();

  return (
    <div className="space-y-4 px-4 py-4">
      <h1 className="font-brand text-xl font-extrabold text-[#FF7A1A]">Nova foto</h1>

      <Tabs value={mode} onValueChange={(value: string) => setMode(value as "upload" | "url")}>
        <TabsList className="w-full bg-[#12343E]" data-testid="create-mode-tabs">
          <TabsTrigger value="upload" data-testid="create-mode-upload" className="flex-1 gap-1.5">
            <Upload className="h-4 w-4" /> Upload
          </TabsTrigger>
          <TabsTrigger value="url" data-testid="create-mode-url" className="flex-1 gap-1.5">
            <Link2 className="h-4 w-4" /> Link
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {mode === "upload" ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            data-testid="create-file-input"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <Button
            type="button"
            variant="outline"
            data-testid="create-file-button"
            onClick={() => fileInputRef.current?.click()}
            className="h-11 w-full border-[#FF6600] text-[#FF7A1A] hover:bg-[#FF6600]/10"
          >
            <Upload className="h-4 w-4" /> {file ? file.name : "escolher arquivo do computador"}
          </Button>
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor="create-url" className="text-[#FF7A1A]">
            Link da imagem
          </Label>
          <Input
            id="create-url"
            data-testid="create-url-input"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="https://... ou /api/uploads/..."
            className="h-10 border-[#174450] bg-[#12343E] placeholder:text-[#5E818C]"
          />
        </div>
      )}

      {preview && (
        <img
          src={preview}
          alt="prévia da foto"
          data-testid="create-preview"
          style={{ filter: filterCss(filterId) }}
          className="max-h-72 w-full rounded-lg border border-[#174450] object-cover"
        />
      )}

      <div>
        <p className="pb-2 text-sm font-semibold text-[#B5CBD3]">filtro retrô</p>
        <div className="flex gap-2 overflow-x-auto pb-1" data-testid="create-filter-row">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              data-testid={`create-filter-${f.id}`}
              onClick={() => setFilterId(f.id)}
              className={cn(
                "flex shrink-0 flex-col items-center gap-1 rounded-lg p-1 transition-transform active:scale-95",
                filterId === f.id && "ring-2 ring-[#FF6B00]",
              )}
            >
              <span className="block h-14 w-14 overflow-hidden rounded-md bg-gradient-to-br from-[#174450] to-[#3d2c1e]">
                {preview && (
                  <img
                    src={preview}
                    alt=""
                    style={{ filter: f.css }}
                    className="h-full w-full object-cover"
                  />
                )}
              </span>
              <span className="text-[10px] text-[#B5CBD3]">{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="create-caption" className="text-[#FF7A1A]">
          Legenda
        </Label>
        <Textarea
          id="create-caption"
          data-testid="create-caption-input"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="f/f? bjinhus ♥"
        />
        <p className="text-right text-xs text-[#5E818C]" data-testid="create-caption-counter">
          {caption.length}/500
        </p>
      </div>

      <Button
        data-testid="create-submit-button"
        disabled={!hasPhoto || postMut.isPending}
        onClick={() => postMut.mutate()}
        className="h-11 w-full bg-[#FF6600] text-sm font-extrabold uppercase tracking-wide text-white hover:bg-[#ff7d1f]"
      >
        Postar no Floguinho
      </Button>
    </div>
  );
}