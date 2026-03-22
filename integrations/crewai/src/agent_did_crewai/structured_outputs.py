"""Structured output helpers aligned with CrewAI output_json/output_pydantic surfaces."""

from __future__ import annotations

from collections.abc import Iterable
from typing import Any, cast

from pydantic import BaseModel, ConfigDict, create_model


class AgentDidStructuredOutput(BaseModel):
    """Base output contract for CrewAI tasks that emit Agent-DID assertions."""

    model_config = ConfigDict(extra="forbid")

    did: str
    authentication_key_id: str | None = None


def create_identity_output_model(
    *,
    model_name: str = "AgentDidCrewOutput",
    required_fields: Iterable[str] | None = None,
) -> type[BaseModel]:
    field_definitions: dict[str, Any] = {
        field_name: (str, ...)
        for field_name in sorted(set(required_fields or []))
        if field_name not in {"did", "authentication_key_id"}
    }
    return cast(type[BaseModel], create_model(model_name, __base__=AgentDidStructuredOutput, **field_definitions))
