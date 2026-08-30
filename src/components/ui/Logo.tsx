export function LogoMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="94" height="94" rx="22" fill="none" stroke="#c9a227" strokeWidth="4" />
      <rect x="27" y="52" width="12" height="26" rx="2" fill="#c9a227" />
      <rect x="44" y="38" width="12" height="40" rx="2" fill="#e8c766" />
      <rect x="61" y="24" width="12" height="54" rx="2" fill="#c9a227" />
    </svg>
  );
}

export function Logo({
  size = 32,
  className = "",
  compact = false,
}: {
  size?: number;
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 font-display ${className}`}>
      <LogoMark size={size} />
      <span className="tracking-tight">{compact ? "Budget Calculator" : "The Budget Calculator"}</span>
    </span>
  );
}
