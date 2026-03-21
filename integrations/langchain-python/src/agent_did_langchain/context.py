"""Prompt composition utilities for Agent-DID identity context."""

from __future__ import annotations

from .snapshot import AgentDidIdentitySnapshot


def build_agent_did_system_prompt(
    identity_snapshot: AgentDidIdentitySnapshot, additional_system_context: str | None = None
) -> str:
    capabilities = ", ".join(identity_snapshot.capabilities) if identity_snapshot.capabilities else "none"
    lines = [
        "Agent-DID identity context:",
        f"- did: {identity_snapshot.did}",
        f"- controller: {identity_snapshot.controller}",
        f"- name: {identity_snapshot.name}",
        f"- version: {identity_snapshot.version}",
        f"- capabilities: {capabilities}",
        f"- member_of: {identity_snapshot.member_of or 'none'}",
        f"- authentication_key_id: {identity_snapshot.authentication_key_id or 'unknown'}",
        "Rules:",
        "- Treat this DID as the authoritative identity of this agent.",
        "- Never invent or substitute another DID for this agent.",
        (
            "- If an outbound HTTP request must be authenticated with Agent-DID, "
            "use the dedicated signing tool instead of fabricating headers."
        ),
    ]

    if additional_system_context and additional_system_context.strip():
        lines.append(f"Additional identity policy: {additional_system_context.strip()}")

    return "\n".join(lines)


def compose_system_prompt(
    base_system_prompt: str | None,
    identity_snapshot: AgentDidIdentitySnapshot,
    additional_context: str | None = None,
) -> str:
    identity_section = build_agent_did_system_prompt(identity_snapshot, additional_context)
    if base_system_prompt and base_system_prompt.strip():
        return f"{base_system_prompt.strip()}\n\n{identity_section}"
    return identity_section
