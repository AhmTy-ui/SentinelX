"""Developer platform endpoints: API keys, usage analytics, alerts."""

from __future__ import annotations

import datetime as dt
import hashlib
import secrets

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.intelligence import feed as feed_engine
from app.models import Alert, ApiKey
from app.schemas import (
    AlertCreate,
    AlertItem,
    ApiKeyCreate,
    ApiKeyCreated,
    ApiKeyItem,
    UsageResponse,
)

router = APIRouter()


# --------------------------- API keys ---------------------------

@router.get("/keys", response_model=list[ApiKeyItem], tags=["developer"])
def list_keys(db: Session = Depends(get_db)) -> list[ApiKey]:
    return list(db.scalars(select(ApiKey).order_by(ApiKey.created_at.desc())))


@router.post("/keys", response_model=ApiKeyCreated, tags=["developer"])
def create_key(payload: ApiKeyCreate, db: Session = Depends(get_db)) -> dict:
    raw = "sk_" + ("live" if payload.environment in ("production", "live") else "test") + "_" + secrets.token_urlsafe(24)
    key = ApiKey(
        name=payload.name,
        environment=payload.environment,
        key_prefix=raw[:14],
        key_hash=hashlib.sha256(raw.encode()).hexdigest(),
        scopes=["score-wallet", "analyze-transaction", "check-contract"],
    )
    db.add(key)
    db.commit()
    db.refresh(key)
    return {
        "id": key.id,
        "name": key.name,
        "key_prefix": key.key_prefix,
        "environment": key.environment,
        "created_at": key.created_at,
        "last_used_at": key.last_used_at,
        "revoked": key.revoked,
        "secret": raw,
    }


@router.post("/keys/{key_id}/revoke", response_model=ApiKeyItem, tags=["developer"])
def revoke_key(key_id: int, db: Session = Depends(get_db)) -> ApiKey:
    key = db.get(ApiKey, key_id)
    if not key:
        raise HTTPException(404, "API key not found")
    key.revoked = True
    db.commit()
    db.refresh(key)
    return key


@router.delete("/keys/{key_id}", tags=["developer"])
def delete_key(key_id: int, db: Session = Depends(get_db)) -> dict:
    key = db.get(ApiKey, key_id)
    if not key:
        raise HTTPException(404, "API key not found")
    db.delete(key)
    db.commit()
    return {"deleted": key_id}


# --------------------------- Usage ---------------------------

@router.get("/usage", response_model=UsageResponse, tags=["developer"])
def usage() -> UsageResponse:
    return feed_engine.usage()


# --------------------------- Alerts ---------------------------

@router.get("/alerts", response_model=list[AlertItem], tags=["alerts"])
def list_alerts(db: Session = Depends(get_db)) -> list[Alert]:
    rows = list(db.scalars(select(Alert).order_by(Alert.created_at.desc())))
    if not rows:
        _seed_alerts(db)
        rows = list(db.scalars(select(Alert).order_by(Alert.created_at.desc())))
    return rows


@router.post("/alerts", response_model=AlertItem, tags=["alerts"])
def create_alert(payload: AlertCreate, db: Session = Depends(get_db)) -> Alert:
    alert = Alert(**payload.model_dump())
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


@router.post("/alerts/{alert_id}/resolve", response_model=AlertItem, tags=["alerts"])
def resolve_alert(alert_id: int, db: Session = Depends(get_db)) -> Alert:
    alert = db.get(Alert, alert_id)
    if not alert:
        raise HTTPException(404, "Alert not found")
    alert.status = "resolved"
    db.commit()
    db.refresh(alert)
    return alert


def _seed_alerts(db: Session) -> None:
    samples = [
        ("Wallet flagged: drainer interaction", "HIGH RISK", "ethereum", "0x9a3f…b21c"),
        ("Suspicious unlimited USDC approval", "WARNING", "base", "0x71de…0f4a"),
        ("Contract threat escalation: honeypot", "MALICIOUS", "bnb", "0x004c…ee90"),
        ("Exploit-linked interaction detected", "HIGH RISK", "arbitrum", "0xbb12…77a1"),
        ("Sybil cluster detected", "WARNING", "ethereum", "0x33aa…9c0d"),
        ("Abnormal transaction velocity", "CAUTION", "base", "0xfe45…1188"),
    ]
    now = dt.datetime.now(dt.timezone.utc)
    for i, (event, sev, chain, subj) in enumerate(samples):
        db.add(
            Alert(
                event=event,
                severity=sev,
                chain=chain,
                subject=subj,
                status="open" if i % 3 else "resolved",
                detail="Auto-generated monitoring alert.",
                created_at=now - dt.timedelta(hours=i * 5),
            )
        )
    db.commit()
