import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import { CameraMark } from "@/components/FloguinhoLogo";

export default function TopNavBar() {
  return (
    <header
      data-testid="top-nav-bar"
      className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-[#174450] bg-[#081B20]/90 px-4 backdrop-blur-md"
    >
      <span className="w-10" aria-hidden="true" />
      <Link to="/" data-testid="top-nav-logo-link" aria-label="Início" className="flex items-center gap-2">
        <CameraMark size={24} />
        <span className="font-brand text-lg leading-none font-extrabold text-white">floguinho</span>
      </Link>
      <Link
        to="/settings"
        data-testid="top-nav-settings-link"
        aria-label="Configurações"
        className="flex h-9 w-9 items-center justify-center rounded-full text-[#96B8C2] transition-colors hover:text-[#FF6B00]"
      >
        <Settings className="h-5 w-5" />
      </Link>
    </header>
  );
}