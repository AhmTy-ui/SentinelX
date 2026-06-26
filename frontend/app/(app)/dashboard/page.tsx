"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { DashboardData } from "@/lib/types";
import { riskMeta, timeAgo } from "@/lib/format";
import { Heatmap } from "@/components/Heatmap";
import { Card, RiskBadge, Stat } from "@/components/ui";
import { Activity, Bolt, Code, FileCode, Wallet } from "@/components/icons";

const QUICK = [
  { href: "/wallet", label: "Analyze Wallet", icon: Wallet },
  { href: "/contracts", label: "Scan Contract", icon: FileCode },
  { href: "/transactions", label: "Decode Transaction", icon: Activity },
  { href: "/developers", label: "Generate API Key", icon: Code },
];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const load = () => api.dashboard().then(setData).catch((e) => setErr(e.message));
    load();
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mission Control</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Real-time Web3 security operations center
          </p>
        </div>
        <span className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs text-ink-muted">
          <span className="live-dot h-2 w-2 rounded-full bg-[#2ecc71] text-[#2ecc71]" />
          Live monitoring · 4 chains
        </span>
      </div>

      {/* AI summary banner */}
      {data && (
        <div className="card relative overflow-hidden p-5">
          <div className="absolute inset-0 grid-bg opacity-20" />
          <div className="relative">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-dim text-brand-bright">
                <Bolt width={15} height={15} />
              </span>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">
                AI Intelligence Summary · last 24h
              </h2>
            </div>
            <ul className="mt-3 grid gap-2 md:grid-cols-3">
              {data.ai_intelligence.map((s, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-border bg-surface-2 p-3 text-sm text-ink-muted"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {err && (
        <div className="card border-[rgba(255,77,79,0.4)] text-sm text-[#ff8a8b]">
          Could not reach the SentinelX API ({err}). Ensure the backend is running on{" "}
          <span className="font-mono">{api.base}</span>.
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {(data?.stats ?? Array.from({ length: 5 })).map((s, i) =>
          s ? (
            <Stat key={i} label={s.label} value={s.value} sub={s.change} />
          ) : (
            <div key={i} className="card-2 h-24 animate-pulse p-4" />
          ),
        )}
      </div>

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK.map((q) => {
          const Icon = q.icon;
          return (
            <Link
              key={q.href}
              href={q.href}
              className="card group flex items-center gap-3 p-4 transition hover:border-brand"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-dim text-brand-bright transition group-hover:scale-105">
                <Icon width={20} height={20} />
              </span>
              <span className="text-sm font-medium">{q.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Heatmap */}
        <Card className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Threat Activity Heatmap</h2>
              <p className="text-xs text-ink-faint">Chain activity spikes · 24h window</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-ink-faint">
              <span className="h-3 w-3 rounded-[2px]" style={{ background: "rgba(46,204,113,0.4)" }} />
              low
              <span className="h-3 w-3 rounded-[2px]" style={{ background: "rgba(47,129,247,0.6)" }} />
              <span className="h-3 w-3 rounded-[2px]" style={{ background: "rgba(245,166,35,0.7)" }} />
              <span className="h-3 w-3 rounded-[2px]" style={{ background: "rgba(255,77,79,0.85)" }} />
              high
            </div>
          </div>
          {data ? (
            <Heatmap cells={data.heatmap} />
          ) : (
            <div className="h-40 animate-pulse rounded-lg bg-surface-2" />
          )}
        </Card>

        {/* Live feed */}
        <Card className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <span className="live-dot h-2 w-2 rounded-full bg-danger text-danger" />
              Live Threat Feed
            </h2>
            <Link href="/threats" className="text-xs text-brand-bright hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-1">
            {(data?.feed ?? []).map((t) => {
              const m = riskMeta(t.risk_level);
              return (
                <div
                  key={t.id}
                  className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-surface-2"
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: m.color, boxShadow: `0 0 6px ${m.color}` }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-ink">{t.threat_type}</p>
                    <p className="text-[11px] text-ink-faint">
                      {t.chain} · <span className="font-mono">{t.subject}</span> ·{" "}
                      {timeAgo(t.timestamp)}
                    </p>
                  </div>
                  <RiskBadge level={t.risk_level} size="sm" />
                </div>
              );
            })}
            {!data && (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-2" />
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
