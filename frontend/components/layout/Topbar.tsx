"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CHAINS, useApp } from "@/components/AppContext";
import { Bell, Globe, Menu, Search } from "@/components/icons";
import { shortAddr } from "@/lib/format";
import { WalletModal } from "@/components/WalletModal";

export function Topbar({ onMenu }: { onMenu?: () => void }) {
  const { chain, setChain, wallet, disconnect } = useApp();
  const [chainOpen, setChainOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const activeChain = CHAINS.find((c) => c.id === chain) ?? CHAINS[0];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    if (q.length > 30) router.push(`/wallet?q=${encodeURIComponent(q)}`);
    else router.push(`/contracts?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-bg/80 px-4 backdrop-blur md:px-6">
      <button
        className="grid h-9 w-9 place-items-center rounded-lg border border-border text-ink-muted lg:hidden"
        onClick={onMenu}
        aria-label="Open menu"
      >
        <Menu />
      </button>

      <form onSubmit={submit} className="relative hidden flex-1 max-w-md md:block">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint">
          <Search width={16} height={16} />
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search wallet, contract, or tx hash…"
          className="w-full rounded-lg border border-border bg-surface-2 py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none"
        />
      </form>

      <div className="ml-auto flex items-center gap-2">
        {/* API health */}
        <div className="hidden items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs text-ink-muted sm:flex">
          <span className="live-dot h-2 w-2 rounded-full bg-[#2ecc71] text-[#2ecc71]" />
          API healthy
        </div>

        {/* Chain selector */}
        <div className="relative">
          <button
            onClick={() => setChainOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-ink hover:border-brand"
          >
            <Globe width={16} height={16} className="text-brand-bright" />
            <span className="hidden sm:inline">{activeChain.label}</span>
          </button>
          {chainOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setChainOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-border bg-surface p-1.5 shadow-xl">
                {CHAINS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setChain(c.id);
                      setChainOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                      c.id === chain
                        ? "bg-brand-dim/60 text-ink"
                        : "text-ink-muted hover:bg-surface-2"
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-bright" />
                    {c.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Notifications */}
        <button className="relative grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface-2 text-ink-muted hover:text-ink">
          <Bell width={17} height={17} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
        </button>

        {/* Wallet status */}
        {wallet ? (
          <button
            onClick={disconnect}
            title="Disconnect"
            className="flex items-center gap-2 rounded-lg border border-[rgba(46,204,113,0.4)] bg-[rgba(46,204,113,0.1)] px-3 py-2 text-sm text-[#7ee2a8]"
          >
            <span className="h-2 w-2 rounded-full bg-[#2ecc71]" />
            <span className="font-mono">{shortAddr(wallet)}</span>
          </button>
        ) : (
          <button
            onClick={() => setWalletOpen(true)}
            className="rounded-lg bg-brand px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-bright"
          >
            Connect Wallet
          </button>
        )}
      </div>

      <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
    </header>
  );
}
