"""Pydantic request/response schemas mirroring the PRD API design."""

from __future__ import annotations

import datetime as dt

from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Shared
# ---------------------------------------------------------------------------

Chain = str
RiskLevel = str  # SAFE | CAUTION | WARNING | HIGH RISK | MALICIOUS


class ThreatItem(BaseModel):
    category: str
    severity: RiskLevel
    confidence: int = Field(ge=0, le=100)
    explanation: str


# ---------------------------------------------------------------------------
# Wallet risk scoring  (POST /score-wallet)
# ---------------------------------------------------------------------------

class WalletScoreRequest(BaseModel):
    wallet: str = Field(..., examples=["0x1234abcd...."])
    chain: Chain = "ethereum"


class BehaviorIndicator(BaseModel):
    label: str
    value: str


class WalletTxRow(BaseModel):
    timestamp: dt.datetime
    chain: str
    interaction_type: str
    threat_flag: str
    risk_score: int
    counterparty: str


class GraphNode(BaseModel):
    id: str
    label: str
    risk_level: RiskLevel
    kind: str  # wallet | contract


class GraphEdge(BaseModel):
    source: str
    target: str
    weight: int


class WalletGraph(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]


class WalletScoreResponse(BaseModel):
    wallet: str
    ens: str | None = None
    chain: str
    risk_score: int
    risk_level: RiskLevel
    reputation: str
    confidence: int
    wallet_age_days: int
    activity_profile: str
    threats: list[str]
    threat_breakdown: list[ThreatItem]
    behavior_indicators: list[BehaviorIndicator]
    transaction_history: list[WalletTxRow]
    graph: WalletGraph
    ai_summary: str
    cached: bool = False


# ---------------------------------------------------------------------------
# Transaction analysis  (POST /analyze-transaction)
# ---------------------------------------------------------------------------

class TransactionRequest(BaseModel):
    tx_data: str = Field(..., description="Raw calldata or transaction hash")
    contract: str | None = None
    chain: Chain = "ethereum"


class PermissionRow(BaseModel):
    scope: str
    spend_limit: str
    token_exposure: str
    recommendation: str


class SimulationChange(BaseModel):
    asset: str
    change: str
    direction: str  # in | out | approval


class TransactionResponse(BaseModel):
    summary: str
    chain: str
    contract: str
    risk_level: RiskLevel
    action: str
    assets_affected: list[str]
    estimated_balance_impact: str
    gas_estimate: str
    warnings: list[str]
    threat_cards: list[ThreatItem]
    human_explanation: str
    permissions: list[PermissionRow]
    simulation: list[SimulationChange]


# ---------------------------------------------------------------------------
# Contract analysis  (POST /check-contract)
# ---------------------------------------------------------------------------

class ContractRequest(BaseModel):
    contract: str
    chain: Chain = "ethereum"


class PermissionPower(BaseModel):
    power: str
    active: bool
    risk: RiskLevel


class HolderRisk(BaseModel):
    label: str
    value: str
    risk: RiskLevel


class ContractResponse(BaseModel):
    contract: str
    chain: str
    name: str
    verification_status: str
    trust_score: int
    risk_level: RiskLevel
    deploy_date: dt.date
    ownership_status: str
    upgradeability: str
    threat_status: str
    risk_summary: list[ThreatItem]
    permissions: list[PermissionPower]
    code_intelligence: list[str]
    ai_code_explanation: str
    relationship_graph: WalletGraph
    holder_risk: list[HolderRisk]
    warnings: list[str]


# ---------------------------------------------------------------------------
# Threat feed / monitor
# ---------------------------------------------------------------------------

class ThreatFeedItem(BaseModel):
    id: str
    threat_type: str
    risk_level: RiskLevel
    chain: str
    timestamp: dt.datetime
    subject: str
    confidence: int
    value_at_risk: str | None = None
    summary: str


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------

class DashboardStat(BaseModel):
    label: str
    value: str
    change: str
    trend: str  # up | down | flat


class HeatmapCell(BaseModel):
    chain: str
    hour: int
    intensity: int


class DashboardResponse(BaseModel):
    stats: list[DashboardStat]
    heatmap: list[HeatmapCell]
    feed: list[ThreatFeedItem]
    ai_intelligence: list[str]


# ---------------------------------------------------------------------------
# Alerts
# ---------------------------------------------------------------------------

class AlertItem(BaseModel):
    id: int
    event: str
    severity: RiskLevel
    chain: str
    subject: str
    status: str
    detail: str
    created_at: dt.datetime


class AlertCreate(BaseModel):
    event: str
    severity: RiskLevel = "WARNING"
    chain: str = "ethereum"
    subject: str = ""
    detail: str = ""


# ---------------------------------------------------------------------------
# API keys
# ---------------------------------------------------------------------------

class ApiKeyCreate(BaseModel):
    name: str
    environment: str = "production"


class ApiKeyItem(BaseModel):
    id: int
    name: str
    key_prefix: str
    environment: str
    created_at: dt.datetime
    last_used_at: dt.datetime | None
    revoked: bool


class ApiKeyCreated(ApiKeyItem):
    secret: str  # full key, shown once


# ---------------------------------------------------------------------------
# Usage analytics
# ---------------------------------------------------------------------------

class UsagePoint(BaseModel):
    date: str
    requests: int
    errors: int
    threats: int
    latency_ms: int


class EndpointUsage(BaseModel):
    endpoint: str
    requests: int
    share: int


class UsageResponse(BaseModel):
    total_requests: int
    error_rate: float
    avg_latency_ms: int
    threats_detected: int
    series: list[UsagePoint]
    by_endpoint: list[EndpointUsage]
    plan: str
    quota: int
    used: int
