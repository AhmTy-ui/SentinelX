"use client";

import { useMemo, useState } from "react";
import type { WalletGraph } from "@/lib/types";
import { riskMeta } from "@/lib/format";

export function Graph({
  graph,
  height = 320,
}: {
  graph: WalletGraph;
  height?: number;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const W = 640;
  const H = height;

  const positions = useMemo(() => {
    const pos: Record<string, { x: number; y: number }> = {};
    const cx = W / 2;
    const cy = H / 2;
    const peripheral = graph.nodes.filter((n) => n.id !== "root" && n.id !== "deployer");
    const center = graph.nodes.find((n) => n.id === "root") ?? graph.nodes[0];
    if (center) pos[center.id] = { x: cx, y: cy };
    const deployer = graph.nodes.find((n) => n.id === "deployer");
    if (deployer) pos[deployer.id] = { x: cx - 200, y: cy - 90 };
    const radius = Math.min(W, H) / 2 - 50;
    peripheral.forEach((n, i) => {
      const ang = (i / Math.max(1, peripheral.length)) * Math.PI * 2 - Math.PI / 2;
      pos[n.id] = {
        x: cx + Math.cos(ang) * radius,
        y: cy + Math.sin(ang) * radius * 0.78,
      };
    });
    return pos;
  }, [graph, H]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-[#070a0f] grid-bg">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} className="block">
        {graph.edges.map((e, i) => {
          const a = positions[e.source];
          const b = positions[e.target];
          if (!a || !b) return null;
          const active = hover === e.source || hover === e.target;
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={active ? "var(--color-brand-bright)" : "var(--color-border-strong)"}
              strokeWidth={active ? 2 : 1}
              strokeDasharray="4 6"
              style={{ animation: "dash 30s linear infinite", opacity: active ? 1 : 0.6 }}
            />
          );
        })}
        {graph.nodes.map((n) => {
          const p = positions[n.id];
          if (!p) return null;
          const m = riskMeta(n.risk_level);
          const isRoot = n.id === "root";
          const rad = isRoot ? 16 : 9;
          return (
            <g
              key={n.id}
              transform={`translate(${p.x},${p.y})`}
              onMouseEnter={() => setHover(n.id)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: "pointer" }}
            >
              <circle r={rad + 6} fill={m.color} opacity={0.12} />
              <circle
                r={rad}
                fill={n.kind === "contract" ? "var(--color-surface-3)" : m.color}
                stroke={m.color}
                strokeWidth={2}
                style={{ filter: `drop-shadow(0 0 6px ${m.color})` }}
              />
              {n.kind === "contract" && (
                <rect x={-4} y={-4} width={8} height={8} fill={m.color} rx={1} />
              )}
              <text
                y={rad + 14}
                textAnchor="middle"
                className="font-mono"
                fontSize={10}
                fill="var(--color-ink-muted)"
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="pointer-events-none absolute bottom-2 right-3 flex gap-3 text-[10px] text-ink-faint">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[var(--color-brand-bright)]" /> Wallet
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-[1px] bg-ink-muted" /> Contract
        </span>
      </div>
    </div>
  );
}
