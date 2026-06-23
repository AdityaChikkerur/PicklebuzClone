interface DiagramProps {
  className?: string;
}

export function TwoBounceDiagram({ className }: DiagramProps) {
  return (
    <svg
      viewBox="0 0 320 120"
      className={className}
      role="img"
      aria-label="Two-bounce rule: serve bounces, return bounces, then volleys allowed"
    >
      <rect x="10" y="20" width="300" height="80" rx="8" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <line x1="160" y1="20" x2="160" y2="100" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <rect x="10" y="55" width="150" height="25" fill="currentColor" opacity="0.08" />
      <rect x="160" y="55" width="150" height="25" fill="currentColor" opacity="0.08" />
      <text x="85" y="72" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.7">Bounce 1</text>
      <text x="235" y="72" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.7">Bounce 2</text>
      <path d="M 50 35 Q 120 10 160 40" fill="none" stroke="#16a34a" strokeWidth="2" markerEnd="url(#arrow)" />
      <path d="M 270 35 Q 200 10 160 40" fill="none" stroke="#2563eb" strokeWidth="2" />
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#16a34a" />
        </marker>
      </defs>
      <text x="160" y="110" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.5">Then volleys allowed</text>
    </svg>
  );
}

export function KitchenDiagram({ className }: DiagramProps) {
  return (
    <svg
      viewBox="0 0 320 120"
      className={className}
      role="img"
      aria-label="Kitchen zone marked near the net on both sides"
    >
      <rect x="20" y="30" width="280" height="60" rx="6" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <line x1="160" y1="30" x2="160" y2="90" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <rect x="20" y="30" width="280" height="18" fill="#dc2626" opacity="0.15" />
      <rect x="20" y="72" width="280" height="18" fill="#dc2626" opacity="0.15" />
      <text x="160" y="42" textAnchor="middle" fontSize="9" fill="#dc2626">Kitchen — no volleys</text>
      <text x="160" y="84" textAnchor="middle" fontSize="9" fill="#dc2626">Kitchen — no volleys</text>
      <circle cx="100" cy="60" r="6" fill="#16a34a" opacity="0.8" />
      <text x="100" y="105" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.6">OK to volley</text>
    </svg>
  );
}

export function UnderhandServeDiagram({ className }: DiagramProps) {
  return (
    <svg
      viewBox="0 0 200 140"
      className={className}
      role="img"
      aria-label="Underhand serve with paddle below wrist and waist"
    >
      <line x1="60" y1="120" x2="60" y2="50" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      <circle cx="60" cy="42" r="10" fill="currentColor" opacity="0.3" />
      <line x1="60" y1="70" x2="95" y2="95" stroke="currentColor" strokeWidth="2" opacity="0.4" />
      <line x1="95" y1="95" x2="130" y2="110" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="145" cy="112" rx="14" ry="8" fill="#16a34a" opacity="0.6" transform="rotate(-20 145 112)" />
      <line x1="60" y1="78" x2="120" y2="78" stroke="#dc2626" strokeWidth="1" strokeDasharray="4 3" />
      <text x="125" y="75" fontSize="8" fill="#dc2626">waist</text>
      <circle cx="8" cy="112" r="5" fill="#fbbf24" opacity="0.9" />
      <text x="100" y="135" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.6">Paddle below wrist</text>
    </svg>
  );
}

export function DiagonalServeDiagram({ className }: DiagramProps) {
  return (
    <svg
      viewBox="0 0 320 120"
      className={className}
      role="img"
      aria-label="Diagonal serve from right court to opponent right court"
    >
      <rect x="10" y="20" width="140" height="80" rx="6" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <rect x="170" y="20" width="140" height="80" rx="6" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <line x1="10" y1="60" x2="150" y2="60" stroke="currentColor" opacity="0.2" />
      <line x1="170" y1="60" x2="310" y2="60" stroke="currentColor" opacity="0.2" />
      <circle cx="120" cy="75" r="5" fill="#16a34a" />
      <circle cx="260" cy="35" r="5" fill="#2563eb" />
      <path d="M 120 75 Q 190 20 260 35" fill="none" stroke="#16a34a" strokeWidth="2" strokeDasharray="6 4" markerEnd="url(#arrow2)" />
      <defs>
        <marker id="arrow2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#16a34a" />
        </marker>
      </defs>
      <text x="80" y="110" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.5">Server</text>
      <text x="240" y="110" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.5">Receiver</text>
    </svg>
  );
}

