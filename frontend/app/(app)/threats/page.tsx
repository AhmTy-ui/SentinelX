"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { RiskLevel, ThreatFeedItem } from "@/lib/types";
import { riskMeta, timeAgo } from "@/lib/format";
import { ChainBadge, RiskBadge, Stat } from "@/components/ui";
import { CHAINS } from "@/components/AppContext";
import { Radar } from "@/components/icons";

const LEVELS: (RiskLevel | "ALL")[] = ["ALL", "MALICIOUS", "HIGH RISK", "WARNING", "CAUTION", "SAFE"];

export default function ThreatsPage() {
  const [items, setItems] = useState<ThreatFeedItem[]>([]);
  const [level, setLevel] = useState<RiskLevel | "ALL">("ALL");
  const [chain, setChain] = useState<string>("all");
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const load = () => api.threatFeed(40).then(setItems).catch(() => {});
    load();
    if (paused) return;
    const t = setInterval(load, 12000);
    return () => clearInterval(t);
  }, [paused]);

  const filtered = useMemo(
    () =>
      items.filter(
        (t) =>
          (level === "ALL" || t.risk_level === level) &&
          (chain === "all" || t.chain.toLowerCase().includes(chain)),
      ),
    [items, level, chain],
  );

  const counts = useMemo(() => {
    const c = { malicious: 0, high: 0, warning: 0, atRisk: 0 };
    for (const t of items) {
      if (t.risk_level === "MALICIOUS") c.malicious++;
      else if (t.risk_level === "HIGH RISK") c.high++;
      else if (t.risk_level === "WARNING") c.warning++;
    }
    return c;
  }, [items]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Threat Monitor</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Real-time global threat surveillance across EVM networks
          </p>
        </div>
        <button
          onClick={() => setPaused((p) => !p)}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
            paused
              ? "border-border bg-surface-2 text-ink-muted"
              : "border-[rgba(255,77,79,0.4)] bg-[rgba(255,45,85,0.06)] text-[#ff8a8b]"
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${paused ? "bg-ink-faint" : "live-dot bg-danger text-danger"}`} />
          {paused ? "Stream paused" : "Live · streaming"}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Malicious (live)" value={counts.malicious} accent="#ff7a96" />
        <Stat label="High risk (live)" value={counts.high} accent="#ff8a8b" />
        <Stat label="Warnings (live)" value={counts.warning} accent="#fac974" />
        <Stat label="Total tracked" value={items.length} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                level === l
                  ? "border-brand bg-brand-dim/60 text-ink"
                  : "border-border bg-surface-2 text-ink-muted hover:text-ink"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap gap-1.5">
          <button
            onClick={() => setChain("all")}
            className={`rounded-lg border px-3 py-1.5 text-xs ${
              chain === "all" ? "border-brand text-ink" : "border-border bg-surface-2 text-ink-muted"
            }`}
          >
            All chains
          </button>
          {CHAINS.map((c) => (
            <button
              key={c.id}
              onClick={() => setChain(c.id)}
              className={`rounded-lg border px-3 py-1.5 text-xs ${
                chain === c.id ? "border-brand text-ink" : "border-border bg-surface-2 text-ink-muted"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => {
          const m = riskMeta(t.risk_level);
          const href = t.subject.startsWith("0x") && t.subject.length > 20 ? `/contracts?q=${t.subject}` : `/wallet?q=${t.subject}`;
          return (
            <Link
              key={t.id}
              href={href}
              className="card group p-4 transition hover:border-brand"
              style={{ borderLeft: `3px solid ${m.color}` }}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-ink">{t.threat_type}</h3>
                <RiskBadge level={t.risk_level} size="sm" />
              </div>
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-muted">{t.summary}</p>
              <div className="mt-3 flex items-center justify-between">
                <ChainBadge chain={t.chain} />
                <span className="text-[11px] text-ink-faint">{timeAgo(t.timestamp)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-ink-faint">
                <span className="font-mono">{t.subject}</span>
                {t.value_at_risk && <span className="text-[#fac974]">{t.value_at_risk}</span>}
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-14 text-center text-ink-faint">
          <Radar width={28} height={28} />
          <p className="text-sm">No threats match the current filters.</p>
        </div>
      )}
    </div>
  );
}
