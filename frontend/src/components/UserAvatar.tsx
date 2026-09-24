import { cn } from "@/lib/utils";

// Avatar circular com anel laranja; sem foto, mostra as iniciais.
export default function UserAvatar({
  src,
  username,
  size = 40,
  ring = true,
}: {
  src?: string | null;
  username: string;
  size?: number;
  ring?: boolean;
}) {
  const initials = username.replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase() || "??";
  return (
    <span
      data-testid="user-avatar"
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#174450] text-[#96B8C2]",
        ring && "ring-2 ring-[#FF6B00]",
      )}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src} alt={username} className="h-full w-full object-cover" />
      ) : (
        <span style={{ fontSize: Math.max(10, size / 2.8) }} className="font-bold">
          {initials}
        </span>
      )}
    </span>
  );
}