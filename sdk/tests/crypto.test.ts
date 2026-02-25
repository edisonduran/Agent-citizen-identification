import { hashPayload, formatHashUri, generateAgentMetadataHash } from '../src/crypto/hash';

describe('Crypto Hash Module', () => {
  const samplePrompt = "You are a helpful customer support agent.";
  
  // The expected SHA-256 hash for the sample prompt (calculated externally for verification)
  // "You are a helpful customer support agent." -> SHA256
  const expectedHash = "0x8b8f8e8d8c8b8a898887868584838281807f7e7d7c7b7a797877767574737271"; // Placeholder, will be dynamic in real test

  it('should generate a deterministic hash for a given payload', () => {
    const hash1 = hashPayload(samplePrompt);
    const hash2 = hashPayload(samplePrompt);
    
    expect(hash1).toBeDefined();
    expect(hash1.startsWith('0x')).toBe(true);
    expect(hash1).toEqual(hash2); // Determinism check
  });

  it('should throw an error for empty payloads', () => {
    expect(() => hashPayload("")).toThrow("Payload cannot be empty");
  });

  it('should format a raw hex hash into a valid URI', () => {
    const rawHash = "0xabcdef123456";
    const uri = formatHashUri(rawHash);
    
    expect(uri).toEqual("hash://sha256/abcdef123456");
  });

  it('should generate a complete metadata hash URI in one step', () => {
    const uri = generateAgentMetadataHash(samplePrompt);
    
    expect(uri).toBeDefined();
    expect(uri.startsWith('hash://sha256/')).toBe(true);
  });
});
