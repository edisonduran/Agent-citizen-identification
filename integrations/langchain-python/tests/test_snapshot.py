from __future__ import annotations

import pytest
from agent_did_sdk import AgentIdentity, AgentIdentityConfig, CreateAgentParams, InMemoryAgentRegistry

from agent_did_langchain.snapshot import build_agent_did_identity_snapshot


@pytest.mark.asyncio
async def test_snapshot_contains_expected_fields_without_secrets() -> None:
    AgentIdentity.set_registry(InMemoryAgentRegistry())
    identity = AgentIdentity(AgentIdentityConfig(signer_address="0x1111111111111111111111111111111111111111"))
    runtime_identity = await identity.create(
        CreateAgentParams(
            name="SnapshotBot",
            description="Snapshot testing",
            core_model="gpt-4.1-mini",
            system_prompt="Test prompt",
            capabilities=["research:web", "report:write"],
        )
    )

    snapshot = build_agent_did_identity_snapshot(runtime_identity).model_dump(exclude_none=True)

    assert snapshot["did"] == runtime_identity.document.id
    assert snapshot["controller"] == runtime_identity.document.controller
    assert snapshot["authentication_key_id"] == runtime_identity.document.authentication[0]
    assert snapshot["capabilities"] == ["research:web", "report:write"]
    assert "agent_private_key" not in snapshot
