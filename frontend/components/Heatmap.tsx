import type { HeatmapCell } from "@/lib/types";

function color(intensity: number) {
  // 0 -> dark surface, high -> threat red via blue/amber midpoints
  if (intensity > 75) return `rgba(255,77,79,${0.25 + (intensity / 100) * 0.7})`;
  if (intensity > 50) return `rgba(245,166,35,${0.2 + (intensity / 100) * 0.6})`;
  if (intensity > 25) return `rgba(47,129,247,${0.15 + (intensity / 100) * 0.5})`;
  return `rgba(46,204,113,${0.08 + (intensity / 100) * 0.35})`;
}

export function Heatmap({ cells }: { cells: HeatmapCell[] }) {
  const chains = Array.from(new Set(cells.map((c) => c.chain)));
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const lookup = new Map(cells.map((c) => [`${c.chain}-${c.hour}`, c.intensity]));

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <div className="min-w-[560px]">
        {chains.map((chain) => (
          <div key={chain} className="mb-1.5 flex items-center gap-2">
            <span className="w-20 shrink-0 text-right text-[11px] text-ink-muted">
              {chain}
            </span>
            <div className="flex gap-1">
              {hours.map((h) => {
                const v = lookup.get(`${chain}-${h}`) ?? 0;
                return (
                  <div
                    key={h}
                    title={`${chain} · ${h}:00 · intensity ${v}`}
                    className="h-5 w-5 rounded-[3px] border border-black/30"
                    style={{ background: color(v) }}
                  />
                );
              })}
            </div>
          </div>
        ))}
        <div className="ml-22 mt-2 flex items-center gap-2 pl-22 text-[10px] text-ink-faint">
          <span className="w-20" />
          <span>00:00</span>
          <span className="ml-auto">23:00</span>
        </div>
      </div>
    </div>
  );
}
