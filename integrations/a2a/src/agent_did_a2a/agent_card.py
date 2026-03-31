"""A2A AgentCard builder enriched with Agent-DID identity.

An AgentCard is the discovery document that A2A agents expose at
``/.well-known/agent.json``.  This module generates spec-compliant
AgentCards that embed the agent's DID, verification methods, and
DID-based HTTP Signature authentication scheme.
"""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from .config import AgentDidA2AConfig
from .snapshot import AgentDidIdentitySnapshot


class A2ASkill(BaseModel):
    """An A2A skill declaration."""

    model_config = ConfigDict(extra="allow")

    id: str
    name: str
    description: str
    input_modes: list[str] = Field(default_factory=lambda: ["text/plain"])
    output_modes: list[str] = Field(default_factory=lambda: ["text/plain"])
    tags: list[str] = Field(default_factory=list)


class A2AAuthenticationInfo(BaseModel):
    """A2A authentication info block with Agent-DID extension."""

    model_config = ConfigDict(extra="allow")

    schemes: list[str] = Field(default_factory=list)
    credentials: str | None = None


class A2AAgentCard(BaseModel):
    """A2A-compliant AgentCard enriched with Agent-DID identity.

    Standard A2A fields:
      name, description, url, skills, capabilities, authentication

    Agent-DID extensions:
      did, controller, authentication_key_id, verification_endpoint
    """

    model_config = ConfigDict(extra="allow")

    # --- Standard A2A fields ---
    name: str
    description: str | None = None
    url: str
    version: str = "0.1.0"
    skills: list[A2ASkill] = Field(default_factory=list)
    capabilities: dict[str, bool] = Field(default_factory=dict)
    authentication: A2AAuthenticationInfo = Field(default_factory=A2AAuthenticationInfo)

    # --- Agent-DID identity extensions ---
    did: str
    controller: str
    authentication_key_id: str | None = None
    verification_endpoint: str | None = None


def build_agent_card(
    *,
    identity_snapshot: AgentDidIdentitySnapshot,
    agent_url: str,
    skills: list[A2ASkill] | None = None,
    capabilities: dict[str, bool] | None = None,
    config: AgentDidA2AConfig | None = None,
    verification_endpoint: str | None = None,
) -> A2AAgentCard:
    """Build an A2A AgentCard enriched with Agent-DID identity.

    The card declares ``http-signature-did`` as an authentication scheme
    so that consuming agents know they can verify the agent's identity
    via DID-based HTTP Message Signatures.
    """

    effective_config = config or AgentDidA2AConfig()

    schemes = ["http-signature-did"]
    for extra in effective_config.additional_auth_schemes:
        schemes.append(extra.scheme)

    return A2AAgentCard(
        name=identity_snapshot.name,
        description=identity_snapshot.description,
        url=agent_url,
        version=identity_snapshot.version,
        skills=skills or [],
        capabilities=capabilities or {"streaming": False, "pushNotifications": False},
        authentication=A2AAuthenticationInfo(schemes=schemes),
        did=identity_snapshot.did,
        controller=identity_snapshot.controller,
        authentication_key_id=identity_snapshot.authentication_key_id,
        verification_endpoint=verification_endpoint,
    )


def agent_card_to_json(card: A2AAgentCard) -> dict[str, Any]:
    """Serialize an AgentCard to a JSON-compatible dict for ``/.well-known/agent.json``."""
    return card.model_dump(exclude_none=True)
