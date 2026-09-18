/** Ilustrações de traço único, feitas à mão pra este site — sem ícones de biblioteca. */

export function LeafBranch({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 260" fill="none" className={className} aria-hidden>
      <path d="M110 250 C104 190 100 120 112 40" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M112 74 C150 66 178 80 190 112 C160 118 136 112 116 96"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M108 74 C70 66 42 80 30 112 C60 118 84 112 104 96"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M113 118 C155 112 184 128 196 162 C164 166 138 158 117 140"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M107 118 C65 112 36 128 24 162 C56 166 82 158 103 140"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M112 40 C118 30 128 24 140 24"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="140" cy="24" r="2.4" fill="currentColor" />
    </svg>
  );
}

export function MoleculeChain({ className }: { className?: string }) {
  const hex = (cx: number, cy: number, r: number) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 2;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(" ");

  return (
    <svg viewBox="0 0 260 200" fill="none" className={className} aria-hidden>
      <polygon points={hex(70, 100, 34)} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points={hex(140, 68, 34)} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points={hex(140, 136, 34)} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points={hex(210, 100, 34)} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="100" y1="88" x2="113" y2="82" stroke="currentColor" strokeWidth="1.5" />
      <line x1="100" y1="112" x2="113" y2="118" stroke="currentColor" strokeWidth="1.5" />
      <line x1="170" y1="82" x2="180" y2="88" stroke="currentColor" strokeWidth="1.5" />
      <line x1="170" y1="118" x2="180" y2="112" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="70" cy="100" r="2.2" fill="currentColor" />
      <circle cx="140" cy="68" r="2.2" fill="currentColor" />
      <circle cx="140" cy="136" r="2.2" fill="currentColor" />
      <circle cx="210" cy="100" r="2.2" fill="currentColor" />
    </svg>
  );
}

export function WaterRipple({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 220" fill="none" className={className} aria-hidden>
      <path
        d="M110 40 C126 68 148 92 148 118 C148 142 131 160 110 160 C89 160 72 142 72 118 C72 92 94 68 110 40Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <ellipse cx="110" cy="188" rx="70" ry="8" stroke="currentColor" strokeWidth="1.3" />
      <ellipse cx="110" cy="188" rx="46" ry="5.2" stroke="currentColor" strokeWidth="1.1" />
      <path d="M98 104 C98 96 104 90 112 90" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function Compass({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden>
      <circle cx="60" cy="60" r="42" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="60" cy="60" r="2" fill="currentColor" />
      <path d="M60 22 L67 58 L60 98 L53 58 Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M60 18 V26 M60 94 V102 M18 60 H26 M94 60 H102" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}
