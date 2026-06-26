"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppContext";
import { Check, Lock, Shield, X } from "@/components/icons";
import { Spinner } from "@/components/ui";

const WALLETS = [
  { id: "metamask", name: "MetaMask", hint: "Browser extension", emoji: "🦊", available: true },
  { id: "rabby", name: "Rabby", hint: "Security-first wallet", emoji: "🐰", available: true },
  { id: "coinbase", name: "Coinbase Wallet", hint: "Self-custody", emoji: "🔵", available: true },
  { id: "walletconnect", name: "WalletConnect", hint: "Scan with mobile", emoji: "🔗", available: true },
  { id: "phantom", name: "Phantom", hint: "Coming soon", emoji: "👻", available: false },
  { id: "safe", name: "Safe Wallet", hint: "Coming soon", emoji: "🛡️", available: false },
];

function randomAddr() {
  return "0x" + Array.from({ length: 40 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
}

export function WalletModal({
  open,
  onClose,
  redirectTo = "/dashboard",
}: {
  open: boolean;
  onClose: () => void;
  redirectTo?: string;
}) {
  const { connect } = useApp();
  const router = useRouter();
  const [stage, setStage] = useState<"select" | "signing" | "done">("select");
  const [selected, setSelected] = useState<string | null>(null);
  const [nonce, setNonce] = useState("");

  if (!open) return null;

  const pick = (id: string) => {
    setSelected(id);
    setNonce(Math.random().toString(36).slice(2, 12));
    setStage("signing");
    setTimeout(() => {
      const addr = randomAddr();
      connect(addr);
      setStage("done");
      setTimeout(() => {
        onClose();
        setStage("select");
        router.push(redirectTo);
      }, 900);
    }, 1600);
  };

  const wallet = WALLETS.find((w) => w.id === selected);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => stage === "select" && onClose()}
      />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Shield className="text-brand-bright" width={18} height={18} />
            <h3 className="text-sm font-semibold">Connect to SentinelX</h3>
          </div>
          {stage === "select" && (
            <button onClick={onClose} className="text-ink-faint hover:text-ink">
              <X width={18} height={18} />
            </button>
          )}
        </div>

        {stage === "select" && (
          <div className="p-5">
            <div className="mb-4 grid gap-2">
              {WALLETS.map((w) => (
                <button
                  key={w.id}
                  disabled={!w.available}
                  onClick={() => pick(w.id)}
                  className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3 text-left transition hover:border-brand disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="text-xl">{w.emoji}</span>
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-ink">{w.name}</span>
                    <span className="block text-xs text-ink-faint">{w.hint}</span>
                  </span>
                  {!w.available && (
                    <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-ink-faint">
                      Soon
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-[rgba(46,204,113,0.35)] bg-[rgba(46,204,113,0.08)] p-3">
              <div className="flex items-start gap-2">
                <Lock width={15} height={15} className="mt-0.5 text-[#7ee2a8]" />
                <p className="text-xs leading-relaxed text-[#9fe6bd]">
                  SentinelX never requests wallet spending permissions during login.
                  You only sign a message to prove ownership.
                </p>
              </div>
            </div>
            <p className="mt-3 text-center text-[11px] text-ink-faint">
              By connecting you agree to the Terms & Privacy Policy. Chain compatibility:
              EVM (Ethereum, Base, Arbitrum, BNB).
            </p>
          </div>
        )}

        {stage === "signing" && (
          <div className="flex flex-col items-center gap-4 px-5 py-12 text-center">
            <span className="text-4xl">{wallet?.emoji}</span>
            <Spinner className="text-brand-bright" />
            <div>
              <p className="text-sm font-medium">Awaiting signature…</p>
              <p className="mt-1 text-xs text-ink-faint">
                Approve the read-only signature request in {wallet?.name}.
              </p>
            </div>
            <div className="w-full rounded-lg border border-border bg-surface-2 p-3 text-left">
              <p className="font-mono text-[11px] text-ink-muted">
                Sign-In to SentinelX AI
                <br />
                Nonce: {nonce}
                <br />
                No spending permission requested.
              </p>
            </div>
          </div>
        )}

        {stage === "done" && (
          <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[rgba(46,204,113,0.15)] text-[#2ecc71]">
              <Check width={26} height={26} />
            </span>
            <p className="text-sm font-medium">Wallet connected</p>
            <p className="text-xs text-ink-faint">Entering mission control…</p>
          </div>
        )}
      </div>
    </div>
  );
}
