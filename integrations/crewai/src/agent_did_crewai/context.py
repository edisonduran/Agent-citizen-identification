"""Context helpers for CrewAI system prompts."""

from __future__ import annotations

from .snapshot import AgentDidIdentitySnapshot


def build_agent_did_system_prompt(snapshot: AgentDidIdentitySnapshot) -> str:
    capabilities = ", ".join(snapshot.capabilities) if snapshot.capabilities else "none declared"

    lines = [
        "Agent-DID identity context:",
        f"- DID: {snapshot.did}",
        f"- Controller: {snapshot.controller}",
        f"- Name: {snapshot.name}",
        f"- Version: {snapshot.version}",
        f"- Capabilities: {capabilities}",
        f"- Authentication key: {snapshot.authentication_key_id or 'none'}",
        "- Never expose or request the agent private key.",
        "- Only use signing tools when the host enabled them explicitly.",
    ]

    if snapshot.description:
        lines.insert(4, f"- Description: {snapshot.description}")
    if snapshot.member_of:
        lines.insert(-2, f"- Member of: {snapshot.member_of}")

    return "\n".join(lines)


def compose_system_prompt(
    base_prompt: str | None,
    snapshot: AgentDidIdentitySnapshot,
    additional_context: str | None = None,
) -> str:
    sections = []
    if base_prompt and base_prompt.strip():
        sections.append(base_prompt.strip())
    sections.append(build_agent_did_system_prompt(snapshot))
    if additional_context and additional_context.strip():
        sections.append(additional_context.strip())
    return "\n\n".join(sections)
