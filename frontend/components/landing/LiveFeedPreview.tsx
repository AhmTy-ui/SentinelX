"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ThreatFeedItem } from "@/lib/types";
import { riskMeta, timeAgo } from "@/lib/format";
import { RiskBadge } from "@/components/ui";

export function LiveFeedPreview() {
  const [items, setItems] = useState<ThreatFeedItem[]>([]);

  useEffect(() => {
    const load = () => api.threatFeed(6).then(setItems).catch(() => {});
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  if (!items.length) {
    return (
      <div className="card h-[360px] animate-pulse" />
    );
  }

  return (
    <div className="card overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-medium">
          <span className="live-dot h-2 w-2 rounded-full bg-danger text-danger" />
          Live Threat Intelligence Feed
        </span>
        <span className="text-[11px] text-ink-faint">auto-refresh · 15s</span>
      </div>
      <div className="divide-y divide-border">
        {items.map((t) => {
          const m = riskMeta(t.risk_level);
          return (
            <div key={t.id} className="flex items-center gap-3 px-4 py-3">
              <span
                className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
                style={{ background: m.color, boxShadow: `0 0 8px ${m.color}` }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink">{t.threat_type}</p>
                <p className="text-[11px] text-ink-faint">
                  {t.chain} · <span className="font-mono">{t.subject}</span> · {timeAgo(t.timestamp)}
                </p>
              </div>
              <div className="hidden text-right sm:block">
                <RiskBadge level={t.risk_level} size="sm" />
                <p className="mt-1 text-[10px] text-ink-faint">{t.confidence}% conf.</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
