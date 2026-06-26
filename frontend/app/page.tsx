import Link from "next/link";
import { HeroVisual } from "@/components/landing/HeroVisual";
import { ThreatTicker } from "@/components/landing/ThreatTicker";
import { LiveFeedPreview } from "@/components/landing/LiveFeedPreview";
import {
  Activity,
  ArrowUpRight,
  FileCode,
  Logo,
  Lock,
  Shield,
  Wallet,
} from "@/components/icons";

const CAPABILITIES = [
  {
    icon: Wallet,
    title: "Wallet Intelligence",
    desc: "Analyze wallets before users interact with them. Risk scores, behavioral profiling, and cluster detection in real time.",
  },
  {
    icon: Activity,
    title: "Transaction Simulation",
    desc: "Decode and explain malicious transaction behavior before signing — the firewall between your users and asset drains.",
  },
  {
    icon: FileCode,
    title: "Contract Threat Detection",
    desc: "Detect honeypots, rug logic, hidden permissions, and exploit patterns across EVM chains.",
  },
];

const CODE = `curl -X POST https://api.sentinelx.ai/score-wallet \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{ "wallet": "0x123...", "chain": "ethereum" }'`;

const JSON_RESP = `{
  "wallet": "0x123...",
  "risk_score": 84,
  "risk_level": "HIGH RISK",
  "threats": [
    "Interacted with phishing contract",
    "Connected to suspicious wallet cluster",
    "High-frequency automated behavior detected"
  ]
}`;

