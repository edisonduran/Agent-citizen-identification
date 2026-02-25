import { ethers } from 'ethers';
import { AgentIdentity } from '../src/core/AgentIdentity';
import { CreateAgentParams } from '../src/core/types';

describe('AgentIdentity Core Module', () => {
  // Create a random wallet to act as the "Creator" (Controller)
  const creatorWallet = ethers.Wallet.createRandom();
  let agentIdentity: AgentIdentity;

  beforeAll(() => {
    // Initialize the SDK with the creator's wallet
    agentIdentity = new AgentIdentity({
      signer: creatorWallet,
      network: 'polygon'
    });
  });

  it('should successfully create a valid Agent-DID Document (RFC-001 Compliant)', async () => {
    const params: CreateAgentParams = {
      name: "TestBot-Alpha",
      description: "A test agent for unit testing",
      coreModel: "gpt-4o-mini",
      systemPrompt: "You are a helpful test assistant.",
      capabilities: ["read:test", "write:log"],
      memberOf: "did:fleet:test-fleet-1"
    };

    const result = await agentIdentity.create(params);
    const document = result.document;

    // 1. Verify Core DID Structure
    expect(document).toBeDefined();
    expect(document["@context"]).toContain("https://www.w3.org/ns/did/v1");
    expect(document.id.startsWith("did:agent:polygon:0x")).toBe(true);
    
    // 2. Verify Controller (Creator)
    const expectedControllerDid = `did:ethr:${creatorWallet.address}`;
    expect(document.controller).toEqual(expectedControllerDid);

    // 3. Verify Metadata & Hashing
    expect(document.agentMetadata.name).toEqual("TestBot-Alpha");
    expect(document.agentMetadata.description).toEqual("A test agent for unit testing");
    expect(document.agentMetadata.version).toEqual("1.0.0"); // Default value
    expect(document.agentMetadata.capabilities).toEqual(["read:test", "write:log"]);
    expect(document.agentMetadata.memberOf).toEqual("did:fleet:test-fleet-1");

    // Ensure sensitive data was hashed into URIs
    expect(document.agentMetadata.coreModelHash.startsWith("hash://sha256/")).toBe(true);
    expect(document.agentMetadata.systemPromptHash.startsWith("hash://sha256/")).toBe(true);
    
    // The raw prompt should NOT be in the document
    expect(JSON.stringify(document)).not.toContain("You are a helpful test assistant.");

    // 4. Verify Verification Method (The Agent's Key)
    expect(document.verificationMethod).toBeDefined();
    expect(document.verificationMethod.length).toBe(1);
    
    const vm = document.verificationMethod[0];
    expect(vm.id).toEqual(`${document.id}#key-1`);
    expect(vm.controller).toEqual(expectedControllerDid);
    expect(vm.type).toEqual("Ed25519VerificationKey2020");
    expect(vm.blockchainAccountId?.startsWith("eip155:1:0x")).toBe(true);

    // 5. Verify Authentication Binding
    expect(document.authentication).toContain(vm.id);
    
    // 6. Verify Private Key
    expect(result.agentPrivateKey).toBeDefined();
    expect(typeof result.agentPrivateKey).toBe('string');
  });

  it('should handle minimal parameters correctly', async () => {
    const minimalParams: CreateAgentParams = {
      name: "MinimalBot",
      coreModel: "llama-3",
      systemPrompt: "Minimal prompt"
    };

    const result = await agentIdentity.create(minimalParams);
    const document = result.document;

    expect(document.agentMetadata.name).toEqual("MinimalBot");
    expect(document.agentMetadata.description).toBeUndefined();
    expect(document.agentMetadata.capabilities).toEqual([]); // Should default to empty array
    expect(document.agentMetadata.memberOf).toBeUndefined();
  });
  
  it('should sign HTTP requests (Web Bot Auth)', async () => {
    const params: CreateAgentParams = {
      name: "SignerBot",
      coreModel: "test",
      systemPrompt: "test"
    };

    const { document, agentPrivateKey } = await agentIdentity.create(params);
    
    const requestParams = {
      method: 'POST',
      url: 'https://api.example.com/v1/data',
      body: '{"test": true}',
      agentPrivateKey,
      agentDid: document.id
    };
    
    const headers = await agentIdentity.signHttpRequest(requestParams);
    
    expect(headers['Signature']).toBeDefined();
    expect(headers['Signature-Input']).toBeDefined();
    expect(headers['Signature-Agent']).toEqual(document.id);
    expect(headers['Date']).toBeDefined();
    expect(headers['Content-Digest']).toBeDefined();
  });
});
