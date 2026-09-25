import { useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Eye, EyeOff, Link2, Upload } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPost, apiPostForm, errorMessage } from "@/lib/api";
import type { Me, UploadOut } from "@/lib/types";
import { beginSession } from "@/lib/session";
import FloguinhoLogo from "@/components/FloguinhoLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [avatarMode, setAvatarMode] = useState<"upload" | "url">("upload");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sobe a foto antes de criar a conta (o endpoint de upload é público justamente pra isso).
  const pickFile = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const { url } = await apiPostForm<UploadOut>("/uploads", form);
      setAvatarUrl(url);
      toast("foto escolhida! ♥");
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setUploading(false);
    }
  };

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: () => apiGet<Me>("/auth/me"),
    retry: false,
  });

  const signupMut = useMutation({
    mutationFn: () =>
      apiPost<Me>("/auth/signup", {
        username: username.trim(),
        email: email.trim(),
        password,
        avatar_url: avatarUrl.trim(),
      }),
    onSuccess: (me) => {
      beginSession();
      toast(`flog criado! bem-vindo(a), ${me.username} ♥`);
      navigate("/", { replace: true });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  if (meQuery.isSuccess) return <Navigate to="/" replace />;

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-[#0D1117] px-4 py-8">
      <div className="mb-2">
        <FloguinhoLogo size={52} />
      </div>

      {/* Caixa centralizada com largura controlada idêntica ao Emergent */}
      <div className="relative mt-4 w-full max-w-md border-2 border-[#FF6B00] px-6 pt-7 pb-6 bg-[#0D1117]">
        <div className="absolute -top-4 left-1/2 w-fit -translate-x-1/2 border-2 border-[#FF6B00] bg-[#0D1117] px-4 py-0.5">
          <h1 className="text-center text-sm font-bold text-white uppercase tracking-wider">Criar nova conta</h1>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!signupMut.isPending) signupMut.mutate();
          }}
        >
          <div className="flex items-center gap-3">
            <Label htmlFor="signup-username" className="w-24 shrink-0 text-right text-xs font-semibold text-[#FF7A1A]">
              Username:
            </Label>
            <Input
              id="signup-username"
              data-testid="signup-username-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              required
              minLength={3}
              maxLength={20}
              pattern="[A-Za-z0-9_.]{3,20}"
              title="3 a 20 caracteres: letras, números, _ ou ."
              className="h-8 rounded-none border-0 bg-[#F5EFE0] text-xs text-[#1F2937] dark:bg-[#F5EFE0] dark:text-[#1F2937]"
            />
          </div>

          <div className="flex items-center gap-3">
            <Label htmlFor="signup-email" className="w-24 shrink-0 text-right text-xs font-semibold text-[#FF7A1A]">
              E-mail:
            </Label>
            <Input
              id="signup-email"
              type="email"
              data-testid="signup-email-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              required
              className="h-8 rounded-none border-0 bg-[#F5EFE0] text-xs text-[#1F2937] dark:bg-[#F5EFE0] dark:text-[#1F2937]"
            />
          </div>

          <div className="flex items-center gap-3">
            <Label htmlFor="signup-password" className="w-24 shrink-0 text-right text-xs font-semibold text-[#FF7A1A]">
              Senha:
            </Label>
            <div className="relative flex-1">
              <Input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                data-testid="signup-password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
                minLength={6}
                className="h-8 w-full rounded-none border-0 bg-[#F5EFE0] pr-8 text-xs text-[#1F2937] dark:bg-[#F5EFE0] dark:text-[#1F2937]"
              />
              <button
                type="button"
                data-testid="signup-password-toggle"
                aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-[#6b7280] hover:text-[#1F2937]"
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Label className="mt-2 w-24 shrink-0 text-right text-xs font-semibold text-[#FF7A1A]">Sua foto:</Label>
            <div className="min-w-0 flex-1 space-y-2">
              <Tabs
                value={avatarMode}
                onValueChange={(value: string) => setAvatarMode(value as "upload" | "url")}
              >
                <TabsList className="w-full bg-[#161d26]">
                  <TabsTrigger
                    value="upload"
                    data-testid="signup-avatar-mode-upload"
                    className="flex-1 gap-1 text-xs text-[#7A9CA5] data-[state=active]:bg-[#174450] data-[state=active]:text-white"
                  >
                    <Upload className="h-3.5 w-3.5" /> Do meu dispositivo
                  </TabsTrigger>
                  <TabsTrigger
                    value="url"
                    data-testid="signup-avatar-mode-url"
                    className="flex-1 gap-1 text-xs text-[#7A9CA5] data-[state=active]:bg-[#174450] data-[state=active]:text-white"
                  >
                    <Link2 className="h-3.5 w-3.5" /> Link
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-2">
                {avatarUrl.trim() && (
                  <img
                    src={avatarUrl.trim()}
                    alt="prévia da sua foto"
                    data-testid="signup-avatar-preview"
                    className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-[#FF6B00]"
                  />
                )}
                {avatarMode === "upload" ? (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      data-testid="signup-file-input"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void pickFile(file);
                        e.target.value = "";
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      data-testid="signup-file-button"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="h-9 flex-1 border-[#FF6600] text-xs font-bold text-[#FF7A1A] hover:bg-[#FF6600]/10"
                    >
                      <Upload className="h-4 w-4" />
                      {uploading ? "carregando..." : avatarUrl ? "trocar foto" : "escolher foto"}
                    </Button>
                  </>
                ) : (
                  <Input
                    id="signup-avatar"
                    data-testid="signup-avatar-input"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://... (opcional)"
                    className="h-9 rounded-none border-0 bg-[#F5EFE0] text-xs text-[#1F2937] placeholder:text-[#9aa1a9] dark:bg-[#F5EFE0] dark:text-[#1F2937] dark:placeholder:text-[#9aa1a9]"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <Button
              type="submit"
              data-testid="signup-submit-button"
              disabled={signupMut.isPending || uploading}
              className="h-8 w-full max-w-48 rounded-[3px] bg-[#C2185B] px-4 text-xs font-extrabold uppercase tracking-wide text-white hover:bg-[#d92b6e]"
            >
              Criar conta
            </Button>
          </div>
        </form>
      </div>

      <p className="mt-5 text-center text-xs text-[#7A9CA5]">
        já tem flog?{" "}
        <Link to="/login" data-testid="signup-login-link" className="text-[#2f7df6] underline">
          entrar na minha conta
        </Link>
      </p>
    </div>
  );
}
