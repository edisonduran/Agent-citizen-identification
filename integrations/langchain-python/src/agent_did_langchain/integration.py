"""Public integration assembly for Agent-DID and LangChain Python."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from agent_did_sdk import AgentDIDDocument, AgentIdentity

from .config import AgentDidExposureConfig, AgentDidIntegrationConfig
from .context import compose_system_prompt
from .snapshot import AgentDidIdentitySnapshot, RuntimeIdentity, build_agent_did_identity_snapshot
from .tools import create_agent_did_tools


@dataclass(slots=True)
class AgentDidLangChainIntegration:
    """Ready-to-use integration bundle for LangChain Python agents."""

    agent_identity: AgentIdentity
    runtime_identity: RuntimeIdentity
    config: AgentDidIntegrationConfig
    tools: list[Any]

    @property
    def identity_snapshot(self) -> AgentDidIdentitySnapshot:
        return build_agent_did_identity_snapshot(self.runtime_identity)

    def get_current_identity(self) -> dict[str, Any]:
        return self.identity_snapshot.model_dump(exclude_none=True)

    def get_current_document(self) -> AgentDIDDocument:
        return self.runtime_identity.document

    def compose_system_prompt(self, base_prompt: str | None = None, additional_context: str | None = None) -> str:
        effective_additional_context = additional_context or self.config.additional_system_context
        return compose_system_prompt(base_prompt, self.identity_snapshot, effective_additional_context)

    def create_agent_kwargs(self, base_prompt: str | None = None) -> dict[str, Any]:
        return {
            "tools": self.tools,
            "system_prompt": self.compose_system_prompt(base_prompt),
        }


def create_agent_did_langchain_integration(
    *,
    agent_identity: AgentIdentity,
    runtime_identity: RuntimeIdentity,
    expose: AgentDidExposureConfig | dict[str, Any] | None = None,
    tool_prefix: str = "agent_did",
    additional_system_context: str | None = None,
    allow_private_network_targets: bool = False,
) -> AgentDidLangChainIntegration:
    exposure = (
        expose
        if isinstance(expose, AgentDidExposureConfig)
        else AgentDidExposureConfig.model_validate(expose or {})
    )
    config = AgentDidIntegrationConfig(
        expose=exposure,
        tool_prefix=tool_prefix,
        additional_system_context=additional_system_context,
        allow_private_network_targets=allow_private_network_targets,
    )
    tools = create_agent_did_tools(
        agent_identity=agent_identity,
        runtime_identity=runtime_identity,
        expose=config.expose,
        tool_prefix=config.tool_prefix,
        allow_private_network_targets=config.allow_private_network_targets,
    )

    return AgentDidLangChainIntegration(
        agent_identity=agent_identity,
        runtime_identity=runtime_identity,
        config=config,
        tools=tools,
    )
