"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useApp } from "@/components/AppContext";
import type { TransactionAnalysis } from "@/lib/types";
import { Button, Card, ChainBadge, EmptyState, Pill, RiskBadge, SectionTitle, Spinner } from "@/components/ui";
import { ThreatCard } from "@/components/ThreatCard";
import { Activity, Bolt } from "@/components/icons";

const SAMPLE = "0x095ea7b3000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

export default function TransactionPage() {
  const { chain } = useApp();
  const [tx, setTx] = useState("");
  const [contract, setContract] = useState("");
  const [data, setData] = useState<TransactionAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tx.trim()) return;
    setLoading(true);
    setErr(null);
    try {
      setData(await api.analyzeTransaction(tx.trim(), chain, contract.trim() || undefined));
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Analysis failed");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const dirTone = (d: string) =>
    d === "out" ? "text-[#ff8a8b]" : d === "approval" ? "text-[#fac974]" : "text-[#7ee2a8]";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transaction Analyzer</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Decode & simulate transaction intent before you sign — the pre-sign firewall
        </p>
      </div>

      <Card>
        <form onSubmit={run} className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wider text-ink-faint">
              Raw transaction data / calldata
            </label>
            <textarea
              value={tx}
              onChange={(e) => setTx(e.target.value)}
              rows={3}
              placeholder="0x095ea7b3…"
              className="w-full resize-none rounded-lg border border-border bg-surface-2 p-3 font-mono text-xs text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={contract}
              onChange={(e) => setContract(e.target.value)}
              placeholder="Target contract (optional)"
              className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2.5 font-mono text-sm text-ink placeholder:font-sans placeholder:text-ink-faint focus:border-brand focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setTx(SAMPLE)}
              className="rounded-lg border border-border px-3 py-2.5 text-xs text-ink-muted hover:border-brand"
            >
              Use sample calldata
            </button>
            <Button type="submit" disabled={loading} className="sm:w-44">
              {loading ? <Spinner /> : "Analyze Transaction"}
            </Button>
          </div>
        </form>
      </Card>

      {err && (
        <div className="card border-[rgba(255,77,79,0.4)] text-sm text-[#ff8a8b]">{err}</div>
      )}

      {!data && !loading && (
        <EmptyState
          icon={<Activity width={28} height={28} />}
          title="Paste calldata to simulate"
          hint="SentinelX decodes the function call, explains the intent in plain English, and flags drains, unlimited approvals, and hidden transfers before signing."
        />
      )}

      {data && (
        <>
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone="brand">{data.action}</Pill>
                  <ChainBadge chain={data.chain} />
                  <span className="font-mono text-xs text-ink-muted">{data.contract}</span>
                </div>
                <p className="mt-3 max-w-2xl text-sm text-ink">{data.summary}</p>
              </div>
              <RiskBadge level={data.risk_level} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="card-2 p-3">
                <p className="text-[11px] text-ink-faint">Balance impact</p>
                <p className="mt-1 font-mono text-sm text-ink">{data.estimated_balance_impact}</p>
              </div>
              <div className="card-2 p-3">
                <p className="text-[11px] text-ink-faint">Gas estimate</p>
                <p className="mt-1 font-mono text-sm text-ink">{data.gas_estimate}</p>
              </div>
              <div className="card-2 p-3 col-span-2">
                <p className="text-[11px] text-ink-faint">Assets affected</p>
                <p className="mt-1 font-mono text-sm text-ink">
                  {data.assets_affected.join(", ") || "—"}
                </p>
              </div>
            </div>
          </Card>

          {data.warnings.length > 0 && (
            <div className="card border-[rgba(255,77,79,0.4)] bg-[rgba(255,45,85,0.06)]">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#ff8a8b]">
                Critical warnings
              </p>
              <ul className="space-y-1.5 text-sm text-[#ffb3b4]">
                {data.warnings.map((w, i) => (
                  <li key={i} className="flex gap-2">
                    <span>▲</span> {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI explanation */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 grid-bg opacity-20" />
            <div className="relative flex gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-dim text-brand-bright">
                <Bolt width={18} height={18} />
              </span>
              <div>
                <h3 className="text-sm font-semibold">Human-readable explanation</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                  {data.human_explanation}
                </p>
              </div>
            </div>
          </Card>

          {data.threat_cards.length > 0 && (
            <div>
              <SectionTitle sub="Behavioral threats detected in this call">
                Threat Detection
              </SectionTitle>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {data.threat_cards.map((t) => (
                  <ThreatCard key={t.category} item={t} />
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Permissions */}
            <Card>
              <SectionTitle>Permissions Requested</SectionTitle>
              <div className="space-y-2">
                {data.permissions.map((p, i) => (
                  <div key={i} className="card-2 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-ink">{p.scope}</span>
                      <span className="font-mono text-xs text-[#fac974]">{p.spend_limit}</span>
                    </div>
                    <p className="mt-1 text-xs text-ink-faint">Exposure: {p.token_exposure}</p>
                    <p className="mt-1 text-xs text-ink-muted">{p.recommendation}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Simulation */}
            <Card>
              <SectionTitle sub="Predicted balance changes">Simulation Result</SectionTitle>
              <div className="space-y-2">
                {data.simulation.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2.5"
                  >
                    <span className="text-sm text-ink">{s.asset}</span>
                    <span className={`font-mono text-sm font-semibold ${dirTone(s.direction)}`}>
                      {s.change}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
