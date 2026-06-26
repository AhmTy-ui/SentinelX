"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bell,
  Code,
  FileCode,
  Grid,
  Logo,
  News,
  Radar,
  Settings,
  Wallet,
} from "@/components/icons";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: Grid },
  { href: "/wallet", label: "Wallet Intelligence", icon: Wallet },
  { href: "/transactions", label: "Transaction Analyzer", icon: Activity },
  { href: "/contracts", label: "Contract Scanner", icon: FileCode },
  { href: "/threats", label: "Threat Monitor", icon: Radar },
  { href: "/alerts", label: "Alerts Center", icon: Bell },
  { href: "/feed", label: "Intelligence Feed", icon: News },
  { href: "/developers", label: "API & Developers", icon: Code },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-surface/80">
      <Link
        href="/"
        className="flex items-center gap-2.5 border-b border-border px-5 py-4"
      >
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-dim text-brand-bright glow-brand">
          <Logo width={18} height={18} />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight">SentinelX</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-ink-faint">
            AI Defense
          </p>
        </div>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-thin p-3">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-brand-dim/60 text-ink"
                  : "text-ink-muted hover:bg-surface-2 hover:text-ink"
              }`}
            >
              <span
                className={`transition ${active ? "text-brand-bright" : "text-ink-faint group-hover:text-ink-muted"}`}
              >
                <Icon width={18} height={18} />
              </span>
              {item.label}
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-bright" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="card-2 flex items-center gap-3 p-3">
          <span className="relative grid h-7 w-7 place-items-center rounded-full bg-[rgba(46,204,113,0.15)] text-[#7ee2a8]">
            <span className="live-dot h-2 w-2 rounded-full bg-[#2ecc71]" />
          </span>
          <div className="leading-tight">
            <p className="text-xs font-medium text-ink">All systems operational</p>
            <p className="text-[10px] text-ink-faint">99.98% uptime · 4 chains live</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
