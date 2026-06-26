"""Core intelligence endpoints (PRD section 9) + dashboard & threat feed."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.intelligence import feed as feed_engine
from app.intelligence.common import SUPPORTED_CHAINS
from app.intelligence.contract import check_contract
from app.intelligence.transaction import analyze_transaction
from app.intelligence.wallet import score_wallet
from app.models import AnalysisRecord
from app.schemas import (
    ContractRequest,
    ContractResponse,
    DashboardResponse,
    ThreatFeedItem,
    TransactionRequest,
    TransactionResponse,
    WalletScoreRequest,
    WalletScoreResponse,
)

router = APIRouter()


def _validate_chain(chain: str) -> str:
    chain = chain.lower().strip()
    if chain not in SUPPORTED_CHAINS:
        raise HTTPException(422, f"Unsupported chain '{chain}'. Supported: {SUPPORTED_CHAINS}")
    return chain


def _record(db: Session, kind: str, subject: str, chain: str, level: str, score: int, result: dict) -> None:
    db.add(
        AnalysisRecord(kind=kind, subject=subject, chain=chain, risk_level=level, risk_score=score, result=result)
    )
    db.commit()


@router.post("/score-wallet", response_model=WalletScoreResponse, tags=["intelligence"])
def score_wallet_endpoint(payload: WalletScoreRequest, db: Session = Depends(get_db)) -> WalletScoreResponse:
    chain = _validate_chain(payload.chain)
    if not payload.wallet.strip():
        raise HTTPException(422, "wallet is required")
    result = score_wallet(payload.wallet.strip(), chain)
    _record(db, "wallet", payload.wallet.strip(), chain, result.risk_level, result.risk_score, result.model_dump(mode="json"))
    return result


@router.post("/analyze-transaction", response_model=TransactionResponse, tags=["intelligence"])
def analyze_transaction_endpoint(payload: TransactionRequest, db: Session = Depends(get_db)) -> TransactionResponse:
    chain = _validate_chain(payload.chain)
    if not payload.tx_data.strip():
        raise HTTPException(422, "tx_data is required")
    result = analyze_transaction(payload.tx_data.strip(), payload.contract, chain)
    _record(db, "transaction", payload.tx_data.strip()[:66], chain, result.risk_level, 0, result.model_dump(mode="json"))
    return result


@router.post("/check-contract", response_model=ContractResponse, tags=["intelligence"])
def check_contract_endpoint(payload: ContractRequest, db: Session = Depends(get_db)) -> ContractResponse:
    chain = _validate_chain(payload.chain)
    if not payload.contract.strip():
        raise HTTPException(422, "contract is required")
    result = check_contract(payload.contract.strip(), chain)
    _record(db, "contract", payload.contract.strip(), chain, result.risk_level, 100 - result.trust_score, result.model_dump(mode="json"))
    return result


@router.get("/threat-feed", response_model=list[ThreatFeedItem], tags=["threats"])
def threat_feed(limit: int = Query(20, ge=1, le=100)) -> list[ThreatFeedItem]:
    return feed_engine.live_feed(limit)


@router.get("/dashboard", response_model=DashboardResponse, tags=["dashboard"])
def dashboard() -> DashboardResponse:
    return feed_engine.dashboard()


@router.get("/chains", tags=["meta"])
def chains() -> dict:
    from app.intelligence.common import CHAIN_LABELS

    return {"chains": [{"id": c, "label": CHAIN_LABELS[c]} for c in SUPPORTED_CHAINS]}
