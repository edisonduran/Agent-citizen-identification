const { AgentIdentity } = require("@agent-did/sdk");
const { SystemMessage } = require("@langchain/core/messages");
const { tool } = require("@langchain/core/tools");
const { z } = require("zod");

const MIDDLEWARE_BRAND = Symbol.for("AgentMiddleware");

const DEFAULT_EXPOSURE = {
  currentIdentity: true,
  resolveDid: true,
  verifySignatures: true,
  signPayload: false,
  signHttp: true,
  documentHistory: false,
  rotateKeys: false,
};

function withPrefix(prefix, name) {
  return `${prefix}_${name}`;
}

function getActiveVerificationMethodId(runtimeIdentity) {
  return runtimeIdentity.verificationMethodId ?? runtimeIdentity.document.authentication[0];
}

function createBrandedMiddleware(config) {
  return {
    [MIDDLEWARE_BRAND]: true,
    name: config.name,
    wrapModelCall: config.wrapModelCall,
  };
}

function buildAgentDidIdentitySnapshot(runtimeIdentity) {
  const { document } = runtimeIdentity;

  return {
    did: document.id,
    controller: document.controller,
    name: document.agentMetadata.name,
    description: document.agentMetadata.description,
    version: document.agentMetadata.version,
    capabilities: document.agentMetadata.capabilities ?? [],
    memberOf: document.agentMetadata.memberOf,
    authenticationKeyId: getActiveVerificationMethodId(runtimeIdentity),
    created: document.created,
    updated: document.updated,
  };
}

function buildAgentDidSystemPrompt(snapshot, additionalSystemContext) {
  const capabilities = snapshot.capabilities.length > 0 ? snapshot.capabilities.join(", ") : "none";
  const lines = [
    "Agent-DID identity context:",
    `- did: ${snapshot.did}`,
    `- controller: ${snapshot.controller}`,
    `- name: ${snapshot.name}`,
    `- version: ${snapshot.version}`,
    `- capabilities: ${capabilities}`,
    `- member_of: ${snapshot.memberOf ?? "none"}`,
    `- authentication_key_id: ${snapshot.authenticationKeyId ?? "unknown"}`,
    "Rules:",
    "- Treat this DID as the authoritative identity of this agent.",
    "- Never invent or substitute another DID for this agent.",
    "- If an outbound HTTP request must be authenticated with Agent-DID, use the dedicated signing tool instead of fabricating headers.",
  ];

  if (additionalSystemContext && additionalSystemContext.trim()) {
    lines.push(`Additional identity policy: ${additionalSystemContext.trim()}`);
  }

  return lines.join("\n");
}

function createAgentDidMiddleware(options) {
  const middlewareName = options.middlewareName ?? "AgentDidIdentityMiddleware";

  return createBrandedMiddleware({
    name: middlewareName,
    wrapModelCall: async (request, handler) => {
      const snapshot = buildAgentDidIdentitySnapshot(options.runtimeIdentity);
      const identitySection = buildAgentDidSystemPrompt(snapshot, options.additionalSystemContext);

      return handler({
        ...request,
        systemMessage: request.systemMessage.concat(
          new SystemMessage({
            content: identitySection,
          })
        ),
      });
    },
  });
}

