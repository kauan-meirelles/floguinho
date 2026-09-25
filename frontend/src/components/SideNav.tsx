import { NavLink, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Camera, LayoutGrid, MessageCircle, Settings, User, Users } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { Me, UnreadOut } from "@/lib/types";
import FloguinhoLogo from "@/components/FloguinhoLogo";
import UserAvatar from "@/components/UserAvatar";
import VerifiedBadge from "@/components/VerifiedBadge";
import { cn } from "@/lib/utils";

// Navegação lateral do desktop (>= lg): o app deixa de ser só "celular no meio da tela".
export default function SideNav() {
  const meQuery = useQuery({ queryKey: ["me"], queryFn: () => apiGet<Me>("/auth/me"), retry: false });
  const unreadQuery = useQuery({
    queryKey: ["unread"],
    queryFn: () => apiGet<UnreadOut>("/messages/unread-count"),
    refetchInterval: 10000,
  });
  const unread = unreadQuery.data?.count ?? 0;
  const me = meQuery.data;

  const items = [
    { to: "/", icon: LayoutGrid, label: "Início", testid: "side-nav-feed" },
    { to: "/explore", icon: Users, label: "Flogos", testid: "side-nav-explore" },
    { to: "/chat", icon: MessageCircle, label: "Chat", testid: "side-nav-chat", badge: unread },
    { to: "/create", icon: Camera, label: "Nova Foto", testid: "side-nav-create" },
    { to: me ? `/u/${me.username}` : "/settings", icon: User, label: "Meu Flog", testid: "side-nav-profile" },
    { to: "/settings", icon: Settings, label: "Configurações", testid: "side-nav-settings" },
  ];

  return (
    <aside
      data-testid="side-nav"
      className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col justify-between border-r border-[#174450] bg-[#081B20] px-4 py-6 lg:flex xl:w-64"
    >
      <div>
        <Link to="/" data-testid="side-nav-logo" className="mb-8 block">
          <FloguinhoLogo size={44} />
        </Link>

        <nav className="space-y-1">
          {items.map(({ to, icon: Icon, label, testid, badge }) => (
            <NavLink
              key={label}
              to={to}
              data-testid={testid}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-[#FF6600]/12 text-[#FF7A1A]"
                    : "text-[#B5CBD3] hover:bg-[#12343E] hover:text-white",
                )
              }
            >
              <span className="relative inline-flex">
                <Icon className="h-5 w-5" aria-hidden="true" />
                {badge ? (
                  <span
                    data-testid="side-nav-unread-badge"
                    className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D91B5C] px-1 text-[9px] font-bold text-white"
                  >
                    {badge}
                  </span>
                ) : null}
              </span>
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      {me && (
        <Link
          to={`/u/${me.username}`}
          data-testid="side-nav-me-card"
          className="flex items-center gap-2 rounded-xl border border-[#174450] bg-[#12343E]/70 p-2.5 transition-colors hover:border-[#FF6600]/50"
        >
          <UserAvatar src={me.avatar_url} username={me.username} size={36} />
          <div className="min-w-0 leading-tight">
            <p className="flex items-center gap-1 truncate text-xs font-extrabold text-[#FF7A1A]">
              {me.username}
              {me.verified && <VerifiedBadge size={12} />}
            </p>
            <p className="truncate text-[10px] text-[#7A9CA5]">ver meu flog</p>
          </div>
        </Link>
      )}
    </aside>
  );
}