import type { ThreatItem } from "@/lib/types";
import { riskMeta } from "@/lib/format";
import { ConfidenceMeter, RiskBadge } from "./ui";

export function ThreatCard({ item }: { item: ThreatItem }) {
  const m = riskMeta(item.severity);
  return (
    <div
      className="rounded-xl border bg-surface-2 p-4"
      style={{ borderColor: m.border }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
            style={{ background: m.color, boxShadow: `0 0 8px ${m.color}` }}
          />
          <h4 className="text-sm font-semibold text-ink">{item.category}</h4>
        </div>
        <RiskBadge level={item.severity} size="sm" />
      </div>
      <p className="mt-2 text-xs leading-relaxed text-ink-muted">
        {item.explanation}
      </p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-ink-faint">
          Detection confidence
        </span>
        <ConfidenceMeter value={item.confidence} />
      </div>
    </div>
  );
}
