import { ethers } from 'ethers';
import { ed25519 } from '@noble/curves/ed25519';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { AgentDIDDocument, CreateAgentParams, CreateAgentResult, SignHttpRequestParams, VerificationMethod } from './types';
import { generateAgentMetadataHash } from '../crypto/hash';

export interface AgentIdentityConfig {
  signer: ethers.Signer; // The Creator's Wallet (Controller)
  network?: string; // e.g., 'polygon', 'base', 'ethereum'
}

export class AgentIdentity {
  private signer: ethers.Signer;
  private network: string;

  constructor(config: AgentIdentityConfig) {
    this.signer = config.signer;
    this.network = config.network || 'polygon';
  }

  /**
   * Creates a new Agent-DID Document (Passport) from raw parameters.
   * Automatically hashes sensitive IP (coreModel, systemPrompt) and generates the DID.
   * 
   * @param params The raw agent configuration (name, prompt, capabilities, etc.)
   * @returns A fully formed AgentDIDDocument compliant with RFC-001 and the Agent's private key
   */
  public async create(params: CreateAgentParams): Promise<CreateAgentResult> {
    // 1. Get the Controller's address (The Creator)
    const controllerAddress = await this.signer.getAddress();
    const controllerDid = `did:ethr:${controllerAddress}`;

    // 2. Generate a unique Agent ID (Hash of controller + timestamp + random nonce)
    const timestamp = new Date().toISOString();
    const nonce = ethers.hexlify(ethers.randomBytes(16));
    const rawAgentId = ethers.keccak256(ethers.toUtf8Bytes(`${controllerAddress}-${timestamp}-${nonce}`));
    const agentDid = `did:agent:${this.network}:${rawAgentId}`;

    // 3. Hash the sensitive Intellectual Property (IP)
    const coreModelHashUri = generateAgentMetadataHash(params.coreModel);
    const systemPromptHashUri = generateAgentMetadataHash(params.systemPrompt);

    // 4. Construct the Verification Method (The Agent's own keypair for signing actions)
    // We use Ed25519 for high-speed, deterministic agent signatures as per RFC-001
    const privateKeyBytes = ed25519.utils.randomPrivateKey();
    const publicKeyBytes = ed25519.getPublicKey(privateKeyBytes);
    
    const privateKeyHex = bytesToHex(privateKeyBytes);
    const publicKeyHex = bytesToHex(publicKeyBytes);
    
    // We also generate an EVM wallet for Account Abstraction (ERC-4337)
    const agentWallet = ethers.Wallet.createRandom();
    const verificationMethodId = `${agentDid}#key-1`;
    
    const verificationMethod: VerificationMethod = {
      id: verificationMethodId,
      type: "Ed25519VerificationKey2020",
      controller: controllerDid,
      publicKeyMultibase: `z${publicKeyHex}`, // Simplified multibase representation for the SDK
      blockchainAccountId: `eip155:1:${agentWallet.address}` // Assuming Ethereum Mainnet format for the account ID
    };

    // 5. Assemble the final JSON-LD Document (RFC-001 Compliant)
    const document: AgentDIDDocument = {
      "@context": ["https://www.w3.org/ns/did/v1", "https://agent-did.org/v1"],
      id: agentDid,
      controller: controllerDid,
      created: timestamp,
      updated: timestamp,
      agentMetadata: {
        name: params.name,
        description: params.description,
        version: params.version || "1.0.0",
        coreModelHash: coreModelHashUri,
        systemPromptHash: systemPromptHashUri,
        capabilities: params.capabilities || [],
        memberOf: params.memberOf
      },
      verificationMethod: [verificationMethod],
      authentication: [verificationMethodId]
    };

    return {
      document,
      agentPrivateKey: privateKeyHex
    };
  }

  /**
   * Signs a payload using the Agent's Ed25519 private key to prove identity.
   */
  public async signMessage(payload: string, agentPrivateKeyHex: string): Promise<string> {
    const messageBytes = new TextEncoder().encode(payload);
    const privateKeyBytes = hexToBytes(agentPrivateKeyHex);
    const signatureBytes = ed25519.sign(messageBytes, privateKeyBytes);
    return bytesToHex(signatureBytes);
  }

  /**
   * Signs an HTTP request (Web Bot Auth) for secure API consumption.
   * Implements a simplified version of IETF HTTP Message Signatures.
   */
  public async signHttpRequest(params: SignHttpRequestParams): Promise<Record<string, string>> {
    const urlObj = new URL(params.url);
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    // 1. Construct the string to sign (Method, Path, Host, Timestamp, Body Hash)
    let bodyHash = "";
    if (params.body) {
      bodyHash = ethers.keccak256(ethers.toUtf8Bytes(params.body));
    }
    
    const stringToSign = [
      `(request-target): ${params.method.toLowerCase()} ${urlObj.pathname}${urlObj.search}`,
      `host: ${urlObj.host}`,
      `date: ${timestamp}`,
      `content-digest: sha-256=${bodyHash}`
    ].join('\n');

    // 2. Sign the string with Ed25519
    const signatureHex = await this.signMessage(stringToSign, params.agentPrivateKey);

    // 3. Return the headers to be injected into the HTTP request
    return {
      'Signature': `sig1=:${signatureHex}:`,
      'Signature-Input': `sig1=("@request-target" "host" "date" "content-digest");created=${timestamp};keyid="${params.agentDid}#key-1"`,
      'Signature-Agent': params.agentDid,
      'Date': timestamp,
      'Content-Digest': `sha-256=${bodyHash}`
    };
  }

  /**
   * Verifies that a signature was produced by a specific Agent-DID.
   * (Placeholder for future implementation using the Universal Resolver)
   */
  public static async verifySignature(did: string, payload: string, signature: string): Promise<boolean> {
    // 1. Resolve the DID to get the JSON-LD document (Mocked here)
    // 2. Extract the public key / blockchainAccountId from the verificationMethod
    // 3. Use ed.verify(signature, payload, publicKey)
    throw new Error("Not implemented: Requires Universal Resolver integration");
  }
}
