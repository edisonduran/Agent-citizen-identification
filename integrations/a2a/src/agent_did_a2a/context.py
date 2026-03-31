"""A2A session context helpers with DID identity injection."""

from __future__ import annotations

from .snapshot import AgentDidIdentitySnapshot


def build_agent_did_a2a_context(snapshot: AgentDidIdentitySnapshot) -> str:
    """Build a human-readable A2A context block for system prompts or session metadata."""

    capabilities = ", ".join(snapshot.capabilities) if snapshot.capabilities else "none declared"

    lines = [
        "Agent-DID A2A identity context:",
        f"- DID: {snapshot.did}",
        f"- Controller: {snapshot.controller}",
        f"- Name: {snapshot.name}",
        f"- Version: {snapshot.version}",
        f"- Capabilities: {capabilities}",
        f"- Authentication key: {snapshot.authentication_key_id or 'none'}",
        "- All outgoing A2A requests are signed with HTTP Message Signatures.",
        "- Verify incoming AgentCards against the declared DID before delegating tasks.",
    ]

    if snapshot.description:
        lines.insert(4, f"- Description: {snapshot.description}")
    if snapshot.member_of:
        lines.insert(-2, f"- Member of: {snapshot.member_of}")

    return "\n".join(lines)
