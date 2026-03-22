# F2-05 - CrewAI Implementation Checklist

## Objective

Keep the CrewAI package in `integrations/crewai/` functionally complete and aligned with the repo narrative without re-opening already closed architectural questions.

Use this checklist when implementation work starts or when a PR changes CrewAI package shape, security defaults, callbacks or documentation.

---

## Current Baseline

- [x] The package declares itself as `functional` and that status matches the shipped runtime coverage.
- [x] `integrations/crewai/README.md` no longer describes the Python SDK as future work.
- [x] `docs/F2-05-CrewAI-Integration-Design.md` still matches the intended CrewAI surface.

---

## Factory And Public Surface

- [x] Implement `create_agent_did_crewai_integration(...)` in `integrations/crewai/src/agent_did_crewai/__init__.py`.
- [x] Define the returned integration object shape before adding secondary helpers.
- [x] Keep the public surface Python-first and aligned with CrewAI concepts: tools, callbacks, guardrails and structured outputs.

---

## Tools

- [x] Add tools for current DID exposure, DID resolution and signature verification.
- [x] Keep sensitive operations opt-in: HTTP signing, payload signing and key rotation.
- [x] Ensure tool inputs and outputs are structured enough for `Task` and `Crew` composition.

---

## Callbacks And Guardrails

- [x] Add step/task callback hooks for Agent-DID traceability.
- [x] Define optional guardrails for outputs that must carry DID-derived guarantees.
- [x] Ensure callback and guardrail paths do not leak private keys, raw payloads or raw signatures by default.

---

## Documentation And Examples

- [x] Add at least one runnable example covering the integration bundle.
- [x] Document secure defaults and opt-in exposure flags in `integrations/crewai/README.md`.
- [x] Keep the design doc, README and package metadata aligned in the same PR.

---

## Validation

- [x] Add Python tests for the integration factory and exposed tools.
- [x] Add tests for secure defaults and failure handling.
- [x] Add package build validation once implementation exists.

---

## Exit Rule

F2-05 is complete for repo scope when the package has a functional factory, explicit `Agent`/`Task`/`Crew` helpers, runnable wiring example, automated tests, successful build validation and documentation that matches shipped behavior.