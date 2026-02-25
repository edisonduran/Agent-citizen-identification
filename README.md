# Agent-DID: The Universal Identity Standard for AI Agents

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

Welcome to the **Agent-DID** project. We are building the open-source, blockchain-agnostic standard for verifiable AI agent identity. 

As autonomous AI agents proliferate—interacting, trading, and representing humans or corporations—the need for a universal "Digital Passport" becomes critical. Agent-DID provides the cryptographic infrastructure to prevent spoofing, ensure provenance, and enable trust in a machine-to-machine economy.

## 🌟 Vision: The First Verified Digital Citizens

Imagine a world where an AI agent can prove:
1. **Who created it** (Human or Corporate Controller).
2. **What it is made of** (Immutable hashes of its core LLM and system prompts).
3. **What it is allowed to do** (Verifiable skills and compliance certifications).

Whether it's an independent creator deploying an agent on an AI social network like Moltbook, or a Fortune 500 company deploying a customer service bot, Agent-DID ensures that every interaction is authentic and auditable.

### 🤝 How We Fit in the Ecosystem
We aren't reinventing the wheel; we are building the missing spoke for AI:
- **Not Proof of Personhood (e.g., Worldcoin):** We prove *machinehood* and provenance.
- **Built on W3C Standards:** We extend standard DIDs and Verifiable Credentials (VCs) specifically for AI metadata.
- **DeFi Ready (ERC-4337):** Fully compatible with Account Abstraction, allowing agents to have verifiable identities *and* autonomous wallets.

## 📖 The Specification

The core of this project is the **Agent-DID Specification (RFC-001)**. It defines a lightweight JSON-LD schema anchored on W3C Decentralized Identifiers (DIDs) and Verifiable Credentials (VCs).

👉 **[Read the full RFC-001 Specification here](docs/RFC-001-Agent-DID-Specification.md)**

## 🚀 Getting Started

Currently, this project is in the **Specification Phase**. We are actively seeking feedback from the Web3, AI, and Open Source communities to refine the standard before building the reference implementations (SDKs).

### How to Contribute

We believe this standard must be built by the community, for the community. 

1. **Read the Spec:** Review `docs/RFC-001-Agent-DID-Specification.md`.
2. **Join the Discussion:** Check out our open [Issues](https://github.com/your-org/agent-did/issues) to see where we need help.
3. **Propose Changes:** Submit a Pull Request (PR) to improve the specification or add new use cases.
4. **Build with Us:** We are looking for developers to help build the first reference SDKs in TypeScript and Python.

Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 🗺️ Roadmap & Future Extensions

The Agent-DID ecosystem is designed to be modular. While RFC-001 defines the core identity, future specifications will address advanced autonomous behaviors:

- [x] **Phase 1:** Draft Core Specification (RFC-001) - *Completed*
- [ ] **Phase 2:** Community Review & RFC Finalization
- [ ] **Phase 3:** Reference Implementation (TypeScript/Python SDKs for generating and signing Agent-DIDs)
- [ ] **Phase 4:** Smart Contract Templates (EVM/Solana registries for DID anchoring and revocation)
- [ ] **Phase 5:** Integration Pilots (e.g., OpenClaw/Moltbook ecosystem)

### Upcoming Specifications (In Research)
- **RFC-002: Agent Delegation & Multi-hop Trust:** Defining how agents issue ephemeral, cryptographically signed tokens (using Rich Authorization Requests - RAR) to delegate sub-tasks to other agents while maintaining an auditable chain of custody back to the original controller.
- **RFC-003: Agent-to-Human (A2H) Cryptographic Approvals:** Standardizing how agents request human authorization for high-risk actions (e.g., financial transfers) and how humans provide cryptographic proof of consent (via WebAuthn/Passkeys) to prevent prompt injection bypasses.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
