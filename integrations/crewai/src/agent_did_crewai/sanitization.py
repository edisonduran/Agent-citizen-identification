"""Sanitization helpers for CrewAI callbacks and output guardrails."""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import asdict, is_dataclass
from typing import Any

from pydantic import BaseModel

SENSITIVE_FIELD_NAMES = {
    "agent_private_key",
    "private_key",
    "seed",
    "mnemonic",
    "payload",
    "body",
    "signature",
    "signatures",
    "signed_payload",
}


def normalize_output(value: Any) -> Any:
    if isinstance(value, BaseModel):
        return value.model_dump(exclude_none=True)
    if is_dataclass(value) and not isinstance(value, type):
        return asdict(value)
    if isinstance(value, Mapping):
        return {str(key): normalize_output(item) for key, item in value.items()}
    if isinstance(value, (list, tuple, set, frozenset)):
        return [normalize_output(item) for item in value]
    if isinstance(value, (str, int, float, bool)) or value is None:
        return value
    if hasattr(value, "__dict__"):
        return normalize_output(vars(value))
    return repr(value)


def sanitize_output(value: Any) -> Any:
    normalized = normalize_output(value)
    if isinstance(normalized, dict):
        sanitized: dict[str, Any] = {}
        for key, item in normalized.items():
            if key.lower() in SENSITIVE_FIELD_NAMES:
                sanitized[key] = "[REDACTED]"
            else:
                sanitized[key] = sanitize_output(item)
        return sanitized
    if isinstance(normalized, list):
        return [sanitize_output(item) for item in normalized]
    return normalized


def find_sensitive_paths(value: Any, prefix: str = "") -> list[str]:
    normalized = normalize_output(value)
    if isinstance(normalized, dict):
        paths: list[str] = []
        for key, item in normalized.items():
            current_path = f"{prefix}.{key}" if prefix else key
            if key.lower() in SENSITIVE_FIELD_NAMES:
                paths.append(current_path)
            paths.extend(find_sensitive_paths(item, current_path))
        return paths
    if isinstance(normalized, list):
        indexed_paths: list[str] = []
        for index, item in enumerate(normalized):
            current_path = f"{prefix}[{index}]" if prefix else f"[{index}]"
            indexed_paths.extend(find_sensitive_paths(item, current_path))
        return indexed_paths
    return []
