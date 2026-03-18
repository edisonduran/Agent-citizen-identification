# RFC-001 Agent-DID — 2-Hour Practical Course

## Course Overview

| Field | Detail |
|---|---|
| Duration | 2 hours (6 modules) |
| Level | Intermediate |
| Prerequisites | Basic cryptography, Ethereum/EVM basics, Node.js/TypeScript |
| Outcome | Participants can create, resolve, sign, and verify Agent-DIDs end-to-end |

---

## Module 1 — Fundamentals (15 min)

### 1.1 What is Decentralized Identity?

- Self-sovereign identity vs. centralized identity.
- W3C DID Core 1.0 overview.
- Why AI agents need their own identity layer.

### 1.2 The Agent-DID Thesis

- Persistent identity for autonomous agents.
- Hybrid architecture: minimal on-chain anchor, full off-chain document.
- Key properties: tamper-evidence, revocability, interoperability.

### 1.3 Exercise — Concept Map

Draw a diagram connecting: DID, DID Document, Verification Method, Agent Metadata, Registry, Resolver.

**Expected time:** 5 min.

---

## Module 2 — Specification & Architecture (20 min)

### 2.1 RFC-001 Structure

- DID Method: `did:agent-did:<multibase-pubkey>`.
- Document anatomy: `id`, `verificationMethod`, `authentication`, `agentMetadata`, `created`, `updated`.
- On-chain vs. off-chain split.

### 2.2 Architecture Diagram

```
┌─────────────────┐     ┌──────────────┐     ┌───────────────┐
│   SDK Client    │────▶│  EVM Registry │────▶│  DID Document │
│ (AgentIdentity) │     │  (Solidity)   │     │   (Off-chain) │
└─────────────────┘     └──────────────┘     └───────────────┘
        │                                            ▲
        │              ┌──────────────┐              │
        └─────────────▶│   Resolver   │──────────────┘
                       └──────────────┘
```

### 2.3 Exercise — Identify Components

Given a sample DID Document, label each field and explain its purpose.

**Expected time:** 5 min.

---

## Module 3 — SDK End-to-End (25 min)

### 3.1 Installation

```bash
npm install @agent-did/sdk
```

### 3.2 Create an Agent Identity

```typescript
import { AgentIdentity } from '@agent-did/sdk';

const agent = await AgentIdentity.create({
  name: 'CourseAgent',
  version: '1.0.0',
  capabilities: ['data-analysis', 'nlp'],
});

console.log('DID:', agent.did);
console.log('Document:', JSON.stringify(agent.didDocument, null, 2));
```

### 3.3 Sign and Verify

```typescript
const message = 'Hello from the course!';
const signature = await agent.sign(message);
const isValid = await agent.verifySignature(message, signature);
console.log('Valid:', isValid); // true
```

### 3.4 Key Rotation

```typescript
await agent.rotateVerificationMethod();
// New key is now active; previous key is revoked
```

### 3.5 Exercise — Full Lifecycle

1. Create an agent identity.
2. Sign a message.
3. Verify the signature.
4. Rotate the key.
5. Verify the old signature fails with the new key context.
6. Sign a new message and verify with the new key.

**Expected time:** 10 min.

### 3.6 Framework Integration Snapshot

If you want to see this identity model inside an agent runtime instead of plain SDK calls, review the LangChain JS integration in [../integrations/langchain/README.md](../integrations/langchain/README.md). It shows how to inject Agent-DID context through middleware and expose signing or verification operations as tools.

---

## Module 4 — Universal Resolver & HA (20 min)

### 4.1 Resolver Architecture

- `InMemoryDIDResolver` — local, for testing.
- `UniversalResolverClient` — production, with caching and multi-source fallback.
- `HttpDIDDocumentSource` / `JsonRpcDIDDocumentSource` — pluggable document sources.

### 4.2 Resolution Flow

1. Client calls `resolve(did)`.
2. Resolver checks cache → if hit, return.
3. If miss, query on-chain registry for document reference.
4. Fetch off-chain document.
5. Validate document integrity.
6. Cache and return.

### 4.3 High Availability Concepts

- Multi-zone deployment.
- SLO targets: 99.9% availability, p95 ≤ 750 ms.
- Failover and cache-stale strategies.

### 4.4 Exercise — Resolver Configuration

Configure a `UniversalResolverClient` with two HTTP sources and verify resolution works when one source is unavailable.

**Expected time:** 5 min.

---

## Module 5 — EVM Smart Contract (20 min)

### 5.1 AgentRegistry.sol Overview

- `registerAgent(did, owner, documentHash)` — registers a new DID.
- `getAgentRecord(did)` — returns on-chain record.
- `revokeAgent(did)` — revokes a DID.
- `updateDidDocument(did, newDocumentHash)` — updates document reference.
- Events: `AgentRegistered`, `AgentRevoked`, `AgentUpdated`.

### 5.2 Deployment with Hardhat

```bash
cd contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy-agent-registry.js --network localhost
```

### 5.3 Revocation Policy

- Only the owner can revoke.
- Revocation is permanent (no un-revoke).
- Revoked DIDs fail resolution.

### 5.4 Exercise — Contract Interaction

1. Deploy the contract locally.
2. Register an agent DID.
3. Query the on-chain record.
4. Revoke the DID.
5. Verify resolution now fails.

**Expected time:** 10 min.

---

## Module 6 — Validation & Conformance (15 min)

### 6.1 Conformance Suite

```bash
cd sdk
npm test
node ../scripts/conformance-rfc001.js
```

### 6.2 MUST vs. SHOULD Controls

- **MUST**: 11 controls that are mandatory for compliance.
- **SHOULD**: 5 controls that are recommended but not blocking.

### 6.3 Smoke Tests

```bash
node scripts/e2e-smoke.js
node scripts/resolver-ha-smoke.js
node scripts/revocation-policy-smoke.js
```

### 6.4 Exercise — Run and Interpret

1. Run the conformance suite.
2. Identify which controls pass/fail.
3. For any PARTIAL controls, explain what is missing.

**Expected time:** 5 min.

---

## Final Assessment — 10 Questions

1. What standard does `did:agent-did` extend? → W3C DID Core 1.0
2. What algorithm does Agent-DID use for signing? → Ed25519
3. What is stored on-chain vs. off-chain? → Anchor/revocation on-chain; full document off-chain
4. How is a DID derived from the public key? → Multibase encoding of the Ed25519 public key
5. What happens when a key is rotated? → New key becomes active; old key is revoked
6. What is the purpose of `agentMetadata`? → Stores agent capabilities, version, integrity hashes
7. How does the resolver find the DID Document? → Queries on-chain registry for document reference, then fetches off-chain
8. Can a revoked DID be reactivated? → No, revocation is permanent
9. What is the SLO target for resolver availability? → 99.9%
10. How many MUST controls exist in the conformance checklist? → 11

---

## Recommended Study Plan

| Day | Activity | Duration |
|---|---|---|
| 1 | Read RFC-001 Specification | 45 min |
| 2 | Complete Modules 1-3 (exercises) | 60 min |
| 3 | Complete Modules 4-6 (exercises) | 55 min |
| 4 | Run full conformance + smoke tests | 30 min |
| 5 | Review assessment, revisit weak areas, inspect LangChain integration example | 30 min |
