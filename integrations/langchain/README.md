# @agent-did/langchain

Integracion de Agent-DID para LangChain JS 1.x.

Esta integracion implementa el enfoque recomendado por la API moderna de LangChain: middleware para inyectar identidad del agente en `createAgent()` y herramientas para exponer operaciones Agent-DID dentro del loop de herramientas.

## Compatibilidad objetivo

- `langchain` `^1.2.32`
- `@langchain/core` `^1.1.32`
- `@agent-did/sdk` `^0.1.0`
- Node.js 20+

## Instalacion

```bash
npm install @agent-did/sdk langchain @langchain/core zod
```

Si publicas este paquete por separado:

```bash
npm install @agent-did/langchain
```

## Uso rapido

```ts
import { ethers } from "ethers";
import { createAgent } from "langchain";
import { AgentIdentity } from "@agent-did/sdk";
import { createAgentDidIntegration } from "@agent-did/langchain";

const signer = new ethers.Wallet(process.env.CREATOR_PRIVATE_KEY!);
const identity = new AgentIdentity({ signer, network: "polygon" });

const runtimeIdentity = await identity.create({
  name: "research_assistant",
  description: "Agente de investigacion con identidad verificable",
  coreModel: "gpt-4.1-mini",
  systemPrompt: "Eres un agente de investigacion preciso y trazable.",
  capabilities: ["research:web", "report:write"]
});

const integration = createAgentDidIntegration({
  agentIdentity: identity,
  runtimeIdentity,
  expose: {
    signHttp: true,
    verifySignatures: true,
    signPayload: false,
    rotateKeys: false,
    documentHistory: true
  }
});

const agent = createAgent({
  name: "research_assistant",
  model: "openai:gpt-4.1-mini",
  systemPrompt: "Responde con precision y usa herramientas cuando haga falta.",
  tools: integration.tools,
  middleware: [integration.middleware]
});

const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content: "Muestrame tu DID actual y firma una solicitud POST a https://api.example.com/tasks"
    }
  ]
});

console.log(result.messages.at(-1)?.content);
```

## Que agrega la integracion

- Middleware que inyecta en el sistema el DID actual, controlador, capacidades y metodo de autenticacion activo.
- Herramientas de consulta para identidad actual, resolucion DID y verificacion de firmas.
- Herramientas opcionales para firma de payloads, firma HTTP, historial documental y rotacion de clave.

## Compatibilidad de API

- `createAgentDidIntegration(...)`: nombre recomendado.
- `createAgentDidPlugin(...)`: alias mantenido por compatibilidad retroactiva.

## Seguridad por defecto

- `signPayload` y `rotateKeys` vienen deshabilitados por defecto.
- `signHttp` puede habilitarse para que el agente firme solicitudes salientes sin exponer la clave privada al modelo.
- La clave privada nunca se inserta en mensajes, contexto ni estado del agente.

## Archivos relevantes

- `src/agentDidLangChain.js`: middleware, herramientas y helpers principales.
- `examples/agentDidLangChain.example.js`: ejemplo con `createAgent()` de LangChain 1.x.
- `tests/agentDidLangChain.test.js`: pruebas de la integracion.