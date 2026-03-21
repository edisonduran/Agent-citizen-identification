from __future__ import annotations

from agent_did_langchain.context import build_agent_did_system_prompt, compose_system_prompt
from agent_did_langchain.snapshot import AgentDidIdentitySnapshot


def _snapshot() -> AgentDidIdentitySnapshot:
    return AgentDidIdentitySnapshot(
        did="did:agent:polygon:0xtest",
        controller="did:ethr:0xcontroller",
        name="PromptBot",
        description="Testing prompt composition",
        version="1.0.0",
        capabilities=["research:web", "report:write"],
        member_of="ops",
        authentication_key_id="did:agent:polygon:0xtest#key-1",
        created="2026-03-21T00:00:00.000Z",
        updated="2026-03-21T00:00:00.000Z",
    )


def test_build_agent_did_system_prompt_contains_identity_context() -> None:
    prompt = build_agent_did_system_prompt(_snapshot(), "Never sign arbitrary payloads.")

    assert "Agent-DID identity context:" in prompt
    assert "did:agent:polygon:0xtest" in prompt
    assert "did:ethr:0xcontroller" in prompt
    assert "research:web, report:write" in prompt
    assert "Never sign arbitrary payloads." in prompt


def test_compose_system_prompt_supports_empty_and_non_empty_base_prompt() -> None:
    snapshot = _snapshot()

    composed = compose_system_prompt("Base system prompt", snapshot)
    identity_only = compose_system_prompt(None, snapshot)

    assert composed.startswith("Base system prompt")
    assert "Agent-DID identity context:" in composed
    assert identity_only.startswith("Agent-DID identity context:")
