import type { UsagePoint } from "@/lib/types";

export function UsageChart({
  series,
  metric = "requests",
  height = 180,
  color = "var(--color-brand-bright)",
}: {
  series: UsagePoint[];
  metric?: "requests" | "errors" | "threats" | "latency_ms";
  height?: number;
  color?: string;
}) {
  const W = 720;
  const H = height;
  const pad = 8;
  const vals = series.map((p) => p[metric]);
  const max = Math.max(1, ...vals);
  const stepX = (W - pad * 2) / Math.max(1, series.length - 1);

  const pts = series.map((p, i) => {
    const x = pad + i * stepX;
    const y = H - pad - (p[metric] / max) * (H - pad * 2);
    return [x, y] as const;
  });

  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1]?.[0].toFixed(1)},${H - pad} L${pts[0]?.[0].toFixed(1)},${H - pad} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} className="block">
      <defs>
        <linearGradient id={`area-${metric}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => (
        <line
          key={g}
          x1={pad}
          x2={W - pad}
          y1={H - pad - g * (H - pad * 2)}
          y2={H - pad - g * (H - pad * 2)}
          stroke="var(--color-border)"
          strokeDasharray="2 4"
        />
      ))}
      <path d={area} fill={`url(#area-${metric})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.6} fill={color} opacity={0.6} />
      ))}
    </svg>
  );
}
