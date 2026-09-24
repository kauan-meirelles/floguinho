// Filtros retrô do Floguinho — o backend guarda o id, o CSS aplica o efeito.
export interface RetroFilter {
  id: string;
  label: string;
  css: string;
}

export const FILTERS: RetroFilter[] = [
  { id: "normal", label: "Normal", css: "none" },
  { id: "n2006", label: "2006", css: "saturate(1.35) contrast(1.08) brightness(1.02)" },
  { id: "sepia", label: "Sépia", css: "sepia(0.55) saturate(1.1)" },
  { id: "hard", label: "Contraste", css: "contrast(1.55) saturate(1.15)" },
  { id: "y2k", label: "Y2K Flash", css: "saturate(2) hue-rotate(-10deg) contrast(1.12) brightness(1.05)" },
];

export function filterCss(id: string): string {
  return FILTERS.find((f) => f.id === id)?.css ?? "none";
}