export function FaultsDiagram({ className }: DiagramProps) {
  return (
    <svg
      viewBox="0 0 280 100"
      className={className}
      role="img"
      aria-label="Common faults: net, out, kitchen volley"
    >
      <rect x="10" y="15" width="80" height="70" rx="6" fill="none" stroke="#dc2626" strokeWidth="1.5" opacity="0.5" />
      <text x="50" y="55" textAnchor="middle" fontSize="10" fill="#dc2626">Net</text>
      <rect x="100" y="15" width="80" height="70" rx="6" fill="none" stroke="#dc2626" strokeWidth="1.5" opacity="0.5" />
      <text x="140" y="55" textAnchor="middle" fontSize="10" fill="#dc2626">Out</text>
      <rect x="190" y="15" width="80" height="70" rx="6" fill="none" stroke="#dc2626" strokeWidth="1.5" opacity="0.5" />
      <text x="230" y="48" textAnchor="middle" fontSize="9" fill="#dc2626">Kitchen</text>
      <text x="230" y="62" textAnchor="middle" fontSize="9" fill="#dc2626">volley</text>
      <text x="140" y="95" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.5">Fault = rally ends</text>
    </svg>
  );
}

export function DoublesScoringDiagram({ className }: DiagramProps) {
  return (
    <svg
      viewBox="0 0 300 110"
      className={className}
      role="img"
      aria-label="Doubles server rotation S1 then S2"
    >
      <rect x="20" y="25" width="100" height="50" rx="8" fill="#16a34a" opacity="0.15" stroke="#16a34a" strokeWidth="1.5" />
      <text x="70" y="48" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#16a34a">S1</text>
      <text x="70" y="62" textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.6">Server 1</text>
      <path d="M 125 50 L 145 50" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#arrow3)" />
      <rect x="150" y="25" width="100" height="50" rx="8" fill="#2563eb" opacity="0.15" stroke="#2563eb" strokeWidth="1.5" />
      <text x="200" y="48" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#2563eb">S2</text>
      <text x="200" y="62" textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.6">Server 2</text>
      <path d="M 255 50 L 275 50" stroke="currentColor" strokeWidth="1.5" />
      <text x="285" y="54" fontSize="14" fill="currentColor" opacity="0.5">→</text>
      <text x="150" y="95" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.5">Then side-out to opponents</text>
      <defs>
        <marker id="arrow3" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
        </marker>
      </defs>
    </svg>
  );
}

export function SideOutDiagram({ className }: DiagramProps) {
  return (
    <svg
      viewBox="0 0 300 110"
      className={className}
      role="img"
      aria-label="Side-out: receiving team wins rally but does not score"
    >
      <rect x="20" y="30" width="110" height="45" rx="8" fill="#16a34a" opacity="0.12" stroke="#16a34a" strokeWidth="1.5" />
      <text x="75" y="52" textAnchor="middle" fontSize="10" fill="#16a34a" fontWeight="bold">Serving</text>
      <text x="75" y="66" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.6">scores on win</text>
      <rect x="170" y="30" width="110" height="45" rx="8" fill="#2563eb" opacity="0.12" stroke="#2563eb" strokeWidth="1.5" />
      <text x="225" y="52" textAnchor="middle" fontSize="10" fill="#2563eb" fontWeight="bold">Receiving</text>
      <text x="225" y="66" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.6">side-out on win</text>
      <text x="150" y="95" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.5">No point — serve switches</text>
    </svg>
  );
}
