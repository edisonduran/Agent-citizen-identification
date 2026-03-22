# F2-05 - CrewAI Integration Review Checklist

## Objective

Turn CrewAI integration review into a repeatable artifact so future implementation work cannot drift from the repo narrative.

Run this checklist whenever a change affects `integrations/crewai/**` or the CrewAI design and implementation documents.

---

## When To Run It

Run this checklist when a change affects one or more of the following:

- `integrations/crewai/**`
- `docs/F2-05-CrewAI-Integration-Design.md`
- `docs/F2-05-CrewAI-Implementation-Checklist.md`
- CrewAI tools, callbacks, guardrails, README or package metadata

---

## Package Governance

- [ ] The package status is still correct for the shipped state (`functional` while the current `Agent`/`Task`/`Crew` helper surface remains accurate).
- [ ] README, design doc and package metadata describe the same current state.
- [ ] No CrewAI document refers to the Python SDK as future work.

---

## Public Surface

- [ ] The intended factory name remains `create_agent_did_crewai_integration(...)`.
- [ ] Public concepts remain centered on CrewAI-native surfaces: tools, callbacks, guardrails and structured outputs.
- [ ] Any newly introduced helper surface is documented in the README and reflected in the implementation checklist.

---

## Security

- [ ] Sensitive capabilities remain opt-in.
- [ ] Private keys remain outside model-visible prompts and context.
- [ ] Logs, callbacks and future observability hooks do not expose raw secrets by default.

---

## Documentation And Delivery

- [ ] `docs/F2-05-CrewAI-Implementation-Checklist.md` still reflects the current shipped completion state or the next concrete delta.
- [ ] The README still points to the implementation and review checklists.
- [ ] If shipped behavior changes, the design doc is updated in the same PR.

---

## Decision Rule

CrewAI review is complete when the current package state is accurately described, security expectations remain explicit, and all implementation-facing artifacts agree on the shipped surface.