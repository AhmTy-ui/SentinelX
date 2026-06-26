"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppProvider, useApp } from "@/components/AppContext";
import { WalletModal } from "@/components/WalletModal";
import { Logo, Lock, Mail, Shield } from "@/components/icons";

const WALLETS = [
  { id: "metamask", name: "MetaMask", emoji: "🦊" },
  { id: "rabby", name: "Rabby", emoji: "🐰" },
  { id: "coinbase", name: "Coinbase", emoji: "🔵" },
  { id: "walletconnect", name: "WalletConnect", emoji: "🔗" },
];

function LoginInner() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"wallet" | "email">("wallet");
  const [email, setEmail] = useState("");
  const router = useRouter();
  const { connect } = useApp();

  const emailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    connect("0x" + Array.from({ length: 40 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join(""));
    router.push("/dashboard");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden border-r border-border lg:flex">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-dim/20 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-dim text-brand-bright glow-brand">
              <Logo width={20} height={20} />
            </span>
            <span className="font-semibold">SentinelX AI</span>
          </Link>
          <div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight">
              The AI Immune <br /> System for Web3
            </h1>
            <p className="mt-4 max-w-sm text-ink-muted">
              Mission control for real-time wallet, transaction, and contract threat
              intelligence.
            </p>
            <div className="mt-8 flex items-center gap-2 rounded-xl border border-[rgba(46,204,113,0.3)] bg-[rgba(46,204,113,0.07)] p-4 text-sm text-[#9fe6bd]">
              <Shield width={18} height={18} />
              SentinelX never requests wallet spending permissions during login.
            </div>
          </div>
          <p className="text-xs text-ink-faint">
            Trusted by protocols, wallets & institutions
          </p>
        </div>
      </div>

      {/* Auth panel */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-dim text-brand-bright">
                <Logo width={20} height={20} />
              </span>
              <span className="font-semibold">SentinelX AI</span>
            </Link>
          </div>

          <h2 className="text-2xl font-bold tracking-tight">Connect to continue</h2>
          <p className="mt-2 text-sm text-ink-muted">
            Access your threat intelligence dashboard.
          </p>

          <div className="mt-6 flex rounded-lg border border-border bg-surface-2 p-1">
            <button
              onClick={() => setTab("wallet")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                tab === "wallet" ? "bg-brand text-white" : "text-ink-muted"
              }`}
            >
              Wallet
            </button>
            <button
              onClick={() => setTab("email")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                tab === "email" ? "bg-brand text-white" : "text-ink-muted"
              }`}
            >
              Email (Enterprise)
            </button>
          </div>

          {tab === "wallet" ? (
            <div className="mt-6">
              <button
                onClick={() => setOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-bright glow-brand"
              >
                <Lock width={16} height={16} /> Connect Wallet
              </button>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {WALLETS.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setOpen(true)}
                    className="flex flex-col items-center gap-1 rounded-lg border border-border bg-surface-2 py-3 text-[10px] text-ink-faint hover:border-brand"
                  >
                    <span className="text-lg">{w.emoji}</span>
                    {w.name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={emailSubmit} className="mt-6 space-y-3">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint">
                  <Mail width={16} height={16} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@institution.com"
                  className="w-full rounded-lg border border-border bg-surface-2 py-3 pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-bright"
              >
                Continue with Email
              </button>
              <p className="text-center text-xs text-ink-faint">
                For enterprise teams, institutional users & support access.
              </p>
            </form>
          )}

          <p className="mt-8 text-center text-xs text-ink-faint">
            By connecting you agree to our{" "}
            <span className="text-ink-muted">Terms</span> &{" "}
            <span className="text-ink-muted">Privacy Policy</span>.
          </p>
        </div>
      </div>

      <WalletModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

export default function LoginPage() {
  return (
    <AppProvider>
      <LoginInner />
    </AppProvider>
  );
}
