// Timestamps no estilo recado de 2006: "hoje · 21:47", "ontem · 15:02", "12 mar 2006 · 09:13".
import { format, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";

export function retroTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  if (isToday(d)) return `hoje · ${format(d, "HH:mm")}`;
  if (isYesterday(d)) return `ontem · ${format(d, "HH:mm")}`;
  return format(d, "dd MMM yyyy · HH:mm", { locale: ptBR });
}
