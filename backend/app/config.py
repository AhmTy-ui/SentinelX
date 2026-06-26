"""Application configuration.

All external integrations (Alchemy, QuickNode, Etherscan, OpenAI, Redis,
PostgreSQL) are configured here. When the corresponding API keys are absent the
intelligence engine falls back to deterministic heuristic analysis so the full
product remains demonstrable end-to-end without paid data providers.
"""

from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "SentinelX AI"
    app_version: str = "1.0.0"
    environment: str = "development"

    # Persistence. Defaults to local SQLite; set to a PostgreSQL URL in prod.
    database_url: str = "sqlite:///./sentinelx.db"

    # CORS origins allowed to call the API (the Next.js dashboard).
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    # External data + AI providers. Optional — heuristics run without them.
    alchemy_api_key: str | None = None
    quicknode_url: str | None = None
    etherscan_api_key: str | None = None
    openai_api_key: str | None = None
    redis_url: str | None = None

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def live_providers_enabled(self) -> bool:
        return bool(self.alchemy_api_key or self.quicknode_url or self.etherscan_api_key)


@lru_cache
def get_settings() -> Settings:
    return Settings()
