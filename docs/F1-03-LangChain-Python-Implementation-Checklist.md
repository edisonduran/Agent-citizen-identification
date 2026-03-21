# F1-03 — LangChain Python Implementation Checklist

## Objective

Turn the current `integrations/langchain-python/` design scaffold into a functional Python integration built on top of the implemented Agent-DID Python SDK.

This checklist is the execution companion to:

- `docs/F1-03-LangChain-Python-Integration-Design.md`
- `docs/F1-03-LangChain-Python-Technical-Plan.md`
- `integrations/langchain-python/README.md`

---

## Current Status

The blocking dependency has changed.

- **Before:** the integration was blocked by the absence of the Python SDK.
- **Now:** the Python SDK exists, has dedicated CI, and parity governance with the TypeScript SDK.

The remaining work is implementation work inside `integrations/langchain-python/`.

---

## Implementation Phases

### Phase 1 — Minimal Functional Integration

- [x] Replace the placeholder `NotImplementedError` factory with a real integration factory.
- [x] Define the public integration config for Python.
- [x] Implement current identity exposure.
- [x] Implement DID resolution tool.
- [x] Implement signature verification tool.
- [x] Keep sensitive operations opt-in by default.

### Phase 2 — Secure Optional Operations

- [x] Implement HTTP signing as explicit opt-in.
- [x] Implement payload signing as explicit opt-in.
- [x] Keep private key material outside model-visible context.
- [x] Keep key rotation disabled by default.
- [x] Keep arbitrary signing disabled by default unless explicitly enabled.

### Phase 3 — Context Injection and UX

- [x] Inject DID, controller, active authentication method, and capabilities into agent context.
- [x] Align naming and conceptual API with the JS integration where practical.
- [x] Add a runnable example equivalent to the JS package quick start.
- [x] Document LangChain Python version expectations.

### Phase 4 — Validation

- [x] Add Python tests for the integration package.
- [x] Add tests for identity exposure.
- [x] Add tests for DID resolution.
- [x] Add tests for signature verification.
- [x] Add tests for opt-in HTTP signing.
- [x] Add regression coverage for secret isolation.

### Phase 5 — Release Readiness

- [x] Update `pyproject.toml` metadata away from `design-scaffold` semantics.
- [x] Update `README.md` from design scaffold language to implementation language.
- [x] Add package-level release checks aligned with `docs/SDK-Release-Checklist.md`.
- [x] Add CI coverage if the package becomes executable and testable.

---

## Definition of Done

The LangChain Python integration is ready when all of the following are true:

1. `create_agent_did_langchain_integration(...)` is implemented.
2. The integration exposes identity, DID resolution, and verification tools.
3. HTTP signing is opt-in and secret-safe.
4. A runnable example exists.
5. Automated tests exist.
6. Documentation no longer describes the package as blocked by the Python SDK.

## Current Closure Notes

- The package now includes opt-in key rotation.
- HTTP signing rejects insecure schemes and private or loopback targets by default.
- Dedicated CI coverage is expected in `.github/workflows/ci-langchain-python.yml`.

---

## Related Files

- `integrations/langchain-python/README.md`
- `integrations/langchain-python/pyproject.toml`
- `integrations/langchain-python/src/agent_did_langchain/__init__.py`
- `docs/F1-03-LangChain-Python-Integration-Design.md`
- `docs/F2-01-TS-Python-Parity-Matrix.md`
- `docs/SDK-Release-Checklist.md`