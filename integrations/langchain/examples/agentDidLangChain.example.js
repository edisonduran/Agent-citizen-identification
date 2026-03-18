const { ethers } = require("ethers");
const { createAgent } = require("langchain");
const { AgentIdentity } = require("@agent-did/sdk");
const { createAgentDidIntegration } = require("../src");

async function main() {
  try {
    const privateKey = process.env.CREATOR_PRIVATE_KEY;

    if (!privateKey) {
      throw new Error("Missing CREATOR_PRIVATE_KEY environment variable");
    }

    const signer = new ethers.Wallet(privateKey);
    const identity = new AgentIdentity({ signer, network: "polygon" });

    const runtimeIdentity = await identity.create({
      name: "research_assistant",
      description: "Agente de investigacion con trazabilidad Agent-DID",
      coreModel: "gpt-4.1-mini",
      systemPrompt: "Eres un investigador preciso, trazable y seguro.",
      capabilities: ["research:web", "report:write", "http:sign"],
    });

    const integration = createAgentDidIntegration({
      agentIdentity: identity,
      runtimeIdentity,
      additionalSystemContext: "Solo usa la firma HTTP Agent-DID cuando el flujo realmente requiera autenticacion saliente.",
      expose: {
        signHttp: true,
        verifySignatures: true,
        documentHistory: true,
      },
    });

    const agent = createAgent({
      name: "research_assistant",
      model: "openai:gpt-4.1-mini",
      systemPrompt: "Eres un asistente empresarial preciso. Usa herramientas cuando mejoren exactitud o trazabilidad.",
      tools: integration.tools,
      middleware: [integration.middleware],
    });

    const result = await agent.invoke({
      messages: [
        {
          role: "user",
          content: "Indica tu identidad Agent-DID actual y prepara una firma HTTP POST para https://api.example.com/orders con body {\"orderId\":42}",
        },
      ],
    });

    console.log(result.messages.at(-1)?.content);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

void main();