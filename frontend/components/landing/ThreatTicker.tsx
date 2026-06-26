"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ThreatFeedItem } from "@/lib/types";
import { riskMeta } from "@/lib/format";

const FALLBACK: Pick<ThreatFeedItem, "threat_type" | "risk_level" | "chain" | "subject">[] = [
  { threat_type: "Phishing contract detected", risk_level: "HIGH RISK", chain: "Ethereum", subject: "0x4f…a91c" },
  { threat_type: "Wallet drain cluster", risk_level: "MALICIOUS", chain: "Base", subject: "0x9a…b21c" },
  { threat_type: "Unlimited approval campaign", risk_level: "WARNING", chain: "Arbitrum", subject: "0x71…0f4a" },
  { threat_type: "Honeypot token deployed", risk_level: "MALICIOUS", chain: "BNB Chain", subject: "0x00…ee90" },
];

export function ThreatTicker() {
  const [items, setItems] = useState(FALLBACK);

  useEffect(() => {
    api
      .threatFeed(12)
      .then((d) => d.length && setItems(d))
      .catch(() => {});
  }, []);

  const row = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-y border-border bg-surface/50">
      <div className="flex w-max animate-ticker gap-8 py-2.5">
        {row.map((t, i) => {
          const m = riskMeta(t.risk_level);
          return (
            <span key={i} className="flex shrink-0 items-center gap-2 text-xs">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.color }} />
              <span style={{ color: m.text }} className="font-medium">
                {t.threat_type}
              </span>
              <span className="text-ink-faint">·</span>
              <span className="text-ink-muted">{t.chain}</span>
              <span className="font-mono text-ink-faint">{t.subject}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
