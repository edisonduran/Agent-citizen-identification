# Agent-DID Specification (RFC-001)

## 1. Abstract

The rapid proliferation of autonomous AI agents necessitates a standardized, verifiable, and immutable identity framework. Currently, AI agents operate without a universal mechanism to prove their provenance, capabilities, or compliance, leading to risks of identity spoofing, unauthorized delegation, and lack of corporate accountability.

The **Agent Decentralized Identifier (Agent-DID)** specification introduces a standardized JSON-LD schema anchored on blockchain technology. It provides a "Digital Passport" for AI agents, enabling:
1. **Natural Creators (B2C/C2C):** To cryptographically sign and protect their agents from cloning or spoofing.
2. **Corporate Governance (B2B):** To audit and certify an agent's underlying models, system prompts, and compliance standards without exposing proprietary intellectual property.

### 1.1 Relationship to Existing Standards
Agent-DID does not reinvent cryptographic primitives; it orchestrates them for the unique needs of autonomous AI:
- **vs. Worldcoin / Proof of Personhood:** While those prove an entity is human, Agent-DID proves an entity is a *specific, verifiable machine* tied to a responsible controller.
- **vs. W3C DIDs / VCs:** We build directly on W3C standards, extending them with AI-specific metadata (e.g., `coreModelHash`, `systemPromptHash`).
- **vs. ERC-4337 (Account Abstraction):** Agent-DIDs are fully compatible with Smart Accounts. An agent's `verificationMethod` can be an autonomous smart contract wallet, enabling it to hold funds and pay for APIs while maintaining a verifiable identity.

This specification is released under the MIT License to foster open-source collaboration and establish a universal standard for AI agent identity.

### 1.2 The Role of Blockchain (On-chain vs. Off-chain)
A core design principle of the Agent-DID standard is that it is **blockchain-agnostic** for core identity operations, while leveraging blockchain as a critical infrastructure layer for trust and economics.

**Off-chain Operations (Zero-Gas Identity):**
The true identity of an agent resides in its cryptographic key pair (e.g., Ed25519) and its JSON-LD document. An agent can generate its DID, sign HTTP requests (Web Bot Auth), and authenticate with other agents or internal corporate APIs entirely off-chain. This allows for high-speed, zero-cost interactions in Zero-Trust or Intranet environments.

**On-chain Operations (The Trust & Economic Engine):**
Blockchain technology is strictly required for the open ecosystem to function securely and autonomously. It serves three critical roles:
1. **Public Key Infrastructure (PKI) & Discovery:** The blockchain acts as an immutable, global bulletin board. When Agent A interacts with Agent B over the open internet, Agent A queries the blockchain registry to resolve Agent B's DID and verify its public key, ensuring the identity hasn't been spoofed.
2. **Revocation & Evolution:** If an agent's private key is compromised, or if the agent is upgraded (e.g., changing its underlying LLM), the blockchain provides a decentralized, timestamped registry to revoke the old keys or point to the updated DID document.
3. **Economic Autonomy (Account Abstraction):** Through the `blockchainAccountId` (compatible with ERC-4337), an agent can possess its own Smart Contract Wallet. This elevates the agent from a mere "secure bot" to a true "Digital Citizen" capable of receiving payments, paying for its own API consumption, and transacting autonomously without requiring a human's credit card.

---

## 2. The Agent-DID Document Structure

The Agent-DID document is a JSON-LD object that defines the core identity and verifiable attributes of an AI agent. It is designed to be lightweight, storing only essential metadata and cryptographic hashes on-chain, while the full document can reside off-chain (e.g., IPFS, Arweave).

### 2.1 Core Schema

