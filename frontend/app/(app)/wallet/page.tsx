"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useApp } from "@/components/AppContext";
import type { WalletScore } from "@/lib/types";
import { shortAddr, timeAgo } from "@/lib/format";
import { Button, Card, ChainBadge, ConfidenceMeter, EmptyState, Pill, RiskBadge, SectionTitle, Spinner } from "@/components/ui";
import { RiskMeter } from "@/components/RiskMeter";
import { ThreatCard } from "@/components/ThreatCard";
import { Graph } from "@/components/Graph";
import { Bolt, Download, Eye, Search, Star, Wallet } from "@/components/icons";

function WalletInner() {
  const { chain } = useApp();
  const params = useSearchParams();
  const initialQ = params.get("q") ?? "";
  const [input, setInput] = useState(initialQ);
  const [data, setData] = useState<WalletScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const run = useCallback(
    async (addr: string) => {
      if (!addr.trim()) return;
      setLoading(true);
      setErr(null);
      try {
        setData(await api.scoreWallet(addr.trim(), chain));
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Analysis failed");
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [chain],
  );

  useEffect(() => {
    if (initialQ) run(initialQ);
  }, [initialQ, run]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Wallet Intelligence</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Reputation, behavioral analysis & risk scoring for any address
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(input);
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint">
            <Search width={18} height={18} />
          </span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Wallet address or ENS (e.g. 0x… or vault.eth)"
            className="w-full rounded-lg border border-border bg-surface-2 py-3 pl-10 pr-3 font-mono text-sm text-ink placeholder:font-sans placeholder:text-ink-faint focus:border-brand focus:outline-none"
          />
        </div>
        <Button type="submit" disabled={loading} className="sm:w-40">
          {loading ? <Spinner /> : <>Analyze Wallet</>}
        </Button>
      </form>

      {err && (
        <div className="card border-[rgba(255,77,79,0.4)] text-sm text-[#ff8a8b]">{err}</div>
      )}

      {!data && !loading && (
        <EmptyState
          icon={<Wallet width={28} height={28} />}
          title="Search a wallet to begin"
          hint="Enter any EVM address to see its risk score, threat breakdown, transaction intelligence, and connected-wallet graph."
        />
      )}

      {data && (
        <>
          {/* Header */}
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg text-ink">{shortAddr(data.wallet, 10, 8)}</span>
                  {data.ens && <Pill tone="brand">{data.ens}</Pill>}
                  <ChainBadge chain={data.chain} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <RiskBadge level={data.risk_level} />
                  <Pill>{data.reputation}</Pill>
                  <Pill>Age: {data.wallet_age_days}d</Pill>
                  <Pill>{data.activity_profile}</Pill>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline"><Star width={15} height={15} /> Watchlist</Button>
                <Button variant="outline"><Download width={15} height={15} /> Export</Button>
                <Button variant="ghost"><Eye width={15} height={15} /> Raw Data</Button>
              </div>
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Risk visualization */}
            <Card className="flex flex-col items-center justify-center">
              <RiskMeter score={data.risk_score} level={data.risk_level} />
              <div className="mt-4 w-full space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-faint">Threat confidence</span>
                  <ConfidenceMeter value={data.confidence} />
                </div>
              </div>
            </Card>

            {/* Behavior indicators */}
            <Card className="lg:col-span-2">
              <SectionTitle>Behavioral Indicators</SectionTitle>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {data.behavior_indicators.map((b) => (
                  <div key={b.label} className="card-2 p-3">
                    <p className="text-[11px] uppercase tracking-wider text-ink-faint">{b.label}</p>
                    <p className="mt-1.5 font-mono text-base text-ink">{b.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Threat breakdown */}
          <div>
            <SectionTitle sub="Severity, confidence & explanation per category">
              Threat Breakdown
            </SectionTitle>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {data.threat_breakdown.map((t) => (
                <ThreatCard key={t.category} item={t} />
              ))}
            </div>
          </div>

          {/* AI panel */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 grid-bg opacity-20" />
            <div className="relative flex gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-dim text-brand-bright">
                <Bolt width={18} height={18} />
              </span>
              <div>
                <h3 className="text-sm font-semibold">AI Analysis</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{data.ai_summary}</p>
              </div>
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-5">
            {/* Tx history */}
            <Card className="lg:col-span-3">
              <SectionTitle>Transaction History Intelligence</SectionTitle>
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-[11px] uppercase tracking-wider text-ink-faint">
                      <th className="py-2 pr-3 font-medium">Time</th>
                      <th className="py-2 pr-3 font-medium">Type</th>
                      <th className="py-2 pr-3 font-medium">Flag</th>
                      <th className="py-2 pr-3 font-medium">Risk</th>
                      <th className="py-2 font-medium">Counterparty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.transaction_history.map((r, i) => {
                      const flagged = r.threat_flag === "Flagged";
                      return (
                        <tr key={i} className="hover:bg-surface-2">
                          <td className="py-2.5 pr-3 text-ink-muted">{timeAgo(r.timestamp)}</td>
                          <td className="py-2.5 pr-3">{r.interaction_type}</td>
                          <td className="py-2.5 pr-3">
                            <span className={flagged ? "text-[#ff8a8b]" : "text-[#7ee2a8]"}>
                              {r.threat_flag}
                            </span>
                          </td>
                          <td className="py-2.5 pr-3 font-mono">{r.risk_score}</td>
                          <td className="py-2.5 font-mono text-ink-muted">{r.counterparty}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Graph */}
            <Card className="lg:col-span-2">
              <SectionTitle sub="Connected wallets & suspicious clusters">
                Wallet Graph
              </SectionTitle>
              <Graph graph={data.graph} height={300} />
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

export default function WalletPage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-surface-2" />}>
      <WalletInner />
    </Suspense>
  );
}
