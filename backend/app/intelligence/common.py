"""Shared primitives for the deterministic intelligence engine."""

from __future__ import annotations

import hashlib
import random

SUPPORTED_CHAINS = ["ethereum", "base", "arbitrum", "bnb"]

CHAIN_LABELS = {
    "ethereum": "Ethereum",
    "base": "Base",
    "arbitrum": "Arbitrum",
    "bnb": "BNB Chain",
}

# Risk levels presented externally (PRD: deterministic, actionable labels).
RISK_SAFE = "SAFE"
RISK_CAUTION = "CAUTION"
RISK_WARNING = "WARNING"
RISK_HIGH = "HIGH RISK"
RISK_MALICIOUS = "MALICIOUS"


def seeded_rng(*parts: str) -> random.Random:
    """A deterministic RNG seeded by the given string parts."""
    digest = hashlib.sha256("::".join(p.lower() for p in parts).encode()).hexdigest()
    return random.Random(int(digest[:16], 16))


def score_to_level(score: int) -> str:
    """Map a 0-100 risk score to an external threat label."""
    if score >= 85:
        return RISK_MALICIOUS
    if score >= 65:
        return RISK_HIGH
    if score >= 40:
        return RISK_WARNING
    if score >= 20:
        return RISK_CAUTION
    return RISK_SAFE


def reputation_label(score: int) -> str:
    if score >= 85:
        return "Known malicious actor"
    if score >= 65:
        return "High-risk wallet"
    if score >= 40:
        return "Elevated risk"
    if score >= 20:
        return "Low risk"
    return "Trusted / clean history"


def severity_from_score(score: int) -> str:
    return score_to_level(score)


def short(addr: str, lead: int = 6, tail: int = 4) -> str:
    addr = addr.strip()
    if len(addr) <= lead + tail:
        return addr
    return f"{addr[:lead]}…{addr[-tail:]}"


def fake_address(rng: random.Random) -> str:
    return "0x" + "".join(rng.choice("0123456789abcdef") for _ in range(40))