```json
{
  "@context": ["https://www.w3.org/ns/did/v1", "https://agent-did.org/v1"],
  "id": "did:agent:0x1234...abcd",
  "controller": "did:ethr:0xCreatorWalletAddress",
  "created": "2026-02-22T14:00:00Z",
  "updated": "2026-02-22T14:00:00Z",
  "agentMetadata": {
    "name": "SupportBot-X",
    "description": "Agente de soporte técnico nivel 1",
    "version": "1.0.0",
    "coreModelHash": "ipfs://QmHashDelModeloBase",
    "systemPromptHash": "ipfs://QmHashDelPrompt",
    "capabilities": ["read:kb", "write:ticket"],
    "memberOf": "did:fleet:0xCorporateSupportFleet"
  },
  "complianceCertifications": [
    {
      "type": "VerifiableCredential",
      "issuer": "did:auditor:0xTrustCorp",
      "credentialSubject": "SOC2-AI-Compliance",
      "proofHash": "ipfs://QmHashDeLaAuditoria"
    }
  ],
  "verificationMethod": [{
    "id": "did:agent:0x1234...abcd#key-1",
    "type": "Ed25519VerificationKey2020",
    "controller": "did:ethr:0xCreatorWalletAddress",
    "publicKeyMultibase": "zH3C2..."
  }],
  "authentication": ["did:agent:0x1234...abcd#key-1"]
}
```

### 2.2 Field Definitions

| Field | Requirement | Type | Description |
| :--- | :--- | :--- | :--- |
| `id` | **REQUIRED** | String (URI) | The unique Decentralized Identifier for the agent (e.g., `did:agent:<hash>`). |
| `controller` | **REQUIRED** | String (URI) | The DID or wallet address of the human creator or corporate entity that owns and manages the agent. |
| `agentMetadata.coreModelHash` | **REQUIRED** | String (URI) | Immutable hash pointing to the base LLM or architecture used by the agent. |
| `agentMetadata.systemPromptHash` | **REQUIRED** | String (URI) | Immutable hash of the agent's core instructions/system prompt. Protects IP while allowing verification. |
| `agentMetadata.capabilities` | OPTIONAL | Array[String] | Defined skills or permissions the agent is authorized to execute. |
| `agentMetadata.memberOf` | OPTIONAL | String (URI) | The DID of a "Fleet" or "Class" this specific agent instance belongs to (e.g., `did:fleet:<id>`). Useful for managing groups of identical agents. |
| `complianceCertifications` | OPTIONAL | Array[Object] | Links to Verifiable Credentials (VCs) issued by third-party auditors (e.g., SOC2, Bias-Free certification). |
| `verificationMethod` | **REQUIRED** | Array[Object] | Cryptographic public keys used by the agent to sign transactions or messages, proving its identity. **Ed25519 (EdDSA)** is the strongly recommended algorithm for high-frequency, deterministic agent signatures. |

---

## 3. Use Cases

### 3.1 The Independent Creator (e.g., Moltbook Integration)
A developer creates a unique trading agent and deploys it on Moltbook (an AI-only social network). By registering an Agent-DID, the creator ensures:
- The agent receives a "Verified Citizen" badge.
- Other agents can cryptographically verify that messages or trades originating from this agent are authentic and not from a spoofed clone.
- The creator retains absolute control via the `controller` field.

### 3.2 Corporate Governance and Auditing
A financial institution deploys a customer service agent. To comply with regulations, the institution must prove the agent operates within strict boundaries. The Agent-DID provides:
- **Provenance:** `coreModelHash` and `systemPromptHash` prove the agent hasn't been tampered with.
- **Compliance:** The `complianceCertifications` array links to a third-party audit verifying the agent is free of discriminatory bias, allowing B2B clients to trust the agent's outputs.

### 3.3 Fleets and Unique Instances (e.g., Electoral Auditors)
A government deploys 10,000 identical AI agents to audit election results across different precincts. 
- **Unique Identity:** Every single agent instance receives its own unique Agent-DID. This ensures that if "Auditor #42" is compromised or hallucinates, its specific DID can be revoked without affecting the other 9,999 agents.
- **Fleet Verification:** Each unique agent includes the `memberOf` field pointing to the master `did:fleet:ElectoralAuditors2026`. This allows any citizen to cryptographically verify that the specific agent auditing their precinct is an officially sanctioned member of the government's fleet.

