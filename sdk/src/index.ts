/**
 * @agent-did/sdk
 * The official TypeScript SDK for the Agent-DID Specification (RFC-001)
 * 
 * This SDK provides the core tools to create, sign, and verify Decentralized Identifiers
 * for autonomous AI agents, ensuring provenance, compliance, and secure delegation.
 */

// Export Core Types (RFC-001 Schema)
export {
  AgentMetadata,
  VerifiableCredentialLink,
  VerificationMethod,
  AgentDIDDocument,
  CreateAgentParams
} from './core/types';

// Export Core Identity Class
export {
  AgentIdentity,
  AgentIdentityConfig
} from './core/AgentIdentity';

// Export Cryptographic Utilities
export {
  hashPayload,
  formatHashUri,
  generateAgentMetadataHash
} from './crypto/hash';

// Note: Resolver and Registry modules will be exported here in future versions
// export * from './resolver';
// export * from './registry';
