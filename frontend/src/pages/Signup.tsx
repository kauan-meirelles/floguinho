import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPost, errorMessage } from "@/lib/api";
import type { Me } from "@/lib/types";
import { beginSession } from "@/lib/session";
import FloguinhoLogo from "@/components/FloguinhoLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-[#0D1117] px-6 py-10">
      <FloguinhoLogo size={64} />

      <div className="relative mt-12 w-full max-w-sm border-2 border-[#FF6B00] px-6 pt-8 pb-7">
        <div className="absolute -top-5 left-1/2 w-fit -translate-x-1/2 border-2 border-[#FF6B00] bg-[#0D1117] px-6 py-1">
          <h1 className="text-center text-lg font-bold text-white">Criar nova conta</h1>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!signupMut.isPending) signupMut.mutate();
          }}
        >
          <div className="flex items-center gap-3">
            <Label htmlFor="signup-username" className="w-24 shrink-0 text-right text-sm text-[#FF7A1A]">
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
              className="h-9 rounded-none border-0 bg-[#F5EFE0] text-[#1F2937] dark:bg-[#F5EFE0] dark:text-[#1F2937]"
            />
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="signup-email" className="w-24 shrink-0 text-right text-sm text-[#FF7A1A]">
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
              className="h-9 rounded-none border-0 bg-[#F5EFE0] text-[#1F2937] dark:bg-[#F5EFE0] dark:text-[#1F2937]"
            />
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="signup-password" className="w-24 shrink-0 text-right text-sm text-[#FF7A1A]">
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
                className="h-9 rounded-none border-0 bg-[#F5EFE0] pr-10 text-[#1F2937] dark:bg-[#F5EFE0] dark:text-[#1F2937]"
              />
              <button
                type="button"
                data-testid="signup-password-toggle"
                aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#6b7280] hover:text-[#1F2937]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="signup-avatar" className="w-24 shrink-0 text-right text-sm text-[#FF7A1A]">
              Foto (URL):
            </Label>
            <Input
              id="signup-avatar"
              data-testid="signup-avatar-input"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="opcional"
              className="h-9 rounded-none border-0 bg-[#F5EFE0] text-[#1F2937] placeholder:text-[#9aa1a9] dark:bg-[#F5EFE0] dark:text-[#1F2937]"
            />
          </div>

          <div className="flex justify-center pt-2">
            <Button
              type="submit"
              data-testid="signup-submit-button"
              disabled={signupMut.isPending}
              className="h-9 w-full max-w-56 rounded-[3px] bg-[#C2185B] px-4 text-xs font-extrabold uppercase tracking-wide text-white hover:bg-[#d92b6e]"
            >
              Criar conta
            </Button>
          </div>
        </form>
      </div>

      <p className="mt-8 text-center text-sm text-[#7A9CA5]">
        já tem flog?{" "}
        <Link to="/login" data-testid="signup-login-link" className="text-[#2f7df6] underline">
          entrar na minha conta
        </Link>
      </p>
    </div>
  );
}