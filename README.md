# SentinelX AI — The AI Immune System for Web3

Real-time wallet, transaction, and smart-contract threat intelligence for EVM
chains (Ethereum, Base, Arbitrum, BNB Chain). SentinelX scores risk 0–100,
explains threats in plain English, and surfaces them through a military-grade
security operations console.

> MVP uses deterministic, heuristic threat intelligence — **no external API
> keys required** to run. Integration seams for live providers (Alchemy,
> Etherscan, LLMs) are kept ready.

## Stack

| Layer    | Tech                                                |
| -------- | --------------------------------------------------- |
| Frontend | Next.js (App Router) · TypeScript · Tailwind CSS v4 |
| Backend  | FastAPI · Python 3.12 · SQLAlchemy                  |

## Monorepo layout

```
backend/    FastAPI service (intelligence engine + REST API)
frontend/   Next.js application (SOC console UI)
```

## Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API root: `http://localhost:8000` · interactive docs at `/docs`.

Core endpoints: `POST /score-wallet`, `POST /analyze-transaction`,
`POST /check-contract`; platform endpoints: `/threat-feed`, `/dashboard`,
`/alerts`, `/keys`, `/usage`, `/chains`.

## Frontend

```bash
cd frontend
npm install
npm run dev   # http://localhost:3000
```

Set `NEXT_PUBLIC_API_BASE` to point at the backend (defaults to
`http://localhost:8000`).

### Pages

Landing · Login (wallet + email) · Dashboard (SOC) · Wallet Intelligence ·
Transaction Analyzer · Contract Scanner · Threat Monitor · Intelligence Feed ·
Alerts Center · Developer Portal · Settings.
