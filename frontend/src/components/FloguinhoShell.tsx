import type { ReactNode } from "react";

// O app é um celular retro: um frame estreito centralizado com borda petrol brilhante.
export default function FloguinhoShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh justify-center bg-[#04090c]">
      <div
        data-testid="app-shell"
        className="relative flex w-full max-w-md flex-col border-x border-[#174450] bg-[#0C232A] shadow-[0_0_90px_rgba(255,107,0,0.12)]"
      >
        {children}
      </div>
    </div>
  );
}
