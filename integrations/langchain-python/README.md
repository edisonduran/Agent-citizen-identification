# agent-did-langchain

Integracion funcional de Agent-DID para LangChain Python 1.2.x.

Esta variante complementa la integracion ya implementada en TypeScript/JavaScript y reutiliza el SDK Python real de Agent-DID como backend para snapshot de identidad, resolucion, verificacion, firma HTTP opt-in y rotacion controlada de claves.

## Estado

- Estado actual: `functional-mvp`
- Lenguaje objetivo: Python
- Dependencia previa resuelta: SDK Python de Agent-DID (F2-01)
- Relacion con roadmap: complemento Python de la integracion LangChain ya entregada en JS
- Implementacion: funcional para fases base, operaciones opt-in y readiness de CI

El paquete ya expone una factory publica, helpers de contexto, tools reutilizables, rotacion de claves opt-in y validacion de objetivos HTTP con rechazo por defecto de esquemas inseguros y destinos privados/loopback.

## Compatibilidad objetivo

- `agent-did-sdk >=0.1.0`
- `langchain >=1.2.13,<1.3`
- `langchain-core >=1.2.20,<1.3`
- Python 3.10+

## Instalacion

```bash
python -m pip install -e ../../sdk-python
python -m pip install -e .[dev]
```

## Uso rapido

```python
from agent_did_langchain import create_agent_did_langchain_integration
from agent_did_sdk import AgentIdentity, AgentIdentityConfig, CreateAgentParams
from langchain.agents import create_agent

identity = AgentIdentity(AgentIdentityConfig(signer_address="0x1234567890123456789012345678901234567890"))
runtime_identity = await identity.create(
    CreateAgentParams(
        name="research_assistant",
        core_model="gpt-4.1-mini",
        system_prompt="Eres un agente preciso y trazable.",
        capabilities=["research:web", "report:write"],
    )
)

integration = create_agent_did_langchain_integration(
    agent_identity=identity,
    runtime_identity=runtime_identity,
    expose={"sign_http": True},
)

agent = create_agent(
    model="openai:gpt-4.1-mini",
    tools=integration.tools,
    system_prompt=integration.compose_system_prompt("Usa herramientas cuando aporten evidencia verificable."),
)
```

## Hallazgos tecnicos confirmados

La documentacion publica actual de LangChain Python confirma al menos estas superficies utiles:

- `create_agent(...)` como factory principal para agentes.
- `tools` como mecanismo nativo para exponer funciones al agente.
- `system_prompt` y `messages` como puntos base para inyectar identidad y contexto.
- `agent.invoke(...)` como interfaz directa de ejecucion.
- runtime construido sobre LangGraph, con soporte de durabilidad, streaming, human-in-the-loop y persistence en el ecosistema.
- LangSmith como camino recomendado para tracing y observabilidad.

## Que agrega la integracion

- Snapshot estable de identidad Agent-DID sin secretos.
- Composicion de `system_prompt` con DID, controlador, capacidades y reglas operativas.
- Tools para identidad actual, resolucion DID y verificacion de firmas.
- Tools opt-in para firma HTTP, firma de payload, historial documental y rotacion de claves.

## Objetivo arquitectonico

Mantener en Python el enfoque ya validado en JS:

- inyectar DID, controlador, capacidades y metadata verificable en el contexto del agente,
- exponer herramientas Agent-DID para resolucion, verificacion y firma opt-in,
- mantener la clave privada fuera del prompt y del estado visible al modelo,
- ofrecer una API de integracion pequena y consistente entre lenguajes.

## API publica del MVP

```python
from agent_did_langchain import create_agent_did_langchain_integration

integration = create_agent_did_langchain_integration(
    agent_identity=agent_identity,
    runtime_identity=runtime_identity,
    expose={
        "verify_signatures": True,
        "sign_http": True,
        "rotate_keys": False,
    },
)
```

El objeto devuelto expone:

- `tools`
- `identity_snapshot`
- `get_current_identity()`
- `get_current_document()`
- `compose_system_prompt(base_prompt, additional_context=None)`

## Checklist operativo

La ejecucion del scaffold a paquete funcional esta desglosada en [../../docs/F1-03-LangChain-Python-Implementation-Checklist.md](../../docs/F1-03-LangChain-Python-Implementation-Checklist.md).

El plan tecnico cerrado por archivos, versiones objetivo y criterios de aceptacion esta en [../../docs/F1-03-LangChain-Python-Technical-Plan.md](../../docs/F1-03-LangChain-Python-Technical-Plan.md).

## Componentes principales

- `pyproject.toml`: metadata del paquete Python.
- `src/agent_did_langchain/__init__.py`: factory principal y exports publicos.
- `src/agent_did_langchain/config.py`: configuracion y defaults de exposicion.
- `src/agent_did_langchain/snapshot.py`: snapshot serializable de identidad.
- `src/agent_did_langchain/context.py`: composicion de prompt/contexto.
- `src/agent_did_langchain/tools.py`: herramientas Agent-DID para LangChain Python.
- `src/agent_did_langchain/integration.py`: ensamblaje publico del adaptador.
- `tests/`: pruebas funcionales y de seguridad.
- `examples/agent_did_langchain_example.py`: quick start runnable.

## Criterios de implementacion

1. Exponer DID actual, resolucion documental y verificacion de firmas mediante tools.
2. Permitir firma HTTP solo con opt-in explicito.
3. Mantener rotacion de claves deshabilitada por defecto y fuera de este MVP.
4. Inyectar identidad Agent-DID en el contexto del agente sin exponer secretos.
5. Incluir ejemplo runnable y pruebas automatizadas en Python.

## Seguridad operativa

- `sign_http` solo existe con opt-in.
- `sign_payload` solo existe con opt-in.
- `rotate_keys` solo existe con opt-in.
- Los secretos nunca se devuelven en outputs de tools.
- La firma HTTP rechaza por defecto `file://`, URLs con credenciales embebidas y destinos `localhost` o redes privadas.
- Si el caso de uso requiere firmar hacia targets internos controlados, puede habilitarse `allow_private_network_targets=True` en la factory.

## Validacion local recomendada

```bash
cd ../..
npm run langchain-python:install-dev
npm run lint:langchain-python
npm run typecheck:langchain-python
npm run test:langchain-python
```

## Referencias

- Integracion JS funcional: [../langchain/README.md](../langchain/README.md)
- Documento de diseno: [../../docs/F1-03-LangChain-Python-Integration-Design.md](../../docs/F1-03-LangChain-Python-Integration-Design.md)
- Documentacion oficial: https://docs.langchain.com/oss/python/langchain/overview