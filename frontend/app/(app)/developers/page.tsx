"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ApiKey, ApiKeyCreated, UsageData } from "@/lib/types";
import { fmtNum, timeAgo } from "@/lib/format";
import { Button, Card, Pill, SectionTitle, Spinner, Stat } from "@/components/ui";
import { UsageChart } from "@/components/UsageChart";
import { Check, Code, Copy, Plus, Trash } from "@/components/icons";

const ENDPOINTS = [
  { method: "POST", path: "/score-wallet", desc: "Risk score & behavioral profile for a wallet" },
  { method: "POST", path: "/analyze-transaction", desc: "Decode & simulate transaction intent" },
  { method: "POST", path: "/check-contract", desc: "Honeypot / rug-pull / permission scan" },
  { method: "GET", path: "/threat-feed", desc: "Live global threat intelligence stream" },
  { method: "GET", path: "/dashboard", desc: "Aggregate SOC metrics & heatmap" },
];

const SNIPPET = `import requests

resp = requests.post(
    "https://api.sentinelx.ai/score-wallet",
    headers={"Authorization": "Bearer sk_live_..."},
    json={"wallet": "0x123...", "chain": "ethereum"},
)
print(resp.json()["risk_level"])  # -> "HIGH RISK"`;

export default function DevelopersPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [name, setName] = useState("");
  const [env, setEnv] = useState("test");
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<ApiKeyCreated | null>(null);
  const [copied, setCopied] = useState(false);
  const [metric, setMetric] = useState<"requests" | "errors" | "threats">("requests");

  const loadKeys = () => api.keys().then(setKeys).catch(() => {});
  useEffect(() => {
    loadKeys();
    api.usage().then(setUsage).catch(() => {});
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const k = await api.createKey(name.trim(), env);
      setCreated(k);
      setName("");
      await loadKeys();
    } finally {
      setCreating(false);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Developer Portal</h1>
        <p className="mt-1 text-sm text-ink-muted">
          API keys, usage analytics & integration reference
        </p>
      </div>

      {/* Usage stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total requests (30d)" value={usage ? fmtNum(usage.total_requests) : "—"} />
        <Stat label="Error rate" value={usage ? `${usage.error_rate}%` : "—"} />
        <Stat label="Avg latency" value={usage ? `${usage.avg_latency_ms}ms` : "—"} />
        <Stat label="Threats detected" value={usage ? fmtNum(usage.threats_detected) : "—"} accent="#ff8a8b" />
      </div>

      {/* Plan / quota */}
      {usage && (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Pill tone="brand">{usage.plan} plan</Pill>
              <span className="text-sm text-ink-muted">
                {fmtNum(usage.used)} / {fmtNum(usage.quota)} monthly requests
              </span>
            </div>
            <Button variant="outline">Upgrade plan</Button>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand to-brand-bright"
              style={{ width: `${Math.min(100, (usage.used / usage.quota) * 100)}%` }}
            />
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Usage chart */}
        <Card className="lg:col-span-3">
          <SectionTitle
            right={
              <div className="flex gap-1">
                {(["requests", "errors", "threats"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMetric(m)}
                    className={`rounded-md px-2.5 py-1 text-[11px] capitalize ${
                      metric === m ? "bg-brand-dim/60 text-ink" : "text-ink-faint hover:text-ink-muted"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            }
          >
            API Usage · 30 days
          </SectionTitle>
          {usage ? (
            <UsageChart
              series={usage.series}
              metric={metric}
              color={metric === "errors" ? "#ff8a8b" : metric === "threats" ? "#fac974" : "var(--color-brand-bright)"}
            />
          ) : (
            <div className="h-44 animate-pulse rounded-lg bg-surface-2" />
          )}
        </Card>

        {/* Endpoint breakdown */}
        <Card className="lg:col-span-2">
          <SectionTitle>Top Endpoints</SectionTitle>
          <div className="space-y-3">
            {(usage?.by_endpoint ?? []).map((e) => (
              <div key={e.endpoint}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-ink-muted">{e.endpoint}</span>
                  <span className="text-ink-faint">{e.share}%</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
                  <div
                    className="h-full rounded-full bg-brand-bright"
                    style={{ width: `${e.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* API keys */}
      <Card>
        <SectionTitle sub="Secret keys carry full account privileges — store them securely">
          API Keys
        </SectionTitle>

        <form onSubmit={create} className="mb-4 flex flex-col gap-2 sm:flex-row">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Key name (e.g. Production backend)"
            className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none"
          />
          <select
            value={env}
            onChange={(e) => setEnv(e.target.value)}
            className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none"
          >
            <option value="test">Test</option>
            <option value="live">Live</option>
          </select>
          <Button type="submit" disabled={creating}>
            {creating ? <Spinner /> : <><Plus width={15} height={15} /> Generate Key</>}
          </Button>
        </form>

        {created && (
          <div className="mb-4 rounded-lg border border-[rgba(46,204,113,0.4)] bg-[rgba(46,204,113,0.07)] p-3">
            <p className="text-xs text-[#7ee2a8]">
              Copy your secret now — it will not be shown again.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 overflow-x-auto rounded-md bg-surface-3 px-3 py-2 font-mono text-xs text-ink">
                {created.secret}
              </code>
              <Button variant="outline" onClick={() => copy(created.secret)}>
                {copied ? <Check width={15} height={15} /> : <Copy width={15} height={15} />}
              </Button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wider text-ink-faint">
                <th className="py-2 pr-3 font-medium">Name</th>
                <th className="py-2 pr-3 font-medium">Key</th>
                <th className="py-2 pr-3 font-medium">Env</th>
                <th className="py-2 pr-3 font-medium">Last used</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {keys.map((k) => (
                <tr key={k.id} className="hover:bg-surface-2">
                  <td className="py-2.5 pr-3 text-ink">{k.name}</td>
                  <td className="py-2.5 pr-3 font-mono text-ink-muted">{k.key_prefix}…</td>
                  <td className="py-2.5 pr-3">
                    <Pill tone={k.environment === "live" ? "danger" : "default"}>{k.environment}</Pill>
                  </td>
                  <td className="py-2.5 pr-3 text-ink-faint">
                    {k.last_used_at ? timeAgo(k.last_used_at) : "never"}
                  </td>
                  <td className="py-2.5 pr-3">
                    {k.revoked ? (
                      <span className="text-[#ff8a8b]">revoked</span>
                    ) : (
                      <span className="text-[#7ee2a8]">active</span>
                    )}
                  </td>
                  <td className="py-2.5">
                    <div className="flex justify-end gap-1">
                      {!k.revoked && (
                        <button
                          onClick={() => api.revokeKey(k.id).then(loadKeys)}
                          className="rounded-md border border-border px-2 py-1 text-[11px] text-ink-muted hover:border-brand"
                        >
                          Revoke
                        </button>
                      )}
                      <button
                        onClick={() => api.deleteKey(k.id).then(loadKeys)}
                        className="grid h-7 w-7 place-items-center rounded-md border border-border text-ink-faint hover:border-[rgba(255,77,79,0.5)] hover:text-[#ff8a8b]"
                      >
                        <Trash width={14} height={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {keys.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-ink-faint">
                    No API keys yet. Generate one to start integrating.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Docs + playground */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle sub="RESTful · JSON · Bearer auth">API Reference</SectionTitle>
          <div className="space-y-2">
            {ENDPOINTS.map((e) => (
              <div key={e.path} className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2.5">
                <span
                  className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-bold ${
                    e.method === "GET"
                      ? "bg-[rgba(46,204,113,0.15)] text-[#7ee2a8]"
                      : "bg-brand-dim text-brand-bright"
                  }`}
                >
                  {e.method}
                </span>
                <span className="font-mono text-xs text-ink">{e.path}</span>
                <span className="ml-auto hidden text-[11px] text-ink-faint sm:block">{e.desc}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="flex items-center gap-2 text-xs text-ink-muted">
              <Code width={14} height={14} /> Quickstart · Python
            </span>
            <button
              onClick={() => copy(SNIPPET)}
              className="text-[11px] text-ink-faint hover:text-ink"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed text-ink-muted">
            {SNIPPET}
          </pre>
        </Card>
      </div>
    </div>
  );
}
