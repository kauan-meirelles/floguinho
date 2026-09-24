import { BadgeCheck } from "lucide-react";

// O selinho de flog verificado — dado pelo dono da rede.
export default function VerifiedBadge({ size = 14 }: { size?: number }) {
  return (
    <span
      data-testid="verified-badge"
      title="flog verificado pelo dono"
      aria-label="flog verificado"
      className="inline-flex items-center"
    >
      <BadgeCheck style={{ width: size, height: size }} className="fill-[#1D9BF0] text-white" />
    </span>
  );
}
