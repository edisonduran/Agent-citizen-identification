# agent-did-crewai

Integracion funcional de Agent-DID para CrewAI Python.

Esta variante reutiliza el SDK Python real de Agent-DID para snapshot de identidad, resolucion, verificacion, firma opt-in y callbacks/guardrails ligeros orientados al runtime de CrewAI.

## Estado

- Estado actual: `functional`
- Roadmap: F2-05
- Lenguaje objetivo: Python
- Dependencia previa resuelta: SDK Python de Agent-DID
- Implementacion: funcional para tools base, callbacks, guardrails, outputs estructurados y hooks de integracion

El paquete ya expone una factory publica, tools reutilizables, callbacks de trazabilidad, guardrails ligeros y helpers explicitos para `Agent`, `Task` y `Crew`. Mantiene defaults seguros: firma HTTP, firma arbitraria, rotacion de claves e historial documental siguen siendo operaciones opt-in.

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

## Compatibilidad objetivo

- `agent-did-sdk >=0.1.0`
- Python 3.10+
- CrewAI host runtime opcional; el paquete expone herramientas compatibles sin forzar dependencia dura para tests locales del repo

## Uso rapido

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

El bundle devuelto incluye:

- `tools`: wrappers compatibles con el patrón de tools del host
- `get_current_identity()` y `get_current_document()`
- `compose_system_prompt(...)`
- `create_agent_kwargs(...)` para inyectar backstory y tools en `Agent`
- `create_task_kwargs(...)` para inyectar callback, guardrail, `output_pydantic` y tools en `Task`
- `create_crew_kwargs(...)` para inyectar `step_callback` y `task_callback` en `Crew`
- `create_output_model(...)` y `create_identity_output_model(...)` para contratos `output_pydantic`

## Hooks de integracion

El paquete ahora tambien expone helpers ligeros para conectar la identidad a callbacks y validaciones de salida:

- `create_step_callback(integration, sink=None)`
- `create_task_callback(integration, sink=None)`
- `create_identity_output_guardrail(integration, required_fields=None)`

Estos helpers no exponen secretos por defecto: redaccionan `payload`, `body`, `signature` y claves privadas si aparecen en callbacks, y el guardrail rechaza outputs con esos campos sensibles.

## Defaults seguros

- `current_identity`, `resolve_did` y `verify_signatures` quedan habilitados por defecto.
- `sign_http`, `sign_payload`, `rotate_keys` y `document_history` permanecen deshabilitados por defecto.
- `sign_http` rechaza esquemas no HTTP(S), credenciales embebidas y targets privados/loopback salvo opt-in explicito con `allow_private_network_targets=True`.
- La rotacion de clave actualiza el estado compartido de la integracion y las tools, evitando snapshots obsoletos despues de una rotacion.
- Callbacks y guardrails no propagan secretos crudos por defecto.

## Componentes previstos

- `pyproject.toml`: metadata del paquete Python.
- `src/agent_did_crewai/__init__.py`: factory principal y estado del paquete.
- `src/agent_did_crewai/config.py`: configuracion publica.
- `src/agent_did_crewai/context.py`: helpers de prompt y contexto.
- `src/agent_did_crewai/integration.py`: bundle principal del adaptador.
- `src/agent_did_crewai/structured_outputs.py`: contratos `output_pydantic` para `Task`.
- `src/agent_did_crewai/sanitization.py`: redaccion de callbacks y deteccion de campos sensibles.
- `src/agent_did_crewai/snapshot.py`: snapshot de identidad.
- `src/agent_did_crewai/tools.py`: herramientas Agent-DID para CrewAI.
- `src/agent_did_crewai/callbacks.py`: step/task callbacks para trazabilidad.
- `src/agent_did_crewai/guardrails.py`: validaciones de salida basadas en DID y firma.
- `tests/`: pruebas automatizadas funcionales.
- `examples/agent_did_crewai_mvp_example.py`: ejemplo runnable del bundle.

## Criterios de implementacion

1. Herramientas CrewAI para DID actual, resolucion documental y verificacion de firmas.
2. Firma HTTP con opt-in explicito.
3. Integracion con callbacks, guardrails y outputs estructurados para auditar salidas y pasos relevantes.
4. Rotacion de claves y firma arbitraria deshabilitadas por defecto.
5. Helpers explicitos para `Agent`, `Task` y `Crew`.
6. Ejemplo runnable con wiring compatible con `Agent`, `Task` y `Crew`.
7. Suite automatizada de pruebas y build en Python.

## Validacion local

```bash
cd sdk-python
python -m pip install -e .[dev]
cd ../integrations/crewai
python -m pip install -e .[dev]
python -m build
python -m pytest tests/ -q
```

## Gobernanza de implementacion

- Checklist de implementacion: [../../docs/F2-05-CrewAI-Implementation-Checklist.md](../../docs/F2-05-CrewAI-Implementation-Checklist.md)
- Checklist de review recurrente: [../../docs/F2-05-CrewAI-Integration-Review-Checklist.md](../../docs/F2-05-CrewAI-Integration-Review-Checklist.md)

## Referencias

- Integracion funcional de referencia: [../langchain/README.md](../langchain/README.md)
- Documento de diseno: [../../docs/F2-05-CrewAI-Integration-Design.md](../../docs/F2-05-CrewAI-Integration-Design.md)
- Documentacion oficial: https://docs.crewai.com/