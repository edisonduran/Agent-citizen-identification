# F2-05 - Diseno de Integracion con CrewAI

## Objetivo

Definir una integracion de Agent-DID para CrewAI orientada a Python, alineada con las superficies publicas del framework y dependiente del futuro SDK Python de Agent-DID.

## Estado actual

- Roadmap item: F2-05
- Estado: diseno y scaffold inicial
- Paquete base: [../integrations/crewai/README.md](../integrations/crewai/README.md)
- Referencia funcional existente: [../integrations/langchain/README.md](../integrations/langchain/README.md)
- Decision actual: implementar en Python una vez exista el SDK Python de Agent-DID

## Hallazgos de investigacion

La documentacion oficial de CrewAI confirma piezas relevantes para una integracion Agent-DID:

- `Agent` como unidad principal con memoria, tools, razonamiento, knowledge sources y callbacks por paso.
- `Task` con herramientas por tarea, contexto entre tareas, callbacks, guardrails y outputs estructurados.
- `Crew` con memoria compartida, callbacks de task/step, planning, streaming, usage metrics y output logs.
- `BaseTool` y `@tool` para herramientas custom sync y async.
- `kickoff()`, `kickoff_async()`, `akickoff()` y variantes por lote para ejecucion.
- replay CLI y logs para observabilidad y reproducibilidad.

## Principios de diseno

1. Implementacion Python-first.
2. Paridad conceptual con la integracion de LangChain donde sea posible.
3. Clave privada siempre encapsulada fuera del contexto del modelo.
4. Operaciones sensibles siempre bajo opt-in.
5. Integracion nativa con tools, callbacks, guardrails y outputs estructurados.

## Capacidades objetivo

- Exponer DID actual, controlador, capacidades y clave activa.
- Resolver documentos DID y verificar firmas desde tools reutilizables.
- Firmar payloads o solicitudes HTTP mediante herramientas opt-in.
- Adjuntar trazabilidad Agent-DID a callbacks de task o step.
- Reforzar outputs con guardrails o validaciones basadas en firma y estructura.

## Superficies de adaptacion esperadas

- `BaseTool` o `@tool` para operaciones Agent-DID.
- `step_callback` y `task_callback` para auditoria.
- `guardrail` y `guardrails` para validar salidas sensibles.
- `output_json` y `output_pydantic` para contratos de salida verificables.
- `memory`, `context` y `knowledge_sources` como puntos de enriquecimiento no secreto.

## API preliminar

```python
integration = create_agent_did_crewai_integration(
    agent_identity=agent_identity,
    runtime_identity=runtime_identity,
    expose={
        "sign_http": True,
        "verify_signatures": True,
        "sign_payload": False,
        "rotate_keys": False,
        "document_history": True,
    },
)
```

## Entregables esperados

1. Factory principal del adaptador.
2. Toolkit Agent-DID para CrewAI.
3. Integracion con callbacks para trazabilidad.
4. Guardrails opcionales para validar outputs y firmas.
5. Ejemplo runnable con `Agent`, `Task` y `Crew`.
6. Suite automatizada de pruebas Python.

## Riesgos tecnicos

- Dependencia del futuro SDK Python de Agent-DID.
- Diferencias entre tool-level integration y callback-level auditing.
- Riesgo de duplicar contexto sensible en memoria o logs si no se controla bien.
- Posible necesidad de separar integracion para `Agent.kickoff()` directa vs `Crew.kickoff()`.

## Recomendacion actual

La siguiente iteracion de F2-05 deberia comenzar cuando exista el SDK Python de Agent-DID. En ese momento conviene priorizar primero un toolkit de tools y callbacks, y despues agregar guardrails o envelopes de salida firmados.

## Criterio de cierre

F2-05 se considerara implementado cuando exista un paquete funcional bajo `integrations/crewai/`, con ejemplo ejecutable, pruebas automatizadas y documentacion de uso equivalente a la ya disponible en LangChain.