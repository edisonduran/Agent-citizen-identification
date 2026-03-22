"""CrewAI callback helpers for Agent-DID traceability."""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

from .integration import AgentDidCrewAIIntegration
from .sanitization import sanitize_output

CallbackSink = Callable[[dict[str, Any]], None]


def create_step_callback(
    integration: AgentDidCrewAIIntegration, sink: CallbackSink | None = None
) -> Callable[[Any], dict[str, Any]]:
    def callback(step_output: Any) -> dict[str, Any]:
        payload = {
            "event": "agent_did.crewai.step",
            "identity": integration.get_current_identity(),
            "step_output": sanitize_output(step_output),
        }
        if sink:
            sink(payload)
        return payload

    return callback


def create_task_callback(
    integration: AgentDidCrewAIIntegration, sink: CallbackSink | None = None
) -> Callable[[Any], dict[str, Any]]:
    def callback(task_output: Any) -> dict[str, Any]:
        payload = {
            "event": "agent_did.crewai.task",
            "identity": integration.get_current_identity(),
            "task_output": sanitize_output(task_output),
        }
        if sink:
            sink(payload)
        return payload

    return callback
