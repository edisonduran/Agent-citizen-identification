# agent-did-crewai

Scaffold de diseno para la futura integracion de Agent-DID con CrewAI.

Importante: CrewAI tiene una superficie publica claramente orientada a Python. Por eso este scaffold se plantea desde el inicio como integracion Python y depende del futuro SDK Python de Agent-DID.

## Estado

- Estado actual: `design-scaffold`
- Roadmap: F2-05
- Lenguaje objetivo: Python
- Dependencia bloqueante: SDK Python de Agent-DID
- Implementacion: pendiente

Este directorio no contiene una integracion funcional todavia. Fija la forma del paquete, el objetivo de seguridad y las superficies de CrewAI donde Agent-DID encaja mejor.

## Hallazgos tecnicos confirmados

La documentacion publica de CrewAI confirma superficies utiles para una integracion Agent-DID:

- `Agent` con `role`, `goal`, `backstory`, `tools`, `memory`, `step_callback`, `reasoning`, `knowledge_sources` y control de contexto.
- `Task` con `agent`, `tools`, `context`, `callback`, `guardrail`, `guardrails`, `output_json` y `output_pydantic`.
- `Crew` con `agents`, `tasks`, `process`, `memory`, `task_callback`, `step_callback`, `planning`, `output_log_file` y `stream`.
- `BaseTool` y decorator `tool` para herramientas custom sync y async.
- `kickoff()`, `kickoff_async()`, `akickoff()` y streaming para ejecucion.
- Logs, usage metrics y replay CLI para trazabilidad operativa.

## Objetivo

Integrar Agent-DID como capa de identidad verificable para agentes y crews de CrewAI, con foco en:

- exponer el DID actual y capacidades verificables del agente,
- firmar payloads o solicitudes HTTP mediante opt-in,
- verificar firmas y resolver documentos DID desde herramientas reutilizables,
- usar callbacks, guardrails y outputs estructurados para reforzar trazabilidad,
- mantener la clave privada fuera del prompt y del contexto visible al modelo.

## API conceptual propuesta

```python
from agent_did_crewai import create_agent_did_crewai_integration

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

La forma concreta dependera de como convenga mapear Agent-DID a:

- herramientas CrewAI (`BaseTool` o `@tool`),
- callbacks de agente y task,
- guardrails de salida,
- configuracion de `Agent`, `Task` y `Crew`,
- outputs estructurados y logs.

## Componentes previstos

- `pyproject.toml`: metadata del paquete Python.
- `src/agent_did_crewai/__init__.py`: factory principal y estado del scaffold.
- `src/agent_did_crewai/tools.py`: herramientas Agent-DID para CrewAI.
- `src/agent_did_crewai/callbacks.py`: step/task callbacks para trazabilidad.
- `src/agent_did_crewai/guardrails.py`: validaciones de salida basadas en DID y firma.
- `tests/`: pruebas una vez exista implementacion funcional.

## Criterios de implementacion

1. Herramientas CrewAI para DID actual, resolucion documental y verificacion de firmas.
2. Firma HTTP con opt-in explicito.
3. Integracion con callbacks o guardrails para auditar salidas y pasos relevantes.
4. Rotacion de claves y firma arbitraria deshabilitadas por defecto.
5. Ejemplo runnable con `Agent`, `Task` y `Crew`.
6. Suite automatizada de pruebas en Python.

## Referencias

- Integracion funcional de referencia: [../langchain/README.md](../langchain/README.md)
- Documento de diseno: [../../docs/F2-05-CrewAI-Integration-Design.md](../../docs/F2-05-CrewAI-Integration-Design.md)
- Documentacion oficial: https://docs.crewai.com/