const ENTERPRISE = [
  { k: "99.98%", v: "API uptime (trailing 90d)" },
  { k: "<3s", v: "Wallet analysis latency" },
  { k: "4", v: "EVM chains monitored" },
  { k: "SOC2", v: "Compliance roadmap" },
];

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-dim text-brand-bright glow-brand">
              <Logo width={18} height={18} />
            </span>
            <span className="text-sm font-semibold tracking-tight">
              SentinelX <span className="text-ink-faint">AI</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-ink-muted md:flex">
            <a href="#capabilities" className="hover:text-ink">Product</a>
            <a href="#developers" className="hover:text-ink">Developers</a>
            <a href="#enterprise" className="hover:text-ink">Enterprise</a>
            <Link href="/feed" className="hover:text-ink">Threat Feed</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-lg px-3 py-2 text-sm text-ink-muted hover:text-ink sm:block"
            >
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg bg-brand px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-bright"
            >
              Launch App
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs text-ink-muted">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-[#2ecc71] text-[#2ecc71]" />
              Real-time Web3 threat intelligence infrastructure
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              The AI Immune System <br />
              <span className="text-gradient">for Web3</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted md:text-lg">
              Real-time wallet intelligence, transaction analysis, and threat
              detection infrastructure for protocols, wallets, and institutions.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-bright glow-brand"
              >
                Start Monitoring <ArrowUpRight width={16} height={16} />
              </Link>
              <a
                href="#developers"
                className="inline-flex items-center gap-2 rounded-lg border border-border-strong px-5 py-3 text-sm font-medium text-ink hover:border-brand"
              >
                Explore API
              </a>
              <Link
                href="/feed"
                className="inline-flex items-center gap-2 rounded-lg px-4 py-3 text-sm text-ink-muted hover:text-ink"
              >
                <span className="live-dot h-1.5 w-1.5 rounded-full bg-danger text-danger" />
                Live Threat Feed
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6 text-xs text-ink-faint">
              <span>Ethereum</span>
              <span>Base</span>
              <span>Arbitrum</span>
              <span>BNB Chain</span>
            </div>
          </div>

          <div className="relative h-[360px] overflow-hidden rounded-2xl border border-border bg-[#070a0f] md:h-[440px]">
            <HeroVisual />
          </div>
        </div>
      </section>

      <ThreatTicker />

      {/* Live feed credibility */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6">
        <div className="grid items-start gap-8 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-bright">
              Live Intelligence
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Threats detected, the moment they happen
            </h2>
            <p className="mt-4 max-w-md text-ink-muted">
              SentinelX continuously scans on-chain behavior across EVM networks —
              surfacing phishing contracts, drainer clusters, exploit activity, and
              token scams in real time. Every classification ships with a confidence
              score and a human-readable reason.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-ink-muted">
              {[
                "Phishing & drainer contract detection",
                "Suspicious wallet cluster identification",
                "Exploit activity & bridge anomaly tracking",
                "Token scam & impersonation alerts",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Shield width={15} height={15} className="text-[#7ee2a8]" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <LiveFeedPreview />
        </div>
      </section>

      {/* Capabilities */}
      <section id="capabilities" className="border-y border-border bg-surface/30">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-bright">
              Core Capabilities
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Intelligence at every layer of the stack
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {CAPABILITIES.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.title}
                  className="card group relative overflow-hidden p-6 transition hover:border-brand"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-dim text-brand-bright">
                    <Icon width={22} height={22} />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {c.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Developers */}
      <section id="developers" className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-bright">
              Built for Developers
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              The API is the product
            </h2>
            <p className="mt-4 max-w-md text-ink-muted">
              Drop SentinelX into your protocol, wallet, or exchange with a single
              request. Stripe-level clean, deeply technical, fast. SDKs for
              JavaScript, Python, Go, and Rust.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              {[
                ["12M+", "API requests/day"],
                ["<200ms", "median latency"],
                ["4", "EVM chains"],
              ].map(([k, v]) => (
                <div key={v} className="card-2 p-4">
                  <p className="font-mono text-xl font-bold text-brand-bright">{k}</p>
                  <p className="mt-1 text-[11px] text-ink-faint">{v}</p>
                </div>
              ))}
            </div>
            <Link
              href="/developers"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand-bright hover:underline"
            >
              Open Developer Portal <ArrowUpRight width={15} height={15} />
            </Link>
          </div>

          <div className="space-y-4">
            <div className="card overflow-hidden p-0">
              <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-2 text-xs text-ink-faint">request.sh</span>
              </div>
              <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed text-ink-muted">
                {CODE}
              </pre>
            </div>
            <div className="card overflow-hidden p-0">
              <div className="border-b border-border px-4 py-2.5 text-xs text-ink-faint">
                200 OK · response.json
              </div>
              <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed text-[#9fe6bd]">
                {JSON_RESP}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise */}
      <section id="enterprise" className="border-y border-border bg-surface/30">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <div className="card relative overflow-hidden p-8 md:p-12">
            <div className="absolute inset-0 grid-bg opacity-30" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs text-ink-muted">
                <Lock width={13} height={13} /> Enterprise-grade infrastructure
              </span>
              <h2 className="mt-5 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
                Trusted security infrastructure for exchanges, wallets &
                institutions
              </h2>
              <p className="mt-4 max-w-2xl text-ink-muted">
                Compliance-ready architecture, audit logging, and dedicated
                deployment options for protocol treasuries, institutional custody,
                and stablecoin issuers.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                {ENTERPRISE.map((e) => (
                  <div key={e.v} className="card-2 p-4">
                    <p className="font-mono text-2xl font-bold">{e.k}</p>
                    <p className="mt-1 text-xs text-ink-faint">{e.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-5 md:px-6">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-dim text-brand-bright">
                <Logo width={18} height={18} />
              </span>
              <span className="text-sm font-semibold">SentinelX AI</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-ink-faint">
              The intelligent trust and security layer powering the future of Web3
              infrastructure.
            </p>
          </div>
          {[
            { h: "Product", links: ["Dashboard", "Wallet Intelligence", "Contract Scanner", "Threat Monitor"] },
            { h: "Developers", links: ["Docs", "API Reference", "GitHub", "Status"] },
            { h: "Company", links: ["Privacy", "Terms", "Contact", "Security Disclosures"] },
          ].map((col) => (
            <div key={col.h}>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink">
                {col.h}
              </p>
              <ul className="mt-4 space-y-2.5 text-sm text-ink-faint">
                {col.links.map((l) => (
                  <li key={l}>
                    <span className="cursor-pointer hover:text-ink-muted">{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-ink-faint md:flex-row md:px-6">
            <p>© {new Date().getFullYear()} SentinelX AI. All rights reserved.</p>
            <p>The AI Immune System for Web3 · MVP v1.0</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
