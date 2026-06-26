import type { RiskLevel } from "@/lib/types";
import { riskMeta } from "@/lib/format";

export function RiskMeter({
  score,
  level,
  size = 168,
}: {
  score: number;
  level: RiskLevel;
  size?: number;
}) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, score)) / 100;
  const m = riskMeta(level);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-surface-3)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={m.color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ filter: `drop-shadow(0 0 8px ${m.color})`, transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-4xl font-bold" style={{ color: m.color }}>
          {score}
        </span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-ink-faint">
          Risk Score
        </span>
        <span
          className="mt-1 text-xs font-semibold uppercase tracking-wide"
          style={{ color: m.text }}
        >
          {level}
        </span>
      </div>
    </div>
  );
}
