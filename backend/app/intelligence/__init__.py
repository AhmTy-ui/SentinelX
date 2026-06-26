"""SentinelX heuristic + AI intelligence engine.

This package implements the hybrid intelligence approach described in the PRD
(section 7): rule-based threat detection, wallet reputation heuristics,
lightweight anomaly scoring, and human-readable AI-style explanations.

Results are deterministic for a given (subject, chain) so the dashboard behaves
consistently across reloads while still feeling alive. When real data-provider
keys are configured the same interfaces can be backed by live on-chain data.
"""
