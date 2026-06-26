"use client";

import { useState } from "react";
import { useApp, CHAINS } from "@/components/AppContext";
import { Button, Card, Pill, SectionTitle } from "@/components/ui";
import { shortAddr } from "@/lib/format";
import { Plus, Trash } from "@/components/icons";

function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 rounded-full transition ${on ? "bg-brand" : "bg-surface-3"}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
          on ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

const NOTIF = [
  { key: "critical", label: "Critical threat alerts", desc: "Malicious & high-risk detections on watched addresses" },
  { key: "approvals", label: "Risky approval alerts", desc: "Unlimited / suspicious token approvals" },
  { key: "digest", label: "Daily intelligence digest", desc: "Summary of threat activity across your portfolio" },
  { key: "product", label: "Product updates", desc: "New features, chains & detection capabilities" },
];

export default function SettingsPage() {
  const { wallet, chain, setChain, disconnect } = useApp();
  const [notif, setNotif] = useState<Record<string, boolean>>({
    critical: true,
    approvals: true,
    digest: false,
    product: false,
  });
  const [watch, setWatch] = useState<string[]>([
    "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "vault.eth",
  ]);
  const [newAddr, setNewAddr] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Account, monitoring preferences & security configuration
        </p>
      </div>

      {/* Account */}
      <Card>
        <SectionTitle>Account</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wider text-ink-faint">
              Notification email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@institution.com"
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wider text-ink-faint">
              Default chain
            </label>
            <select
              value={chain}
              onChange={(e) => setChain(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none"
            >
              {CHAINS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Connected wallet */}
      <Card>
        <SectionTitle>Connected Wallet</SectionTitle>
        {wallet ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[rgba(46,204,113,0.3)] bg-[rgba(46,204,113,0.06)] p-4">
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#2ecc71]" />
              <div>
                <p className="font-mono text-sm text-ink">{shortAddr(wallet, 10, 8)}</p>
                <p className="text-[11px] text-ink-faint">Read-only · no spending permissions granted</p>
              </div>
            </div>
            <Button variant="danger" onClick={disconnect}>
              Disconnect
            </Button>
          </div>
        ) : (
          <p className="text-sm text-ink-faint">No wallet connected.</p>
        )}
      </Card>

      {/* Notifications */}
      <Card>
        <SectionTitle>Notification Preferences</SectionTitle>
        <div className="space-y-1">
          {NOTIF.map((n) => (
            <div
              key={n.key}
              className="flex items-center justify-between gap-4 rounded-lg px-2 py-3 hover:bg-surface-2"
            >
              <div>
                <p className="text-sm font-medium text-ink">{n.label}</p>
                <p className="text-xs text-ink-faint">{n.desc}</p>
              </div>
              <Toggle
                on={notif[n.key]}
                onChange={(v) => setNotif((s) => ({ ...s, [n.key]: v }))}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Watchlist */}
      <Card>
        <SectionTitle sub="Get alerted when these addresses are involved in threats">
          Monitored Addresses
        </SectionTitle>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!newAddr.trim()) return;
            setWatch((w) => [...w, newAddr.trim()]);
            setNewAddr("");
          }}
          className="mb-3 flex gap-2"
        >
          <input
            value={newAddr}
            onChange={(e) => setNewAddr(e.target.value)}
            placeholder="Add wallet/contract address or ENS"
            className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2.5 font-mono text-sm text-ink placeholder:font-sans placeholder:text-ink-faint focus:border-brand focus:outline-none"
          />
          <Button type="submit">
            <Plus width={15} height={15} /> Add
          </Button>
        </form>
        <div className="space-y-2">
          {watch.map((a, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2.5"
            >
              <span className="font-mono text-sm text-ink">{a}</span>
              <button
                onClick={() => setWatch((w) => w.filter((_, idx) => idx !== i))}
                className="grid h-7 w-7 place-items-center rounded-md border border-border text-ink-faint hover:border-[rgba(255,77,79,0.5)] hover:text-[#ff8a8b]"
              >
                <Trash width={14} height={14} />
              </button>
            </div>
          ))}
          {watch.length === 0 && (
            <p className="text-sm text-ink-faint">No monitored addresses yet.</p>
          )}
        </div>
      </Card>

      {/* Security */}
      <Card>
        <SectionTitle>Security</SectionTitle>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Pill tone="success">2FA recommended</Pill>
            <span className="text-sm text-ink-muted">
              Add hardware-key or TOTP protection to your account.
            </span>
          </div>
          <Button variant="outline">Configure 2FA</Button>
        </div>
      </Card>

      {/* Danger zone */}
      <Card className="border-[rgba(255,77,79,0.3)]">
        <SectionTitle>Danger Zone</SectionTitle>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-muted">
            Permanently delete your account, API keys & monitoring configuration.
          </p>
          <Button variant="danger">Delete account</Button>
        </div>
      </Card>
    </div>
  );
}
