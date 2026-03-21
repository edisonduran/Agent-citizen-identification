"""Public package surface for the Agent-DID LangChain Python integration."""

from .config import AgentDidExposureConfig, AgentDidIntegrationConfig
from .context import build_agent_did_system_prompt, compose_system_prompt
from .integration import AgentDidLangChainIntegration, create_agent_did_langchain_integration
from .observability import (
    AgentDidEventHandler,
    AgentDidObservabilityEvent,
    compose_event_handlers,
    create_json_logger_event_handler,
    create_langsmith_event_handler,
    create_langsmith_run_tree,
    sanitize_observability_attributes,
    serialize_observability_event,
)
from .snapshot import AgentDidIdentitySnapshot, build_agent_did_identity_snapshot
from .tools import create_agent_did_tools

PACKAGE_STATUS = "mvp"

__all__ = [
    "PACKAGE_STATUS",
    "AgentDidExposureConfig",
    "AgentDidIdentitySnapshot",
    "AgentDidIntegrationConfig",
    "AgentDidLangChainIntegration",
    "AgentDidEventHandler",
    "AgentDidObservabilityEvent",
    "build_agent_did_identity_snapshot",
    "build_agent_did_system_prompt",
    "compose_event_handlers",
    "compose_system_prompt",
    "create_agent_did_langchain_integration",
    "create_agent_did_tools",
    "create_json_logger_event_handler",
    "create_langsmith_event_handler",
    "create_langsmith_run_tree",
    "sanitize_observability_attributes",
    "serialize_observability_event",
]
