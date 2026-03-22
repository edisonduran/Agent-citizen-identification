# F2-04 - Microsoft Agent Framework Implementation Checklist

## Objective

Convert the Microsoft Agent Framework package in `integrations/microsoft-agent-framework/` from an SDK-ready scaffold into a functional Python-oriented integration without reopening already settled language-scope decisions.

Use this checklist when implementation work starts or when a PR changes the package shape, runtime hooks, tools, middleware or documentation.

---

## Current Baseline

- [ ] The package still declares itself as `sdk-ready-scaffold`, not as a shipped integration.
- [ ] `integrations/microsoft-agent-framework/README.md` no longer describes the Python SDK as future work.
- [ ] `docs/F2-04-Microsoft-Agent-Framework-Integration-Design.md` still matches the intended runtime surface.

---

## Factory And Public Surface

- [ ] Keep `createAgentDidMicrosoftAgentFrameworkIntegration(...)` as the conceptual entry point until the Python implementation surface is finalized.
- [ ] Define the Python adapter return shape before adding secondary helpers.
- [ ] Keep the public concepts centered on Microsoft Agent Framework-native surfaces: tools, middleware, context and observability hooks.

---

## Runtime Integration

- [ ] Map Agent-DID tools to the framework tool-registration mechanism.
- [ ] Define middleware or runtime hooks for identity injection without exposing secrets.
- [ ] Define how session or workflow context carries identity metadata safely.

---

## Security

- [ ] Keep sensitive capabilities opt-in: HTTP signing, payload signing and key rotation.
- [ ] Ensure private keys never enter model-visible prompts or runtime context.
- [ ] Ensure error, logging and observability paths stay sanitized by default.

---

## Documentation And Examples

- [ ] Add at least one runnable example covering the target Python runtime.
- [ ] Document secure defaults and opt-in exposure flags in `integrations/microsoft-agent-framework/README.md`.
- [ ] Keep README, design doc and package metadata aligned in the same PR.

---

## Validation

- [ ] Add tests for the adapter factory and tool exposure.
- [ ] Add tests for middleware or context injection semantics.
- [ ] Add tests for secure defaults and failure handling.

---

## Exit Rule

F2-04 is implementation-ready for release review when the package has a functional adapter, runnable example, automated tests and documentation that matches shipped behavior.