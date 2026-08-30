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
      <defs>
        <linearGradient id="genevieve-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f3d98a" />
          <stop offset="45%" stopColor="#c9a227" />
          <stop offset="100%" stopColor="#9c7d1b" />
        </linearGradient>
      </defs>
      <line x1="50" y1="12" x2="15" y2="90" stroke="url(#genevieve-gold)" strokeWidth="10" strokeLinecap="square" />
      <line x1="50" y1="12" x2="85" y2="90" stroke="url(#genevieve-gold)" strokeWidth="10" strokeLinecap="square" />
      <ellipse cx="50" cy="61" rx="27" ry="25" fill="#f3d98a" />
      <text
        x="50"
        y="72"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="700"
        fontSize="50"
        fill="#2b0810"
      >
        G
      </text>
      <rect x="43" y="56" width="15" height="4.2" fill="#2b0810" />
    </svg>
  );
}

export function Logo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display ${className}`}>
      <LogoMark size={size} />
      <span className="tracking-wide">
        Genevieve<span className="text-gold">.</span>
      </span>
    </span>
  );
}
