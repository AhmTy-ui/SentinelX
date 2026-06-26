"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useApp } from "@/components/AppContext";
import type { ContractAnalysis } from "@/lib/types";
import { riskMeta, shortAddr } from "@/lib/format";
import { Button, Card, ChainBadge, EmptyState, Pill, RiskBadge, SectionTitle, Spinner } from "@/components/ui";
import { RiskMeter } from "@/components/RiskMeter";
import { ThreatCard } from "@/components/ThreatCard";
import { Graph } from "@/components/Graph";
import { Bolt, Check, FileCode, Lock, Search, X } from "@/components/icons";

function ContractInner() {
  const { chain } = useApp();
  const params = useSearchParams();
  const initialQ = params.get("q") ?? "";
  const [input, setInput] = useState(initialQ);
  const [data, setData] = useState<ContractAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const run = useCallback(
    async (addr: string) => {
      if (!addr.trim()) return;
      setLoading(true);
      setErr(null);
      try {
        setData(await api.checkContract(addr.trim(), chain));
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Scan failed");
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
        <h1 className="text-2xl font-bold tracking-tight">Contract Scanner</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Honeypot, rug-pull, hidden permission & exploit detection for smart contracts
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
            placeholder="Contract address (0x…)"
            className="w-full rounded-lg border border-border bg-surface-2 py-3 pl-10 pr-3 font-mono text-sm text-ink placeholder:font-sans placeholder:text-ink-faint focus:border-brand focus:outline-none"
          />
        </div>
        <Button type="submit" disabled={loading} className="sm:w-40">
          {loading ? <Spinner /> : "Scan Contract"}
        </Button>
      </form>

      {err && (
        <div className="card border-[rgba(255,77,79,0.4)] text-sm text-[#ff8a8b]">{err}</div>
      )}

      {!data && !loading && (
        <EmptyState
          icon={<FileCode width={28} height={28} />}
          title="Scan a contract to begin"
          hint="Enter a contract address to detect honeypot logic, owner privileges, hidden fees, rug-pull vectors, and upgradeable proxy risk."
        />
      )}

      {data && (
        <>
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg font-semibold text-ink">{data.name}</span>
                  <ChainBadge chain={data.chain} />
                  {data.verification_status === "Verified" ? (
                    <Pill tone="success"><Check width={12} height={12} /> Verified</Pill>
                  ) : (
                    <Pill tone="danger"><X width={12} height={12} /> Unverified</Pill>
                  )}
                </div>
                <p className="mt-2 font-mono text-xs text-ink-muted">{shortAddr(data.contract, 12, 10)}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Pill>Deployed: {data.deploy_date}</Pill>
                  <Pill>{data.ownership_status}</Pill>
                  <Pill>{data.upgradeability}</Pill>
                </div>
              </div>
              <RiskBadge level={data.risk_level} />
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="flex flex-col items-center justify-center">
              <RiskMeter score={data.trust_score} level={data.risk_level} />
              <p className="mt-3 text-center text-xs text-ink-faint">
                Composite trust score · {data.threat_status}
              </p>
            </Card>

            {/* Permissions powers */}
            <Card className="lg:col-span-2">
              <SectionTitle sub="Privileged capabilities exposed by the contract owner">
                Permission Powers
              </SectionTitle>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {data.permissions.map((p) => {
                  const m = riskMeta(p.risk);
                  return (
                    <div
                      key={p.power}
                      className="flex items-center justify-between rounded-lg border bg-surface-2 px-3 py-2.5"
                      style={{ borderColor: p.active ? m.border : "var(--color-border)" }}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="grid h-6 w-6 place-items-center rounded-md"
                          style={{ background: p.active ? m.bg : "var(--color-surface-3)", color: m.text }}
                        >
                          <Lock width={13} height={13} />
                        </span>
                        <span className="text-sm text-ink">{p.power}</span>
                      </div>
                      <span
                        className="text-xs font-semibold"
                        style={{ color: p.active ? m.text : "var(--color-ink-faint)" }}
                      >
                        {p.active ? "ACTIVE" : "none"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Risk summary */}
          <div>
            <SectionTitle sub="Detected vulnerability & scam vectors">Risk Summary</SectionTitle>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {data.risk_summary.map((t) => (
                <ThreatCard key={t.category} item={t} />
              ))}
            </div>
          </div>

          {/* AI code explanation */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 grid-bg opacity-20" />
            <div className="relative flex gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-dim text-brand-bright">
                <Bolt width={18} height={18} />
              </span>
              <div>
                <h3 className="text-sm font-semibold">AI Code Intelligence</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                  {data.ai_code_explanation}
                </p>
              </div>
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-5">
            {/* Code intel + holders */}
            <div className="space-y-6 lg:col-span-3">
              <Card>
                <SectionTitle>Code Intelligence Findings</SectionTitle>
                <ul className="space-y-2">
                  {data.code_intelligence.map((c, i) => (
                    <li key={i} className="flex gap-2 rounded-lg bg-surface-2 px-3 py-2.5 text-sm text-ink-muted">
                      <span className="text-brand-bright">›</span> {c}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card>
                <SectionTitle>Holder & Liquidity Risk</SectionTitle>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {data.holder_risk.map((h) => {
                    const m = riskMeta(h.risk);
                    return (
                      <div key={h.label} className="card-2 p-3">
                        <p className="text-[11px] uppercase tracking-wider text-ink-faint">{h.label}</p>
                        <p className="mt-1 font-mono text-base" style={{ color: m.text }}>
                          {h.value}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Relationship graph */}
            <Card className="lg:col-span-2">
              <SectionTitle sub="Deployer & related contract cluster">
                Relationship Graph
              </SectionTitle>
              <Graph graph={data.relationship_graph} height={300} />
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

export default function ContractsPage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-surface-2" />}>
      <ContractInner />
    </Suspense>
  );
}
