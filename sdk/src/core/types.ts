/**
 * Core types for the Agent-DID Specification (RFC-001)
 */

export interface AgentMetadata {
  name: string;
  description?: string;
  version: string;
  coreModelHash: string; // URI pointing to the base LLM hash (e.g., ipfs://...)
  systemPromptHash: string; // URI pointing to the system prompt hash
  capabilities?: string[]; // Array of authorized skills/permissions
  memberOf?: string; // DID of the Fleet/Class this agent belongs to
}

export interface VerifiableCredentialLink {
  type: string; // e.g., "VerifiableCredential"
  issuer: string; // DID of the auditor/issuer
  credentialSubject: string; // e.g., "SOC2-AI-Compliance"
  proofHash: string; // URI pointing to the actual VC proof
}

export interface VerificationMethod {
  id: string; // e.g., "did:agent:0x...#key-1"
  type: string; // e.g., "Ed25519VerificationKey2020" or "EcdsaSecp256k1RecoveryMethod2020"
  controller: string; // DID of the creator/owner
  publicKeyMultibase?: string;
  blockchainAccountId?: string; // For EVM/Smart Account compatibility (ERC-4337)
}

export interface AgentDIDDocument {
  "@context": string[];
  id: string; // The Agent's unique DID
  controller: string; // The Creator's DID or Wallet Address
  created: string; // ISO 8601 timestamp
  updated: string; // ISO 8601 timestamp
  agentMetadata: AgentMetadata;
  complianceCertifications?: VerifiableCredentialLink[];
  verificationMethod: VerificationMethod[];
  authentication: string[]; // Array of verificationMethod IDs
}

/**
 * Input parameters required to create a new Agent-DID
 */
export interface CreateAgentParams {
  name: string;
  description?: string;
  version?: string; // Defaults to "1.0.0"
  coreModel: string; // The raw model name/string (will be hashed by SDK)
  systemPrompt: string; // The raw prompt string (will be hashed by SDK)
  capabilities?: string[];
  memberOf?: string;
}

/**
 * The result of creating a new Agent-DID
 */
export interface CreateAgentResult {
  document: AgentDIDDocument;
  agentPrivateKey: string; // The Ed25519 private key (hex) for the agent to sign actions
}

/**
 * Parameters for signing an HTTP request (Web Bot Auth)
 */
export interface SignHttpRequestParams {
  method: string;
  url: string;
  body?: string;
  agentPrivateKey: string;
  agentDid: string;
}
