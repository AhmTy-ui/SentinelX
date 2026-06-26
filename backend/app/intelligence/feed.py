"""Live threat feed, dashboard metrics, intelligence reports & usage analytics."""

from __future__ import annotations

import datetime as dt
import random

from app.intelligence.common import (
    CHAIN_LABELS,
    SUPPORTED_CHAINS,
    fake_address,
    score_to_level,
    seeded_rng,
    short,
)
from app.schemas import (
    DashboardResponse,
    DashboardStat,
    EndpointUsage,
    HeatmapCell,
    ThreatFeedItem,
    UsagePoint,
    UsageResponse,
)

THREAT_TYPES = [
    "Phishing contract detected",
    "Wallet drain cluster",
    "Suspicious approval campaign",
    "Honeypot token deployed",
    "Exploit attempt",
    "Suspicious bridge activity",
    "Abnormal transaction velocity",
    "Governance attack anomaly",
    "Fake token impersonation",
    "Mixer-linked outflow",
]


def _feed_item(rng: random.Random, age_seconds: int) -> ThreatFeedItem:
    score = rng.randint(35, 99)
    chain = rng.choice(SUPPORTED_CHAINS)
    ttype = rng.choice(THREAT_TYPES)
    subj = fake_address(rng)
    return ThreatFeedItem(
        id=f"thr_{rng.randint(10**9, 10**10)}",
        threat_type=ttype,
        risk_level=score_to_level(score),
        chain=CHAIN_LABELS[chain],
        timestamp=dt.datetime.now(dt.timezone.utc) - dt.timedelta(seconds=age_seconds),
        subject=short(subj),
        confidence=rng.randint(58, 99),
        value_at_risk=(f"${rng.randint(2, 9800):,}K" if rng.random() < 0.6 else None),
        summary=f"{ttype} on {CHAIN_LABELS[chain]} involving {short(subj)}.",
    )


def live_feed(limit: int = 20, salt: str = "") -> list[ThreatFeedItem]:
    # Salt rotates per-minute so the feed feels live while staying reproducible.
    bucket = salt or dt.datetime.now(dt.timezone.utc).strftime("%Y%m%d%H%M")
    rng = seeded_rng("feed", bucket)
    items = [_feed_item(rng, age_seconds=i * rng.randint(20, 90)) for i in range(limit)]
    return items


def dashboard() -> DashboardResponse:
    bucket = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%d%H")
    rng = seeded_rng("dashboard", bucket)
    stats = [
        DashboardStat(label="Total threats detected", value=f"{rng.randint(120000, 480000):,}", change=f"+{rng.randint(2, 18)}%", trend="up"),
        DashboardStat(label="High-risk wallets monitored", value=f"{rng.randint(8000, 42000):,}", change=f"+{rng.randint(1, 9)}%", trend="up"),
        DashboardStat(label="Contracts scanned", value=f"{rng.randint(60000, 260000):,}", change=f"+{rng.randint(3, 22)}%", trend="up"),
        DashboardStat(label="Active chains monitored", value="4", change="ETH · Base · ARB · BNB", trend="flat"),
        DashboardStat(label="API requests today", value=f"{rng.randint(400000, 2200000):,}", change=f"+{rng.randint(4, 30)}%", trend="up"),
    ]
    heatmap = [
        HeatmapCell(chain=CHAIN_LABELS[c], hour=h, intensity=seeded_rng("heat", bucket, c, str(h)).randint(0, 100))
        for c in SUPPORTED_CHAINS
        for h in range(24)
    ]
    ai = [
        "Base chain phishing activity increased 23% in the last 24 hours.",
        "High-confidence approval-drain campaigns detected targeting USDC holders.",
        "New honeypot token cluster identified on BNB Chain (14 contracts).",
        "Arbitrum bridge outflows show coordinated wallet-cluster behavior.",
    ]
    rng.shuffle(ai)
    return DashboardResponse(stats=stats, heatmap=heatmap, feed=live_feed(8), ai_intelligence=ai[:3])


def usage() -> UsageResponse:
    rng = seeded_rng("usage", dt.datetime.now(dt.timezone.utc).strftime("%Y%m%d"))
    series: list[UsagePoint] = []
    total = 0
    errors = 0
    threats = 0
    for i in range(30):
        day = (dt.date.today() - dt.timedelta(days=29 - i)).isoformat()
        req = rng.randint(8000, 60000)
        err = rng.randint(0, int(req * 0.03))
        thr = rng.randint(20, 900)
        total += req
        errors += err
        threats += thr
        series.append(UsagePoint(date=day, requests=req, errors=err, threats=thr, latency_ms=rng.randint(120, 480)))
    by_endpoint = [
        EndpointUsage(endpoint="/score-wallet", requests=rng.randint(80000, 300000), share=0),
        EndpointUsage(endpoint="/analyze-transaction", requests=rng.randint(60000, 220000), share=0),
        EndpointUsage(endpoint="/check-contract", requests=rng.randint(40000, 160000), share=0),
        EndpointUsage(endpoint="/threat-feed", requests=rng.randint(20000, 90000), share=0),
    ]
    ep_total = sum(e.requests for e in by_endpoint) or 1
    for e in by_endpoint:
        e.share = round(e.requests / ep_total * 100)
    quota = 5_000_000
    return UsageResponse(
        total_requests=total,
        error_rate=round(errors / max(total, 1) * 100, 2),
        avg_latency_ms=round(sum(p.latency_ms for p in series) / len(series)),
        threats_detected=threats,
        series=series,
        by_endpoint=by_endpoint,
        plan="Scale",
        quota=quota,
        used=total,
    )
