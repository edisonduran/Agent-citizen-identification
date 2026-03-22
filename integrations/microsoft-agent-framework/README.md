# @agent-did/microsoft-agent-framework

Scaffold de diseno listo para implementacion de Agent-DID con Microsoft Agent Framework.

Importante: la documentacion publica consultada muestra superficies estables sobre todo para Python y C#. No se confirmo una ruta JavaScript equivalente en el mismo nivel de madurez, asi que este scaffold no debe interpretarse como un compromiso de implementacion Node.js inmediato. La siguiente iteracion sigue orientada a Python sobre el SDK Python ya disponible de Agent-DID.

## Estado

- Estado actual: `sdk-ready-scaffold`
- Roadmap: F2-04
- Implementacion: pendiente
- Publicacion: deshabilitada por ahora (`private: true`)

Este paquete todavia no implementa la integracion. Su objetivo es fijar la forma del paquete, la API esperada y los criterios de validacion antes de escribir el adaptador real, pero ya no esta bloqueado por la ausencia del SDK Python.

## Hallazgos tecnicos confirmados

Segun la documentacion oficial y la guia de migracion desde AutoGen, Microsoft Agent Framework expone al menos estas superficies utiles para Agent-DID:

- `Agent` como abstraccion principal para single-agent execution.
- `tools` registrables y herramientas dinamicas por invocacion.
- `AgentSession` para estado conversacional.
- `middleware` para concerns transversales como seguridad, logging y validacion.
- `WorkflowBuilder` y `executor` para orquestacion multi-agent basada en data flow.
- `request_info()` y `send_responses_streaming()` para human-in-the-loop.
- `checkpoint_storage` para persistencia y reanudacion.
- `setup_observability()` para trazabilidad operativa.

## Decision de lenguaje

La decision actual para F2-04 es:

1. Implementacion en Python.
2. Dependencia explicita del SDK Python existente de Agent-DID.
3. Sin compromiso de implementacion JS en esta fase.

Hasta que se implemente el adaptador Python, este paquete permanece como scaffold privado de diseno.

## Objetivo

Integrar Agent-DID como capa de identidad verificable para agentes ejecutados sobre Microsoft Agent Framework, de forma equivalente a lo ya disponible para LangChain:

- inyectar DID, controlador, capacidades y clave activa en el contexto operativo del agente,
- exponer herramientas para inspeccionar identidad, verificar firmas y resolver documentos,
- habilitar firma de payloads o solicitudes HTTP solo mediante opt-in,
- mantener la clave privada fuera del contexto visible para el modelo.

## API propuesta

```js
const {
  createAgentDidMicrosoftAgentFrameworkIntegration,
} = require("@agent-did/microsoft-agent-framework");

const integration = createAgentDidMicrosoftAgentFrameworkIntegration({
  agentIdentity,
  runtimeIdentity,
  expose: {
    signHttp: true,
    verifySignatures: true,
    signPayload: false,
    rotateKeys: false,
    documentHistory: true,
  },
});
```

La forma exacta del adaptador dependera de la superficie estable que Microsoft Agent Framework exponga para:

- middleware o filtros de ejecucion,
- herramientas o funciones registrables,
- enriquecimiento de contexto o session state,
- inspeccion de mensajes entrantes y salientes.

Como la implementacion objetivo sera Python, esta API se toma solo como referencia conceptual derivada del patron usado en LangChain.

## Componentes previstos

- `src/index.js`: punto de entrada del paquete.
- `src/integration.js`: factory principal del adaptador.
- `src/tools.js`: herramientas Agent-DID expuestas al runtime.
- `src/context.js`: enriquecimiento del contexto del agente.
- `src/messageSigning.js`: firma y verificacion de mensajes o solicitudes.
- `tests/`: pruebas cuando exista una superficie estable para automatizarlas.

## Criterios de implementacion

La integracion se considerara lista cuando cumpla al menos con lo siguiente:

1. Inyecta identidad Agent-DID en el contexto del runtime sin exponer secretos.
2. Expone consulta de DID actual, resolucion documental y verificacion de firmas.
3. Permite firma HTTP con opt-in explicito.
4. Mantiene rotacion de claves y firma arbitraria deshabilitadas por defecto.
5. Incluye pruebas automatizadas equivalentes a las del paquete de LangChain.

## Gobernanza de implementacion

- Checklist de implementacion: [../../docs/F2-04-Microsoft-Agent-Framework-Implementation-Checklist.md](../../docs/F2-04-Microsoft-Agent-Framework-Implementation-Checklist.md)
- Checklist de review recurrente: [../../docs/F2-04-Microsoft-Agent-Framework-Integration-Review-Checklist.md](../../docs/F2-04-Microsoft-Agent-Framework-Integration-Review-Checklist.md)

## Referencias

- Implementacion de referencia actual: [../langchain/README.md](../langchain/README.md)
- Documento de diseno: [../../docs/F2-04-Microsoft-Agent-Framework-Integration-Design.md](../../docs/F2-04-Microsoft-Agent-Framework-Integration-Design.md)
- Documentacion oficial: https://learn.microsoft.com/agent-framework/