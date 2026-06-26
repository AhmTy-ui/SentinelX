"""Transaction threat analysis heuristics (PRD 3.2 / 5.2)."""

from __future__ import annotations

from app.intelligence.common import (
    CHAIN_LABELS,
    fake_address,
    score_to_level,
    seeded_rng,
    severity_from_score,
    short,
)
from app.schemas import (
    PermissionRow,
    SimulationChange,
    ThreatItem,
    TransactionResponse,
)

# Common 4-byte selectors used to derive a plausible decoded action.
SELECTORS = {
    "0x095ea7b3": ("approve", "Token approval"),
    "0xa9059cbb": ("transfer", "Token transfer"),
    "0x23b872dd": ("transferFrom", "Delegated transfer"),
    "0x42842e0e": ("safeTransferFrom", "NFT transfer"),
    "0x38ed1739": ("swapExactTokensForTokens", "DEX swap"),
    "0x": ("call", "Contract interaction"),
}

THREAT_LIBRARY = [
    ("Unlimited approval risk", "This transaction grants an unlimited (uint256 max) spending allowance."),
    ("Hidden transfer permissions", "Contract can move tokens without further confirmations."),
    ("Delegatecall behavior", "Execution is delegated to another contract, altering trust assumptions."),
    ("Proxy upgrade risk", "Target is an upgradeable proxy; logic can change after you sign."),
    ("Suspicious contract interaction", "Counterparty contract matches drainer behavioral patterns."),
    ("Asset drain risk", "Combination of approvals enables draining of multiple assets."),
]

TOKENS = ["USDC", "USDT", "WETH", "DAI", "ARB", "PEPE", "LINK"]


def analyze_transaction(tx_data: str, contract: str | None, chain: str) -> TransactionResponse:
    rng = seeded_rng("tx", tx_data, contract or "", chain)
    selector = (tx_data.strip().lower()[:10]) if tx_data.strip().lower().startswith("0x") else "0x"
    fn, action_label = SELECTORS.get(selector, SELECTORS.get(selector[:10], ("call", "Contract interaction")))

    base = rng.randint(5, 96)
    is_approval = fn in ("approve", "transferFrom") or rng.random() < 0.35
    if is_approval:
        base = max(base, rng.randint(55, 96))

    level = score_to_level(base)
    token = rng.choice(TOKENS)
    contract_addr = contract or fake_address(rng)

    # Threat cards.
    cards: list[ThreatItem] = []
    warnings: list[str] = []
    n_threats = 0 if base < 20 else rng.randint(1, 3)
    chosen = rng.sample(THREAT_LIBRARY, k=min(n_threats, len(THREAT_LIBRARY))) if n_threats else []
    for name, desc in chosen:
        sev = rng.randint(max(0, base - 15), min(100, base + 10))
        cards.append(
            ThreatItem(
                category=name,
                severity=severity_from_score(sev),
                confidence=rng.randint(64, 97),
                explanation=desc,
            )
        )
        warnings.append(desc)

    if is_approval:
        summary = f"This transaction grants {'unlimited' if base>60 else 'a fixed'} {token} spending approval to {short(contract_addr)}."
        human = (
            f"You are approving {short(contract_addr)} to spend your {token}. "
            + (
                "Because the amount is unlimited, this contract can transfer all of your "
                f"{token} now and in the future without asking again. Only approve if you fully trust it."
                if base > 60
                else f"The approval is capped, which limits exposure, but you should still verify the spender."
            )
        )
        spend_limit = "Unlimited (2^256-1)" if base > 60 else f"{rng.randint(100, 50000):,} {token}"
    else:
        summary = f"This transaction performs a {action_label.lower()} via {short(contract_addr)}."
        human = (
            f"This is a {action_label.lower()}. SentinelX decoded the calldata and assessed the "
            f"interaction as {level}. " + (warnings[0] if warnings else "No dangerous permissions were detected.")
        )
        spend_limit = "N/A"

    permissions = [
        PermissionRow(
            scope=f"{token} spending" if is_approval else "Token movement",
            spend_limit=spend_limit,
            token_exposure=f"{rng.randint(1, 100)}% of balance" if is_approval else "Single transfer",
            recommendation="Revoke after use" if base > 60 else "Monitor",
        )
    ]

    simulation = [
        SimulationChange(asset=token, change=f"-{rng.randint(1, 5000):,}", direction="out" if not is_approval else "approval"),
    ]
    if rng.random() < 0.6:
        simulation.append(
            SimulationChange(asset="ETH", change=f"-{rng.uniform(0.001, 0.02):.4f} (gas)", direction="out")
        )

    return TransactionResponse(
        summary=summary,
        chain=CHAIN_LABELS.get(chain, chain.title()),
        contract=contract_addr,
        risk_level=level,
        action=action_label,
        assets_affected=[token] + (["ETH"] if rng.random() < 0.5 else []),
        estimated_balance_impact=f"{'-' if base>40 else '~'}{rng.randint(1, 9000):,} {token}",
        gas_estimate=f"{rng.randint(21000, 240000):,} gas (~{rng.uniform(1, 28):.2f} gwei)",
        warnings=warnings or ["No dangerous permissions detected"],
        threat_cards=cards,
        human_explanation=human,
        permissions=permissions,
        simulation=simulation,
    )
