import { NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Camera, LayoutGrid, MessageCircle, Settings, User, Users } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { Me, UnreadOut } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function BottomTabBar() {
  // Mesma query key do RequireAuth — cache compartilhado, sem chamada extra.
  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: () => apiGet<Me>("/auth/me"),
    retry: false,
  });
  
  const unreadQuery = useQuery({
    queryKey: ["unread"],
    queryFn: () => apiGet<UnreadOut>("/messages/unread-count"),
    refetchInterval: 10000,
  });
  
  const unread = unreadQuery.data?.count ?? 0;
  const profileTo = meQuery.data ? `/u/${meQuery.data.username}` : "/settings";

  const tabs = [
    { to: "/", icon: LayoutGrid, label: "Início", testid: "nav-feed-tab", end: true },
    { to: "/explore", icon: Users, label: "Flogos", testid: "nav-explore-tab", end: false },
    { to: "/chat", icon: MessageCircle, label: "Chat", testid: "nav-chat-tab", badge: unread, end: false },
    { to: "/create", icon: Camera, label: "Nova Foto", testid: "nav-create-tab", end: false },
    { to: profileTo, icon: User, label: "Perfil", testid: "nav-profile-tab", end: false },
    { to: "/settings", icon: Settings, label: "Config", testid: "nav-settings-tab", end: false },
  ];

  return (
    <nav
      data-testid="bottom-tab-bar"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto flex h-16 max-w-md items-center justify-around border-t border-[#174450] bg-[#081B20] px-1 lg:hidden"
    >
      {tabs.map(({ to, icon: Icon, label, testid, badge, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          data-testid={testid}
          className={({ isActive }) =>
            cn(
              "flex min-w-11 flex-col items-center gap-0.5 rounded-lg px-1.5 py-1.5 text-[10px] font-semibold transition-transform active:scale-95",
              isActive ? "text-[#FF6B00]" : "text-[#7A9CA5]",
            )
          }
        >
          <span className="relative inline-flex">
            <Icon className="h-5 w-5" aria-hidden="true" />
            {badge ? (
              <span
                data-testid="nav-chat-unread-badge"
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
  );
}