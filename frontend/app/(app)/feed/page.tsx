"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { ThreatFeedItem } from "@/lib/types";
import { riskMeta, timeAgo } from "@/lib/format";
import { Card, ChainBadge, RiskBadge } from "@/components/ui";
import { News, Search } from "@/components/icons";

export default function FeedPage() {
  const [items, setItems] = useState<ThreatFeedItem[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    const load = () => api.threatFeed(50).then(setItems).catch(() => {});
    load();
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(
      (t) =>
        t.threat_type.toLowerCase().includes(s) ||
        t.summary.toLowerCase().includes(s) ||
        t.subject.toLowerCase().includes(s) ||
        t.chain.toLowerCase().includes(s),
    );
  }, [items, q]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Intelligence Feed</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Curated chronological stream of on-chain threat intelligence
          </p>
        </div>
        <span className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs text-ink-muted">
          <span className="live-dot h-2 w-2 rounded-full bg-danger text-danger" />
          {items.length} reports · auto-refresh
        </span>
      </div>

      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint">
          <Search width={18} height={18} />
        </span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter feed by type, chain, address…"
          className="w-full rounded-lg border border-border bg-surface-2 py-3 pl-10 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none"
        />
      </div>

      <div className="relative space-y-3 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-border">
        {filtered.map((t) => {
          const m = riskMeta(t.risk_level);
          return (
            <div key={t.id} className="relative pl-7">
              <span
                className="absolute left-0 top-5 h-3.5 w-3.5 rounded-full border-2 border-bg"
                style={{ background: m.color, boxShadow: `0 0 8px ${m.color}` }}
              />
              <Card className="!p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-ink">{t.threat_type}</h3>
                    <RiskBadge level={t.risk_level} size="sm" />
                  </div>
                  <span className="text-[11px] text-ink-faint">{timeAgo(t.timestamp)}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t.summary}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-ink-faint">
                  <ChainBadge chain={t.chain} />
                  <span className="font-mono">{t.subject}</span>
                  <span>·</span>
                  <span>{t.confidence}% confidence</span>
                  {t.value_at_risk && (
                    <span className="text-[#fac974]">· {t.value_at_risk} at risk</span>
                  )}
                </div>
              </Card>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-14 text-center text-ink-faint">
            <News width={28} height={28} />
            <p className="text-sm">No intelligence reports match your filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
