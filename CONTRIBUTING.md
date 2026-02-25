# Contributing to Agent-DID

First off, thank you for considering contributing to Agent-DID! It's people like you that make open-source standards possible. We are building the foundational identity layer for the AI economy, and every contribution matters.

## 🤝 How Can I Contribute?

### 1. Review and Discuss the Specification
The most valuable contribution right now is reviewing the **[RFC-001 Specification](docs/RFC-001-Agent-DID-Specification.md)**. 
- Does the JSON-LD schema make sense?
- Are there edge cases we missed for corporate compliance?
- How should we handle key rotation or agent revocation?
Open an Issue to start a discussion!

### 2. Propose Changes (Pull Requests)
If you have a concrete improvement to the specification or documentation:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/improve-schema`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add support for multi-sig controllers'`).
5. Push to the branch (`git push origin feature/improve-schema`).
6. Open a Pull Request.

### 3. Build Reference Implementations
We are looking for developers to help build the first SDKs (TypeScript/Python) to generate, sign, and verify Agent-DIDs based on the RFC-001 spec. If you want to lead one of these efforts, please open an Issue titled "Proposal: [Language] SDK Implementation".

## 📝 Code of Conduct

This project and everyone participating in it is governed by a Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

- Be welcoming and inclusive.
- Respect differing viewpoints and experiences.
- Focus on what is best for the community and the standard.

## 🔍 Issue Triage

When opening an issue, please use one of the following tags in the title if applicable:
- `[RFC]`: For discussions related to the specification.
- `[Docs]`: For documentation improvements.
- `[SDK]`: For discussions related to reference implementations.
- `[Idea]`: For proposing new features or use cases (e.g., Moltbook integration).

Thank you for helping us build the future of verifiable AI identity!
