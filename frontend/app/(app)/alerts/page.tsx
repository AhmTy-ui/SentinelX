"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { AlertItem } from "@/lib/types";
import { riskMeta, timeAgo } from "@/lib/format";
import { Button, Card, ChainBadge, RiskBadge, Stat } from "@/components/ui";
import { Bell, Check } from "@/components/icons";

const TABS = ["active", "resolved", "all"] as const;
type Tab = (typeof TABS)[number];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [tab, setTab] = useState<Tab>("active");
  const [busy, setBusy] = useState<number | null>(null);

  const load = () => api.alerts().then(setAlerts).catch(() => {});
  useEffect(() => {
    load();
  }, []);

  const resolve = async (id: number) => {
    setBusy(id);
    try {
      await api.resolveAlert(id);
      await load();
    } finally {
      setBusy(null);
    }
  };

  const filtered = useMemo(
    () =>
      alerts.filter((a) =>
        tab === "all" ? true : tab === "active" ? a.status !== "Resolved" : a.status === "Resolved",
      ),
    [alerts, tab],
  );

  const active = alerts.filter((a) => a.status !== "Resolved").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Alerts Center</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Triage & respond to monitored wallet and contract events
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Active alerts" value={active} accent="#ff8a8b" />
        <Stat label="Resolved" value={alerts.length - active} accent="#7ee2a8" />
        <Stat label="Total" value={alerts.length} />
      </div>

      <div className="flex rounded-lg border border-border bg-surface-2 p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md py-2 text-sm font-medium capitalize transition ${
              tab === t ? "bg-brand text-white" : "text-ink-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((a) => {
          const m = riskMeta(a.severity);
          const resolved = a.status === "Resolved";
          return (
            <Card key={a.id} className="!p-4" >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex gap-3">
                  <span
                    className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: m.color, boxShadow: `0 0 8px ${m.color}` }}
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-ink">{a.event}</h3>
                      <RiskBadge level={a.severity} size="sm" />
                      {resolved && (
                        <span className="rounded-full border border-[rgba(46,204,113,0.4)] bg-[rgba(46,204,113,0.1)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[#7ee2a8]">
                          Resolved
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm text-ink-muted">{a.detail}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-ink-faint">
                      <ChainBadge chain={a.chain} />
                      <span className="font-mono">{a.subject}</span>
                      <span>· {timeAgo(a.created_at)}</span>
                    </div>
                  </div>
                </div>
                {!resolved && (
                  <Button
                    variant="outline"
                    onClick={() => resolve(a.id)}
                    disabled={busy === a.id}
                  >
                    <Check width={15} height={15} /> Resolve
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-14 text-center text-ink-faint">
            <Bell width={28} height={28} />
            <p className="text-sm">No {tab === "all" ? "" : tab} alerts.</p>
          </div>
        )}
      </div>
    </div>
  );
}
