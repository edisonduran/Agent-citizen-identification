"""Public package surface for the Agent-DID LangChain Python integration."""

from .config import AgentDidExposureConfig, AgentDidIntegrationConfig
from .context import build_agent_did_system_prompt, compose_system_prompt
from .integration import AgentDidLangChainIntegration, create_agent_did_langchain_integration
from .snapshot import AgentDidIdentitySnapshot, build_agent_did_identity_snapshot
from .tools import create_agent_did_tools

PACKAGE_STATUS = "mvp"

__all__ = [
    "PACKAGE_STATUS",
    "AgentDidExposureConfig",
    "AgentDidIdentitySnapshot",
    "AgentDidIntegrationConfig",
    "AgentDidLangChainIntegration",
    "build_agent_did_identity_snapshot",
    "build_agent_did_system_prompt",
    "compose_system_prompt",
    "create_agent_did_langchain_integration",
    "create_agent_did_tools",
]
