// Types mirroring the FastAPI backend schemas.

export type RiskLevel =
  | "SAFE"
  | "CAUTION"
  | "WARNING"
  | "HIGH RISK"
  | "MALICIOUS";

export interface ThreatItem {
  category: string;
  severity: RiskLevel;
  confidence: number;
  explanation: string;
}

export interface BehaviorIndicator {
  label: string;
  value: string;
}

export interface WalletTxRow {
  timestamp: string;
  chain: string;
  interaction_type: string;
  threat_flag: string;
  risk_score: number;
  counterparty: string;
}

export interface GraphNode {
  id: string;
  label: string;
  risk_level: RiskLevel;
  kind: "wallet" | "contract";
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
}

export interface WalletGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface WalletScore {
  wallet: string;
  ens: string | null;
  chain: string;
  risk_score: number;
  risk_level: RiskLevel;
  reputation: string;
  confidence: number;
  wallet_age_days: number;
  activity_profile: string;
  threats: string[];
  threat_breakdown: ThreatItem[];
  behavior_indicators: BehaviorIndicator[];
  transaction_history: WalletTxRow[];
  graph: WalletGraph;
  ai_summary: string;
  cached: boolean;
}

export interface PermissionRow {
  scope: string;
  spend_limit: string;
  token_exposure: string;
  recommendation: string;
}

export interface SimulationChange {
  asset: string;
  change: string;
  direction: "in" | "out" | "approval";
}

export interface TransactionAnalysis {
  summary: string;
  chain: string;
  contract: string;
  risk_level: RiskLevel;
  action: string;
  assets_affected: string[];
  estimated_balance_impact: string;
  gas_estimate: string;
  warnings: string[];
  threat_cards: ThreatItem[];
  human_explanation: string;
  permissions: PermissionRow[];
  simulation: SimulationChange[];
}

export interface PermissionPower {
  power: string;
  active: boolean;
  risk: RiskLevel;
}

export interface HolderRisk {
  label: string;
  value: string;
  risk: RiskLevel;
}

export interface ContractAnalysis {
  contract: string;
  chain: string;
  name: string;
  verification_status: string;
  trust_score: number;
  risk_level: RiskLevel;
  deploy_date: string;
  ownership_status: string;
  upgradeability: string;
  threat_status: string;
  risk_summary: ThreatItem[];
  permissions: PermissionPower[];
  code_intelligence: string[];
  ai_code_explanation: string;
  relationship_graph: WalletGraph;
  holder_risk: HolderRisk[];
  warnings: string[];
}

export interface ThreatFeedItem {
  id: string;
  threat_type: string;
  risk_level: RiskLevel;
  chain: string;
  timestamp: string;
  subject: string;
  confidence: number;
  value_at_risk: string | null;
  summary: string;
}

export interface DashboardStat {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "flat";
}

export interface HeatmapCell {
  chain: string;
  hour: number;
  intensity: number;
}

export interface DashboardData {
  stats: DashboardStat[];
  heatmap: HeatmapCell[];
  feed: ThreatFeedItem[];
  ai_intelligence: string[];
}

export interface AlertItem {
  id: number;
  event: string;
  severity: RiskLevel;
  chain: string;
  subject: string;
  status: string;
  detail: string;
  created_at: string;
}

export interface ApiKey {
  id: number;
  name: string;
  key_prefix: string;
  environment: string;
  created_at: string;
  last_used_at: string | null;
  revoked: boolean;
}

export interface ApiKeyCreated extends ApiKey {
  secret: string;
}

export interface UsagePoint {
  date: string;
  requests: number;
  errors: number;
  threats: number;
  latency_ms: number;
}

export interface EndpointUsage {
  endpoint: string;
  requests: number;
  share: number;
}

export interface UsageData {
  total_requests: number;
  error_rate: number;
  avg_latency_ms: number;
  threats_detected: number;
  series: UsagePoint[];
  by_endpoint: EndpointUsage[];
  plan: string;
  quota: number;
  used: number;
}

export interface ChainOption {
  id: string;
  label: string;
}