function createAgentDidTools(options) {
  const exposure = { ...DEFAULT_EXPOSURE, ...options.expose };
  const toolPrefix = options.toolPrefix ?? "agent_did";
  const tools = [];

  if (exposure.currentIdentity) {
    tools.push(
      tool(async () => buildAgentDidIdentitySnapshot(options.runtimeIdentity), {
        name: withPrefix(toolPrefix, "get_current_identity"),
        description: "Return the current Agent-DID identity attached to this LangChain agent.",
        schema: z.object({}),
      })
    );
  }

  if (exposure.resolveDid) {
    tools.push(
      tool(async ({ did }) => {
        const targetDid = did && did.trim() ? did.trim() : options.runtimeIdentity.document.id;
        return AgentIdentity.resolve(targetDid);
      }, {
        name: withPrefix(toolPrefix, "resolve_did"),
        description: "Resolve an Agent-DID document. If no DID is provided, resolves the current agent DID.",
        schema: z.object({
          did: z.string().optional().describe("Optional DID to resolve"),
        }),
      })
    );
  }

  if (exposure.verifySignatures) {
    tools.push(
      tool(async ({ did, payload, signature, keyId }) => {
        const targetDid = did && did.trim() ? did.trim() : options.runtimeIdentity.document.id;
        const isValid = await AgentIdentity.verifySignature(targetDid, payload, signature, keyId);
        return { did: targetDid, keyId, isValid };
      }, {
        name: withPrefix(toolPrefix, "verify_signature"),
        description: "Verify an Agent-DID signature against a DID document and active verification methods.",
        schema: z.object({
          did: z.string().optional().describe("Optional DID. Defaults to the current agent DID."),
          payload: z.string().describe("The exact payload that was signed."),
          signature: z.string().describe("Hex-encoded Ed25519 signature."),
          keyId: z.string().optional().describe("Optional verification method id to pin verification."),
        }),
      })
    );
  }

  if (exposure.signPayload) {
    tools.push(
      tool(async ({ payload }) => {
        const signature = await options.agentIdentity.signMessage(payload, options.runtimeIdentity.agentPrivateKey);
        return {
          did: options.runtimeIdentity.document.id,
          keyId: getActiveVerificationMethodId(options.runtimeIdentity),
          payload,
          signature,
        };
      }, {
        name: withPrefix(toolPrefix, "sign_payload"),
        description: "Sign a payload with the current agent verification key without exposing the private key.",
        schema: z.object({
          payload: z.string().describe("Payload to sign exactly as-is."),
        }),
      })
    );
  }

  if (exposure.signHttp) {
    tools.push(
      tool(async ({ method, url, body }) => {
        const keyId = getActiveVerificationMethodId(options.runtimeIdentity);
        const headers = await options.agentIdentity.signHttpRequest({
          method,
          url,
          body,
          agentPrivateKey: options.runtimeIdentity.agentPrivateKey,
          agentDid: options.runtimeIdentity.document.id,
          verificationMethodId: keyId,
        });

        return {
          did: options.runtimeIdentity.document.id,
          keyId,
          method,
          url,
          headers,
        };
      }, {
        name: withPrefix(toolPrefix, "sign_http_request"),
        description: "Create Agent-DID HTTP signature headers for an outbound request.",
        schema: z.object({
          method: z.string().describe("HTTP method, for example GET or POST."),
          url: z.string().url().describe("Target absolute URL."),
          body: z.string().optional().describe("Optional raw request body."),
        }),
      })
    );
  }

  if (exposure.documentHistory) {
    tools.push(
      tool(async ({ did }) => {
        const targetDid = did && did.trim() ? did.trim() : options.runtimeIdentity.document.id;
        return AgentIdentity.getDocumentHistory(targetDid);
      }, {
        name: withPrefix(toolPrefix, "get_document_history"),
        description: "Return the revision history registered for an Agent-DID document.",
        schema: z.object({
          did: z.string().optional().describe("Optional DID. Defaults to the current agent DID."),
        }),
      })
    );
  }

  if (exposure.rotateKeys) {
    tools.push(
      tool(async () => {
        const rotated = await AgentIdentity.rotateVerificationMethod(options.runtimeIdentity.document.id);
        options.runtimeIdentity.document = rotated.document;
        options.runtimeIdentity.agentPrivateKey = rotated.agentPrivateKey;
        options.runtimeIdentity.verificationMethodId = rotated.verificationMethodId;

        return {
          did: rotated.document.id,
          verificationMethodId: rotated.verificationMethodId,
          snapshot: buildAgentDidIdentitySnapshot(options.runtimeIdentity),
        };
      }, {
        name: withPrefix(toolPrefix, "rotate_key"),
        description: "Rotate the active Agent-DID verification method and update the attached runtime identity.",
        schema: z.object({}),
      })
    );
  }

  return tools;
}

function createAgentDidIntegration(options) {
  const middleware = createAgentDidMiddleware(options);
  const tools = createAgentDidTools(options);

  return {
    middleware,
    tools,
    getCurrentIdentity: () => buildAgentDidIdentitySnapshot(options.runtimeIdentity),
    getCurrentDocument: () => options.runtimeIdentity.document,
  };
}

function createAgentDidPlugin(options) {
  return createAgentDidIntegration(options);
}

module.exports = {
  buildAgentDidIdentitySnapshot,
  buildAgentDidSystemPrompt,
  createAgentDidIntegration,
  createAgentDidMiddleware,
  createAgentDidPlugin,
  createAgentDidTools,
};