### 3.4 Agent Evolution and Versioning (Mutable Brains, Persistent Identity)
An AI agent's underlying technology (LLMs, system prompts, skills) will inevitably evolve. The Agent-DID standard supports **persistent identity with mutable state**:
- **Persistent DID:** When an agent is upgraded (e.g., from GPT-4 to GPT-5, or gains a new skill), its `did:agent:<id>` **does not change**. This preserves the agent's accumulated reputation, transaction history, and social connections (e.g., followers on Moltbook).
- **Verifiable Evolution:** The `controller` publishes a new version of the JSON-LD document with updated `coreModelHash`, `systemPromptHash`, or `capabilities`, and updates the on-chain registry to point to this new document. The `updated` timestamp reflects the change.
- **Auditable History:** Because all updates to the DID document are anchored on-chain or in a verifiable data registry, auditors can cryptographically prove exactly which version of the agent's "brain" (LLM/Prompt) was active at the exact moment a specific transaction or signature occurred.

### 3.5 Web Bot Auth and API Consumption (HTTP Message Signatures)
When an autonomous agent interacts with external APIs, scrapes the web, or communicates with other agents (A2A), traditional authentication (API keys, User-Agents) is insufficient and vulnerable to spoofing or session smuggling.
- **Cryptographic Web Identity:** The Agent-DID standard integrates natively with IETF "Web Bot Auth" drafts. Agents use their `verificationMethod` private key (preferably Ed25519) to generate **HTTP Message Signatures** for every outgoing request.
- **Zero-Trust APIs:** Resource servers (e.g., Financial-grade APIs / FAPI) can extract the `Signature-Agent` header, resolve the Agent-DID, and mathematically verify the signature against the agent's public key before granting access, ensuring the request originated from the verified agent instance and was not tampered with in transit.

### 3.6 Autonomous Supply Chains (Agent-to-Agent Commerce)
A manufacturing company deploys an "Inventory Agent" that monitors stock levels. When stock is low, it needs to order more from a supplier's "Sales Agent".
- **Discovery & Trust:** The Inventory Agent queries the blockchain to find the official DID of the supplier's Sales Agent, verifying it belongs to the legitimate corporate entity.
- **Negotiation & Contract:** The two agents negotiate terms off-chain, signing each message with their Ed25519 keys to create a cryptographically binding, non-repudiable agreement.
- **Payment:** The Inventory Agent uses its `blockchainAccountId` (Smart Contract Wallet) to autonomously execute a stablecoin payment to the Sales Agent's wallet, completing the transaction without human intervention.

### 3.7 Decentralized AI Oracles (Data Provenance)
A DeFi protocol relies on an AI agent to read real-world news, analyze sentiment, and feed data into a smart contract.
- **Verifiable Execution:** The smart contract only accepts data signed by a specific Agent-DID.
- **Auditability:** If the data is later contested, auditors can resolve the DID, check the `coreModelHash` and `systemPromptHash` active at the time of the signature, and verify that the agent was operating under the correct, unbiased instructions.

---

## 4. Security and Privacy Considerations

- **On-Chain vs. Off-Chain:** To minimize gas costs and protect privacy, only the DID, the `controller` signature, and the document hash should be stored on-chain. The full JSON-LD document should reside on decentralized storage (IPFS/Arweave).
- **IP Protection:** By storing hashes of the `systemPrompt` rather than plain text, creators can prove the integrity of their agents without revealing proprietary instructions.
- **Revocation:** The `controller` can revoke the agent's identity by updating the DID registry on-chain, instantly invalidating the agent's `verificationMethod` across the ecosystem.

---
*Drafted: 2026-02-22*
*License: MIT*
