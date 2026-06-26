"""Wallet risk scoring heuristics (PRD 3.1 / 5.1)."""

from __future__ import annotations

import datetime as dt

from app.intelligence.common import (
    CHAIN_LABELS,
    fake_address,
    reputation_label,
    score_to_level,
    seeded_rng,
    severity_from_score,
    short,
)
from app.schemas import (
    BehaviorIndicator,
    GraphEdge,
    GraphNode,
    ThreatItem,
    WalletGraph,
    WalletScoreResponse,
    WalletTxRow,
)

RISK_FACTORS = [
    ("Phishing exposure", "Interactions with wallets/contracts on phishing blocklists"),
    ("Mixer exposure", "Funds traced through Tornado-style mixing services"),
    ("Sybil probability", "Behavioral overlap with coordinated wallet clusters"),
    ("Exploit linkage", "Proximity to addresses tied to known exploits"),
    ("Bot behavior", "High-frequency automated transaction patterns"),
    ("Scam interactions", "Approvals or transfers to fake-token / drainer contracts"),
    ("Wash trading", "Self-referential trading inflating volume"),
    ("Velocity anomaly", "Abnormal transaction velocity vs. wallet age"),
]

INTERACTIONS = ["Swap", "Approval", "Transfer", "Mint", "Bridge", "Contract Call", "Stake"]


def score_wallet(wallet: str, chain: str) -> WalletScoreResponse:
    rng = seeded_rng("wallet", wallet, chain)
    base = rng.randint(3, 97)

    # Threat breakdown — a subset of risk factors are "active".
    breakdown: list[ThreatItem] = []
    active_threats: list[str] = []
    for category, desc in RISK_FACTORS:
        active = rng.random() < (base / 130)
        sev_score = rng.randint(max(0, base - 25), min(100, base + 10)) if active else rng.randint(0, 18)
        if active:
            active_threats.append(f"{category}: {desc}")
        breakdown.append(
            ThreatItem(
                category=category,
                severity=severity_from_score(sev_score),
                confidence=rng.randint(58, 98) if active else rng.randint(10, 40),
                explanation=desc,
            )
        )

    level = score_to_level(base)
    age_days = rng.randint(2, 1800)

    behavior = [
        BehaviorIndicator(label="Total transactions", value=f"{rng.randint(40, 90000):,}"),
        BehaviorIndicator(label="Unique counterparties", value=f"{rng.randint(5, 4200):,}"),
        BehaviorIndicator(label="Avg tx / day", value=f"{rng.randint(1, 320)}"),
        BehaviorIndicator(label="First seen", value=f"{age_days} days ago"),
        BehaviorIndicator(label="Net flow (30d)", value=f"{'-' if rng.random()<.5 else '+'}{rng.randint(1,950)} ETH"),
        BehaviorIndicator(label="Contract approvals", value=f"{rng.randint(0, 64)}"),
    ]

    profile_options = [
        "Active DeFi trader",
        "MEV / automated bot infrastructure",
        "Dormant accumulation wallet",
        "Bridge-heavy cross-chain operator",
        "NFT collector",
        "Suspected drainer collector",
    ]
    profile = profile_options[base % len(profile_options)]

    # Transaction history table.
    now = dt.datetime.now(dt.timezone.utc)
    history: list[WalletTxRow] = []
    for i in range(8):
        flagged = rng.random() < (base / 160)
        tx_score = rng.randint(50, 99) if flagged else rng.randint(0, 35)
        history.append(
            WalletTxRow(
                timestamp=now - dt.timedelta(hours=rng.randint(1, 720)),
                chain=CHAIN_LABELS.get(chain, chain.title()),
                interaction_type=rng.choice(INTERACTIONS),
                threat_flag="Flagged" if flagged else "Clean",
                risk_score=tx_score,
                counterparty=short(fake_address(rng)),
            )
        )
    history.sort(key=lambda r: r.timestamp, reverse=True)

    # Wallet graph.
    nodes = [GraphNode(id="root", label=short(wallet), risk_level=level, kind="wallet")]
    edges: list[GraphEdge] = []
    cluster = rng.randint(4, 8)
    for i in range(cluster):
        nscore = rng.randint(max(0, base - 30), min(100, base + 20))
        nid = f"n{i}"
        nodes.append(
            GraphNode(
                id=nid,
                label=short(fake_address(rng)),
                risk_level=score_to_level(nscore),
                kind="contract" if rng.random() < 0.4 else "wallet",
            )
        )
        edges.append(GraphEdge(source="root", target=nid, weight=rng.randint(1, 9)))
        if i > 1 and rng.random() < 0.4:
            edges.append(GraphEdge(source=nid, target=f"n{rng.randint(0, i-1)}", weight=rng.randint(1, 5)))

    ai_summary = _ai_summary(wallet, profile, active_threats, level)

    ens = None
    if rng.random() < 0.25:
        ens = rng.choice(["vault", "degen", "whale", "ops", "treasury", "anon"]) + ".eth"

    return WalletScoreResponse(
        wallet=wallet,
        ens=ens,
        chain=CHAIN_LABELS.get(chain, chain.title()),
        risk_score=base,
        risk_level=level,
        reputation=reputation_label(base),
        confidence=rng.randint(72, 97),
        wallet_age_days=age_days,
        activity_profile=profile,
        threats=active_threats[:6] or ["No active threats detected in current window"],
        threat_breakdown=breakdown,
        behavior_indicators=behavior,
        transaction_history=history,
        graph=WalletGraph(nodes=nodes, edges=edges),
        ai_summary=ai_summary,
    )


def _ai_summary(wallet: str, profile: str, threats: list[str], level: str) -> str:
    if not threats:
        return (
            f"This wallet ({short(wallet)}) presents a clean on-chain history with no "
            f"high-confidence threat signals. Behavior is consistent with a {profile.lower()}. "
            f"Reputation: {level}."
        )
    lead = threats[0].split(":")[0].lower()
    extra = f" and {len(threats) - 1} additional risk categor{'y' if len(threats)==2 else 'ies'}" if len(threats) > 1 else ""
    return (
        f"This wallet demonstrates behavior associated with {profile.lower()}. SentinelX "
        f"detected {lead}{extra}, raising its classification to {level}. Recommended action: "
        f"treat interactions with elevated caution and verify counterparties before signing."
    )
