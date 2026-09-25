import type { ReactNode } from "react";
import SideNav from "@/components/SideNav";

// No celular: um frame estreito, como o app da série.
// No desktop: barra lateral + coluna de conteúdo e um painel de fundo com o clima da rede.
export default function FloguinhoShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-[#06161b] bg-[radial-gradient(circle_at_18%_12%,rgba(255,107,0,0.10),transparent_45%),radial-gradient(circle_at_82%_78%,rgba(217,27,92,0.10),transparent_45%)]">
      <div className="mx-auto flex w-full max-w-6xl justify-center lg:gap-8">
        <SideNav />
        <div
          data-testid="app-shell"
          className="relative flex w-full max-w-md flex-col border-x border-[#174450] bg-[#0C232A] shadow-[0_0_90px_rgba(255,107,0,0.12)] lg:my-6 lg:max-w-xl lg:rounded-2xl lg:border lg:shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
        >
          {children}
        </div>

        {/* Coluna de apoio: só aparece em telas largas, para o desktop não ficar vazio */}
        <aside className="hidden w-64 shrink-0 py-8 xl:block" data-testid="desktop-aside">
          <div className="rounded-2xl border border-[#174450] bg-[#0F2D35]/70 p-4">
            <p className="font-brand text-sm font-extrabold text-[#FF7A1A]">bem-vindo ao floguinho</p>
            <p className="pt-1.5 text-xs leading-relaxed text-[#96B8C2]">
              a rede social de fotos de <span className="text-white/80">De Volta aos 15</span>. poste
              suas fotos, ganhe fãs, deixe recados e converse no chat.
            </p>
          </div>
          <div className="mt-4 rounded-2xl border border-[#174450] bg-[#0F2D35]/70 p-4">
            <p className="text-[11px] font-extrabold tracking-wide text-[#B5CBD3] uppercase">
              dicas de 2006
            </p>
            <ul className="space-y-1.5 pt-2 text-xs text-[#96B8C2]">
              <li>★ "f/f?" = fã por fã, a moeda da rede</li>
              <li>★ use os filtros retrô antes de postar</li>
              <li>★ recado bom volta em dobro ♥</li>
            </ul>
          </div>
          <p className="pt-4 text-center text-[10px] text-[#3f5f68]">floguinho © 2006</p>
        </aside>
      </div>
    </div>
  );
}