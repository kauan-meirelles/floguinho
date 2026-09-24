// Logotipo do Floguinho: câmera branca com lente laranja + wordmark (fiel às referências).
export function CameraMark({ size = 56 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className="text-white"
    >
      <rect x="8" y="18" width="48" height="36" rx="7" stroke="currentColor" strokeWidth="4" />
      <rect x="23" y="7" width="15" height="9" rx="2" stroke="currentColor" strokeWidth="4" />
      <circle cx="32" cy="36" r="12.5" fill="#FF6B00" stroke="currentColor" strokeWidth="4" />
      <circle cx="32" cy="36" r="5.5" fill="#FFFFFF" opacity="0.92" />
      <circle cx="32" cy="36" r="2" fill="#26201a" />
    </svg>
  );
}

export default function FloguinhoLogo({
  size = 56,
  wordmark = true,
  className = "",
}: {
  size?: number;
  wordmark?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <CameraMark size={size} />
      {wordmark && (
        <span className="font-brand text-[26px] leading-none font-extrabold tracking-tight text-white">
          floguinho
        </span>
      )}
    </div>
  );
}