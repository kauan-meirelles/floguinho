import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPost, errorMessage } from "@/lib/api";
import type { Me } from "@/lib/types";
import { beginSession } from "@/lib/session";
import FloguinhoLogo from "@/components/FloguinhoLogo";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Réplica fiel da tela de login da série: fundo quase preto, logo da câmera,
// caixa com borda laranja, labels laranja, campos marfim e botões laranja/rosa.
export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: () => apiGet<Me>("/auth/me"),
    retry: false,
  });

  const loginMut = useMutation({
    mutationFn: () => apiPost<Me>("/auth/login", { username: username.trim(), password }),
    onSuccess: (me) => {
      beginSession();
      toast(`bem-vindo(a) de volta, ${me.username}! ☺`);
      navigate("/", { replace: true });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  if (meQuery.isSuccess) return <Navigate to="/" replace />;

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-[#0D1117] px-6 py-10">
      <FloguinhoLogo size={76} />

      <div className="relative mt-12 w-full max-w-sm border-2 border-[#FF6B00] px-6 pt-8 pb-7">
        <div className="absolute -top-5 left-1/2 w-fit -translate-x-1/2 whitespace-nowrap border-2 border-[#FF6B00] bg-[#0D1117] px-6 py-1">
          <h1 className="text-center text-lg font-bold text-white">Entrar na minha conta</h1>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!loginMut.isPending) loginMut.mutate();
          }}
        >
          <div className="flex items-center gap-3">
            <Label htmlFor="login-username" className="w-24 shrink-0 text-right text-sm text-[#FF7A1A]">
              Username:
            </Label>
            <Input
              id="login-username"
              data-testid="login-username-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              required
              className="h-9 rounded-none border-0 bg-[#F5EFE0] text-[#1F2937] dark:bg-[#F5EFE0] dark:text-[#1F2937]"
            />
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="login-password" className="w-24 shrink-0 text-right text-sm text-[#FF7A1A]">
              Senha:
            </Label>
            <div className="relative flex-1">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                data-testid="login-password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
                className="h-9 rounded-none border-0 bg-[#F5EFE0] pr-10 text-[#1F2937] dark:bg-[#F5EFE0] dark:text-[#1F2937]"
              />
              <button
                type="button"
                data-testid="login-password-toggle"
                aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#6b7280] hover:text-[#1F2937]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="button"
            data-testid="login-forgot-link"
            onClick={() => toast.info("fala com o dono: kauanrobert ☺")}
            className="mx-auto block text-xs text-[#2f7df6] underline"
          >
            Esqueceu a senha?
          </button>

          <div className="flex justify-center gap-3 pt-1">
            <Button
              type="submit"
              data-testid="login-submit-button"
              disabled={loginMut.isPending}
              className="h-9 rounded-[3px] bg-[#FF6600] px-4 text-xs font-extrabold uppercase tracking-wide text-white hover:bg-[#ff7d1f]"
            >
              Entrar na conta
            </Button>
            <Link
              to="/signup"
              data-testid="login-create-link"
              className={cn(
                buttonVariants(),
                "h-9 rounded-[3px] bg-[#C2185B] px-4 text-xs font-extrabold uppercase tracking-wide text-white hover:bg-[#d92b6e]",
              )}
            >
              Criar conta
            </Link>
          </div>
        </form>
      </div>

      <p className="mt-10 text-center text-[11px] text-[#4b5563]">
        a rede social da série{" "}
        <span className="font-bold text-white/80">De Volta aos 15</span> · original{" "}
        <span className="font-black tracking-tighter text-[#E50914]">NETFLIX</span>
      </p>
    </div>
  );
}