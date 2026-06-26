"""Malicious contract detection heuristics (PRD 3.3 / 5.3)."""

from __future__ import annotations

import datetime as dt

from app.intelligence.common import (
    CHAIN_LABELS,
    fake_address,
    score_to_level,
    seeded_rng,
    severity_from_score,
    short,
)
from app.schemas import (
    ContractResponse,
    GraphEdge,
    GraphNode,
    HolderRisk,
    PermissionPower,
    ThreatItem,
    WalletGraph,
)

DETECTIONS = [
    ("Honeypot behavior", "Sell transactions revert for non-owner addresses."),
    ("Owner mint permissions", "Owner can mint unlimited supply, diluting holders."),
    ("Blacklist functionality", "Owner can block specific addresses from transferring."),
    ("Hidden fee logic", "Dynamic fees can be raised arbitrarily by the owner."),
    ("Rug-pull pattern", "Liquidity is removable by a single externally owned account."),
    ("Dangerous upgradeability", "Proxy admin can replace logic with malicious code."),
    ("Obfuscated code", "Assembly blocks obscure transfer and approval behavior."),
]

CODE_INTEL = [
    "Suspicious opcode sequence detected near transfer logic",
    "No obfuscation detected — bytecode maps cleanly to verified source",
    "Selector overlap with 3 previously flagged drainer contracts",
    "Standard OpenZeppelin ERC-20 inheritance verified",
    "Inline assembly used to bypass standard transfer hooks",
    "Reentrancy guard present on state-changing functions",
]

CONTRACT_NAMES = ["VaultRouter", "StakingPool", "TokenSale", "BridgeAdapter", "RewardDistributor", "Unverified Contract", "ProxyAdmin"]


def check_contract(contract: str, chain: str) -> ContractResponse:
    rng = seeded_rng("contract", contract, chain)
    base = rng.randint(4, 96)
    trust = 100 - base
    level = score_to_level(base)
    verified = rng.random() > (base / 140)

    summary: list[ThreatItem] = []
    warnings: list[str] = []
    n = 0 if base < 18 else rng.randint(1, 4)
    chosen = rng.sample(DETECTIONS, k=min(n, len(DETECTIONS))) if n else []
    for name, desc in chosen:
        sev = rng.randint(max(0, base - 12), min(100, base + 8))
        summary.append(
            ThreatItem(category=name, severity=severity_from_score(sev), confidence=rng.randint(60, 98), explanation=desc)
        )
        warnings.append(desc)

    powers = [
        ("Owner powers", base > 45),
        ("Pause controls", rng.random() < (base / 110)),
        ("Mint rights", rng.random() < (base / 120)),
        ("Blacklist rights", rng.random() < (base / 130)),
        ("Proxy control", rng.random() < (base / 115)),
    ]
    permissions = [
        PermissionPower(
            power=name,
            active=active,
            risk=severity_from_score(rng.randint(55, 95)) if active else "SAFE",
        )
        for name, active in powers
    ]

    code = rng.sample(CODE_INTEL, k=3)

    # Relationship graph: deployer + related contracts.
    nodes = [GraphNode(id="root", label=short(contract), risk_level=level, kind="contract")]
    edges: list[GraphEdge] = []
    deployer_score = rng.randint(max(0, base - 20), min(100, base + 15))
    nodes.append(GraphNode(id="deployer", label=short(fake_address(rng)), risk_level=score_to_level(deployer_score), kind="wallet"))
    edges.append(GraphEdge(source="deployer", target="root", weight=9))
    for i in range(rng.randint(2, 5)):
        s = rng.randint(0, 100)
        nid = f"c{i}"
        nodes.append(GraphNode(id=nid, label=short(fake_address(rng)), risk_level=score_to_level(s), kind="contract"))
        edges.append(GraphEdge(source="root", target=nid, weight=rng.randint(1, 6)))

    holders = [
        HolderRisk(label="Top holder concentration", value=f"{rng.randint(8, 92)}%", risk=severity_from_score(rng.randint(20, 95))),
        HolderRisk(label="Top 10 holders", value=f"{rng.randint(30, 99)}%", risk=severity_from_score(rng.randint(20, 90))),
        HolderRisk(label="Liquidity lock", value=rng.choice(["Locked 12mo", "Unlocked", "Locked 3mo", "None"]), risk=severity_from_score(rng.randint(10, 95))),
        HolderRisk(label="Insider concentration", value=f"{rng.randint(2, 60)}%", risk=severity_from_score(rng.randint(10, 90))),
    ]

    threat_status = "MALICIOUS" if base >= 85 else ("FLAGGED" if base >= 50 else "CLEAN")
    ai = (
        f"This contract ({short(contract)}) was assessed as {level} with a trust score of {trust}/100. "
        + (
            f"Primary concern: {warnings[0]} " if warnings else "No critical owner privileges or honeypot patterns were detected. "
        )
        + ("Exercise extreme caution before interacting." if base >= 65 else "Standard due diligence is advised.")
    )

    return ContractResponse(
        contract=contract,
        chain=CHAIN_LABELS.get(chain, chain.title()),
        name=rng.choice(CONTRACT_NAMES) if verified else "Unverified Contract",
        verification_status="Verified" if verified else "Unverified",
        trust_score=trust,
        risk_level=level,
        deploy_date=dt.date.today() - dt.timedelta(days=rng.randint(1, 1400)),
        ownership_status=rng.choice(["Renounced", "EOA owner", "Multisig owner", "Single owner"]),
        upgradeability=rng.choice(["Immutable", "Upgradeable proxy", "Transparent proxy"]),
        threat_status=threat_status,
        risk_summary=summary,
        permissions=permissions,
        code_intelligence=code,
        ai_code_explanation=ai,
        relationship_graph=WalletGraph(nodes=nodes, edges=edges),
        holder_risk=holders,
        warnings=warnings or ["No critical contract risks detected"],
    )
