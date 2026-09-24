import { Navigate, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { Me } from "@/lib/types";
import { CameraMark } from "@/components/FloguinhoLogo";
import FloguinhoShell from "@/components/FloguinhoShell";
import TopNavBar from "@/components/TopNavBar";
import BottomTabBar from "@/components/BottomTabBar";

// Protege as rotas do app: enquanto o /auth/me carrega mostra o shell (nunca tela em branco —
// a página tem que degradar bonito sem backend), e em 401 manda pro login.
export default function RequireAuth() {
  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: () => apiGet<Me>("/auth/me"),
    retry: false,
  });

  if (meQuery.isPending) {
    return (
      <FloguinhoShell>
        <div className="flex min-h-svh flex-col items-center justify-center gap-3">
          <CameraMark size={48} />
          <span className="font-brand text-xl font-extrabold text-white">floguinho</span>
        </div>
      </FloguinhoShell>
    );
  }

  if (meQuery.isError) {
    return <Navigate to="/login" replace />;
  }

  return (
    <FloguinhoShell>
      <TopNavBar />
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <BottomTabBar />
    </FloguinhoShell>
  );
}
