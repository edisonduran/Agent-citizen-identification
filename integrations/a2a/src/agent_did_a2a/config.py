"""Configuration models for the Agent-DID A2A integration."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class AgentDidA2AAuthScheme(BaseModel):
    """A2A-compatible authentication scheme declaring DID-based HTTP Signatures."""

    model_config = ConfigDict(extra="forbid")

    scheme: str = "https"
    credentials: str | None = None


class AgentDidA2AExposureConfig(BaseModel):
    """Feature exposure flags with secure defaults for A2A operations."""

    model_config = ConfigDict(extra="forbid")

    sign_requests: bool = True
    verify_requests: bool = True
    enrich_agent_card: bool = True
    resolve_remote_did: bool = True
    document_history: bool = False
    rotate_keys: bool = False


class AgentDidA2AConfig(BaseModel):
    """Top-level integration config consumed by the public factory."""

    model_config = ConfigDict(extra="forbid")

    expose: AgentDidA2AExposureConfig = Field(default_factory=AgentDidA2AExposureConfig)
    agent_card_url: str = "/.well-known/agent.json"
    allow_private_network_targets: bool = False
    default_request_timeout_seconds: int = 30
    additional_auth_schemes: list[AgentDidA2AAuthScheme] = Field(default_factory=list)
