/** Diagramas estilo desenho técnico/blueprint — linha fina, cotas e marcas de mira. */

function Ticks({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return (
    <g stroke="currentColor" strokeWidth="0.75" opacity="0.5">
      <line x1={x1} y1={y1} x2={x2} y2={y2} strokeDasharray="2 3" />
      <line x1={x1} y1={y1 - 3} x2={x1} y2={y1 + 3} />
      <line x1={x2} y1={y2 - 3} x2={x2} y2={y2 + 3} />
    </g>
  );
}

export function CornerFrame({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden preserveAspectRatio="none">
      <g stroke="currentColor" strokeWidth="1" opacity="0.5">
        <path d="M2 16 V2 H16" fill="none" />
        <path d="M84 2 H98 V16" fill="none" />
        <path d="M98 84 V98 H84" fill="none" />
        <path d="M16 98 H2 V84" fill="none" />
      </g>
    </svg>
  );
}

export function SchematicStack({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" className={className} aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={40} y={30 + i * 22} width={120} height={14} stroke="currentColor" strokeWidth="1.2" opacity={1 - i * 0.14} />
      ))}
      <Ticks x1={40} y1={126} x2={160} y2={126} />
      <line x1="40" y1="130" x2="40" y2="140" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
      <line x1="160" y1="130" x2="160" y2="140" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
      <text x="100" y="152" textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.5" fontFamily="var(--font-mono)">
        120mm
      </text>
    </svg>
  );
}

export function SchematicMolecule({ className }: { className?: string }) {
  const hex = (cx: number, cy: number, r: number) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 2;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(" ");
  return (
    <svg viewBox="0 0 200 160" fill="none" className={className} aria-hidden>
      <polygon points={hex(70, 80, 30)} stroke="currentColor" strokeWidth="1.2" />
      <polygon points={hex(130, 80, 30)} stroke="currentColor" strokeWidth="1.2" />
      <line x1="97" y1="70" x2="103" y2="70" stroke="currentColor" strokeWidth="1.2" />
      <line x1="97" y1="90" x2="103" y2="90" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="70" cy="80" r="1.6" fill="currentColor" />
      <circle cx="130" cy="80" r="1.6" fill="currentColor" />
      <line x1="70" y1="50" x2="70" y2="30" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 3" opacity="0.5" />
      <line x1="130" y1="50" x2="130" y2="30" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 3" opacity="0.5" />
      <Ticks x1={70} y1={30} x2={130} y2={30} />
    </svg>
  );
}

export function SchematicDroplet({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" className={className} aria-hidden>
      <path
        d="M100 24 C118 52 138 76 138 98 C138 122 121 138 100 138 C79 138 62 122 62 98 C62 76 82 52 100 24Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <line x1="100" y1="24" x2="100" y2="10" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 3" opacity="0.5" />
      <line x1="62" y1="98" x2="40" y2="98" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 3" opacity="0.5" />
      <line x1="138" y1="98" x2="160" y2="98" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 3" opacity="0.5" />
      <Ticks x1={40} y1={112} x2={160} y2={112} />
      <text x="100" y="152" textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.5" fontFamily="var(--font-mono)">
        Ø raio variável
      </text>
    </svg>
  );
}

export function ProcessFlow({ className }: { className?: string }) {
  const nodes = [
    { x: 40, label: "MP" },
    { x: 180, label: "PROC." },
    { x: 320, label: "COA" },
  ];
  return (
    <svg viewBox="0 0 360 90" fill="none" className={className} aria-hidden>
      <line x1="60" y1="45" x2="160" y2="45" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" opacity="0.5" />
      <line x1="200" y1="45" x2="300" y2="45" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" opacity="0.5" />
      {nodes.map((n) => (
        <g key={n.label}>
          <circle cx={n.x} cy={45} r="20" stroke="currentColor" strokeWidth="1.2" />
          <text x={n.x} y={49} textAnchor="middle" fontSize="8" fill="currentColor" fontFamily="var(--font-mono)">
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
