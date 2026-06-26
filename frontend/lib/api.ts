import type {
  AlertItem,
  ApiKey,
  ApiKeyCreated,
  ChainOption,
  ContractAnalysis,
  DashboardData,
  ThreatFeedItem,
  TransactionAnalysis,
  UsageData,
  WalletScore,
} from "./types";

const BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") || "http://localhost:8000";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      /* ignore */
    }
    throw new Error(typeof detail === "string" ? detail : "Request failed");
  }
  return res.json() as Promise<T>;
}

export const api = {
  base: BASE,
  scoreWallet: (wallet: string, chain: string) =>
    req<WalletScore>("/score-wallet", {
      method: "POST",
      body: JSON.stringify({ wallet, chain }),
    }),
  analyzeTransaction: (tx_data: string, chain: string, contract?: string) =>
    req<TransactionAnalysis>("/analyze-transaction", {
      method: "POST",
      body: JSON.stringify({ tx_data, chain, contract: contract || null }),
    }),
  checkContract: (contract: string, chain: string) =>
    req<ContractAnalysis>("/check-contract", {
      method: "POST",
      body: JSON.stringify({ contract, chain }),
    }),
  threatFeed: (limit = 20) =>
    req<ThreatFeedItem[]>(`/threat-feed?limit=${limit}`),
  dashboard: () => req<DashboardData>("/dashboard"),
  chains: () => req<{ chains: ChainOption[] }>("/chains"),
  alerts: () => req<AlertItem[]>("/alerts"),
  resolveAlert: (id: number) =>
    req<AlertItem>(`/alerts/${id}/resolve`, { method: "POST" }),
  keys: () => req<ApiKey[]>("/keys"),
  createKey: (name: string, environment: string) =>
    req<ApiKeyCreated>("/keys", {
      method: "POST",
      body: JSON.stringify({ name, environment }),
    }),
  revokeKey: (id: number) =>
    req<ApiKey>(`/keys/${id}/revoke`, { method: "POST" }),
  deleteKey: (id: number) =>
    req<{ deleted: number }>(`/keys/${id}`, { method: "DELETE" }),
  usage: () => req<UsageData>("/usage"),
};
