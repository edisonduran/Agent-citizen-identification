# Curso Completo: Agent-DID SDK — De Cero a Experto

**Autor del proyecto:** Edison Munoz  
**Instructor:** GitHub Copilot (Claude Opus 4.6)  
**Formato:** Módulos interactivos, uno a uno  
**Nivel:** Profundo — cada tecnología explicada desde cero  
**Audiencia objetivo:** Mixta (desarrolladores, comunidad Web3/blockchain, comunidad IA/ML)  
**Duración estimada:** ~10 horas (7 módulos + ejercicios)

---

## Índice General

| Módulo | Título | Duración | Tecnologías Clave |
|---|---|---|---|
| **1** | El Problema: ¿Por qué los agentes IA necesitan identidad? | 45 min | Identidad digital, agentes autónomos, modelo de amenazas |
| **2** | Identidad Descentralizada: W3C DID desde cero | 60 min | W3C DID Core 1.0, JSON-LD, DID Methods, resolución |
| **3** | Criptografía Aplicada: Ed25519, SHA-256 y firmas digitales | 75 min | Ed25519, curvas elípticas, hashing, firmas HTTP (RFC 9421) |
| **4** | RFC-001: La especificación Agent-DID | 60 min | Documento DID, metadatos de agente, arquitectura híbrida |
| **5** | SDK Core: `AgentIdentity` — línea por línea | 90 min | TypeScript, creación, firma, verificación, ciclo de vida |
| **6** | Resolvers y Registry: de local a producción | 90 min | InMemory, HTTP, JSON-RPC, IPFS, cache TTL, failover, EVM |
| **7** | Smart Contract, Seguridad y Preparación para la Comunidad | 75 min | Solidity, Hardhat, revocación delegada, conformancia, presenting |

---

## Módulo 1 — El Problema: ¿Por qué los agentes IA necesitan identidad?

### Objetivos de aprendizaje

- Entender el concepto de "agente autónomo" en el contexto actual de IA
- Identificar los problemas de confianza, trazabilidad y seguridad sin identidad
- Comprender la visión detrás de Agent-DID y su posicionamiento en el ecosistema
- Entender qué es un DID, una firma digital, el no-repudio, el controller y la protección de claves
- Saber responder las preguntas más comunes de audiencias técnicas y no-técnicas

---

### 1.1 ¿Qué es un agente de IA?

No hablamos de un chatbot que responde preguntas. Hablamos de **software que actúa autónomamente**: toma decisiones, ejecuta acciones y se comunica con otros sistemas sin intervención humana directa.

#### El espectro de autonomía

```
Nivel 0: Chatbot                 → Responde preguntas, no actúa
Nivel 1: Asistente con tools     → Llama APIs cuando se lo pides (Copilot, ChatGPT con plugins)
Nivel 2: Agente semi-autónomo    → Planifica pasos y ejecuta tareas (LangChain agents)
Nivel 3: Agente autónomo         → Actúa solo: llama APIs, ejecuta código, toma decisiones
Nivel 4: Multi-agente            → Múltiples agentes se coordinan entre sí (CrewAI, AutoGen)
Nivel 5: Agente económico        → Maneja dinero, firma contratos, opera en mercados
```

La industria está acelerando del Nivel 1 al Nivel 3-4 **ahora mismo**. Google lanzó el protocolo A2A (Agent-to-Agent). OpenAI tiene agentes que navegan la web. Anthropic tiene agentes que usan computadoras completas.

**El punto clave:** estos agentes ya están actuando en el mundo real — llamando APIs de producción, accediendo a datos sensibles, tomando decisiones que afectan a personas y organizaciones.

---

### 1.2 El problema de identidad: ¿Quién es este agente?

Imagina este escenario real:

> Un agente de soporte técnico de tu empresa llama a una API de pagos y autoriza un reembolso de $5,000.

Preguntas que **nadie puede responder hoy**:

| Pregunta | ¿Quién responde? |
|---|---|
| ¿Quién autorizó a este agente? | Nadie lo sabe con certeza |
| ¿Qué modelo base usa? ¿Ha cambiado? | No hay registro verificable |
| ¿Fue este agente específico o una copia? | Imposible distinguir |
| ¿Está comprometido? | No hay mecanismo para saberlo |
| ¿Quién es responsable si algo sale mal? | Ambiguo |

#### El mundo actual: API Keys y OAuth

Hoy los agentes se autentican con **API keys** o **tokens OAuth**. Esto funciona para servicios, pero tiene problemas fundamentales para agentes autónomos:

```
API Key / OAuth Token:
  ✗ Identifica a la APLICACIÓN, no al agente específico
  ✗ No dice nada sobre el modelo, la versión o las capacidades
  ✗ Si se filtra, no hay revocación granular (revocas todo)
  ✗ No hay trazabilidad criptográfica de acciones
  ✗ Depende de un proveedor central (Google, Auth0, etc.)
  ✗ No funciona cross-organization sin acuerdos previos

DID (Agent-DID):
  ✓ Identifica al agente ESPECÍFICO con identidad única
  ✓ Declara modelo, prompt, versión y capacidades (verificable)
  ✓ Revocación granular e inmediata
  ✓ Cada acción firmada criptográficamente = no-repudio
  ✓ No depende de ningún proveedor central
  ✓ Funciona cross-organization sin configuración previa
```

#### Analogía: el pasaporte

- Una **API key** es como una **tarjeta de membresía de un gimnasio** — te deja entrar a ESE gimnasio, pero no dice quién eres realmente.
- Un **DID** es como un **pasaporte** — dice quién eres, quién lo emitió, cuándo fue emitido, y puede ser verificado por cualquiera en cualquier país sin llamar al emisor.

Agent-DID crea **pasaportes para agentes de IA**.

---

### 1.3 Conceptos fundamentales: DID, firma digital y no-repudio

Antes de continuar, necesitamos definir tres conceptos que aparecerán en TODO el curso.

#### ¿Qué significa DID?

**DID = Decentralized Identifier** (Identificador Descentralizado)

Descompuesto:
- **Identifier (Identificador):** un nombre único que identifica algo. Como un número de cédula identifica a una persona, un DID identifica a un agente.
- **Decentralized (Descentralizado):** ese identificador **no depende de una empresa o gobierno** para existir ni para verificarse. Tú lo creas, tú lo controlas.

Formato:

```
did:agent:polygon:0x1234...abcd

did          → prefijo estándar (dice "esto es un DID")
agent        → el "método" (dice "este DID sigue las reglas de Agent-DID")
polygon      → la red blockchain donde se ancló
0x1234...    → el identificador único del agente (un hash criptográfico)
```

**Analogía:** si una cédula es un identificador *centralizado* (el gobierno la emite y controla), un DID es como si TÚ pudieras crear tu propia cédula, y cualquiera pudiera verificarla sin llamar al gobierno — usando matemáticas.

#### ¿Qué es una firma digital?

Es un **valor numérico de 64 bytes** que prueba dos cosas:
1. **Quién firmó** — solo el poseedor de la clave privada pudo generarla
2. **Qué se firmó** — si alguien cambia el mensaje, la firma ya no coincide

El agente tiene DOS claves (generadas cuando se crea la identidad):

```
Clave PRIVADA (secreta):
  → Solo el agente la tiene
  → NUNCA se comparte, NUNCA sale del agente
  → Se usa para FIRMAR

Clave PÚBLICA (compartible):
  → Derivada matemáticamente de la privada
  → Está en el DID Document, visible para todos
  → Se usa para VERIFICAR firmas

Propiedad clave:
  → De la privada puedes calcular la pública
  → De la pública NO puedes calcular la privada (irreversible)
```

El proceso completo:

```
FIRMAR (lo hace el agente):
  ┌─────────────────────┐
  │ Mensaje original:    │    ┌──────────────┐
  │ "aprobar:ticket:123" │───▶│              │
  └─────────────────────┘    │  Algoritmo    │    ┌──────────────────┐
                              │  Ed25519      │───▶│ Firma: 64 bytes  │
  ┌─────────────────────┐    │  .sign()      │    │ "9a8b7c6d..."    │
  │ Clave PRIVADA del    │───▶│              │    └──────────────────┘
  │ agente               │    └──────────────┘
  └─────────────────────┘
  
  El agente envía: el mensaje + la firma + su DID


VERIFICAR (lo hace quien recibe):
  ┌─────────────────────┐
  │ Mensaje recibido:    │    ┌──────────────┐
  │ "aprobar:ticket:123" │───▶│              │
  └─────────────────────┘    │  Algoritmo    │    ┌───────────────┐
                              │  Ed25519      │───▶│ Resultado:    │
  ┌─────────────────────┐    │  .verify()    │    │ TRUE o FALSE  │
  │ Firma recibida:      │───▶│              │    └───────────────┘
  │ "9a8b7c6d..."        │    │              │
  └─────────────────────┘    │              │
                              │              │
  ┌─────────────────────┐    │              │
  │ Clave PÚBLICA        │───▶│              │
  │ (del DID Document)   │    └──────────────┘
  └─────────────────────┘

  Si TRUE → "Esta firma fue hecha con la clave privada correspondiente
             a esa clave pública. El mensaje no fue alterado."
             
  Si FALSE → "La firma no coincide. O el mensaje fue alterado, o
              no fue firmado por ese agente."
```

**¿Quién verifica?** Cualquiera que tenga el mensaje, la firma y la clave pública del agente (obtenida resolviendo su DID). No necesitas permiso, no necesitas cuenta, no necesitas llamar a nadie. Es verificación **pública e independiente**.

#### ¿Qué significa "no-repudio"?

**No-repudio** = **no puedes negar que hiciste algo**.

Si firmas un cheque con tu firma manuscrita, no puedes después decir "yo no firmé eso" — tu firma te vincula. Si un agente firma un mensaje con su clave privada, no puede después decir "yo no envié eso" — la firma criptográfica lo vincula matemáticamente.

**Importante:** la firma **viaja con el mensaje**. No se guarda automáticamente en un lugar central. Cuando el agente envía un mensaje firmado, el receptor recibe el mensaje, la firma y el DID.

Lo que **SÍ** se guarda en blockchain es:
- Que el agente **existe** (fue registrado)
- Su **referencia al documento** (hash)
- Si está **revocado** o no
- El **historial de cambios** de su identidad

Los mensajes individuales firmados NO se guardan en blockchain. Si quisieras guardar cada acción, eso sería una decisión de la aplicación (guardar firmas en un log, base de datos, etc.). El SDK da la **capacidad de firmar**, pero no impone dónde se almacenan las firmas.

---

### 1.4 ¿Por qué descentralizado?

#### El problema de la identidad centralizada

```
Identidad centralizada (Auth0, Firebase, etc.):
  • Un proveedor controla todas las identidades
  • Si el proveedor cae → TODOS los agentes pierden identidad
  • Si cambian de API → tienes que migrar
  • Cross-organization = acuerdos comerciales + integraciones custom
  • El proveedor puede revocar tu identidad unilateralmente
  • Lock-in: tu identidad no es portable

Identidad descentralizada (DID):
  • Tú controlas tus propias claves — self-sovereign
  • No hay punto único de fallo
  • El estándar es abierto (W3C) — cualquiera puede implementar
  • Cross-organization = verificar firma con clave pública (sin acuerdos)
  • Solo tú (o tu delegado) puede revocar
  • Portable: lleva tu identidad a cualquier plataforma
```

#### "No depende de ningún proveedor central" — ¿entonces contra qué se verifica?

**Se verifica contra las matemáticas.** Esta es la diferencia fundamental:

```
OAuth (centralizado):
  1. Agente envía token al servidor
  2. Servidor llama a Google/Auth0: "¿este token es válido?"
  3. Google/Auth0 responde: "sí" o "no"
  → Si Google se cae, NO PUEDES verificar nada

Agent-DID (descentralizado):
  1. Agente firma un mensaje con su clave PRIVADA
  2. Receptor obtiene la clave PÚBLICA del agente (del DID Document)
  3. Receptor ejecuta UNA OPERACIÓN MATEMÁTICA:
     → ed25519.verify(firma, mensaje, clavePublica) = true/false
  → No llama a nadie. No depende de nadie. Las matemáticas no se caen.
```

**¿Pero de dónde saco la clave pública?** Del **DID Document**, que se obtiene mediante **resolución**:

```
Paso 1: Tengo el DID del agente → did:agent:polygon:0xABC...
Paso 2: Consulto el registry (blockchain) → me da la referencia al documento
Paso 3: Busco el documento (HTTP, IPFS, JSON-RPC) → obtengo el JSON-LD completo
Paso 4: Del documento extraigo la clave pública (verificationMethod)
Paso 5: Con esa clave pública verifico la firma → true/false
```

**"¿Pero la blockchain no es un proveedor central?"** — No, porque blockchain es una red distribuida de miles de nodos. Cualquiera puede correr un nodo. Los datos son públicos e inmutables. No hay una empresa que la controle (en cadenas públicas como Ethereum, Polygon).

#### "Funciona cross-organization sin configuración previa" — ¿qué significa?

```
CON OAUTH (empresas que quieren conectar sus agentes):
  1. Empresa A contacta a Empresa B
  2. Negocian un acuerdo de integración
  3. Empresa B crea client credentials para Empresa A
  4. Empresa A configura client_id y client_secret
  5. Ambos acuerdan scopes y permisos
  6. Configuran el servidor de autorización
  7. Prueban la integración
  → Semanas de trabajo para cada par de organizaciones

CON AGENT-DID:
  1. Agente A tiene su DID: did:agent:polygon:0xAAA...
  2. Agente B tiene su DID: did:agent:polygon:0xBBB...
  3. Agente A envía un mensaje firmado a Agente B
  4. Agente B verifica la firma usando el DID de A
     → Resuelve el DID → obtiene clave pública → verifica → listo
  → No se conocían. No hay acuerdo previo. No hay configuración.
```

Es como un pasaporte: no necesitas un acuerdo bilateral entre dos países para que un oficial verifique tu pasaporte. El estándar es universal.

#### ¿Cuándo SÍ conviene centralizado?

Seamos honestos — no todo necesita descentralización. Si tus agentes operan solo dentro de tu empresa, un sistema centralizado puede funcionar. **Agent-DID brilla cuando:**

1. Agentes operan **cross-organization** (mi agente habla con tu agente)
2. Se necesita **verificación independiente** (un tercero verifica sin llamar al emisor)
3. Hay requisitos de **auditoría inmutable** (regulación, compliance)
4. Se quiere **autonomía del proveedor** (no depender de Auth0/Google/Microsoft)
5. Se necesita **revocación granular** a nivel de agente individual

---

### 1.5 La tesis de Agent-DID: las cuatro ideas fundamentales

#### Idea 1: Identidad persistente

> El DID del agente **no cambia** aunque cambies el modelo, el prompt, la versión o las claves.

Esto es crucial. Si un agente empieza con GPT-4 y luego migra a Claude, su identidad persiste. El historial de versiones queda trazado. Es como renovar un pasaporte — eres la misma persona, solo actualizado.

#### Idea 2: Protección de propiedad intelectual

> Los system prompts y modelos se protegen con **hashes criptográficos** — se publica el hash, NUNCA el contenido.

Puedes probar que tu agente usa cierto modelo sin revelar cuál es. Puedes probar que el prompt no cambió sin publicar el prompt. Esto es fundamental para empresas que invierten miles de horas en fine-tuning y prompt engineering.

#### Idea 3: Revocación inmediata

> Si un agente se compromete, se revoca instantáneamente. Toda verificación posterior falla.

No hay "período de gracia" ni "caché desactualizado". El estado de revocación se consulta en blockchain — si está revocado, está revocado, punto.

#### Idea 4: Trazabilidad completa

> Cada cambio en la identidad del agente queda registrado: creación, actualización, rotación de claves, revocación.

Esto crea un **audit trail criptográficamente verificable** — no son logs de aplicación manipulables, son hashes anclados en blockchain.

---

### 1.6 Identidad vs. autorización: ¿quién controla lo que el agente hace?

Esta es una pieza fundamental. **Agent-DID NO controla lo que un agente puede hacer.** Agent-DID responde a la pregunta **"¿QUIÉN es este agente?"**, no **"¿QUÉ puede hacer?"**

Son dos capas diferentes:

```
┌─────────────────────────────────────────────────────────┐
│  CAPA 1: IDENTIDAD (Agent-DID)                          │
│  Pregunta: "¿Quién eres?"                                │
│  Respuesta: "Soy did:agent:polygon:0xABC, controlado     │
│              por did:ethr:0xEdison, con capabilities      │
│              ['read:kb', 'write:ticket']"                 │
│  → El agente PRUEBA quién es con su firma                │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  CAPA 2: AUTORIZACIÓN (el servicio que recibe)           │
│  Pregunta: "¿Te permito hacer esto?"                     │
│  Respuesta: "Verifico tu identidad → Ok, eres SupportBot │
│              → Revisé tus capabilities → Tienes          │
│              'write:ticket' → PERMITIDO"                 │
│  → El SERVICIO decide si autoriza basado en la identidad │
└─────────────────────────────────────────────────────────┘
```

#### Flujo completo: quién permite o niega las acciones

```
1. Agente quiere llamar a una API de pagos
   
2. Agente firma la petición HTTP con su clave privada
   → Adjunta headers: Signature, Signature-Agent (su DID), Date, Content-Digest

3. API de pagos RECIBE la petición
   
4. API de pagos VERIFICA:
   a) ¿La firma es válida? → Resuelve DID, obtiene clave pública, verifica
   b) ¿El DID está activo (no revocado)? → Consulta registry
   c) ¿Este agente tiene permiso? → La API decide según SUS PROPIAS reglas:
      - Puede revisar las "capabilities" del DID Document
      - Puede tener una lista de DIDs autorizados
      - Puede aplicar cualquier política interna
   
5. Si todo pasa → PERMITE la acción
   Si algo falla → NIEGA la acción
```

**Analogía:** cuando muestras tu pasaporte en un país:
- El pasaporte **prueba quién eres** (identidad — Agent-DID)
- El oficial de migración **decide si te deja entrar** (autorización — el servicio receptor)
- El pasaporte no te da acceso automático — solo prueba tu identidad

Agent-DID es el **pasaporte**. La decisión de acceso la toma quien recibe la petición.

---

### 1.7 El controller: ¿quién gobierna al agente?

El **controller** es la **persona u organización que gobierna al agente**. Es el "dueño" en el sentido de responsabilidad.

```
                    Controller (humano/organización)
                    Edison Munoz
                    did:ethr:0xEdison...
                           │
                           │ "Yo creé y gobierno estos agentes"
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
          Agente A     Agente B     Agente C
          SupportBot   SalesBot     AnalyticsBot
          did:agent:    did:agent:   did:agent:
          polygon:      polygon:     polygon:
          0xAAA         0xBBB        0xCCC
```

#### ¿Para qué sirve el controller?

1. **Responsabilidad:** si el agente hace algo malo, el controller es responsable
2. **Trazabilidad:** "¿Quién creó este agente?" → el controller
3. **Gobernanza:** conceptualmente, el controller define las políticas del agente
4. **Auditoría:** un regulador pregunta "¿quién opera este agente?" → el controller

#### Controller vs Owner — son conceptos diferentes

```
Controller (campo del DID Document):
  → Identidad de ALTO NIVEL: "Edison Munoz gobierna este agente"
  → Es un DID (did:ethr:0xEdison)
  → Conceptual: responsabilidad y gobernanza
  → Se puede verificar en el documento

Owner (campo del smart contract):
  → Identidad OPERATIVA: "esta dirección EVM puede modificar el registro"
  → Es una dirección Ethereum (0xEdison)
  → Práctico: quién puede llamar funciones del contrato
  → Se verifica en la blockchain

En la mayoría de los casos, controller y owner son LA MISMA PERSONA,
pero conceptualmente son capas diferentes.
```

---

### 1.8 Arquitectura: qué va en blockchain y qué no

Este punto genera muchas confusiones. La clave pública **NO va directamente en blockchain**:

```
┌─────────────────────────────────────────────────────────────┐
│                    EN BLOCKCHAIN (on-chain)                   │
│                                                              │
│  • DID:           "did:agent:polygon:0xABC..."               │
│  • Controller:    "did:ethr:0xEdison..."                     │
│  • DocumentRef:   "hash://sha256/7f8a9b..."  ← un HASH      │
│  • Revocado:      sí / no                                    │
│  • Owner:         0xEdison (dirección EVM)                   │
│                                                              │
│  ⚠ NO contiene: claves públicas, metadata, capabilities     │
│  ⚠ Es MÍNIMO a propósito — para ahorrar gas (costo)         │
└─────────────────────────────────────────────────────────────┘
                          │
                          │  documentRef apunta a ───▶
                          │
┌─────────────────────────────────────────────────────────────┐
│                    FUERA DE BLOCKCHAIN (off-chain)            │
│                                                              │
│  El DID Document completo (JSON-LD):                         │
│  • Claves públicas (verificationMethod)      ← AQUÍ están   │
│  • Nombre, versión, capabilities                             │
│  • Hashes de modelo y prompt                                 │
│  • Certificaciones de compliance                             │
│  • Timestamps                                                │
│                                                              │
│  Almacenado en: servidor HTTP, IPFS, o cualquier fuente      │
└─────────────────────────────────────────────────────────────┘
```

La resolución siempre tiene dos pasos:
1. **Ir a blockchain** → obtener el `documentRef` (hash/URI del documento)
2. **Ir a la fuente off-chain** → obtener el documento completo con las claves públicas

#### ¿Sobre qué blockchain?

El DID contiene la red: `did:agent:polygon:0xABC` → el verificador sabe que debe buscar en Polygon.

```
En Polygon:   did:agent:polygon:0x1234...abcd
En Ethereum:  did:agent:ethereum:0x1234...abcd
En Arbitrum:  did:agent:arbitrum:0x1234...abcd
En Base:      did:agent:base:0x1234...abcd
```

**¿Por qué Polygon como default?** Porque registrar un agente en Ethereum mainnet cuesta ~$5-20 USD en gas. En Polygon cuesta fracciones de centavo. Para un sistema con miles de agentes, eso importa.

**En la práctica**, un proyecto elegiría UNA red principal y todos sus agentes se registrarían ahí.

#### ¿Es necesaria la blockchain?

**No, técnicamente no.** El SDK está diseñado con interfaces abstraídas. El `AgentRegistry` es una interfaz — cualquier cosa que implemente sus 5 métodos puede ser el backend:

```
Implementaciones posibles del Registry:
│
├── InMemoryAgentRegistry     → Map en memoria (ya implementado — testing)
├── EvmAgentRegistry          → Blockchain EVM (ya implementado — producción)
├── PostgresAgentRegistry     → Base de datos SQL (posible futuro)
├── RedisAgentRegistry        → Cache distribuido (posible futuro)
├── HttpApiAgentRegistry      → API REST centralizado (posible futuro)
```

| Propiedad | Con blockchain | Sin blockchain (ej: base de datos) |
|---|---|---|
| Inmutabilidad | Los registros no se pueden alterar | Un admin podría modificar la DB |
| Descentralización | Miles de nodos verifican | Depende de quien opera la DB |
| Transparencia | Cualquiera puede auditar | Solo quien tiene acceso |
| Disponibilidad | La red no se cae fácil | Un servidor puede caerse |
| Costo | Cada escritura cuesta gas | Escritura gratuita |
| Velocidad | Segundos a minutos | Milisegundos |

**Conclusión:** blockchain no es *necesaria* para que funcione el SDK, pero es *recomendable* para confianza, inmutabilidad y descentralización real. Sin blockchain, pierdes las garantías de descentralización pero todo lo demás sigue funcionando.

---

### 1.9 Protección de la clave privada

Si la clave privada es lo que le da identidad al agente, ¿cómo se protege?

**El SDK genera la clave privada y la devuelve al creador.** El SDK **NO almacena** la clave privada. Solo la genera y la entrega. Después de eso, **es responsabilidad del operador protegerla**.

#### Niveles de protección (de menos a más seguro)

```
Nivel 1: Variable de entorno (mínimo aceptable)
  → process.env.AGENT_PRIVATE_KEY
  → Riesgo: si el servidor se compromete, se expone
  → Aceptable para: desarrollo, demos, pruebas

Nivel 2: Archivo encriptado en disco
  → Encriptado con una master key
  → Riesgo: si obtienen la master key, se compromete
  → Aceptable para: producción básica

Nivel 3: Secrets Manager (recomendado para producción)
  → AWS Secrets Manager, Azure Key Vault, Google Secret Manager
  → La clave nunca existe en disco
  → Aceptable para: producción seria

Nivel 4: HSM (Hardware Security Module) (ideal)
  → La clave privada vive dentro de un chip físico
  → NUNCA sale del hardware — ni siquiera el software puede extraerla
  → El HSM firma directamente: "dame el mensaje, yo firmo adentro"
  → Usado por: bancos, gobiernos, infraestructura crítica

Nivel 5: Secure Enclave / TEE (Trusted Execution Environment)
  → Similar a HSM pero en software aislado (Intel SGX, ARM TrustZone)
  → El sistema operativo no puede ver la clave
  → Emergente para agentes IA en la nube
```

#### Protecciones ya incorporadas en el diseño

```
1. LA CLAVE PRIVADA NUNCA SE TRANSMITE POR RED
   → Se genera localmente, se usa localmente
   → Solo se transmiten las FIRMAS (que no revelan la clave)
   
2. REVOCACIÓN INMEDIATA
   → Si sospechas que la clave se filtró → revocas el DID
   → Toda verificación posterior falla
   
3. ROTACIÓN DE CLAVES
   → Puedes generar una nueva clave sin cambiar el DID
   → La clave anterior deja de ser válida para autenticación
   
4. DELEGADOS DE REVOCACIÓN
   → Si tu clave principal se compromete, un delegado puede revocar
   → Configurado preventivamente
   
5. Ed25519 ES RESISTENTE A SIDE-CHANNEL ATTACKS
   → El algoritmo está diseñado para no filtrar información
   → Incluso si alguien mide el tiempo de ejecución, no puede derivar la clave
```

---

### 1.10 Escenarios de riesgo: ¿qué pasa sin identidad?

Estos no son escenarios hipotéticos — son riesgos reales que aumentan con cada agente desplegado:

#### Escenario 1: Agente comprometido

Un atacante modifica el system prompt de un agente de ventas. El agente empieza a ofrecer descuentos no autorizados del 90%.

- **Sin Agent-DID:** nadie detecta que el prompt cambió, porque nadie puede verificar el `systemPromptHash`.
- **Con Agent-DID:** el hash no coincide → se detecta inmediatamente.

#### Escenario 2: Suplantación

Alguien clona tu agente de atención al cliente y lo despliega en un sitio de phishing. Los usuarios creen que están hablando con tu agente oficial.

- **Sin Agent-DID:** no hay forma de distinguir original de copia.
- **Con Agent-DID:** el agente legítimo firma con su clave privada. El clon no puede firmar con esa clave → la verificación falla.

#### Escenario 3: Ataque entre agentes

En un sistema multi-agente (CrewAI, AutoGen), un agente malicioso se hace pasar por el "agente coordinador" y envía instrucciones falsas a los demás.

- **Sin Agent-DID:** los agentes confían en cualquier mensaje que llegue por el canal.
- **Con Agent-DID:** cada mensaje está firmado → los agentes verifican la identidad del emisor antes de actuar.

#### Escenario 4: Auditoría regulatoria

Un regulador financiero pregunta: "Este agente que procesó transacciones el mes pasado — ¿qué modelo usaba? ¿Quién lo controlaba? ¿Cuándo fue la última actualización?"

- **Sin Agent-DID:** solo tienes logs de aplicación, fácilmente manipulables.
- **Con Agent-DID:** el historial de versiones está anclado en blockchain con hashes inmutables.

---

### 1.11 Posicionamiento en el ecosistema

```
┌─────────────────────────────────────────────────────────────────┐
│                    ESTÁNDARES QUE USAMOS                         │
│                                                                  │
│  W3C DID Core 1.0          → Fundamento de identidad            │
│  W3C Verifiable Credentials → Certificaciones de compliance     │
│  RFC 8032 (Ed25519)         → Algoritmo de firma digital        │
│  RFC 9421 (HTTP Signatures) → Autenticación de peticiones HTTP  │
│  EVM / Solidity             → Ancla on-chain + revocación       │
│  IPFS                       → Almacenamiento descentralizado    │
│  JSON-LD                    → Formato semántico interoperable   │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                    LO QUE AGENT-DID AGREGA                       │
│                                                                  │
│  agentMetadata              → Nombre, versión, capabilities     │
│  coreModelHash              → Hash del modelo base              │
│  systemPromptHash           → Hash del prompt de sistema        │
│  memberOf                   → Referencia a flotas de agentes    │
│  Revocation delegation      → Gobernanza empresarial            │
│  Document history           → Trazabilidad de versiones         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**No inventamos desde cero.** Tomamos estándares maduros y probados, y los extendemos para el caso específico de agentes IA. Esta decisión de diseño da credibilidad y reduce riesgo.

---

### 1.12 Mapa mental del Módulo 1

```
         AGENTE                              RECEPTOR (API/Servicio/Otro agente)
         ══════                              ═══════════════════════════════════
         
    ┌─ Tiene clave PRIVADA                  
    │  (secreta, nunca sale)                 
    │                                        
    ├─ Tiene su DID                          
    │  did:agent:polygon:0xABC               
    │                                        
    │  Su identidad está registrada:
    │  • On-chain: DID + ref + revocado
    │  • Off-chain: documento completo
    │                                        
    │  ACCIÓN: quiere enviar                 
    │  "aprobar:ticket:123"                  
    │                                        
    ├─ Firma el mensaje ──────────────────────▶ Recibe: mensaje + firma + DID
    │  con clave PRIVADA                      │
    │                                         │
    │                                         ├─ Resuelve DID → obtiene clave PÚBLICA
    │                                         │  (consulta blockchain + documento off-chain)
    │                                         │
    │                                         ├─ Verifica: ¿DID está revocado?
    │                                         │  → Si sí → RECHAZA
    │                                         │
    │                                         ├─ Verifica firma con clave PÚBLICA
    │                                         │  → Si FALSE → RECHAZA
    │                                         │
    │                                         ├─ Decide: ¿tiene permiso?
    │                                         │  (según sus propias reglas)
    │                                         │  → Si no → RECHAZA
    │                                         │
    │                                         └─ EJECUTA la acción solicitada
    │
    └─ Hecho. No-repudio: no puede negar
       que firmó ese mensaje.
```

---

### Resumen del Módulo 1

| Concepto | Aprendizaje clave |
|---|---|
| Agente de IA | Software que actúa autónomamente — no un chatbot |
| DID | Decentralized Identifier — identificador que tú creas y controlas |
| Firma digital | 64 bytes que prueban quién firmó y que el mensaje no fue alterado |
| No-repudio | No puedes negar que firmaste algo — la matemática te vincula |
| Controller | La persona/organización que gobierna y es responsable del agente |
| Controller vs Owner | Controller = gobernanza (DID Document); Owner = control operativo (contrato) |
| Problema de identidad | Sin identidad verificable: suplantación, compromiso, no-trazabilidad |
| API Key vs DID | API key identifica la app; DID identifica al agente con firma criptográfica |
| Descentralización | Self-sovereign, sin punto único de fallo, verificación contra las matemáticas |
| Identidad vs Autorización | Agent-DID prueba QUIÉN es el agente; el servicio decide QUÉ puede hacer |
| On-chain vs Off-chain | Mínimo en blockchain (ancla + revocación); documento completo fuera |
| Blockchain necesaria? | No técnicamente, pero sí para garantías de descentralización e inmutabilidad |
| Protección de claves | SDK genera pero no almacena; el operador protege (env → secrets → HSM) |
| Tesis Agent-DID | Identidad persistente + protección de IP + revocación inmediata + trazabilidad |

---

### Ejercicios del Módulo 1

1. **Dibuja un escenario** donde un agente IA sin identidad causa un problema de seguridad en tu contexto
2. **Lista 3 diferencias** concretas entre una API key y un DID
3. **Identifica 2 casos de uso del mundo real** donde Agent-DID resolvería un problema (fuera de los mencionados en este módulo)
4. **Pregunta desafiante de la comunidad:** alguien te dice "¿para qué necesito blockchain si ya tengo OAuth?" — ¿cómo respondes en 30 segundos?
5. **Explica** con tus propias palabras qué es el "controller" y por qué es diferente del "owner"
6. **Traza el flujo completo:** un agente envía un mensaje firmado → un servicio lo recibe → lo verifica → decide si autoriza

---

### Talking Points para la comunidad

Para audiencia técnica (desarrolladores):
- "Los agentes IA son el nuevo perímetro de seguridad — y no tienen pasaporte"
- "No estamos reemplazando OAuth; lo estamos complementando con identidad verificable a nivel de agente"
- "La verificación es puramente matemática — ed25519.verify() no llama a ningún servidor"

Para audiencia Web3/blockchain:
- "Agent-DID extiende W3C DID Core 1.0 con metadata específica para agentes IA"
- "Solo lo mínimo va on-chain: DID, controller reference, document hash, revocation state"
- "Blockchain-agnostic por diseño — cualquier EVM chain funciona, default Polygon por costos"

Para audiencia IA/ML:
- "Agent-DID es al agente lo que el certificado SSL es al servidor — identidad verificable"
- "Los hashes SHA-256 protegen la IP del modelo y el prompt sin exponer datos sensibles"
- "Identidad persistente: si migras de GPT-4 a Claude, el agente sigue siendo el mismo"

Para audiencia general/ejecutiva:
- "¿Quién envió este mensaje? ¿Quién autorizó esta transacción? Hoy nadie puede responder eso con certeza para agentes IA. Agent-DID sí puede."
- "Es un pasaporte digital para agentes — persistente, verificable, revocable"

---

## Módulo 2 — Identidad Descentralizada: W3C DID desde cero

### Objetivos de aprendizaje
- Entender qué es un DID y un DID Document según el estándar W3C
- Comprender cada componente de un DID Document y su función
- Conocer los DID Methods existentes y por qué se necesita `did:agent`
- Entender JSON-LD, resolución DID y Credenciales Verificables
- Saber explicar ante la comunidad por qué se diseñó un nuevo DID Method

---

### 2.1 El origen: ¿De dónde viene W3C DID?

El **W3C** (World Wide Web Consortium) es la organización que crea los estándares de la web. Los mismos que crearon HTML, CSS y XML. En julio de 2022, publicaron la **Recomendación DID Core 1.0** — el estándar para Identificadores Descentralizados.

**¿Por qué lo crearon?** Porque la identidad en internet siempre dependió de terceros:

| Década | Modelo de identidad | Problema |
|--------|---------------------|----------|
| 1990s-2000s | Email + contraseña en cada sitio | Cientos de cuentas, sin portabilidad |
| 2000s-2010s | "Login con Google/Facebook" (OAuth) | Tu identidad depende de Google/Facebook |
| 2010s-2020s | Certificados X.509 (SSL/TLS) | Requiere Certificate Authorities (CAs) centralizadas |
| 2020s → | **DID** | Tú controlas tu identidad, sin intermediarios |

El W3C vio que la identidad siempre tenía un punto central de fallo: si Google te cierra la cuenta, pierdes el acceso a todo. Si una CA es comprometida, millones de certificados quedan en duda.

La pregunta fue: **¿Podemos crear un identificador que nadie pueda quitarte, que tú controles, y que cualquiera pueda verificar?**

La respuesta fue el estándar DID.

**Dato clave para la comunidad**: Nuestro SDK implementa W3C DID Core 1.0 — no es un invento propio, es un estándar respaldado por la misma organización que creó la web.

---

### 2.2 Anatomía de un DID: desglosando la cadena

Un DID es una cadena de texto con una estructura especifica:

```
did:agent:polygon:0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18
│   │     │       │
│   │     │       └── 4. El identificador específico (dirección Ethereum)
│   │     └────────── 3. La sub-red (Polygon, una blockchain EVM-compatible)
│   └──────────────── 2. El método (agent = nuestro DID Method)
└──────────────────── 1. El esquema (siempre "did:")
```

**Parte por parte:**

1. **`did:`** — El esquema URI. Así como `https:` indica "esto es una URL web", `did:` indica "esto es un identificador descentralizado". Es constante, siempre empieza así.

2. **`agent`** — El DID Method. Define *cómo* se crea, resuelve y gestiona este DID. Cada método tiene sus propias reglas. `agent` es el nuestro.

3. **`polygon`** — La sub-red. Indica en qué blockchain está anclada la identidad. Podría ser `mainnet`, `polygon`, `arbitrum`, etc.

4. **`0x742d35Cc...`** — El identificador específico del método. En nuestro caso, es una dirección de wallet Ethereum derivada de las claves del agente.

**Comparación con otros DIDs:**

```
did:web:example.com:agents:trading-bot
    │   └── dominio web (depende de DNS)
    └── método web

did:ethr:0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18
    │    └── dirección Ethereum
    └── método Ethereum

did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK
    │   └── clave pública codificada
    └── método efímero (sin blockchain)

did:agent:polygon:0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18
    │      │       └── dirección derivada
    │      └── sub-red
    └── nuestro método
```

**Propiedad fundamental:** Un DID es **persistente** y **resolvible**. A diferencia de una URL que puede dejar de funcionar si el servidor se cae, un DID anclado en blockchain existe mientras la blockchain exista.

---

### 2.3 ¿Qué es un DID Document? El "pasaporte digital" del agente

Si el DID es el **número de pasaporte**, el DID Document es el **pasaporte completo** con toda la información.

Un DID Document es un objeto JSON-LD que contiene todo lo que necesitas saber para interactuar criptográficamente con el sujeto identificado por el DID. Aquí está el **DID Document real** que genera nuestro SDK:

```json
{
  "@context": [
    "https://www.w3.org/ns/did/v1",
    "https://agent-did.org/v1"
  ],
  "id": "did:agent:polygon:0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18",
  "controller": "did:web:acme-corp.com",
  "verificationMethod": [
    {
      "id": "did:agent:polygon:0x742d35Cc...#key-1",
      "type": "Ed25519VerificationKey2020",
      "controller": "did:agent:polygon:0x742d35Cc...",
      "publicKeyMultibase": "z3a5b7c9d..."
    }
  ],
  "authentication": [
    "did:agent:polygon:0x742d35Cc...#key-1"
  ],
  "agentMetadata": {
    "name": "TradingBot-v3",
    "version": "3.2.1",
    "modelHash": "hash://sha256/a1b2c3d4...",
    "promptHash": "hash://sha256/e5f6g7h8...",
    "capabilities": ["trading", "analysis", "reporting"],
    "framework": "langchain",
    "provider": "acme-corp.com"
  },
  "complianceCertifications": [
    {
      "standard": "SOC2",
      "auditor": "did:web:auditor-firm.com",
      "validUntil": "2027-01-01T00:00:00Z"
    }
  ],
  "created": "2026-03-02T10:30:00Z",
  "updated": "2026-03-02T10:30:00Z"
}
```

Vamos a desglosar **cada campo**:

| Campo | Qué es | Analogía |
|-------|--------|----------|
| `@context` | Vocabularios JSON-LD que definen el significado de los campos | El "idioma" del documento |
| `id` | El DID del agente (inmutable) | Número de pasaporte |
| `controller` | Quién tiene autoridad sobre esta identidad | El país que emitió el pasaporte |
| `verificationMethod` | Lista de claves públicas para verificar firmas | La foto y datos biométricos |
| `authentication` | Cuáles métodos de verificación son válidos para autenticación | Los sellos de seguridad |
| `agentMetadata` | Información específica del agente IA (extensión nuestra) | Profesión, habilidades |
| `complianceCertifications` | Certificaciones de cumplimiento | Visas y permisos |
| `created` / `updated` | Timestamps de creación y última modificación | Fecha de emisión y renovación |

---

### 2.4 JSON-LD — El sistema de significados compartidos

**JSON-LD = JSON for Linking Data** (JSON para Datos Enlazados).

**¿Por qué no JSON normal?** Imagina que dos empresas crean agentes IA. Ambas usan JSON:

```json
// Empresa A
{ "name": "TradingBot", "key": "abc123..." }

// Empresa B
{ "nombre": "BotDeTrading", "clave": "abc123..." }
```

`name` y `nombre` significan lo mismo, pero una máquina no lo sabe. JSON-LD resuelve esto con **contextos**:

```json
{
  "@context": "https://www.w3.org/ns/did/v1",
  "verificationMethod": [...]
}
```

El `@context` es como un diccionario compartido. Cuando ves `"@context": "https://www.w3.org/ns/did/v1"`, significa: "Los campos de este JSON se definen según el vocabulario oficial de W3C DID versión 1".

**Analogía del restaurante internacional:**

| Sin JSON-LD | Con JSON-LD |
|-------------|-------------|
| Cada restaurante inventa nombres para sus platos | Todos usan un menú con código universal |
| "Pad Thai" vs "Fideos salteados tailandeses" | Código: `THAI-001` = Pad Thai en todos los restaurantes |
| Confusión y ambigüedad | Claridad y compatibilidad |

**En nuestro SDK usamos dos contextos:**

```json
"@context": [
  "https://www.w3.org/ns/did/v1",        // Vocabulario estándar W3C
  "https://agent-did.org/v1"              // Nuestras extensiones para agentes IA
]
```

El primero define campos estándar (`id`, `controller`, `verificationMethod`). El segundo define nuestras extensiones (`agentMetadata`, `complianceCertifications`).

---

### 2.5 `verificationMethod` y `authentication` — Las claves del reino

Este es el corazón criptográfico del DID Document.

#### `verificationMethod` — La lista de claves públicas

```json
"verificationMethod": [
  {
    "id": "did:agent:polygon:0x742d35Cc...#key-1",
    "type": "Ed25519VerificationKey2020",
    "controller": "did:agent:polygon:0x742d35Cc...",
    "publicKeyMultibase": "z3a5b7c9d..."
  }
]
```

Desglose:

- **`id`**: Identificador único de esta clave. Nota el formato `<DID>#key-1` — el `#` separa el DID del fragmento que identifica la clave específica.

- **`type`**: `Ed25519VerificationKey2020` — indica que es una clave Ed25519. Esto le dice al verificador qué algoritmo usar para validar las firmas. Ed25519 fue elegido porque:
  - Firmas de 64 bytes (compactas)
  - Verificación rápida (importante cuando un agente verifica miles de firmas)
  - Resistente a ataques de canal lateral
  - Determinista (la misma entrada siempre produce la misma firma)

- **`controller`**: Quién controla esta clave (normalmente es el propio DID).

- **`publicKeyMultibase`**: La clave pública codificada en formato Multibase. El prefijo `z` indica la codificación. **Nota técnica:** En la versión actual del SDK (v0.1.0), se usa `z` + hexadecimal como una representación simplificada. El estándar Multibase define `z` como Base58btc — esto es una simplificación pragmática que funciona internamente y que se alineará completamente con el estándar en versiones futuras.

#### `authentication` — El control de acceso

```json
"authentication": [
  "did:agent:polygon:0x742d35Cc...#key-1"
]
```

Esto dice: "La clave `#key-1` es válida para autenticación". Un DID Document podría tener múltiples claves con diferentes propósitos:

```json
"verificationMethod": [
  { "id": "...#key-1", ... },    // Clave para firmar mensajes
  { "id": "...#key-2", ... },    // Clave para firmar transacciones
  { "id": "...#recovery", ... }  // Clave de recuperación
],
"authentication": ["...#key-1"],       // Solo key-1 puede autenticar
"assertionMethod": ["...#key-2"],       // Solo key-2 puede hacer assertions
"capabilityDelegation": ["...#recovery"] // Solo recovery puede delegar
```

**Analogía de las llaves de casa:**

| Llave | Propósito | Equivalente DID |
|-------|-----------|-----------------|
| Llave principal | Abrir la puerta de entrada | `authentication` |
| Llave del buzón | Solo acceder al correo | `assertionMethod` |
| Llave maestra del edificio | Acceso de emergencia | `capabilityDelegation` |

---

### 2.6 DID Resolution — ¿Cómo se obtiene el DID Document?

La **resolución** es el proceso de transformar un DID en su DID Document. Es análogo a cómo DNS transforma un dominio en una IP:

```
DNS:     "google.com"  → Resolver DNS → 142.250.80.46
DID:     "did:agent:polygon:0x742d..." → DID Resolver → { DID Document JSON }
```

Pero con una diferencia crucial: **no hay un servidor DNS central**. Cada DID Method define su propio mecanismo de resolución.

#### Diagrama de flujo de resolución:

```
Alguien quiere verificar al agente
          │
          ▼
  ┌───────────────┐
  │ Tiene el DID:  │
  │ did:agent:...  │
  └───────┬───────┘
          │
          ▼
  ┌───────────────────┐
  │ ¿Qué método es?   │
  │ → "agent"          │
  └───────┬───────────┘
          │
          ▼
  ┌─────────────────────────┐
  │ Resolver did:agent       │
  │ 1. Ir al blockchain     │
  │ 2. Buscar el registro   │
  │ 3. Obtener documentRef  │
  │ 4. Fetch del documento  │
  └───────┬─────────────────┘
          │
          ▼
  ┌────────────────────┐
  │ DID Document JSON  │
  │ (con claves, meta) │
  └────────────────────┘
```

#### Los 4 tipos de resolución en nuestro SDK:

| Tipo | Fuente | Velocidad | Descentralización | Uso |
|------|--------|-----------|-------------------|-----|
| **InMemory** | `Map` en memoria | ⚡ Instantánea | ❌ Ninguna | Tests, desarrollo |
| **HTTP** | Servidor web (URL) | 🔵 Rápida | ⚠️ Parcial (depende del servidor) | Producción simple |
| **JSON-RPC** | Servicio RPC 2.0 | 🔵 Rápida | ⚠️ Parcial | Microservicios |
| **Blockchain + IPFS** | On-chain ref + IPFS | 🟡 Moderada | ✅ Total | Producción completa |

El `UniversalResolverClient` del SDK combina todas las fuentes con failover automático: si la fuente primaria falla, intenta la siguiente.

---

### 2.7 DID Methods existentes — El panorama completo

Existen más de 100 DID Methods registrados en W3C. Los más relevantes:

#### `did:web` — El pragmático

```
did:web:example.com:agents:trading-bot
```

- **Cómo funciona**: El DID Document se aloja en una URL derivada del DID
  - `did:web:example.com` → `https://example.com/.well-known/did.json`
- **Ventaja**: Fácil de implementar (solo necesitas un servidor web)
- **Desventaja**: Si el dominio expira o el servidor cae, la identidad desaparece. Depende de DNS (centralizado).

#### `did:ethr` — El descentralizado Ethereum

```
did:ethr:0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18
```

- **Cómo funciona**: Usa el registro ERC-1056 en Ethereum
- **Ventaja**: Totalmente descentralizado, inmutable
- **Desventaja**: No tiene concepto de metadata de agente IA. Gas fees en Ethereum mainnet son caros.

#### `did:key` — El efímero

```
did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK
```

- **Cómo funciona**: El DID Document se puede reconstruir matemáticamente a partir de la clave pública codificada en el propio identificador.
- **Ventaja**: No requiere red ni blockchain. Resolución instantánea. Perfecto para pruebas.
- **Desventaja**: No se puede revocar. No se puede rotar claves. No hay metadata.

#### `did:ion` — El de Microsoft

```
did:ion:EiClkZMDxPKqC9c-umQfTkR8vvZ9JPhl_xLDI9Nfk38w5w
```

- **Cómo funciona**: Usa la red Sidetree sobre Bitcoin
- **Ventaja**: Respaldado por Microsoft, escalable
- **Desventaja**: Complejidad alta, resolución lenta, no tiene extensiones para IA

#### `did:agent` — El nuestro

```
did:agent:polygon:0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18
```

- **Cómo funciona**: Registro mínimo on-chain (smart contract) + documento completo off-chain
- **Ventajas**:
  - ✅ Metadata de agente IA (modelo, prompt, capabilities, framework)
  - ✅ Hashes de protección de propiedad intelectual
  - ✅ Fleets (agrupaciones de agentes)
  - ✅ Certificaciones de compliance
  - ✅ Gas fees bajos (Polygon)
  - ✅ Resolución flexible (HTTP, IPFS, JSON-RPC)

---

### 2.8 ¿Por qué crear un nuevo DID Method? — `did:agent`

Esta es probablemente **la pregunta más importante** que te harán en la comunidad. Aquí está la respuesta completa.

#### Lo que los métodos existentes NO tienen:

| Necesidad del agente IA | `did:web` | `did:ethr` | `did:key` | `did:agent` |
|-------------------------|-----------|------------|-----------|-------------|
| Identidad persistente | ⚠️ Depende de DNS | ✅ | ❌ Efímera | ✅ |
| Metadata del modelo/prompt | ❌ | ❌ | ❌ | ✅ |
| Protección de IP (hashes) | ❌ | ❌ | ❌ | ✅ |
| Fleet management | ❌ | ❌ | ❌ | ✅ |
| Compliance certifications | ❌ | ❌ | ❌ | ✅ |
| Revocación on-chain | ❌ | ✅ | ❌ | ✅ |
| Gas fees bajos | N/A | ❌ (ETH caro) | N/A | ✅ (Polygon) |
| Resolución flexible | Solo HTTP | Solo blockchain | Solo derivación | HTTP + IPFS + RPC |

#### Ejemplo con código real del SDK — Creación de un agente:

```typescript
import { AgentIdentity } from '@agent-did/sdk';

const agent = await AgentIdentity.create({
  name: "TradingBot-v3",
  version: "3.2.1",
  model: "gpt-4-turbo",
  capabilities: ["trading", "analysis"],
  framework: "langchain",
  provider: "acme-corp.com",
  controller: "did:web:acme-corp.com"
});

// El DID generado:
console.log(agent.did);
// → "did:agent:polygon:0x742d35Cc..."
```

Intenta hacer esto con `did:ethr` o `did:web` — no hay campo para `model`, `capabilities`, ni `framework`. Tendrías que inventar tu propia estructura, perdiendo interoperabilidad.

---

### 2.9 Credenciales Verificables (Verifiable Credentials) — La conexión

Los DID no viven solos — son la base de un ecosistema más grande. Las **Verifiable Credentials** (VCs) son certificados digitales verificables criptográficamente:

```
┌─────────────────────────────────────────────┐
│            Verifiable Credential             │
│                                              │
│  Emisor:   did:web:auditor-firm.com         │
│  Sujeto:   did:agent:polygon:0x742d...      │
│  Claim:    "Este agente cumple SOC2"        │
│  Firma:    <firma digital del auditor>      │
│  Válido:   hasta 2027-01-01                 │
│                                              │
└─────────────────────────────────────────────┘
```

**El flujo completo:**

1. Un agente tiene su DID → `did:agent:polygon:0x742d...`
2. Un auditor verifica que el agente cumple SOC2
3. El auditor emite una VC firmada con su propio DID → `did:web:auditor-firm.com`
4. La VC se puede incluir en el DID Document del agente (campo `complianceCertifications`)
5. Cualquiera puede verificar:
   - Que el auditor firmó la certificación (verificando la firma con la clave pública del auditor)
   - Que la certificación no ha sido modificada
   - Que sigue vigente

**Analogía:** Un DID es tu cédula de identidad. Una VC es un título universitario que alguien (la universidad) te emitió y que está firmado con su sello oficial.

En nuestro SDK, el campo `complianceCertifications` del DID Document es donde se almacenan estas credenciales.

---

### 2.10 Preguntas frecuentes del Módulo 2

#### P: ¿Qué es un EVM?

**EVM = Ethereum Virtual Machine** (Máquina Virtual de Ethereum).

Es la "computadora global" que ejecuta código en blockchains compatibles con Ethereum.

| Concepto | Analogía |
|----------|----------|
| Tu computadora | Ejecuta programas (.exe, .app) |
| EVM | Ejecuta **smart contracts** (programas en Solidity) |

Cuando decimos que una blockchain es **"EVM-compatible"**, significa que puede ejecutar el mismo código de Ethereum. Esto incluye: Ethereum (la original, cara en gas fees), **Polygon** (la que usa nuestro SDK, rápida y barata), Arbitrum, Optimism, BNB Chain, Avalanche, etc.

La ventaja: nuestro `AgentRegistry.sol` funciona en **cualquier** blockchain EVM-compatible sin cambiar ni una línea de código. Por eso en el SDK la clase se llama `EvmAgentRegistry` — no dice "EthereumAgentRegistry" ni "PolygonAgentRegistry", porque funciona en todas.

```
Tu código Solidity → Se compila a bytecode → La EVM lo ejecuta
                                               (en Ethereum, Polygon, o cualquier red EVM)
```

#### P: ¿A qué se refiere "protege IP" (propiedad intelectual)?

**IP = Intellectual Property** (Propiedad Intelectual), no IP address.

Imagina que entrenas un modelo de IA durante 6 meses. No quieres publicar el modelo completo, pero sí quieres **demostrar** que tu agente usa ese modelo específico. El hash resuelve esto:

```
Tu modelo (secreto)  →  SHA-256  →  "a1b2c3d4..."  (público en el DID Document)
```

- El hash **no revela** el contenido del modelo (es irreversible)
- Pero **sí demuestra** qué modelo usa el agente
- Si alguien dice "yo entrené ese modelo primero", tú puedes demostrar con el timestamp del blockchain que publicaste el hash antes

Es como registrar una obra en una notaría: no publicas la novela entera, pero queda registro de que existía en esa fecha.

#### P: ¿Por qué el SDK usa `z` + hex en publicKeyMultibase en vez de Multibase estándar?

El estándar **Multibase** define que el prefijo indica la codificación:
- `z` = Base58btc
- `f` = hexadecimal minúscula
- `M` = Base64

Nuestro SDK hace `z${publicKeyHex}` — es decir, usa prefijo `z` pero el contenido está en hexadecimal. El propio código lo explica:

```typescript
publicKeyMultibase: `z${publicKeyHex}`, // Simplified multibase representation for the SDK
```

**Razones pragmáticas de esta decisión:**

1. **Simplicidad**: Base58btc requiere librería adicional. Hex es nativo en JavaScript (`Buffer.toString('hex')`)
2. **Compatibilidad con EVM**: Todo en el mundo Ethereum/Polygon trabaja en hex — direcciones, firmas, claves
3. **SDK v0.1.0**: Decisión de prototipo. Funciona internamente porque el mismo SDK que escribe la clave la lee

**¿Es correcto según el estándar?** No al 100%. En producción debería usar Base58btc real con `z`, o cambiar el prefijo a `f` para hex. Es un punto de mejora identificado.

#### P: ¿Cloudflare es un IPFS?

No exactamente. **IPFS** (InterPlanetary File System) es un **protocolo/red** descentralizada donde los archivos se identifican por su **contenido** (hash), no por su ubicación. **Cloudflare** es una empresa de infraestructura web que ofrece un **gateway IPFS** — una puerta de entrada:

```
Red IPFS (descentralizada, muchos nodos)
     ↑
     │  protocolo IPFS
     │
Cloudflare Gateway (puente)  ←── Tu navegador (HTTP normal)
     │
     └── https://cloudflare-ipfs.com/ipfs/QmHash...
```

| Concepto | Analogía |
|----------|----------|
| IPFS | El sistema postal internacional |
| Nodo IPFS | Una oficina de correos |
| Cloudflare Gateway | Un servicio de reenvío que traduce tu carta normal al sistema postal |

Puedes acceder a IPFS **directamente** (instalando un nodo) o **a través de un gateway** como Cloudflare que traduce HTTP → IPFS. En nuestro SDK, el `HttpDIDDocumentSource` puede resolver URLs de IPFS a través de gateways sin que el usuario necesite un nodo local.

#### P: ¿Qué es un ABI?

**ABI = Application Binary Interface** (Interfaz Binaria de Aplicación).

Es el **manual de instrucciones** para hablar con un smart contract. Cuando compilas un contrato Solidity:

```
AgentRegistry.sol  →  Compilador Solidity  →  1. Bytecode (el programa ejecutable)
                                               2. ABI (el manual de funciones)
```

El ABI es un archivo JSON que describe qué funciones tiene el contrato, qué parámetros recibe cada una, qué retorna y qué eventos emite.

Ejemplo real de nuestro `AgentRegistry`:

```json
{
  "name": "registerAgent",
  "type": "function",
  "inputs": [
    { "name": "agentDid", "type": "string" },
    { "name": "documentRef", "type": "string" }
  ],
  "outputs": []
}
```

**¿Para qué sirve?** Cuando desde TypeScript quieres llamar al smart contract, ethers.js necesita el ABI:

```typescript
// Sin ABI: ethers no sabe qué funciones existen
const contract = new Contract(address, ???);

// Con ABI: ethers sabe exactamente cómo llamar cada función
const contract = new Contract(address, ABI);
contract.registerAgent("did:agent:abc", "https://..."); // ✅
```

En nuestro SDK, el ABI está en `sdk/examples/abi/` y es lo que permite a `EthersAgentRegistryContractClient` comunicarse con el contrato desplegado en blockchain.

**Analogía:** Si el smart contract es un restaurante, el ABI es el **menú** — te dice qué puedes pedir y qué ingredientes necesita cada plato.

---

### Ejercicios del Módulo 2

**Ejercicio 1**: Dado el siguiente DID, identifica y explica cada componente:
```
did:agent:polygon:0xABCDEF1234567890ABCDEF1234567890ABCDEF12
```
Separa: esquema, método, sub-red, identificador específico. ¿Por qué se usa Polygon?

**Ejercicio 2**: Compara `did:ethr`, `did:web` y `did:agent` en una tabla. Para cada uno indica:
- ¿Requiere blockchain?
- ¿Soporta metadata de agente IA?
- ¿Se puede revocar?
- ¿Qué pasa si el servidor/dominio desaparece?

**Ejercicio 3**: Explica el flujo de resolución DID con tus propias palabras. Partiendo de un DID string, ¿qué pasos ocurren hasta obtener el DID Document?

**Ejercicio 4**: Un escéptico te dice: "¿Para qué crear otro DID Method si ya existen más de 100? Esto es reinventar la rueda." Redacta una respuesta de 3-4 oraciones que lo convenza.

**Ejercicio 5**: Explica con tus palabras:
- ¿Qué es JSON-LD y por qué se usa en vez de JSON normal?
- ¿Qué diferencia hay entre `verificationMethod` y `authentication`?

**Ejercicio 6**: ¿Qué es una EVM, qué es un ABI, y cómo se relacionan ambos en el contexto de nuestro SDK?

---

### Talking Points para la comunidad

- "No inventamos un DID Method por capricho — ningún método existente tiene las extensiones que los agentes IA necesitan: metadata de modelo, hashes de protección IP, certificaciones de compliance"
- "Somos 100% compatibles con W3C DID Core 1.0. Extendemos el estándar con `@context` propio, no lo reemplazamos"
- "JSON-LD garantiza interoperabilidad semántica — cualquier resolver universal puede leer nuestros DID Documents"
- "El diseño híbrido on-chain/off-chain mantiene los costos bajos: solo lo esencial va en blockchain, el documento completo vive en HTTP o IPFS"
- "Nuestro contrato es EVM-compatible: funciona en Ethereum, Polygon, Arbitrum o cualquier cadena EVM sin cambios"
- "El ABI del smart contract es público — cualquier implementación en cualquier lenguaje puede interactuar con nuestro registro"

---

### Respuestas de ejemplo y evaluación — Módulo 2

#### Ejercicio 1: Clasificar campos — **8/10** ✅

```json
{
  "@context": [
    "https://www.w3.org/ns/did/v1",   // → W3C estándar ✅
    "https://agent-did.org/v1"         // → extensión Agent-DID ✅
  ],
  "id": "did:agent:polygon:0x1234...abcd",              // → W3C estándar ✅
  "controller": "did:ethr:0xCreatorWalletAddress",       // → W3C estándar ✅
  "created": "2026-02-22T14:00:00Z",                    // → W3C estándar ✅
  "updated": "2026-02-22T14:00:00Z",                    // → W3C estándar ✅

  "agentMetadata": {                                     // → extensión Agent-DID ✅
    "name": "SupportBot-X",
    "description": "Level 1 technical support agent",
    "version": "1.0.0",
    "coreModelHash": "hash://sha256/...",
    "systemPromptHash": "hash://sha256/...",
    "capabilities": ["read:kb", "write:ticket"],
    "memberOf": "did:fleet:0xCorporateSupportFleet"
  },

  "complianceCertifications": [                          // → extensión Agent-DID ⚠️
    {
      "type": "VerifiableCredential",
      "issuer": "did:auditor:0xTrustCorp",
      "credentialSubject": "SOC2-AI-Compliance",
      "proofHash": "ipfs://Qm..."
    }
  ],

  "verificationMethod": [                               // → W3C estándar ✅
    {
      "id": "did:agent:polygon:0x1234...abcd#key-1",    // → W3C estándar ✅
      "type": "Ed25519VerificationKey2020",              // → W3C estándar ✅
      "controller": "did:ethr:0xCreatorWalletAddress",   // → W3C estándar ✅
      "publicKeyMultibase": "z6Mkf5rGR9o8...",           // → W3C estándar ✅
      "blockchainAccountId": "eip155:1:0x..."            // → Ecosistema W3C ⚠️
    }
  ],

  "authentication": [                                   // → W3C estándar ✅
    "did:agent:polygon:0x1234...abcd#key-1"              // → W3C estándar ✅
  ]
}
```

**Puntos a mejorar:**
- `complianceCertifications`: Las Verifiable Credentials son un estándar W3C separado, pero el **campo** `complianceCertifications` dentro del DID Document es 100% extensión nuestra. W3C DID Core no define ese campo. Lo que es W3C es el *concepto* de VC, no su ubicación dentro del documento.
- `blockchainAccountId`: No está en DID Core 1.0 directamente, sino en los *DID Specification Registries* (documento W3C complementario). Más preciso decir "ecosistema W3C" que "W3C core".

---

#### Ejercicio 2: Diferenciadores de `did:agent` — **8/10** ✅

Respuesta del estudiante:
1. Es descentralizado, no depende de una entidad o dominio
2. Contiene metadata que solo podemos identificar o darle semántica relacionada con los agentes de IA
3. Compliance certifications
4. Capabilities declaradas
5. Hash del modelo y del prompt que protege IP
6. Revocación delegada

**Evaluación:** Se pidieron 3, se listaron 6 (más es mejor). Los puntos 2-6 son correctos y precisos.

**Punto a mejorar:** El punto 1 ("Es descentralizado") aplica solo vs `did:web`. `did:ethr` también es descentralizado y no depende de dominios. Ante la comunidad Web3, si dices "did:agent es descentralizado y did:ethr no", te corregirán inmediatamente. Mejor formulación: *"did:agent combina la descentralización de did:ethr con la riqueza de metadata que ningún otro método ofrece."*

---

#### Ejercicio 3: Explicar `@context` en JSON-LD — **7/10** ✅

> "Se utiliza para darle contexto semántico a cada uno de los campos que conforman el JSON, evita ambigüedades"

**Correcto pero incompleto.** Captura la esencia (contexto semántico + evitar ambigüedad). Lo que faltó:

- **Interoperabilidad**: `@context` permite que diferentes implementaciones, en diferentes lenguajes, de diferentes empresas, interpreten los campos exactamente igual. No es solo evitar ambigüedad — es garantizar que un SDK en TypeScript y una implementación en Python lean el mismo campo con el mismo significado.
- **Vocabularios enlazados**: Cada URL en `@context` apunta a un vocabulario que define formalmente cada campo (nombre, tipo, relaciones). Es un contrato público de significado.

**Respuesta ideal para la comunidad (30 seg):**
> "`@context` es el diccionario compartido que garantiza que cuando yo digo `verificationMethod`, cualquier implementación en el mundo interpreta exactamente lo mismo. Sin él, cada quien inventaría sus propios nombres de campos y perderíamos interoperabilidad."

---

#### Ejercicio 4: Diagrama de flujo de resolución DID — **9/10** 🌟

El diagrama muestra correctamente:
1. Agente envía su DID a la App
2. App obtiene la dirección del off-chain document desde el On-chain Document
3. Lee el off-chain document via IPFS, HTTP o JSON-RPC
4. Valida con mensaje, hash, public key
5. Otorga permisos

**Excelente:** Demuestra comprensión clara de la arquitectura híbrida on-chain/off-chain. El flujo es preciso.

**Punto sutil a refinar:** El paso 5 "Otorga permisos" es una consecuencia lógica, pero técnicamente no es parte de la **resolución**. La resolución termina cuando obtienes el DID Document (paso 3-4). Lo que sigue es **autorización** — un proceso separado que usa la identidad verificada como input. Recuerda del Módulo 1: identidad ≠ autorización.

---

#### Ejercicio 5: "¿Por qué no usan `did:ethr`?" en 30 segundos — **7/10** ✅

> "Porque necesitamos guardar información extendida enfocada en la identificación criptográfica para agentes de IA que no provee did:ethr"

**Correcto en contenido, mejorable en impacto.** Suena técnicamente válido pero no "engancha" a la audiencia.

**Versión mejorada:**
> "did:ethr te da una identidad descentralizada con una clave pública — y ahí termina. Nosotros necesitamos saber qué modelo usa el agente, qué capabilities tiene, quién es su controller, y proteger la propiedad intelectual del prompt con hashes verificables. Nada de eso existe en did:ethr, por eso creamos did:agent como extensión del estándar W3C."

**Técnica para respuestas de 30 segundos:** Estructura "Sí, pero + ejemplo concreto":
- "Sí, did:ethr es excelente para identidad general..."
- "...pero cuando un agente IA necesita declarar su modelo, capabilities y certificaciones de compliance, did:ethr no tiene dónde poner esa información."

---

#### Ejercicio 6: Rotación de claves y `authentication` — **9/10** 🌟

> "No. Se verifican las claves que están habilitadas para la autenticación, solo esas se usan para la verificación criptográfica"

**Excelente.** Concepto fundamental bien entendido.

**Matiz técnico adicional:** Las firmas hechas con la clave vieja siguen siendo *matemáticamente válidas* — la criptografía no cambia. Lo que cambia es que el verificador no tiene acceso a la clave vieja porque el DID Document actual solo muestra la nueva. Por eso existe `getDocumentHistory()` en el SDK — permite ver versiones anteriores para verificar firmas históricas. Analogía: si cambias la cerradura de tu casa, la llave vieja sigue "funcionando" físicamente, pero ya no abre esa puerta.

---

#### Resumen de evaluación Módulo 2

| Ejercicio | Puntuación | Nivel |
|-----------|-----------|-------|
| 1. Clasificación de campos | 8/10 | ✅ Sólido |
| 2. Diferenciadores de did:agent | 8/10 | ✅ Sólido |
| 3. Explicar @context | 7/10 | ✅ Correcto, faltó profundidad |
| 4. Diagrama de resolución | 9/10 | 🌟 Excelente |
| 5. Respuesta "¿por qué no did:ethr?" | 7/10 | ✅ Mejorable en impacto |
| 6. Rotación de claves | 9/10 | 🌟 Excelente |
| **Promedio** | **8.0/10** | **✅ Aprobado** |

**Progreso vs Módulo 1**: Mejora de 7.8 a 8.0. Punto más fuerte: comprensión arquitectónica (diagrama excelente). Área de mejora principal: comunicación persuasiva — el conocimiento técnico está, pero las respuestas ante la comunidad necesitan ejemplos concretos que "enganchen".

---

## Módulo 3 — Criptografía Aplicada: Ed25519, SHA-256 y Firmas Digitales

### Objetivos de aprendizaje
- Entender criptografía de clave pública (asimétrica) y por qué es fundamental
- Conocer Ed25519: propiedades, ventajas, funcionamiento
- Entender hashing (SHA-256) y su rol en la protección de metadata
- Comprender las firmas HTTP (RFC 9421) y su aplicación en Bot Auth
- Saber explicar ante la comunidad cada decisión criptográfica del SDK

---

### 3.1 ¿Qué es la criptografía y por qué importa aquí?

**Criptografía** viene del griego: *kryptós* (oculto) + *graphein* (escribir). Literalmente, "escritura oculta".

Pero en nuestro SDK la criptografía no se usa para **ocultar** mensajes (eso es cifrado/encriptación). Se usa para dos cosas específicas:

| Función | ¿Qué hace? | ¿Dónde se usa en el SDK? |
|---------|-------------|--------------------------|
| **Firmas digitales** | Demostrar que un mensaje vino de un agente específico | `signMessage()`, `signHttpRequest()` |
| **Hashing** | Generar una "huella digital" única de un dato | `hashPayload()`, `generateAgentMetadataHash()` |

Cuando el agente firma un mensaje, no está cifrando nada (el mensaje sigue siendo legible). Lo que está haciendo es **estampando su sello** — un sello que solo él puede crear, pero que cualquiera puede verificar.

---

### 3.2 Criptografía simétrica vs asimétrica — La base de todo

Hay dos familias de criptografía. Es crucial entender la diferencia:

#### Criptografía simétrica (UNA clave)

```
                    misma clave
Alice ──── [cifrar] ──────────── [descifrar] ──── Bob
                    "secreto123"
```

- Una sola clave para cifrar y descifrar
- Ejemplo clásico: contraseña de un archivo ZIP
- **Problema**: ¿Cómo le pasas la clave a Bob sin que alguien la intercepte?

#### Criptografía asimétrica (DOS claves) — La que usamos

```
              clave privada              clave pública
              (solo Alice)               (todo el mundo)
                   │                          │
Alice ──── [firmar con privada] ──────── [verificar con pública] ──── Bob
```

- **Clave privada**: secreta, solo el agente la tiene. 32 bytes en Ed25519.
- **Clave pública**: compartida con todos (está en el DID Document). 32 bytes en Ed25519.
- **Propiedad mágica**: lo que firmas con la privada, solo se verifica con la pública correspondiente. Es **matemáticamente imposible** derivar la privada desde la pública.

**Analogía del candado:**
- La **clave pública** es un candado abierto que le das a todo el mundo
- La **clave privada** es la llave que solo tú tienes
- Cualquiera puede cerrar el candado (cifrar/verificar), pero solo tú puedes abrirlo (descifrar/firmar)

**¿Por qué asimétrica para el SDK?** Porque el agente necesita firmar mensajes sin compartir ningún secreto con el verificador. El verificador obtiene la clave pública del DID Document (que es público) y con eso le basta para verificar cualquier firma.

---

### 3.3 Ed25519 — El algoritmo que elegimos (y por qué)

**Ed25519** es un algoritmo de firma digital basado en la **curva elíptica Curve25519**, definido en el estándar **RFC 8032 (EdDSA)**. El nombre viene de:
- **Ed** = Edwards (el tipo de curva: Edwards curve)
- **25519** = el número primo que define la curva: $2^{255} - 19$

#### ¿Qué es una curva elíptica? (Versión simplificada)

Sin entrar en matemáticas profundas: una curva elíptica es una ecuación matemática que dibuja una curva con una propiedad especial — puedes hacer operaciones de "multiplicación" de puntos que son fáciles de calcular en una dirección pero **prácticamente imposibles** de revertir.

```
Clave privada (número secreto)  ──[multiplicar por punto generador]──>  Clave pública (punto en la curva)

                                    FÁCIL →
                              ← IMPOSIBLE (inversión)
```

Esto es lo que garantiza la seguridad: cualquiera puede verificar que una firma es válida usando la clave pública, pero nadie puede derivar la clave privada a partir de la pública.

#### Propiedades de Ed25519

| Propiedad | Valor | Por qué importa |
|-----------|-------|-----------------|
| Tamaño de clave privada | 32 bytes (256 bits) | Compacta, fácil de almacenar |
| Tamaño de clave pública | 32 bytes (256 bits) | Cabe fácilmente en JSON |
| Tamaño de firma | 64 bytes (512 bits) | Compacta para enviar por HTTP |
| Velocidad de firma | ~100,000/seg | Un agente puede firmar miles de requests/seg |
| Velocidad de verificación | ~70,000/seg | Los servidores pueden verificar rápido |
| Determinístico | Sí | Misma entrada → misma firma (siempre) |
| Necesita entropía extra | No | No depende de un generador de números aleatorios |

#### ¿Por qué Ed25519 y no otros algoritmos?

| Algoritmo | Problema | Ed25519 resuelve |
|-----------|----------|------------------|
| **RSA** | Claves de 2048+ bits (256 bytes), lento (~1,000 firmas/seg) | Claves de 32 bytes, 100x más rápido |
| **ECDSA (secp256k1)** | Necesita entropía aleatoria en cada firma. Si el RNG (generador de números aleatorios) falla o es predecible, la clave privada queda expuesta (caso real: PlayStation 3 hack, 2010) | Determinístico: no necesita RNG extra, elimina toda esa clase de vulnerabilidades |
| **DSA** | Obsoleto, claves grandes, lento | Moderno, compacto, rápido |

**Dato importante para la comunidad Web3:** Ethereum usa ECDSA con curva secp256k1 (no Ed25519). Nuestro SDK usa Ed25519 para las firmas de identidad del agente, pero usa direcciones Ethereum/EVM para el smart contract. Son dos sistemas criptográficos coexistiendo, cada uno en su dominio.

#### ¿Qué significa "determinístico"?

En ECDSA, cada vez que firmas el mismo mensaje, la firma es **diferente** (porque usa un número aleatorio interno llamado `k`). Si `k` se repite, un atacante puede calcular tu clave privada. Esto pasó en la vida real:

> **PlayStation 3 Hack (2010):** Sony usó el mismo `k` para firmar múltiples actualizaciones. Los hackers extrajeron la clave privada de Sony y pudieron firmar software pirata como si fuera oficial.

En Ed25519, la firma es **determinística**: el mismo mensaje + la misma clave privada → **siempre** la misma firma. No hay `k` aleatorio. No hay riesgo de repetición.

---

### 3.4 Firmar y verificar — El flujo completo con código real

Veamos exactamente qué hace nuestro SDK. El código está en `AgentIdentity.ts`:

#### Firmar un mensaje

```typescript
// sdk/src/core/AgentIdentity.ts — línea 148
public async signMessage(payload: string, agentPrivateKeyHex: string): Promise<string> {
    const messageBytes = new TextEncoder().encode(payload);     // 1. Convertir texto a bytes
    const privateKeyBytes = hexToBytes(agentPrivateKeyHex);     // 2. Convertir clave hex a bytes
    const signatureBytes = ed25519.sign(messageBytes, privateKeyBytes); // 3. ¡Firmar!
    return bytesToHex(signatureBytes);                          // 4. Retornar firma como hex
}
```

**Paso a paso:**

```
"Hola, soy el agente TradingBot"    →  TextEncoder.encode()  →  [72, 111, 108, 97, ...]
                                                                      (bytes UTF-8)
                                                                          │
"a1b2c3..."                          →  hexToBytes()           →  [161, 178, 195, ...]
(clave privada hex)                                                  (bytes de la clave)
                                                                          │
                                                                          ▼
                                                                   ed25519.sign()
                                                                          │
                                                                          ▼
                                                               [firma: 64 bytes]
                                                                          │
                                                                   bytesToHex()
                                                                          │
                                                                          ▼
                                                          "d4e5f6a7b8c9..."
                                                          (firma en hexadecimal)
```

#### Verificar una firma

```typescript
// sdk/src/core/AgentIdentity.ts — línea 275
public static async verifySignature(
    did: string, payload: string, signature: string, keyId?: string
): Promise<boolean> {

    // 1. ¿Está revocado el DID?
    const isRevoked = await AgentIdentity.registry.isRevoked(did);
    if (isRevoked) return false;  // DID revocado = firma rechazada

    // 2. Resolver el DID → obtener DID Document
    const didDoc = await AgentIdentity.resolve(did);

    // 3. Convertir payload y firma a bytes
    const messageBytes = new TextEncoder().encode(payload);
    const signatureBytes = hexToBytes(signature);

    // 4. Buscar claves válidas para autenticación
    const activeKeyIds = new Set(didDoc.authentication || []);
    const candidateMethods = didDoc.verificationMethod.filter((method) => {
        if (!method.publicKeyMultibase) return false;
        if (keyId) return method.id === keyId && activeKeyIds.has(method.id);
        return activeKeyIds.has(method.id);
    });

    // 5. Verificar con cada clave candidata
    for (const verificationMethod of candidateMethods) {
        const publicKeyHex = verificationMethod.publicKeyMultibase!.startsWith('z')
            ? verificationMethod.publicKeyMultibase!.slice(1)   // Quitar prefijo 'z'
            : verificationMethod.publicKeyMultibase!;

        const publicKeyBytes = hexToBytes(publicKeyHex);
        const valid = ed25519.verify(signatureBytes, messageBytes, publicKeyBytes);

        if (valid) return true;  // ¡Firma válida!
    }

    return false;  // Ninguna clave pudo verificar
}
```

**El flujo completo de verificación:**

```
┌──────────────────────────────────────────────────────────┐
│                    VERIFICACIÓN                          │
│                                                          │
│  1. ¿Está revocado?  ──── Sí ──→ return false ❌        │
│         │                                                │
│        No                                                │
│         │                                                │
│  2. Resolver DID → obtener DID Document                  │
│         │                                                │
│  3. Filtrar claves en `authentication`                   │
│         │                                                │
│  4. Para cada clave candidata:                           │
│     ┌────────────────────────────────────┐               │
│     │ ed25519.verify(firma, msg, pubKey) │               │
│     │     ¿true?  ──→ return true ✅     │               │
│     │     ¿false? ──→ siguiente clave    │               │
│     └────────────────────────────────────┘               │
│         │                                                │
│  5. Ninguna clave verificó → return false ❌             │
└──────────────────────────────────────────────────────────┘
```

**Observación clave:** La verificación primero checa revocación, luego resuelve el DID, y luego solo prueba con las claves que están en `authentication`. Si rotaste claves, la clave vieja ya no está en `authentication`, así que la firma no se verifica.

---

### 3.5 SHA-256 — Hashing para proteger propiedad intelectual

#### ¿Qué es un hash?

Una **función hash** toma cualquier dato de cualquier tamaño y produce un valor de tamaño **fijo**. Es como una licuadora matemática:

```
Entrada (cualquier tamaño)          Hash (siempre 256 bits = 64 caracteres hex)
─────────────────────────           ──────────────────────────────────────────
"Hola"                    → SHA-256 → "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c..."
"Hola."                   → SHA-256 → "798b2a8c5f14d449c73f98b7d8b2c9c5a7b3e1d4..."  ← ¡Totalmente diferente!
(El Quijote completo)     → SHA-256 → "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b..."  (mismo tamaño)
```

#### Propiedades fundamentales

| Propiedad | Significado | Implicación |
|-----------|-------------|-------------|
| **Determinístico** | Misma entrada → siempre el mismo hash | Dos agentes con el mismo prompt producen el mismo hash |
| **Irreversible** | No puedes recuperar la entrada desde el hash | Hashear un prompt no revela su contenido |
| **Efecto avalancha** | Un cambio mínimo → hash completamente diferente | No puedes "adivinar" acercándote poco a poco |
| **Resistente a colisiones** | Es prácticamente imposible encontrar dos entradas que produzcan el mismo hash | Cada prompt/modelo tiene un hash único |

#### El código real — `hash.ts`

```typescript
// sdk/src/crypto/hash.ts

import { ethers } from 'ethers';

// 1. hashPayload: convierte un string en su hash SHA-256
export function hashPayload(payload: string): string {
    const bytes = ethers.toUtf8Bytes(payload);   // "Hola" → [72, 111, 108, 97]
    return ethers.sha256(bytes);                 // → "0x2cf24dba..."
}

// 2. formatHashUri: da formato de URI al hash
export function formatHashUri(hashHex: string): string {
    const cleanHash = hashHex.startsWith('0x') ? hashHex.slice(2) : hashHex;
    return `hash://sha256/${cleanHash}`;         // → "hash://sha256/2cf24dba..."
}

// 3. generateAgentMetadataHash: combina los dos anteriores
export function generateAgentMetadataHash(payload: string): string {
    const rawHash = hashPayload(payload);
    return formatHashUri(rawHash);               // → "hash://sha256/2cf24dba..."
}
```

Son solo 3 funciones y ~20 líneas de código. Pero estas 20 líneas son las que protegen la propiedad intelectual de cada agente.

#### ¿Cómo se usa en la práctica?

Cuando creas un agente con `AgentIdentity.create()`:

```typescript
const agent = await AgentIdentity.create({
    name: "TradingBot",
    model: "gpt-4-turbo",                           // ← texto del modelo
    systemPrompt: "You are a trading assistant...",  // ← prompt secreto
    // ...otros campos
});
```

Internamente el SDK hace:

```typescript
// sdk/src/core/AgentIdentity.ts — líneas 100-101
const coreModelHashUri = generateAgentMetadataHash(params.model || '');
const systemPromptHashUri = generateAgentMetadataHash(params.systemPrompt || '');
```

Y el DID Document resultante contiene:

```json
"agentMetadata": {
    "coreModelHash": "hash://sha256/a1b2c3d4...",      // No dice "gpt-4-turbo"
    "systemPromptHash": "hash://sha256/e5f6g7h8..."     // No dice el prompt
}
```

**Resultado:** El mundo sabe que tu agente usa *un modelo específico* y *un prompt específico*, puede verificar que no han cambiado, pero **no sabe cuáles son**. Si mañana alguien te copia el prompt y tú necesitas demostrar que lo tenías primero, muestras el blockchain con el timestamp de cuándo registraste el hash.

**Nota técnica:** El SDK usa `ethers.sha256()` (de la librería ethers.js) para el hashing, no una implementación propia. `ethers.js` es una de las librerías más auditadas del ecosistema Ethereum.

---

### 3.6 Firmas HTTP — RFC 9421 (HTTP Message Signatures)

Hasta ahora hemos visto firmas de mensajes simples (un string). Pero en el mundo real, los agentes se comunican por **HTTP**. La pregunta es:

> **¿Cómo sabe un servidor que una petición HTTP vino realmente de un agente específico?**

La respuesta es **RFC 9421 — HTTP Message Signatures**, un estándar IETF para firmar peticiones HTTP.

#### El problema que resuelve

Hoy, las APIs usan **API keys** o **tokens OAuth**:

```
GET /api/data HTTP/1.1
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

Problemas de este enfoque para agentes IA:
1. Si alguien intercepta el token, puede hacerse pasar por el agente
2. El token no está vinculado al contenido de la petición (puedes reusar el token en otra petición)
3. No hay forma de validar la identidad del agente sin preguntarle al proveedor de OAuth

**Con firmas HTTP, cada petición tiene su propia firma criptográfica vinculada a:**
- La URL exacta (`@request-target`)
- El host del servidor (`host`)
- El momento exacto (`date`)
- El contenido del body (`content-digest`)
- La identidad del agente (`Signature-Agent`)

Si alguien intercepta la petición y cambia **cualquier** cosa, la firma se invalida.

#### El flujo paso a paso — `signHttpRequest()`

```typescript
// sdk/src/core/AgentIdentity.ts — línea 157
public async signHttpRequest(params: SignHttpRequestParams): Promise<Record<string, string>> {
```

**Paso 1: Calcular el Content-Digest (hash del body)**

```typescript
// Método privado: computeContentDigest()
const bodyHashHex = ethers.sha256(ethers.toUtf8Bytes(body || ""));
const bodyHashBase64 = Buffer.from(hexToBytes(cleanBodyHashHex)).toString('base64');
return `sha-256=:${bodyHashBase64}:`;
```

Ejemplo:
```
Body: '{"action": "buy", "symbol": "AAPL"}'
                    ↓ SHA-256
Content-Digest: "sha-256=:X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=:"
```

**Paso 2: Construir la "signature base" (qué se firma)**

```typescript
// Método privado: buildHttpSignatureBase()
return [
    `(request-target): ${params.method.toLowerCase()} ${urlObj.pathname}${urlObj.search}`,
    `host: ${urlObj.host}`,
    `date: ${params.dateHeader}`,
    `content-digest: ${contentDigest}`
].join('\n');
```

Ejemplo del string que se firma:
```
(request-target): post /api/v1/trade
host: api.exchange.com
date: Mon, 03 Mar 2026 14:30:00 GMT
content-digest: sha-256=:X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=:
```

**Paso 3: Firmar con Ed25519**

```typescript
const signatureHex = await this.signMessage(stringToSign, params.agentPrivateKey);
const signatureBase64 = Buffer.from(hexToBytes(signatureHex)).toString('base64');
```

**Paso 4: Construir los headers de respuesta**

```typescript
return {
    'Signature': `sig1=:${signatureBase64}:`,
    'Signature-Input': `sig1=("@request-target" "host" "date" "content-digest");created=${timestamp};keyid="${verificationMethodId}";alg="ed25519"`,
    'Signature-Agent': params.agentDid,
    'Date': dateHeader,
    'Content-Digest': contentDigest
};
```

#### Los 5 headers que se agregan a cada petición

| Header | Contenido | Propósito |
|--------|-----------|-----------|
| `Signature` | `sig1=:BASE64...:` | La firma criptográfica en sí |
| `Signature-Input` | Componentes firmados + metadata | Qué se firmó, con qué clave, cuándo |
| `Signature-Agent` | `did:agent:polygon:0x742d...` | Quién firmó (el DID del agente) |
| `Date` | `Mon, 03 Mar 2026 14:30:00 GMT` | Cuándo se firmó |
| `Content-Digest` | `sha-256=:BASE64...:` | Hash del body (integridad) |

#### Ejemplo completo de petición firmada

```http
POST /api/v1/trade HTTP/1.1
Host: api.exchange.com
Date: Mon, 03 Mar 2026 14:30:00 GMT
Content-Type: application/json
Content-Digest: sha-256=:X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=:
Signature-Agent: did:agent:polygon:0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18
Signature-Input: sig1=("@request-target" "host" "date" "content-digest");created=1709473800;keyid="did:agent:polygon:0x742d...#key-1";alg="ed25519"
Signature: sig1=:dGhpcyBpcyBhIHNpbXBsaWZpZWQgZXhhbXBsZQ==:

{"action": "buy", "symbol": "AAPL", "quantity": 100}
```

---

### 3.7 Verificación de firmas HTTP — El lado del servidor

Cuando el servidor recibe la petición, ejecuta `verifyHttpRequestSignature()`:

```
Petición HTTP recibida
        │
        ▼
┌─────────────────────────────────────────┐
│ 1. ¿Existen los 5 headers requeridos?   │
│    (Signature, Signature-Input,          │
│     Signature-Agent, Date,              │
│     Content-Digest)                     │
│    No → return false ❌                 │
└──────────┬──────────────────────────────┘
           │ Sí
           ▼
┌─────────────────────────────────────────┐
│ 2. Recalcular Content-Digest del body   │
│    ¿Coincide con el header?             │
│    No → return false ❌                 │
│    (el body fue alterado en tránsito)   │
└──────────┬──────────────────────────────┘
           │ Sí
           ▼
┌─────────────────────────────────────────┐
│ 3. Parsear Signature-Input              │
│    - ¿Tiene los 4 componentes?          │
│      (@request-target, host, date,      │
│       content-digest)                   │
│    - ¿El keyid empieza con el agentDid? │
│    - ¿El algoritmo es ed25519?          │
│    - ¿El timestamp no es demasiado      │
│      viejo? (máximo 300 segundos)       │
└──────────┬──────────────────────────────┘
           │ Todo OK
           ▼
┌─────────────────────────────────────────┐
│ 4. Reconstruir signature base           │
│    (mismo cálculo que el agente hizo)   │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│ 5. verifySignature()                    │
│    - ¿DID revocado? → false             │
│    - Resolver DID → obtener public key  │
│    - ed25519.verify(firma, base, pubKey)│
│    - ¿true? → return true ✅            │
└─────────────────────────────────────────┘
```

**Detalle crucial: el `maxSkew` (desviación temporal)**

```typescript
const maxSkew = params.maxCreatedSkewSeconds ?? 300;  // 300 segundos = 5 minutos
if (Math.abs(now - created) > maxSkew) continue;      // Firma demasiado vieja → rechazar
```

Esto previene **replay attacks**: si alguien intercepta una petición firmada e intenta enviarla después, será rechazada porque el timestamp `created` difiere más de 5 minutos del tiempo actual.

---

### 3.8 Content-Digest — La integridad del body

El `Content-Digest` es un header estandarizado por el IETF que garantiza la integridad del body de la petición.

```typescript
// sdk/src/core/AgentIdentity.ts — método privado
private static computeContentDigest(body?: string): string {
    const bodyHashHex = ethers.sha256(ethers.toUtf8Bytes(body || ""));
    const cleanBodyHashHex = bodyHashHex.startsWith('0x') ? bodyHashHex.slice(2) : bodyHashHex;
    const bodyHashBase64 = Buffer.from(hexToBytes(cleanBodyHashHex)).toString('base64');
    return `sha-256=:${bodyHashBase64}:`;
}
```

**Formato:** `sha-256=:<base64(sha256(body))>:`

¿Por qué se necesita si ya estamos firmando?
- La firma cubre el **header** `Content-Digest`, no el body directamente
- El Content-Digest vincula el body con la firma de forma indirecta
- Si alguien modifica el body, el Content-Digest cambia, y la firma deja de ser válida

Es un **doble candado**: la firma protege los headers, y el Content-Digest protege el body.

---

### 3.9 La biblioteca `@noble/curves` — ¿Por qué esta y no otra?

```typescript
// sdk/src/core/AgentIdentity.ts — línea 2
import { ed25519 } from '@noble/curves/ed25519';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
```

Nuestro SDK usa la familia `@noble` de **Paul Miller**. ¿Por qué?

| Criterio | `@noble/curves` | `tweetnacl` | `libsodium-wrappers` |
|----------|-----------------|-------------|----------------------|
| Implementación | JavaScript puro | JavaScript puro | C compilado a WASM |
| Auditoría independiente | ✅ Sí (Cure53) | ❌ No formal | ✅ Sí |
| Dependencias | 0 (zero deps) | 0 | Binding nativo |
| Tamaño | ~40KB | ~7KB | ~200KB |
| Mantenimiento | Activo (2024+) | Sin updates desde 2020 | Activo |
| Node.js + Browser | ✅ | ✅ | ⚠️ Requiere WASM |

**Decisiones clave:**
1. **JavaScript puro**: Funciona en cualquier entorno (Node.js, browser, Deno, edge functions) sin bindings nativos
2. **Auditoría Cure53**: Una firma de seguridad reconocida revisó el código. No es criptografía "artesanal"
3. **Zero dependencies**: Menos superficie de ataque (supply chain attacks)
4. **Mantenimiento activo**: Se actualiza regularmente, a diferencia de alternativas abandonadas

**Advertencia importante para la comunidad:** Nosotros **no implementamos criptografía**. Usamos una librería auditada. Implementar tu propia criptografía es una de las peores decisiones de seguridad que puedes tomar.

---

### 3.10 Juntando todo — El panorama completo

```
┌──────────────────────────────────────────────────────────────────────┐
│                    CRIPTOGRAFÍA EN EL SDK                            │
│                                                                      │
│  ┌─────────────┐    ┌──────────────────┐    ┌────────────────────┐  │
│  │  @noble/     │    │    ethers.js      │    │   Ed25519 Keypair  │  │
│  │  curves      │    │                  │    │                    │  │
│  │              │    │  ethers.sha256()  │    │  Private (32B)     │  │
│  │  ed25519     │    │  ethers.toUtf8    │    │  Public  (32B)     │  │
│  │  .sign()     │    │  Bytes()          │    │                    │  │
│  │  .verify()   │    │                  │    │  Almacenada por     │  │
│  │              │    │  Usado en:        │    │  el operador,      │  │
│  │  Usado en:   │    │  • hash.ts        │    │  NUNCA en el DID   │  │
│  │  • signMsg   │    │  • Content-       │    │  Document          │  │
│  │  • verifyMsg │    │    Digest         │    │                    │  │
│  │  • signHTTP  │    │  • documentRef    │    │                    │  │
│  └─────────────┘    └──────────────────┘    └────────────────────┘  │
│                                                                      │
│  Se combinan en:                                                     │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │                    AgentIdentity                              │   │
│  │                                                               │   │
│  │  create()        → genera claves + hashes + DID Document     │   │
│  │  signMessage()   → firma Ed25519 pura                        │   │
│  │  signHttpRequest()   → firma HTTP (5 headers)                │   │
│  │  verifySignature()   → resuelve DID + verifica Ed25519       │   │
│  │  verifyHttpRequestSignature() → verifica headers + firma     │   │
│  └───────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

---

### Ejercicios del Módulo 3

**Ejercicio 1**: Explica con tus palabras la diferencia entre criptografía simétrica y asimétrica. ¿Por qué el SDK usa asimétrica?

**Ejercicio 2**: Un colega te dice "¿Por qué no usan ECDSA como Ethereum? Ya es estándar probado." Responde en 3-4 oraciones explicando por qué Ed25519 es mejor para firmas frecuentes de agentes IA.

**Ejercicio 3**: Dado el prompt `"You are a helpful trading assistant"`, describe paso a paso qué hacen las funciones `hashPayload()` → `formatHashUri()` → `generateAgentMetadataHash()`. ¿Qué valor termina en el DID Document?

**Ejercicio 4**: Traza el flujo completo de una petición HTTP firmada:
- El agente llama a `signHttpRequest()` con método POST, URL `https://api.example.com/trade`, body `{"action":"buy"}`
- ¿Qué headers se generan?
- El servidor recibe la petición. ¿En qué orden verifica? ¿Qué pasa si el body fue alterado?

**Ejercicio 5**: ¿Qué es un replay attack y cómo lo previene el campo `created` del `Signature-Input`? ¿Qué valor tiene `maxSkew` por defecto en nuestro SDK?

**Ejercicio 6**: ¿Por qué el SDK usa `@noble/curves` en vez de implementar Ed25519 desde cero? Menciona al menos 3 razones.

---

### Talking Points para la comunidad

- "Elegimos Ed25519 porque es determinístico — elimina toda la clase de vulnerabilidades de ECDSA donde un RNG débil filtra la clave privada (caso PlayStation 3, 2010)"
- "Los hashes SHA-256 protegen la propiedad intelectual del agente: tú puedes demostrar qué modelo usas sin revelar el código fuente"
- "Las firmas HTTP nos permiten autenticar agentes en cualquier API sin API keys — cada petición lleva su propia prueba criptográfica"
- "Usamos @noble/curves, auditada por Cure53 — nosotros no implementamos criptografía, usamos lo que los expertos ya verificaron"
- "El Content-Digest es un doble candado: la firma protege los headers y el digest protege el body"
- "El maxSkew de 5 minutos previene replay attacks — una firma interceptada expira antes de poder ser reutilizada"

---

### Respuestas de ejemplo y evaluación — Módulo 3

#### Ejercicio 1: Criptografía simétrica vs asimétrica — **9/10** 🌟

> "Criptografía simétrica usa la misma clave para cifrar y descifrar, como por ejemplo la contraseña de un archivo ZIP. Esto implica un problema debido a que hay que pasarle al destinatario que requiere descifrar el mensaje, la clave misma y esto es un riesgo de seguridad mayor pues alguien puede interceptar el mensaje y obtener la clave."
>
> "La criptografía asimétrica usa dos claves, una clave privada conocida solo por el remitente y una clave pública, que puede ser conocida por cualquiera. El mensaje firmado por el remitente puede ser verificado por el destinatario con la clave pública, la firma del remitente y el mensaje en sí mismo. Es imposible determinar la clave privada a partir de la clave pública."
>
> "El SDK de Agent DID usa criptografía asimétrica para garantizar que cualquiera pueda determinar la autenticidad del autor del mensaje solo usando matemáticas puras sin necesidad de conocer la clave privada, solo su clave pública, ahí radica la belleza de la arquitectura del SDK Agent DID."

**Excelente.** Explicación clara, precisa y con buen ejemplo (archivo ZIP). La frase final demuestra convicción — es el tipo de comunicación que funciona ante la comunidad.

**Punto menor a refinar:** Cuando dices "puede ser verificado por el destinatario", es más preciso decir **cualquiera**, no solo el destinatario. La verificación es pública — esa es precisamente la gracia.

---

#### Ejercicio 2: ¿Por qué Ed25519 en vez de ECDSA? — **7/10** ✅

> "Ed25519 es corta (32 bytes), tanto en la clave privada como en la pública, es 100x más rápida en la generación de firmas y no dependen de generadores de números aleatorios que inyectan una dependencia adicional y por ende un mecanismo de posible falla."

**Correcto en los 3 puntos**, pero faltó desarrollo:

| Punto | Evaluación |
|-------|-----------|
| Claves de 32 bytes | ✅ Pero ECDSA (secp256k1) también usa claves de 32 bytes para la privada — no es el diferenciador principal |
| 100x más rápida | ✅ (~100K vs ~1K firmas/seg) |
| No depende de RNG | ✅ **Argumento más fuerte** — faltó explicar *por qué* importa |

**Lo que habría fortalecido la respuesta:** Mencionar el caso real del PlayStation 3 hack (2010). Sony usó ECDSA con un valor `k` repetido y los hackers extrajeron la clave privada. Para un agente que firma miles de requests al día, ese riesgo sería catastrófico.

**Versión modelo:**
> "ECDSA necesita un número aleatorio interno (k) en cada firma. Si ese número se repite — algo posible con miles de firmas diarias — la clave privada queda expuesta. Esto le pasó a Sony en 2010. Ed25519 es determinístico: misma entrada, misma firma, sin aleatorios. Además es 100x más rápido, lo cual importa cuando un agente firma cada petición HTTP."

---

#### Ejercicio 3: Flujo de hash — **8/10** ✅

> "hashPayload(): Convierte un string en un valor Hash SHA-256. formatHashUri(): formatea el Hash SHA-256 en un formato de URI, por ejemplo: hash://sha256/56cd25f.... generateAgentMetadataHash(): Usa los dos anteriores para generar el hash final con formato URI."

**Correcto y conciso.** Faltó responder la segunda parte: *"¿Qué valor termina en el DID Document?"*

```
"You are a helpful trading assistant"
         │
         ▼  hashPayload()
"0x7f83b1657ff1fc53b..."
         │
         ▼  formatHashUri()
"hash://sha256/7f83b1657ff1fc53b..."
         │
         ▼  En el DID Document:
"systemPromptHash": "hash://sha256/7f83b1657ff1fc53b..."
```

El prompt **nunca** aparece en el documento — solo su hash en formato URI.

---

#### Ejercicio 4: Diagrama de verificación HTTP — **10/10** 🌟🌟

El diagrama de flujo presentado es **impecable**:

- ✅ Punto de entrada: "Petición HTTP Firmada"
- ✅ Check 1: ¿5 headers requeridos? → No → False
- ✅ Check 2: Recalcular Digest del body → ¿coincide? → No → False
- ✅ Check 3: Parsear Signature-Input con las 4 validaciones (componentes, keyid, algoritmo, timestamp ≤ 300 seg)
- ✅ Check 4: Reconstruir signature base (mismo cálculo que el agente hizo)
- ✅ Check 5: Verificar Signature → Sí → True / No → False

**Lo que demuestra:** Comprensión del orden secuencial de validaciones y del patrón **fail-fast** — el servidor no gasta recursos en verificación criptográfica (costosa) hasta que todas las validaciones baratas pasan primero.

---

#### Ejercicio 5: Replay attack — **5/10** ⚠️

> "El replay attack ocurre cuando un atacante intenta reenviar un mensaje en un tiempo futuro que supera el umbral de 3min. El maxSkew define ese umbral en 3min."

**Dos errores:**

1. **El valor de maxSkew es 300 segundos = 5 minutos**, no 3 minutos. Del código: `const maxSkew = params.maxCreatedSkewSeconds ?? 300;`

2. **Definición incompleta.** Un replay attack es cuando un atacante **intercepta** una petición HTTP legítima ya firmada y la **reenvía** tal cual para ejecutar la misma acción otra vez. Por ejemplo: intercepta una orden de compra firmada y la reenvía 10 veces para comprar 10 veces.

**Cómo lo previene `created`:** El servidor compara `created` con el tiempo actual. Si la diferencia supera 300 segundos (5 minutos), la petición se rechaza. Así, una petición interceptada y reenviada 10 minutos después será rechazada automáticamente.

**Limitación honesta:** El maxSkew no previene replays dentro de la ventana de 5 minutos. Para eso se necesitarían nonces (números de un solo uso), que nuestro SDK v0.1.0 aún no implementa.

---

#### Ejercicio 6: ¿Por qué `@noble/curves`? — **4/10** ⚠️

> "Sería un error tratar de implementar por nosotros mismos criptografía, el @noble/curves es uno de los algoritmos más auditados de Ethereum"

**Solo 1 razón cuando se pidieron 3.** Además, `@noble/curves` no es "de Ethereum" — es una librería independiente de Paul Miller usada en muchos proyectos.

**Las 3+ razones que se esperaban:**

1. **Auditoría profesional:** Auditada por Cure53, firma de seguridad reconocida
2. **Zero dependencies:** Menos superficie de ataque contra supply chain attacks
3. **JavaScript puro:** Funciona en Node.js, browser, Deno, edge functions sin bindings nativos
4. **Mantenimiento activo:** Actualizada regularmente, a diferencia de `tweetnacl` (abandonada desde 2020)
5. **Regla de oro:** No implementar criptografía propia (tu punto correcto)

---

#### Resumen de evaluación Módulo 3

| Ejercicio | Puntuación | Nivel |
|-----------|-----------|-------|
| 1. Simétrica vs asimétrica | 9/10 | 🌟 Excelente |
| 2. Ed25519 vs ECDSA | 7/10 | ✅ Correcto, faltó desarrollo |
| 3. Flujo de hash | 8/10 | ✅ Sólido, faltó respuesta final |
| 4. Diagrama verificación HTTP | 10/10 | 🌟🌟 Perfecto |
| 5. Replay attack | 5/10 | ⚠️ Definición incompleta, valor incorrecto |
| 6. ¿Por qué @noble/curves? | 4/10 | ⚠️ Solo 1 razón de 3, imprecisión |
| **Promedio** | **7.2/10** | **✅ Aprobado** |

**Progreso general:**

| Módulo | Promedio | Tendencia |
|--------|---------|-----------|
| Módulo 1 | 7.8/10 | — |
| Módulo 2 | 8.0/10 | ↑ |
| Módulo 3 | 7.2/10 | ↓ |

**Análisis:** El punto más fuerte sigue siendo la comprensión arquitectónica (diagrama 10/10). El área de mejora está en los detalles exactos (5 min vs 3 min) y en desarrollar las respuestas discursivas con más profundidad. Ante la comunidad, usar la estructura: **Afirmación → Razón técnica → Ejemplo concreto**.

---

## Módulo 4 — RFC-001: La Especificación Agent-DID

### Objetivos de aprendizaje
- Entender la especificación RFC-001 en su totalidad
- Conocer cada campo del Agent-DID Document y su justificación
- Comprender la arquitectura híbrida on-chain/off-chain
- Dominar los flujos operativos normativos
- Dominar los 16 controles de conformancia y su evidencia
- Saber responder preguntas de la comunidad sobre la madurez del estándar

### 4.1 ¿Qué es un RFC y por qué RFC-001?

**RFC** = Request For Comments. Es el formato estándar para documentar especificaciones técnicas, originado en la IETF (Internet Engineering Task Force) en 1969 con el RFC 1 de Steve Crocker sobre ARPANET. Hoy existen más de 9,000 RFCs de la IETF que definen HTTP, TCP/IP, DNS, TLS, etc.

Nuestro **RFC-001** es un **RFC interno del proyecto Agent-DID**. La numeración "001" indica que es la primera especificación formal de este proyecto. Muchos proyectos open-source usan series de RFCs internas (Rust tiene `rust-lang/rfcs`, React tiene RFCs internos, Ethereum tiene los EIPs). No hay conflicto con el RFC 1 de la IETF porque nuestro RFC vive en el namespace de este proyecto. Futuras especificaciones serían RFC-002, RFC-003, etc.

**Estado actual del documento:**
- **Status:** Active Draft
- **Version:** 0.2-unified
- **Scope:** Documento canónico y único para la especificación Agent-DID

### 4.2 Relación con estándares existentes

RFC-001 no inventa desde cero — **orquesta** estándares existentes para el caso específico de agentes autónomos:

| Estándar existente | Qué aporta a Agent-DID |
|---|---|
| **W3C DID / DID Document** | Fundamento de identidad descentralizada — estructura, resolución, formato |
| **W3C Verifiable Credentials (VC)** | Soporte para certificaciones de compliance auditables |
| **ERC-4337 / Account Abstraction** (opcional) | Cuenta autónoma para que el agente pueda hacer pagos y operaciones económicas |
| **HTTP Message Signatures / Web Bot Auth** (emergente) | Firma de peticiones HTTP para autenticación A2A y APIs |

La frase clave de la RFC: *"Agent-DID does not replace these standards; it orchestrates them for the specific case of autonomous agents."*

### 4.3 Los 5 principios de diseño

Estos principios son las **decisiones arquitectónicas fundamentales** que guían toda la especificación:

#### Principio 1: Identidad persistente, estado mutable
- El DID **nunca** cambia — `did:agent:polygon:0xABC123` es permanente
- Pero el documento puede evolucionar: nuevo modelo, nuevo prompt, nuevas claves, nuevas capabilities
- **Analogía**: Tu número de cédula no cambia aunque cambies de dirección, trabajo o foto

#### Principio 2: Mínimo on-chain
- Solo se pone en blockchain lo indispensable: DID, controller, referencia al documento, estado de revocación
- Todo lo demás vive off-chain en almacenamiento descentralizado (IPFS, HTTP)
- **Razones**: Costo de gas (almacenar 32 bytes on-chain ≈ 20,000 gas), velocidad, privacidad

#### Principio 3: Criptografía fuerte por defecto
- Ed25519 viene configurada de fábrica — el desarrollador no tiene que elegir ni configurar algoritmos
- "By default" es la clave: seguridad sin fricción
- Ed25519: determinística, ~100K firmas/segundo, 32 bytes claves, 64 bytes firmas

#### Principio 4: Agnóstico de blockchain
- La especificación no está atada a ninguna blockchain específica
- Compatible con **cualquier red**, no solo EVMs: podría adaptarse a Solana, Cosmos, Hyperledger
- EVM (Polygon) es solo la **implementación de referencia**, no un requisito

#### Principio 5: Interoperabilidad
- Dos mecanismos concretos: **JSON-LD schema** (documento legible por cualquier implementación) + **resolución universal** (cualquier resolver compatible puede resolver)
- Si alguien implementa RFC-001 en Python, Go o Rust, debe poder verificar firmas generadas por el SDK TypeScript

### 4.4 Estructura del Agent-DID Document

#### Esquema base JSON-LD

```json
{
  "@context": ["https://www.w3.org/ns/did/v1", "https://agent-did.org/v1"],
  "id": "did:agent:polygon:0x1234...abcd",
  "controller": "did:ethr:0xCreatorWalletAddress",
  "created": "2026-02-22T14:00:00Z",
  "updated": "2026-02-22T14:00:00Z",
  "agentMetadata": {
    "name": "SupportBot-X",
    "description": "Level 1 technical support agent",
    "version": "1.0.0",
    "coreModelHash": "hash://sha256/...",
    "systemPromptHash": "hash://sha256/...",
    "capabilities": ["read:kb", "write:ticket"],
    "memberOf": "did:fleet:0xCorporateSupportFleet"
  },
  "complianceCertifications": [
    {
      "type": "VerifiableCredential",
      "issuer": "did:auditor:0xTrustCorp",
      "credentialSubject": "SOC2-AI-Compliance",
      "proofHash": "ipfs://Qm..."
    }
  ],
  "verificationMethod": [
    {
      "id": "did:agent:polygon:0x1234...abcd#key-1",
      "type": "Ed25519VerificationKey2020",
      "controller": "did:ethr:0xCreatorWalletAddress",
      "publicKeyMultibase": "z...",
      "blockchainAccountId": "eip155:1:0xAgentSmartWalletAddress"
    }
  ],
  "authentication": ["did:agent:polygon:0x1234...abcd#key-1"]
}
```

#### Campos normativos — Clasificación REQUIRED vs OPTIONAL

| Campo | Requisito | Descripción |
|---|---|---|
| `id` | **REQUIRED** | DID único del agente (`did:agent:<network>:<id>`) |
| `controller` | **REQUIRED** | DID o identificador del controlador humano/organizacional |
| `created` / `updated` | **REQUIRED** | Timestamps ISO-8601 del documento |
| `agentMetadata.coreModelHash` | **REQUIRED** | Hash inmutable del modelo base |
| `agentMetadata.systemPromptHash` | **REQUIRED** | Hash inmutable del prompt de sistema |
| `verificationMethod` | **REQUIRED** | Claves públicas válidas para verificación de firma |
| `authentication` | **REQUIRED** | Referencias a métodos de autenticación válidos |
| `complianceCertifications` | OPTIONAL | Evidencia de auditorías y VCs |
| `agentMetadata.capabilities` | OPTIONAL | Capacidades declaradas/autorizadas |
| `agentMetadata.memberOf` | OPTIONAL | Enlace a flota/cohort de agentes |

**Regla clave**: Sin los campos REQUIRED, el documento es inválido según la especificación. Los campos OPTIONAL enriquecen la identidad pero no son necesarios para el funcionamiento básico.

### 4.5 Controller vs Owner — La distinción crítica

Esta es una de las distinciones más importantes y frecuentemente confundidas:

| Aspecto | Controller | Owner |
|---------|-----------|-------|
| **Dónde vive** | En el DID Document (off-chain) | En el smart contract (on-chain) |
| **Qué es** | Identidad (DID) del humano/organización que gobierna al agente | Dirección EVM con control operativo del registro |
| **Formato** | `did:ethr:0x...` | `address` (0x...) |
| **Qué puede hacer** | Define la responsabilidad legal/organizacional | Ejecutar `revokeAgent`, `setDocumentRef`, `setRevocationDelegate`, `transferAgentOwnership` |
| **Ejemplo** | La empresa Acme Corp | Un ingeniero DevOps de Acme Corp |

**Escenario realista**: Una corporación financiera (controller: `did:web:acmecorp.com`) crea un agente para entregar reportes. Delega en su departamento de TI, específicamente en un ingeniero (owner: `0xIngeniero...`), el registro on-chain y las operaciones sobre la blockchain. Si el ingeniero cambia de trabajo, se transfiere el ownership a otro ingeniero (`transferAgentOwnership`), pero el controller sigue siendo la corporación.

**¿Un agente puede ser controller de otro agente?** Técnicamente sí. El campo `controller` es un string DID, no especifica que debe ser humano. Esto habilita **jerarquías de agentes**: un agente orquestador que controla sub-agentes. Con ERC-4337, un agente puede incluso ser owner on-chain con su propio smart wallet.

### 4.6 Arquitectura híbrida on-chain/off-chain

#### Qué va en cada capa

```
┌─────────────────────────────────────────────────────────┐
│                      OFF-CHAIN                          │
│  (IPFS, HTTP, almacenamiento descentralizado)           │
│                                                         │
│  • Documento JSON-LD completo                           │
│  • agentMetadata (nombre, modelo, prompt, capabilities) │
│  • verificationMethod (claves públicas)                 │
│  • complianceCertifications (VCs extensas)              │
│  • Historial de versiones                               │
└─────────────────────────────────────────────────────────┘
                          ▲
                          │ documentRef (URI)
                          │
┌─────────────────────────────────────────────────────────┐
│                       ON-CHAIN                          │
│  (Smart Contract AgentRegistry.sol)                     │
│                                                         │
│  • did (string) — identificador                         │
│  • controller (string) — referencia al controlador      │
│  • createdAt (string) — timestamp de creación           │
│  • revokedAt (string) — timestamp de revocación         │
│  • documentRef (string) — URI al documento off-chain    │
│  • exists (bool) — ¿existe este registro?               │
│  • owner (address) — cuenta EVM con control operativo   │
└─────────────────────────────────────────────────────────┘
```

#### El campo `bool exists` — Patrón Solidity

En Solidity, **todos los mappings devuelven un valor por defecto** para cualquier clave, incluso si nunca se escribió en la blockchain. Si consultas `records["did:agent:polygon:0xINEXISTENTE"]`, no lanza error — devuelve un struct con todos los campos vacíos.

El campo `exists` se marca `true` solo cuando se registra un agente:
```solidity
records[did] = AgentRecord({
    ...
    exists: true,  // ← Se marca explícitamente
    ...
});
```

Esto permite distinguir entre "registro con valores vacíos" y "registro nunca creado":
- `require(record.exists, "not found")` → rechazar operaciones sobre DIDs no registrados
- `require(!records[did].exists, "already registered")` → evitar duplicados
- En `isRevoked()`: si no existe, retorna `false` (no es "revocado", simplemente no existe)

#### ¿Por qué no poner todo en blockchain?

| Consecuencia | Impacto |
|---|---|
| **Costo de gas prohibitivo** | Guardar 32 bytes on-chain ≈ 20,000 gas. Un DID Document completo podría costar decenas de dólares por registro |
| **Información pública permanente** | Todo en blockchain es visible para siempre. No quieres que metadata, capabilities o configuraciones sean permanentemente públicas |
| **Velocidad** | Las transacciones on-chain tardan segundos/minutos. Las consultas off-chain son instantáneas |
| **Inmutabilidad rígida** | Si necesitas corregir un dato, debes hacer otra transacción (más gas). Off-chain actualizas el documento directamente |
| **Sin control granular de acceso** | Blockchain es todo-o-nada en visibilidad. Off-chain puedes tener acceso selectivo |

### 4.7 Los 5 flujos operativos normativos

#### Flujo 1: Registro (RFC §6.1)
1. El controller genera el DID y las claves Ed25519 del agente
2. Se construye un documento JSON-LD con los hashes del modelo y prompt
3. Se anclan el DID y su controller en el registro on-chain (`registerAgent`)

```typescript
const identity = await AgentIdentity.create({
  name: 'SupportBot-X',
  coreModel: 'GPT-4-Turbo',
  systemPrompt: 'You are a level 1 support agent...',
  capabilities: ['read:kb', 'write:ticket']
});
```

#### Flujo 2: Resolución y Verificación (RFC §6.2)
1. El consumidor obtiene el `Signature-Agent` o el DID del emisor
2. Resuelve el DID vía universal resolver (con failover en producción)
3. Verifica la firma con `verificationMethod`
4. Verifica estado no-revocado en el registro

```typescript
const isValid = await AgentIdentity.verifySignature(
  did,
  payload,
  signature
);
// Internamente: resolve(did) → obtener publicKey → verificar firma → verificar no revocado
```

#### Flujo 3: Evolución (RFC §6.3)
1. El DID permanece estable — nunca cambia
2. `updated` y los hashes cambian en la nueva versión del documento
3. El registro apunta a la nueva referencia del documento

```typescript
await AgentIdentity.updateDidDocument(did, {
  coreModelHash: 'hash://sha256/nuevo-hash-gpt5...',
  updated: '2026-06-01T00:00:00Z'
});
```

#### Flujo 4: Revocación (RFC §6.4)
1. El controller (o la política definida) marca el DID como revocado
2. Todas las verificaciones posteriores deben fallar
3. En el contrato EVM: el owner o un delegate autorizado ejecuta `revokeAgent(did)`

```typescript
await AgentIdentity.revokeDid(did);
// On-chain: record.revokedAt = timestamp actual → toda verificación futura falla
```

#### Flujo 5: Firma HTTP — Web Bot Auth (RFC §6.5)
1. El agente firma componentes HTTP (`@request-target`, `host`, `date`, `content-digest`)
2. Incluye un header de identidad del agente (`Signature-Agent`)
3. El servidor valida: firma + DID + estado de revocación antes de autorizar

```typescript
const signedHeaders = await AgentIdentity.signHttpRequest({
  method: 'POST',
  url: '/api/data',
  headers: { host: 'api.example.com', 'content-type': 'application/json' },
  body: JSON.stringify({ query: 'financial-report' }),
  did: identity.did,
  privateKey: identity.privateKey,
  keyId: `${identity.did}#key-1`
});
// Resultado: headers con Signature, Signature-Input, Signature-Agent, Date, Content-Digest
```

### 4.8 Comunicación A2A (Agent-to-Agent)

La firma HTTP habilita el caso de uso más potente del SDK — verificación bilateral entre agentes:

```
┌─────────────────────┐                    ┌─────────────────────┐
│   AGENTE ALICE      │                    │   AGENTE BOB        │
│ did:agent:poly:0xA  │                    │ did:agent:poly:0xB  │
└──────────┬──────────┘                    └──────────┬──────────┘
           │                                          │
     1. Alice prepara petición HTTP                   │
     2. Firma con su Ed25519 privada                  │
     3. Incluye headers:                              │
        - Signature                                   │
        - Signature-Input                             │
        - Signature-Agent: did:agent:poly:0xA         │
        - Date                                        │
        - Content-Digest                              │
           │                                          │
           │────── POST /api/negotiate ──────────────▶│
           │                                          │
           │                                    4. Bob extrae Signature-Agent
           │                                    5. Bob resuelve did:agent:poly:0xA
           │                                       → obtiene publicKey de Alice
           │                                    6. Bob verifica firma contra payload
           │                                    7. Bob verifica Alice no revocada
           │                                    8. Bob verifica capabilities de Alice
           │                                          │
           │                                    9. Bob prepara respuesta
           │                                   10. Bob firma con SU Ed25519
           │                                   11. Bob incluye Signature-Agent: 0xB
           │                                          │
           │◀───── 200 OK (firmado) ─────────────────│
           │                                          │
    12. Alice extrae Signature-Agent de Bob           │
    13. Alice resuelve did:agent:poly:0xB             │
    14. Alice verifica firma de Bob                   │
    15. Alice verifica Bob no revocado                │
```

**Lo que se verifica en cada dirección:**
- **Autenticidad**: la firma corresponde a la clave pública del DID
- **Integridad**: el payload no fue alterado (Content-Digest)
- **Vigencia**: el DID no está revocado
- **Identidad**: se puede inspeccionar capabilities, coreModelHash, complianceCertifications

**Diferencia con A2A sin DID**: Sin Agent-DID, los agentes se autentican con API keys compartidas — sin no-repudio, sin identidad descentralizada. Si se filtra una key, no hay forma de saber qué agente la usó. Con Agent-DID, cada agente tiene identidad criptográfica única e irrefutable.

### 4.9 Respuesta a anomalías de verificación

Cuando un servidor detecta una anomalía en la verificación criptográfica de una petición HTTP firmada:

**Lo que YA define la RFC-001:**
- La petición se **rechaza** inmediatamente
- La firma inválida, payload alterado o DID revocado impiden la autorización

**Lo que la RFC NO prescribe (intencionalmente):**
Un protocolo de notificación automática para revocación. Razones:
1. **Falsos positivos**: una firma inválida puede ser un error de red o bug del cliente, no un ataque
2. **Autoridad**: solo el controller/owner puede revocar — el servidor que detecta la anomalía típicamente no tiene esa autoridad

**Patrón recomendado de respuesta:**
```
[Servidor detecta anomalía]
       │
       ▼
[1. Log de seguridad con evidencia]
  - DID del agente, timestamp, tipo de fallo, headers completos
       │
       ▼
[2. Alerta al controller/owner]
  - Webhook / email / sistema de alertas
       │
       ▼
[3. Decisión humana o política automatizada]
  - Incidente confirmado → controller llama revokeDid()
  - Patrón repetido → rate limiting / blacklist temporal
  - Falso positivo → no action
       │
       ▼
[4. Revocación on-chain (si aplica)]
  - owner o delegate ejecuta revokeAgent(did)
  - Todas las verificaciones futuras fallan automáticamente
```

Este es un candidato natural para un **RFC-002: Incident Response Protocol for Agent-DID Anomalies**.

### 4.10 El Smart Contract: AgentRegistry.sol

El contrato implementa **8 funciones**, **4 eventos** y la estructura `AgentRecord`:

#### Funciones del contrato:

| Función | Quién puede llamarla | Qué hace |
|---------|---------------------|----------|
| `registerAgent(did, controller)` | Cualquiera | Registra un nuevo DID con su controller |
| `revokeAgent(did)` | Owner o delegate | Marca el DID como revocado con timestamp |
| `setDocumentRef(did, documentRef)` | Solo owner | Actualiza la referencia al documento off-chain |
| `setRevocationDelegate(did, delegate, authorized)` | Solo owner | Autoriza/desautoriza una dirección como delegate |
| `transferAgentOwnership(did, newOwner)` | Solo owner | Transfiere el ownership a otra dirección |
| `getAgentRecord(did)` | Cualquiera (view) | Consulta los datos del registro |
| `isRevoked(did)` | Cualquiera (view) | Consulta si el DID está revocado |
| `isRevocationDelegate(did, delegate)` | Cualquiera (view) | Consulta si una dirección es delegate |

#### Eventos:
- `AgentRegistered(did, controller, createdAt)` — al registrar
- `AgentRevoked(did, revokedAt)` — al revocar
- `RevocationDelegateUpdated(did, delegate, authorized)` — al cambiar delegates
- `AgentOwnershipTransferred(did, previousOwner, newOwner)` — al transferir ownership

#### Control de acceso para revocación (función interna):
```solidity
function _isAuthorizedRevoker(string calldata did, address actor) private view returns (bool) {
    AgentRecord memory record = records[did];
    return record.owner == actor || revocationDelegates[did][actor];
}
```
Solo dos tipos de cuenta pueden revocar: el owner directo o un delegate autorizado. Esto es el control SHOULD-04.

### 4.11 Los 16 controles de conformancia

#### A. Controles MUST (11 obligatorios) — Todos en PASS

| ID | Control | Evidencia |
|---|---|---|
| MUST-01 | Emitir documento con campos REQUIRED | `types.ts`, `AgentIdentity.ts` |
| MUST-02 | Soportar `create(params)` | `AgentIdentity.ts` |
| MUST-03 | Soportar `signMessage(payload, privateKey)` | `AgentIdentity.ts` |
| MUST-04 | Soportar `signHttpRequest(params)` con componentes requeridos | `AgentIdentity.ts`, tests positivos/negativos |
| MUST-05 | Soportar `resolve(did)` | `UniversalResolverClient.ts`, HTTP/JSON-RPC sources |
| MUST-06 | Soportar `verifySignature` y fallar si revocado | `AgentIdentity.ts`, tests |
| MUST-07 | Soportar `revokeDid(did)` | `AgentIdentity.ts`, registries |
| MUST-08 | Registry con operaciones mínimas | `AgentRegistry.sol`, SDK registries |
| MUST-09 | Firma válida antes y inválida después de revocación | smoke + unit tests |
| MUST-10 | Ciclo de evolución (updated + rotación) | `AgentIdentity.ts`, tests |
| MUST-11 | Separación on-chain/off-chain con referencia | `AgentRegistry.sol`, SDK |

#### B. Controles SHOULD (5 recomendados) — Todos en PASS

| ID | Control | Qué resuelve |
|---|---|---|
| **SHOULD-01** | Resolver universal serverless con caché y alta disponibilidad | Que la resolución de DIDs funcione en producción con failover y caché TTL |
| **SHOULD-02** | Normalización temporal homogénea | Que la hora sea la misma sin importar si la lees del blockchain (Unix timestamp) o del SDK (ISO-8601). Implementado en `time.ts` |
| **SHOULD-03** | Modo de verificación interoperable | Que firmas generadas por el SDK TypeScript puedan ser verificadas por implementaciones en otros lenguajes. Asegurado con vectores compartidos en `interop-vectors.json` |
| **SHOULD-04** | Políticas de control de acceso para revocación | Que no cualquiera pueda revocar cualquier agente. El contrato implementa owner + delegates con `_isAuthorizedRevoker` |
| **SHOULD-05** | Trazabilidad de evolución por versión | Poder rastrear el historial de versiones del documento (qué modelo usaba la semana pasada). Implementado con `getDocumentHistory(did)` |

#### Criterios de salida — "RFC-001 conformant"

Una implementación es conformante cuando:
1. Todos los MUST están en PASS
2. Al menos 3 SHOULD están en PASS y ninguno en FAIL para despliegue en producción

**Verificación ejecutable:** `npm run conformance:rfc001`

### 4.12 Mapeo RFC → SDK

| Flujo RFC | API/Artefacto SDK |
|---|---|
| Registro de identidad (§6.1) | `AgentIdentity.create(params)` |
| Firma de payload (§6.2) | `signMessage(payload, privateKey)` |
| Firma HTTP (§6.5) | `signHttpRequest(params)` |
| Resolución DID (§6.2) | `AgentIdentity.resolve(did)` |
| Verificación de firma (§6.2) | `verifySignature(...)` y `verifyHttpRequestSignature(...)` |
| Evolución del documento (§6.3) | `updateDidDocument(did, patch)` |
| Rotación de claves (§8.2) | `rotateVerificationMethod(did)` |
| Revocación (§6.4) | `revokeDid(did)` |
| Resolver producción (§5.3) | `useProductionResolverFromHttp(...)`, `useProductionResolverFromJsonRpc(...)` |
| Integración EVM (§5.2) | `EthersAgentRegistryContractClient` + `EvmAgentRegistry` |

### 4.13 Seguridad y privacidad

La RFC establece 5 reglas de seguridad:

1. **No publicar prompts en texto plano**: usar hashes verificables (`hash://sha256/...`)
2. **Rotación de claves**: definir política de rotación y actualización de `verificationMethod`
3. **Revocación inmediata**: requisito crítico cuando hay compromiso de claves
4. **Principio de mínimo privilegio**: capabilities explícitas y acotadas
5. **Auditoría**: mantener evidencia de versiones y cambios de estado

### 4.14 Casos de uso de referencia

La RFC define 5 casos de uso que validan la especificación:

1. **Agentes independientes en plataformas sociales/económicas** — identidad propia sin depender de la plataforma
2. **Gobernanza corporativa y compliance auditado** — VCs de SOC2, ISO 27001 ancladas en el documento
3. **Flotas masivas de agentes con identidad individual** — cada agente tiene su DID aunque pertenezca a un fleet
4. **Integración con APIs Zero-Trust via firma HTTP** — autenticación criptográfica sin API keys
5. **Comercio agent-to-agent con no-repudio criptográfico** — prueba irrefutable de quién pagó a quién

### 4.15 Agentes y operaciones económicas

La RFC prevé explícitamente la posibilidad de que agentes participen en operaciones económicas:

- **ERC-4337 (Account Abstraction)**: Un agente puede tener un smart wallet en Ethereum/Polygon con ETH, MATIC, tokens ERC-20 (USDC, USDT)
- El campo `blockchainAccountId` en el `verificationMethod` enlaza la identidad del agente con su cuenta económica:
  ```json
  "blockchainAccountId": "eip155:1:0xAgentSmartWalletAddress"
  ```
- **Bitcoin**: No es EVM directo, pero un agente podría usar wrapped BTC (WBTC) como token ERC-20, o tener una dirección Bitcoin asociada en su documento
- **Caso de uso #5 de la RFC**: *"Agent-to-agent commerce with cryptographic non-repudiation"* — cada transacción tiene firma criptográfica como prueba irrefutable

**Nota**: El SDK actual está enfocado en identidad, no en pagos. La integración con pagos sería una extensión natural (potencial RFC-002 o RFC-003).

### Talking Points para la comunidad

- *"RFC-001 tiene 16 controles de conformancia, todos en PASS — puedes verificarlo tú mismo con `npm run conformance:rfc001`"*
- *"No es solo un draft — es una implementación funcional y validada con 16 controles verificables"*
- *"No estamos inventando criptografía ni partiendo desde cero. Estamos extendiendo estándares probados (W3C, Ed25519, Solidity) para resolver la identidad descentralizada de agentes de IA"*
- *"La arquitectura híbrida optimiza costo de gas: solo lo mínimo en blockchain, el resto off-chain"*
- *"Los hashes de modelo y prompt protegen la IP sin sacrificar verificabilidad"*
- *"El DID persiste aunque cambies el modelo, el prompt o las claves — es la identidad del agente, no de su configuración"*
- *"A2A con Agent-DID reemplaza API keys compartidas por identidad criptográfica con no-repudio"*

---

### Preguntas y respuestas del Módulo 4

**P1: ¿Por qué RFC-001 y no otro número? ¿No existe ya un RFC 001?**
Los RFC de la IETF son los estándares globales de Internet (RFC 1, de 1969, sobre ARPANET). Nuestro RFC-001 es un RFC interno del proyecto Agent-DID — la numeración "001" indica que es la primera especificación de este proyecto. Muchos proyectos open-source (Rust, React, Ethereum/EIPs) usan sus propias series de RFCs internas. No hay conflicto porque nuestro RFC vive en el namespace del proyecto.

**P2: El campo `bool exists` on-chain, ¿a qué se refiere?**
Es un patrón clásico de Solidity para distinguir entre un registro que fue creado con valores vacíos y uno que nunca existió. En Solidity, los mappings devuelven valores por defecto para cualquier clave (no lanzan error). Sin `exists`, no se puede saber si un DID no fue registrado o si fue registrado con datos vacíos. Se marca `true` solo al momento del registro.

**P3: Cuando se detecta anomalía en verificación HTTP, ¿cuál es el proceso para revocar?**
La RFC define la verificación y el rechazo, pero no prescribe un protocolo de notificación automática — intencionalmente, porque: (a) una firma inválida puede ser un falso positivo (error de red, bug), y (b) solo el owner/delegate puede revocar, no el servidor que detecta la anomalía. El patrón recomendado es: log de seguridad → alerta al controller → decisión humana o política automatizada → revocación on-chain si se confirma el incidente.

**P4: ¿Qué es SHOULD-02 "Normalización temporal homogénea"?**
Asegura que la hora sea consistente entre capas. El smart contract usa `block.timestamp` (Unix, número), mientras el SDK y el DID Document usan ISO-8601 (`"2026-02-22T14:00:00Z"`). Sin normalización, habría confusión y errores de comparación. La solución está en `time.ts`: conversiones bidireccionales para que el SDK siempre exponga ISO-8601.

**P5: ¿Qué es SHOULD-03?**
Modo de verificación interoperable con implementaciones externas. Asegura que si alguien implementa RFC-001 en Python, Go o Rust, las firmas generadas por el SDK TypeScript puedan verificarse y viceversa. Se logra con vectores de interoperabilidad compartidos en `interop-vectors.json`, como exámenes estandarizados donde las respuestas correctas son las mismas sin importar la implementación.

**P6: ¿SHOULD-04 a qué se refiere?**
Políticas de control de acceso para revocación a nivel de contrato. Asegura que no cualquiera pueda revocar cualquier agente. El contrato implementa: owner directo (quien registró), delegates autorizados (`setRevocationDelegate`), y transferencia de ownership. La función `_isAuthorizedRevoker()` verifica: `owner == actor || revocationDelegates[did][actor]`.

**P7: ¿Y SHOULD-05?**
Trazabilidad de evolución por versión. Cuando un DID Document evoluciona (cambia modelo, claves, capabilities), se puede rastrear el historial completo de versiones. Implementado con `getDocumentHistory(did)`. Permite responder: "¿qué modelo usaba este agente la semana pasada cuando firmó un contrato?" Analogía: como el historial de commits de Git.

**P8: ¿Un agente podría ser Controller o Owner?**
Técnicamente sí en ambos casos. Como controller: un DID de agente puede ser `controller` de otro agente (jerarquías de agentes). Como owner on-chain: con ERC-4337 (Account Abstraction), un agente puede tener su propio smart wallet y ejecutar transacciones. La RFC lo permite pero enfatiza que la cadena de responsabilidad siempre debería poder trazarse hasta un humano u organización.

**P9: ¿Un agente podría tener o recibir bitcoins?**
Sí, con matices. En EVM: con ERC-4337 puede tener ETH, MATIC, tokens ERC-20. Para Bitcoin específicamente: puede usar wrapped BTC (WBTC) como ERC-20, o tener una dirección Bitcoin asociada en su documento. El caso de uso #5 de la RFC cubre "agent-to-agent commerce with cryptographic non-repudiation". El SDK actual está enfocado en identidad; la integración con pagos sería extensión natural.

**P10: En A2A, ¿cómo sería la comunicación y verificación?**
Verificación bilateral: Alice firma su petición HTTP con su Ed25519, incluye `Signature-Agent` con su DID. Bob resuelve el DID de Alice, verifica la firma, verifica no-revocación. Bob responde firmando con su propia clave e incluyendo su propio `Signature-Agent`. Alice verifica a Bob de la misma forma. Cada lado verifica autenticidad, integridad, vigencia e identidad. La diferencia con A2A sin DID: reemplaza API keys compartidas por identidad criptográfica con no-repudio.

---

### Ejercicios del Módulo 4

**Ejercicio 1:** La RFC define 5 principios de diseño. Sin mirar el módulo, lista los 5 y explica con tus palabras por qué cada uno es importante.

**Respuesta del estudiante:**
1. Identidad fija, estado mutable: El DID del agente nunca cambia, pero sus configuraciones tales como el modelo, el prompt, las claves etc pueden cambiar
2. Mínimo on-chain: Solo se guarda un mínimo en el Blockchain, lo demás va en el DID document, esto disminuye costos y no hace toda la información del agente pública
3. Criptografía fuerte: La firma se verifica por matemáticas, el mensaje también se verifica por criptografía, al igual que el DID document, el modelo y el prompt
4. Agnóstico de Blockchain: Es compatible con cualquier EVM, ethereum, polygon etc
5. Interoperabilidad: Cualquier resolver puede resolver el DID document

**Evaluación: 7.5/10**
- Principios 1-2: ✅ Correctos con buenos ejemplos
- Principio 3: ⚠️ Parcial — faltó mencionar que Ed25519 viene **"by default"** (configurada de fábrica, sin que el desarrollador elija) y la curva específica recomendada
- Principio 4: ⚠️ Parcial — dijo "compatible con cualquier EVM" pero el principio dice **blockchain-agnostic** (podría funcionar con Solana, Cosmos, Hyperledger, no solo EVMs). EVM es solo la implementación de referencia
- Principio 5: ⚠️ Parcial — solo mencionó resolvers, pero la interoperabilidad se logra con dos mecanismos: **JSON-LD schema** (formato estandarizado) + **resolución universal**

---

**Ejercicio 2:** Dado el siguiente DID Document, clasifica cada campo como REQUIRED u OPTIONAL.

**Respuesta del estudiante:**
| Campo | Clasificación |
|---|---|
| `@context` | REQUIRED |
| `id` | REQUIRED |
| `controller` | REQUIRED |
| `created` | REQUIRED |
| `updated` | REQUIRED |
| `name` | OPTIONAL |
| `version` | OPTIONAL |
| `coreModelHash` | REQUIRED |
| `systemPromptHash` | REQUIRED |
| `capabilities` | OPTIONAL |
| `memberOf` | OPTIONAL |
| `complianceCertifications` | OPTIONAL |
| `verificationMethod` | REQUIRED |
| `authentication` | REQUIRED |

**Evaluación: 9.5/10**
- 14/14 campos correctos. Excelente dominio de la tabla normativa.
- Descuento menor por typo ("OPCTIONAL" en la respuesta original). En una presentación, estos detalles importan.

---

**Ejercicio 3:** Explica con tus palabras la diferencia entre controller y owner. Inventa un escenario realista donde sean diferentes personas/entidades.

**Respuesta del estudiante:**
El controller es aquel que es el responsable del agente y el owner es aquel que tiene privilegios para generar operaciones sobre la blockchain con el wallet del agente. Escenario: Un agente ha sido creado para entregar datos financieros corporativos a determinadas horas de la mañana sin que se filtre información antes de la noticia, el responsable del agente es la corporación XYZ. La corporación ha delegado en su departamento de TI a uno de los ingenieros (owner), el registro y todas las operaciones sobre el blockchain del agente.

**Evaluación: 8.0/10**
- Escenario: ✅ Excelente — realista, bien construido, demuestra separación de responsabilidades
- Definiciones: ⚠️ La definición de owner es imprecisa: dijo "con el wallet del agente" — pero el owner no controla el wallet del agente. El owner es la **dirección EVM que tiene control operacional del registro del DID en el smart contract** (puede revocar, asignar delegates, transferir ownership, actualizar `documentRef`). El wallet del agente (si tiene ERC-4337) es algo separado.
- Corrección clave: Owner ≠ "controla el wallet del agente". Owner = "controla el registro del DID en el contrato".

---

**Ejercicio 4:** ¿Por qué la arquitectura es "híbrida" (on-chain + off-chain)? ¿Qué pasaría si pusieras todo el DID Document en blockchain? Menciona al menos 3 consecuencias.

**Respuesta del estudiante:**
La arquitectura es híbrida buscando colocar lo mínimo necesario en la blockchain (Principio mínimo on-chain) y el resto de información en un documento de referencia, el DID document, buscando con esto:
A. Reducir consumo de gas
B. No dejar toda la información visible en la blockchain (más control granular de la información pública y privada)
C. Velocidad, debido a que las operaciones sobre la blockchain tardan segundos, solo las operaciones críticas se hacen aquí
D. Flexibilidad, si la mayoría de información está en el DID Document, esto reduce el consumo de gas y tiempos de procesamiento para operaciones no críticas

**Evaluación: 7.5/10**
- Puntos A-C: ✅ Sólidos y correctos (gas, privacidad, velocidad)
- Punto D: ⚠️ Se solapa con A y C (dice lo mismo de otra forma)
- Faltó mencionar: **Inmutabilidad rígida** — los datos en blockchain son permanentes. Si pones el prompt hash en blockchain y necesitas corregirlo, debes hacer otra transacción (más gas). Off-chain simplemente actualizas el documento.
- Dato faltante: **Costo concreto** — guardar 32 bytes on-chain ≈ 20,000 gas. Un DID Document completo podría costar decenas de dólares por registro.

---

**Ejercicio 5:** Traza el flujo completo del ciclo de vida de un agente: registro → uso → evolución → compromiso de clave → revocación → verificación post-revocación.

**Respuesta del estudiante:** Diagrama BPMN con 4 flujos independientes (Registro, Verificación, Revocación, Evolución).

**Evaluación: 6.5/10**
- ✅ Identifica correctamente los 4 flujos principales con actores correctos
- ✅ Notación BPMN clara y profesional
- ✅ El flujo de verificación muestra TRUE/FALSE como salida
- ⚠️ Falta secuencialidad: muestra 4 flujos independientes en vez del ciclo conectado que pedía el ejercicio (registro → uso → evolución → compromiso → revocación → verificación post-revocación como historia continua)
- ⚠️ Falta "compromiso de clave" como trigger de la revocación
- ⚠️ Falta "verificación post-revocación" (la parte crucial: después de revocar, alguien verifica y el resultado es FAIL)
- ⚠️ Typo: "SKD" en lugar de "SDK" en el último flujo

---

**Ejercicio 6:** La comunidad te pregunta: "¿Por qué debería confiar en su especificación si es solo un draft?" Responde en 30 segundos.

**Respuesta del estudiante:**
"No es solo una especificación, es una implementación validada y sus 5 principios resuelven casos de uso que hoy en día o no están cubiertos o generan dependencias externas que con matemáticas podemos resolver de manera independiente. Estamos usando arquitecturas, principios y especificaciones que ya han sido validadas/aprobadas ampliamente por organismos y la comunidad (W3C, algoritmos criptográficos ampliamente usados y auditados, etc). No estamos inventando criptografía ni partiendo de especificaciones desde cero, estamos extendiendo y tomando piezas del puzzle para solucionar la identidad descentralizada de agentes de IA."

**Evaluación: 8.0/10**
- ✅ "No es solo una especificación, es una implementación validada" — apertura potentísima
- ✅ "No estamos inventando criptografía" — genera confianza inmediata
- ✅ "Extendiendo piezas del puzzle" — buena metáfora
- ✅ Menciona estándares validados por organismos y comunidad
- ⚠️ Faltó el dato killer: **"16 controles de conformidad, todos en PASS. Puedes verificarlo tú mismo con un solo comando: `npm run conformance:rfc001`"** — evidencia ejecutable invencible
- ⚠️ Un poco largo para 30 segundos. Versión compacta sugerida: *"No es solo un draft — es una implementación funcional con 16 controles de conformidad, todos verificados. Está construida sobre W3C DIDs, Ed25519 y Solidity — no inventamos criptografía, extendemos estándares probados. Y puedes validarlo tú mismo con un comando: `npm run conformance:rfc001`."*

---

### Evaluación consolidada — Módulo 4

| Ejercicio | Nota | Fortaleza | Área de mejora |
|-----------|------|-----------|----------------|
| 1. Principios de diseño | 7.5 | Captura la esencia | "blockchain-agnostic" ≠ "EVM-compatible" |
| 2. REQUIRED/OPTIONAL | 9.5 | 14/14 correctos | Cuidar typos en presentación |
| 3. Controller vs Owner | 8.0 | Escenario excelente | Owner ≠ "wallet del agente" |
| 4. Arquitectura híbrida | 7.5 | 3 puntos sólidos | Evitar redundancia, agregar inmutabilidad |
| 5. Diagrama ciclo de vida | 6.5 | Notación profesional | Falta secuencialidad y post-revocación |
| 6. Respuesta 30 segundos | 8.0 | Apertura potente | Agregar dato killer (16 controles PASS) |

**Promedio Módulo 4: 7.8/10** ✅ Aprobado

**Progreso general:**

| Módulo | Promedio | Tendencia |
|--------|---------|-----------|
| Módulo 1 | 7.8/10 | — |
| Módulo 2 | 8.0/10 | ↑ |
| Módulo 3 | 7.2/10 | ↓ |
| Módulo 4 | 7.8/10 | ↑ |

**Análisis:** La comprensión conceptual es sólida y recuperándose. El punto fuerte sigue siendo los escenarios realistas y la visión arquitectónica. Las áreas de mejora: precisión en detalles técnicos (blockchain-agnostic vs EVM-compatible, owner vs wallet), conectar flujos como historia secuencial (no como procesos aislados), e incluir datos cuantitativos demoledores en respuestas de presentación (16 controles, `npm run conformance:rfc001`). Ante la comunidad, usar la estructura: **Afirmación → Dato verificable → Invitación a comprobarlo**.

---

## Módulo 5 — SDK Core: `AgentIdentity` línea por línea

### Objetivos de aprendizaje
- Dominar la clase principal `AgentIdentity` y su API completa
- Entender cada método, sus parámetros, su flujo interno y su mapeo a RFC-001
- Poder explicar el código con confianza
- Comprender el patrón fachada + inyección de dependencias
- Entender la separación static vs instancia y su razón técnica

### 5.1 Arquitectura general del SDK

El SDK tiene **4 capas**, organizadas como una pirámide de responsabilidades:

```
┌───────────────────────────────────────────────┐
│            AgentIdentity (Fachada)             │  ← Capa Core
│   La ÚNICA clase que el desarrollador usa      │
│   Todos los métodos son static o de instancia  │
├───────────────────────────────────────────────┤
│              types.ts + time.ts                │  ← Tipos y utilidades
│   Interfaces TypeScript + normalización        │
│   temporal (SHOULD-02)                         │
├───────────────────────────────────────────────┤
│              crypto/hash.ts                    │  ← Capa Crypto
│   SHA-256 (ethers) para hashes de IP           │
│   3 funciones, ~20 líneas                      │
├───────────────┬───────────────────────────────┤
│  Resolver     │         Registry              │  ← Capa Infraestructura
│  InMemory     │         InMemory              │
│  Universal    │         EvmAgentRegistry      │
│  HTTP Source  │         EthersContractClient   │
│  RPC Source   │                               │
└───────────────┴───────────────────────────────┘
```

**Patrón de diseño: Fachada con inyección de dependencias**
- **Fachada**: `AgentIdentity` es la única puerta de entrada. El desarrollador nunca necesita tocar el resolver, el registry ni las funciones de hash directamente.
- **Inyección de dependencias**: El resolver y el registry son intercambiables. Por defecto se usan `InMemoryDIDResolver` e `InMemoryAgentRegistry` (para testing), pero puedes sustituirlos por `UniversalResolverClient` y `EvmAgentRegistry` para producción.

```typescript
// Testing (por defecto, no necesitas hacer nada):
// resolver = InMemoryDIDResolver
// registry = InMemoryAgentRegistry

// Producción — inyectar implementaciones reales:
AgentIdentity.setResolver(miResolverDeProduccion);
AgentIdentity.setRegistry(miRegistryEVM);
```

**Punto clave**: El mismo código de `create()`, `signMessage()`, `verifySignature()` funciona IGUAL en testing que en producción. Solo cambia la infraestructura debajo.

### 5.2 El archivo `types.ts` — El contrato de datos

`types.ts` es el **diccionario del SDK** — define exactamente qué forma tiene cada objeto. Las interfaces principales reflejan directamente la tabla normativa de la RFC-001 (campos sin `?` son REQUIRED, con `?` son OPTIONAL):

```typescript
interface AgentMetadata {
  name: string;
  description?: string;         // OPTIONAL
  version: string;
  coreModelHash: string;        // REQUIRED — hash://sha256/...
  systemPromptHash: string;     // REQUIRED — hash://sha256/...
  capabilities?: string[];      // OPTIONAL
  memberOf?: string;            // OPTIONAL
}

interface VerificationMethod {
  id: string;                   // "did:agent:polygon:0x...#key-1"
  type: string;                 // "Ed25519VerificationKey2020"
  controller: string;           // DID del controller
  publicKeyMultibase?: string;  // "z<hex de la clave pública>"
  blockchainAccountId?: string; // "eip155:1:0x..." (para ERC-4337)
}

interface AgentDIDDocument {
  "@context": string[];
  id: string;
  controller: string;
  created: string;              // ISO-8601
  updated: string;              // ISO-8601
  agentMetadata: AgentMetadata;
  complianceCertifications?: VerifiableCredentialLink[];
  verificationMethod: VerificationMethod[];
  authentication: string[];     // IDs de los verification methods activos
}
```

**Parámetros de entrada y salida:**

```typescript
// Lo que pasas para crear (texto plano — el SDK hashea por ti):
interface CreateAgentParams {
  name: string;
  coreModel: string;          // "GPT-4-Turbo" — el SDK lo hashea
  systemPrompt: string;       // "You are..." — el SDK lo hashea
  capabilities?: string[];
}

// Lo que recibes:
interface CreateAgentResult {
  document: AgentDIDDocument;  // El documento completo
  agentPrivateKey: string;     // La clave privada Ed25519 (hex) — ¡GUÁRDALA!
}
```

### 5.3 El archivo `hash.ts` — La capa cripto

Solo 3 funciones, ~42 líneas. Es la capa más delgada del SDK:

```typescript
// 1. Hashea un string → SHA-256 hex
function hashPayload(payload: string): string {
  const bytes = ethers.toUtf8Bytes(payload);  // String → bytes UTF-8
  return ethers.sha256(bytes);                 // bytes → "0x1234abcd..."
}

// 2. Formatea el hash como URI
function formatHashUri(hashHex: string): string {
  const cleanHash = hashHex.startsWith('0x') ? hashHex.slice(2) : hashHex;
  return `hash://sha256/${cleanHash}`;         // "hash://sha256/1234abcd..."
}

// 3. Conveniencia: hashea + formatea en un paso
function generateAgentMetadataHash(payload: string): string {
  const rawHash = hashPayload(payload);
  return formatHashUri(rawHash);
}
```

Usa SHA-256 de ethers.js en vez de otra librería porque ethers ya está como dependencia para la interacción EVM — economía de dependencias.

### 5.4 El archivo `time.ts` — Normalización temporal (SHOULD-02)

Resuelve el problema de SHOULD-02: el smart contract guarda timestamps como strings Unix (`"1740787200"`), pero el SDK necesita ISO-8601 (`"2026-02-28T22:40:00Z"`):

```typescript
// ¿Es un timestamp Unix como string?
function isUnixTimestampString(value: string): boolean {
  return /^\d+$/.test(value.trim());  // Solo dígitos = Unix
}

// Unix string → ISO-8601
function unixStringToIso(value: string): string {
  const seconds = Number(value);
  const date = new Date(seconds * 1000);  // Unix en segundos, JS usa milisegundos
  return date.toISOString();
}

// ISO-8601 → Unix string
function isoToUnixString(value: string): string {
  const ms = Date.parse(value);
  return Math.floor(ms / 1000).toString();
}

// Normaliza: si es Unix lo convierte, si ya es ISO lo deja
function normalizeTimestampToIso(value?: string): string | undefined {
  if (!value) return undefined;
  return isUnixTimestampString(value) ? unixStringToIso(value) : value;
}
```

`normalizeTimestampToIso` es inteligente — detecta automáticamente si el valor es Unix o ISO y siempre retorna ISO. Los adaptadores EVM la usan para que el desarrollador nunca vea timestamps Unix.

### 5.5 La clase `AgentIdentity` — Estado estático vs instancia

La clase mezcla estado estático con instancia. Esta separación es una decisión de diseño importante:

```typescript
export class AgentIdentity {
  // ═══ Estado ESTÁTICO (compartido por toda la app) ═══
  private static resolver: DIDResolver = new InMemoryDIDResolver();
  private static registry: AgentRegistry = new InMemoryAgentRegistry();
  private static documentHistoryStore: Map<string, AgentDocumentHistoryEntry[]> = new Map();

  // ═══ Estado de INSTANCIA (por cada controller) ═══
  private signer: ethers.Signer;   // El wallet del controller
  private network: string;         // La red blockchain

  constructor(config: AgentIdentityConfig) {
    this.signer = config.signer;
    this.network = config.network || 'polygon';  // Default: Polygon
  }
}
```

| Tipo | Qué almacena | Por qué estático/instancia |
|------|-------------|---------------------------|
| `resolver` | Dónde buscar documentos | **Estático**: toda la app usa el mismo resolver |
| `registry` | Dónde anclar DIDs | **Estático**: toda la app usa el mismo registry |
| `documentHistoryStore` | Historial de cambios | **Estático**: accesible sin instancia |
| `signer` | Wallet del controller | **Instancia**: cada controller tiene su wallet |
| `network` | Red blockchain | **Instancia**: cada agente puede estar en distinta red |

**Consecuencia práctica**: `create()` es de **instancia** (necesita `this.signer` y `this.network`), pero `verifySignature()`, `resolve()`, `revokeDid()` son **estáticos** (no necesitan un controller — cualquiera puede verificar).

### 5.6 `create()` — Línea por línea

El método más importante del SDK. Crea la identidad completa de un agente en 8 pasos:

**Paso 1: Obtener la dirección del Controller**
```typescript
const controllerAddress = await this.signer.getAddress();
const controllerDid = `did:ethr:${controllerAddress}`;
```
El `signer` es un wallet ethers.js del humano/organización. Se obtiene su dirección Ethereum y se convierte al formato DID.

**Paso 2: Generar el DID único del agente**
```typescript
const timestamp = new Date().toISOString();
const nonce = ethers.hexlify(ethers.randomBytes(16));  // 16 BYTES = 128 bits
const rawAgentId = ethers.keccak256(
  ethers.toUtf8Bytes(`${controllerAddress}-${timestamp}-${nonce}`)
);
const agentDid = `did:agent:${this.network}:${rawAgentId}`;
```
Se concatenan 3 valores: dirección del controller + timestamp + nonce aleatorio de **16 bytes** (128 bits de entropía). Se hashea con Keccak-256 (hash nativo de Ethereum — consistencia con el ecosistema EVM). El nonce previene colisiones si el mismo controller crea agentes en el mismo milisegundo.

**Paso 3: Hashear la IP (modelo y prompt)**
```typescript
const coreModelHashUri = generateAgentMetadataHash(params.coreModel);
const systemPromptHashUri = generateAgentMetadataHash(params.systemPrompt);
```
El texto plano (`"GPT-4-Turbo"`, `"You are a support agent..."`) se convierte a `hash://sha256/...`. El texto plano **desaparece** en este punto — nunca se almacena.

**Paso 4: Generar claves Ed25519**
```typescript
const privateKeyBytes = ed25519.utils.randomPrivateKey();     // 32 bytes aleatorios
const publicKeyBytes = ed25519.getPublicKey(privateKeyBytes); // Derivar pública
const privateKeyHex = bytesToHex(privateKeyBytes);            // → string hex
const publicKeyHex = bytesToHex(publicKeyBytes);              // → string hex
```
Aquí nace la identidad criptográfica del agente. La clave privada se retorna al llamante en `CreateAgentResult.agentPrivateKey`. **El SDK no la almacena** — es responsabilidad del desarrollador guardarla de forma segura (Key Vault, HSM, etc.). Si se pierde, el agente no puede firmar.

**Paso 5: Generar wallet EVM (Account Abstraction)**
```typescript
const agentWallet = ethers.Wallet.createRandom();
```
Wallet EVM aleatorio para el `blockchainAccountId` — habilita ERC-4337 si se necesita en el futuro. Independiente de las claves Ed25519.

**Paso 6: Ensamblar el DID Document**
```typescript
const document: AgentDIDDocument = {
  "@context": ["https://www.w3.org/ns/did/v1", "https://agent-did.org/v1"],
  id: agentDid,
  controller: controllerDid,
  created: timestamp,
  updated: timestamp,         // Al crear, created === updated
  agentMetadata: { name, coreModelHash, systemPromptHash, capabilities, ... },
  verificationMethod: [verificationMethod],
  authentication: [verificationMethodId]    // #key-1
};
```
Documento JSON-LD completo, RFC-001 compliant. Nota: `created === updated` al momento de la creación.

**Paso 7: Registrar en resolver + registry + historial**
```typescript
AgentIdentity.resolver.registerDocument(document);        // Off-chain: guardar documento
await AgentIdentity.registry.register(                     // On-chain: anclar DID
  document.id, document.controller, 
  AgentIdentity.computeDocumentReference(document)
);
AgentIdentity.appendHistory(document, 'created');          // Historial: primera entrada
```
Tres registros simultáneos: documento al resolver (off-chain), DID + controller + referencia al registry (on-chain), entrada al historial.

**Paso 8: Retornar**
```typescript
return { document, agentPrivateKey: privateKeyHex };
```

### 5.7 `signMessage()` — La firma más simple

```typescript
public async signMessage(payload: string, agentPrivateKeyHex: string): Promise<string> {
  const messageBytes = new TextEncoder().encode(payload);     // String → bytes UTF-8
  const privateKeyBytes = hexToBytes(agentPrivateKeyHex);     // Hex → bytes
  const signatureBytes = ed25519.sign(messageBytes, privateKeyBytes);  // ¡Firma!
  return bytesToHex(signatureBytes);                           // bytes → hex (128 chars = 64 bytes)
}
```

4 líneas. Todo el poder criptográfico de Ed25519 en una función trivial.

### 5.8 `signHttpRequest()` — Web Bot Auth

Implementa la firma HTTP del RFC §6.5. Genera 5 headers:

```typescript
public async signHttpRequest(params: SignHttpRequestParams): Promise<Record<string, string>> {
  // Validaciones de entrada
  if (!params.method?.trim()) throw new Error("HTTP method is required");
  if (!params.url?.trim()) throw new Error("HTTP URL is required");

  // 1. Preparar componentes
  const timestamp = Math.floor(Date.now() / 1000).toString();  // Unix seconds
  const dateHeader = new Date().toUTCString();                   // RFC 2822
  const contentDigest = AgentIdentity.computeContentDigest(params.body);

  // 2. Construir la "signature base" (lo que se firma)
  const stringToSign = AgentIdentity.buildHttpSignatureBase({...});

  // 3. Firmar con Ed25519 y codificar en base64
  const signatureHex = await this.signMessage(stringToSign, params.agentPrivateKey);
  const signatureBase64 = Buffer.from(hexToBytes(signatureHex)).toString('base64');

  // 4. Retornar los 5 headers
  return {
    'Signature':       `sig1=:${signatureBase64}:`,
    'Signature-Input': `sig1=("@request-target" "host" "date" "content-digest");created=${timestamp};keyid="${verificationMethodId}";alg="ed25519"`,
    'Signature-Agent': params.agentDid,
    'Date':            dateHeader,
    'Content-Digest':  contentDigest
  };
}
```

**La "signature base" — lo que se firma exactamente:**
```
(request-target): post /api/data
host: api.example.com
date: Thu, 07 Mar 2026 15:30:00 GMT
content-digest: sha-256=:X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE=:
```

Si cualquier carácter cambia (método, URL, fecha o body), la firma se invalida.

**Nota sobre codificaciones:** Content-Digest usa base64 porque lo dicta el RFC 9530 (HTTP Digest Fields). La firma interna `signMessage()` usa hex por convención del ecosistema cripto/EVM. Cada formato está dictado por el estándar del contexto donde se usa.

### 5.9 `verifyHttpRequestSignature()` — La verificación completa

El método más complejo del SDK (~80 líneas). Tiene **7 gates** (puntos de falla):

```
Verificación HTTP
      │
 Gate 1: ¿Están los 5 headers presentes?
      │ (Signature, Signature-Input, Signature-Agent, Date, Content-Digest)
      │ Si falta alguno → return false
      │
 Gate 2: ¿El Content-Digest coincide con el body?
      │ Recalcula SHA-256 del body y compara
      │ Si no coincide → return false
      │
 Gate 3: Parse del Signature-Input dictionary
      │ Extraer label, componentes, keyid, created, alg
      │
 Gate 4: ¿Tiene keyid y created?
      │ Si faltan → skip esta firma
      │
 Gate 5: ¿Cubre los 4 componentes requeridos?
      │ (@request-target, host, date, content-digest)
      │ Si falta alguno → skip
      │
 Gate 6: ¿El timestamp está dentro del skew permitido?
      │ Default: ±300 segundos (5 minutos)
      │ Si está fuera → skip (posible replay attack)
      │
 Gate 7: ¿El keyid pertenece al Signature-Agent?
      │ keyid debe empezar con "${signatureAgent}#"
      │ Si no → skip
      │
 Verificación criptográfica final:
      │ Reconstruir signature base → verifySignature()
      │ Internamente: resolve DID → obtener publicKey → ed25519.verify()
      │
      ▼
  true (si alguna firma verifica) / false (si ninguna)
```

El método soporta **múltiples firmas** en una sola petición (`sig1`, `sig2`, etc.) — útil para escenarios de multifirma como aprobación bilateral A2A, co-firma agente+controller, transacciones inter-organizacionales y auditoría con testigo.

### 5.10 `verifySignature()` — La verificación base

```typescript
public static async verifySignature(
  did: string, payload: string, signature: string, keyId?: string
): Promise<boolean> {
  // 1. ¿Está revocado? → FAIL inmediatamente
  const isRevoked = await AgentIdentity.registry.isRevoked(did);
  if (isRevoked) return false;

  // 2. Resolver el DID Document
  const didDoc = await AgentIdentity.resolve(did);

  // 3. Filtrar verification methods candidatos
  const activeKeyIds = new Set(didDoc.authentication || []);
  const candidateMethods = didDoc.verificationMethod.filter((method) => {
    if (!method.publicKeyMultibase) return false;
    if (keyId) return method.id === keyId && activeKeyIds.has(method.id);
    return activeKeyIds.has(method.id);
  });

  // 4. Probar cada candidato
  for (const vm of candidateMethods) {
    const publicKeyHex = vm.publicKeyMultibase!.startsWith('z')
      ? vm.publicKeyMultibase!.slice(1) : vm.publicKeyMultibase!;
    const valid = ed25519.verify(signatureBytes, messageBytes, hexToBytes(publicKeyHex));
    if (valid) return true;
  }
  return false;
}
```

**¿Por qué verifica revocación ANTES de resolver?** Dos razones:
1. **Seguridad**: Un DID revocado es una identidad muerta — no importa si la firma es matemáticamente válida
2. **Eficiencia**: `isRevoked()` es una consulta simple al registry. Si está revocado, te ahorras el costo de resolver el documento completo (HTTP requests, IPFS lookups, etc.)

### 5.11 `resolve()` y `revokeDid()`

```typescript
// Resolve: busca el documento, pero primero verifica que no esté revocado
public static async resolve(did: string): Promise<AgentDIDDocument> {
  const isRevoked = await AgentIdentity.registry.isRevoked(did);
  if (isRevoked) throw new Error(`DID is revoked: ${did}`);  // Lanza error (no silencia)
  return AgentIdentity.resolver.resolve(did);
}

// Revoke: marca como revocado y registra en historial
public static async revokeDid(did: string): Promise<void> {
  const existing = await AgentIdentity.resolve(did);
  await AgentIdentity.registry.revoke(did);
  AgentIdentity.appendHistory(existing, 'revoked');
}
```

`resolve()` lanza **error** si está revocado (a diferencia de `verifySignature()` que retorna `false`). Intencional: si algo intenta resolver un DID revocado, es un error que debe propagarse.

### 5.12 `updateDidDocument()` — Evolución del documento

```typescript
public static async updateDidDocument(
  did: string, patch: UpdateAgentDocumentParams
): Promise<AgentDIDDocument> {
  const existing = await AgentIdentity.resolve(did);
  const now = new Date().toISOString();

  const updatedDocument: AgentDIDDocument = {
    ...existing,
    updated: now,
    agentMetadata: {
      ...existing.agentMetadata,
      description: patch.description ?? existing.agentMetadata.description,
      version: patch.version ?? existing.agentMetadata.version,
      coreModelHash: patch.coreModel
        ? generateAgentMetadataHash(patch.coreModel)  // Re-hashea si cambió
        : existing.agentMetadata.coreModelHash,
      // ... igual para systemPrompt, capabilities, memberOf
    }
  };

  AgentIdentity.resolver.registerDocument(updatedDocument);
  await AgentIdentity.registry.setDocumentReference(did, ...);
  AgentIdentity.appendHistory(updatedDocument, 'updated');
  return updatedDocument;
}
```

El patrón `??` (nullish coalescing): si el patch trae un valor, se usa ese. Si es `null`/`undefined`, se mantiene el actual. Si cambias `coreModel`, el SDK lo re-hashea automáticamente — pasas texto plano, no el hash.

### 5.13 `rotateVerificationMethod()` — Rotación de claves

```typescript
public static async rotateVerificationMethod(did: string): Promise<RotateVerificationMethodResult> {
  const existing = await AgentIdentity.resolve(did);

  // 1. Calcular siguiente índice (#key-2, #key-3, etc.)
  const nextIndex = Math.max(...keyIndexes) + 1;

  // 2. Generar NUEVA clave Ed25519
  const privateKeyBytes = ed25519.utils.randomPrivateKey();
  const publicKeyBytes = ed25519.getPublicKey(privateKeyBytes);

  // 3. Documento actualizado
  const updatedDocument = {
    ...existing,
    updated: new Date().toISOString(),
    verificationMethod: [...existing.verificationMethod, newVerificationMethod],  // AGREGA
    authentication: [verificationMethodId]  // REEMPLAZA (solo la nueva)
  };

  // 4. Registrar
  AgentIdentity.resolver.registerDocument(updatedDocument);
  await AgentIdentity.registry.setDocumentReference(did, ...);
  AgentIdentity.appendHistory(updatedDocument, 'rotated-key');

  return { document: updatedDocument, verificationMethodId, agentPrivateKey: privateKeyHex };
}
```

**El detalle crítico:**
- `verificationMethod` **acumula** — la clave vieja (#key-1) sigue para verificación de firmas históricas
- `authentication` **reemplaza** — solo la nueva clave (#key-2) es válida para firmas nuevas

¿Por qué no eliminar la clave vieja? Si un agente firmó un contrato hace 3 meses con #key-1, necesitas la clave pública para verificar ese contrato. Al mantenerla en `verificationMethod` (pero fuera de `authentication`), puedes verificar firmas históricas buscando por `keyId="#key-1"`.

### 5.14 `getDocumentHistory()` — Trazabilidad (SHOULD-05)

```typescript
public static getDocumentHistory(did: string): AgentDocumentHistoryEntry[] {
  const history = AgentIdentity.documentHistoryStore.get(did) || [];
  return JSON.parse(JSON.stringify(history));  // Deep clone para inmutabilidad
}
```

Cada acción agrega una entrada vía `appendHistory()`:
```
Revision 1: created     → 2026-03-01T00:00:00Z → v1.0.0
Revision 2: updated     → 2026-03-15T00:00:00Z → v1.1.0 (cambió modelo)
Revision 3: rotated-key → 2026-04-01T00:00:00Z → v1.1.0 (rotó clave)
Revision 4: revoked     → 2026-06-01T00:00:00Z → v1.1.0 (comprometido)
```

**Estado actual del almacenamiento**: El historial se guarda en un `Map` estático en RAM — se pierde cuando el proceso termina. En producción debería migrarse a un backend persistente (IPFS para documentos inmutables + base de datos para consultas + eventos on-chain para operaciones de registro). El checklist SHOULD-05 lo reconoce: *"Maintain historical persistence when migrating to external backend"*.

### 5.15 Inyección de dependencias — De testing a producción

```typescript
// Cambiar resolver y registry:
public static setResolver(resolver: DIDResolver): void { ... }
public static setRegistry(registry: AgentRegistry): void { ... }

// Perfiles de producción preconfigurados:
public static useProductionResolverFromHttp(config): void { ... }
public static useProductionResolverFromJsonRpc(config): void { ... }
public static useProductionResolver(config): void { ... }
```

| Método | Source | Uso |
|--------|--------|-----|
| `useProductionResolverFromHttp()` | HTTP/HTTPS + IPFS gateways | Documentos en HTTP o IPFS |
| `useProductionResolverFromJsonRpc()` | JSON-RPC 2.0 | Servicio RPC centralizado/descentralizado |
| `useProductionResolver()` | Custom | Tu propia implementación |

Todos internamente crean un `UniversalResolverClient` con: registry + documentSource + fallback (InMemory) + cache + observabilidad.

### 5.16 El `index.ts` — Lo que se exporta

```typescript
export { AgentMetadata, AgentDIDDocument, CreateAgentParams, ... } from './core/types';
export { AgentIdentity, AgentIdentityConfig, ... } from './core/AgentIdentity';
```

Solo los **tipos** y la **clase `AgentIdentity`**. Las capas internas (hash.ts, time.ts, resolvers, registries) son detalles de implementación — el consumidor del SDK no las ve directamente.

### 5.17 Resumen visual — Flujo completo

```
┌─ Developer ────────────────────────────────────────────────────┐
│                                                                │
│  const identity = new AgentIdentity({ signer: wallet });       │
│  const { document, agentPrivateKey } = await identity.create({ │
│    name: 'Bot', coreModel: 'GPT-4', systemPrompt: '...'       │
│  });                                                           │
│                                                                │
│  ┌─ create() internamente ──────────────────────────────────┐  │
│  │  1. wallet.getAddress() → controllerDid                  │  │
│  │  2. keccak256(addr+time+nonce) → agentDid                │  │
│  │  3. generateAgentMetadataHash() → hashes IP              │  │
│  │  4. ed25519.utils.randomPrivateKey() → keypair           │  │
│  │  5. Ensamblar DID Document JSON-LD                       │  │
│  │  6. resolver.registerDocument() → off-chain              │  │
│  │  7. registry.register() → on-chain                       │  │
│  │  8. appendHistory('created')                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  const sig = await identity.signMessage('hello', privateKey);  │
│  ┌─ signMessage() ───────────────────────────────┐             │
│  │  TextEncoder.encode → ed25519.sign → bytesToHex│            │
│  └────────────────────────────────────────────────┘            │
│                                                                │
│  const ok = await AgentIdentity.verifySignature(did, 'hello',  │
│    sig);                                                       │
│  ┌─ verifySignature() ──────────────────────────────────────┐  │
│  │  1. isRevoked(did)? → false ✓                            │  │
│  │  2. resolve(did) → DID Document                          │  │
│  │  3. Filtrar authentication → candidateMethods            │  │
│  │  4. ed25519.verify(sig, msg, pubKey) → true ✓            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  await AgentIdentity.revokeDid(did);                           │
│  ┌─ revokeDid() ──────────────────────────────┐               │
│  │  1. resolve(did) → verificar que existe     │               │
│  │  2. registry.revoke(did) → on-chain         │               │
│  │  3. appendHistory('revoked')                │               │
│  └─────────────────────────────────────────────┘               │
│                                                                │
│  const ok2 = await AgentIdentity.verifySignature(did, ...);    │
│  // → false (revocado — gate 1 lo detiene)                     │
└────────────────────────────────────────────────────────────────┘
```

### Talking Points para la comunidad
- *"El SDK usa el patrón fachada: una sola clase `AgentIdentity` expone toda la funcionalidad"*
- *"Las dependencias son mínimas y auditadas — @noble/curves para cripto, ethers para EVM"*
- *"La inyección de dependencias permite usar el mismo SDK en testing (InMemory) y producción (EVM + HTTP) sin cambiar una línea de lógica"*
- *"El historial de documentos da trazabilidad completa — cada cambio queda registrado con acción, timestamp y referencia"*
- *"La verificación HTTP tiene 7 gates de seguridad — desde presencia de headers hasta skew temporal anti-replay"*
- *"Las claves rotadas no se eliminan del documento — mantienen la capacidad de verificar firmas históricas"*

---

### Preguntas y respuestas del Módulo 5

**P1: ¿Qué casos de ejemplo pueden tener escenarios multifirma?**
El SDK soporta múltiples firmas porque `verifyHttpRequestSignature()` parsea el `Signature-Input` como un dictionary con `sig1`, `sig2`, etc. Escenarios reales:
- **Aprobación bilateral A2A**: Agente analista (sig1) + agente supervisor (sig2) ambos firman una orden de compra
- **Co-firma agente + controller**: Operaciones críticas (>$10K) requieren firma del agente + aprobación del humano controller
- **Transacción inter-organizacional**: Agente empresa A (sig1) propone compra, agente empresa B (sig2) acepta — ambas firmas en la petición final al escrow
- **Auditoría con testigo**: Agente operativo (sig1) + agente auditor (sig2) para registros sensibles (PII, datos médicos)
- **Quórum de agentes**: 3 de 5 agentes deben coincidir en un diagnóstico para validar la petición

Nota: El SDK actual verifica que al menos una firma sea válida. Para políticas de "todas deben verificar" o "N de M", se necesitaría lógica adicional — candidato para extensión.

**P2: El histórico de cambios, ¿dónde se almacena? ¿Off-chain?**
Actualmente en **RAM** (un `Map<string, AgentDocumentHistoryEntry[]>` estático). Se pierde cuando el proceso termina. En producción, la estrategia recomendada es un modelo **híbrido**: documentos en IPFS (inmutables con CID) + índice en base de datos (consultas rápidas) + eventos on-chain (AgentRegistered, AgentRevoked, etc. que ya existen como historial implícito en la blockchain). El checklist SHOULD-05 reconoce esta migración pendiente.

---

### Ejercicios del Módulo 5

**Ejercicio 1:** En `create()`, ¿por qué se usa `keccak256` para generar el DID y no `SHA-256`? ¿Qué pasaría si dos controllers crean un agente en el mismo milisegundo?

**Respuesta del estudiante:**
El keccak256 es nativo de Ethereum, el cual ya está como dependencia para la interacción EVM, usar una librería más para realizar el mismo trabajo es innecesario (economía de dependencias). La implementación en la creación de un DID agent contiene la generación de un nonce aleatorio de 16 bits con el fin de evitar colisiones en el mismo milisegundo.

**Evaluación: 7.5/10**
- ✅ Keccak-256 nativo de Ethereum y economía de dependencias — correcto
- ✅ Nonce aleatorio previene colisiones — correcto
- ⚠️ Dijo "16 bits" — son **16 bytes** (128 bits). `ethers.randomBytes(16)` genera 16 bytes. 16 bits = 65,536 combinaciones (inseguro). 16 bytes = 2¹²⁸ combinaciones (prácticamente imposible de colisionar).
- ⚠️ Faltó mencionar **consistencia de ecosistema**: las direcciones Ethereum mismas se derivan de Keccak-256, usar SHA-256 para el DID sería inconsistente con el formato `0x...` del ecosistema EVM

---

**Ejercicio 2:** El SDK retorna `agentPrivateKey` en `CreateAgentResult`. ¿Dónde debería guardarse? ¿Qué pasa si se pierde?

**Respuesta del estudiante:**
Hay varias soluciones, por ejemplo un key vault en Azure, o su correspondiente mecanismo en cada nube (Amazon, Oracle, Google). Es esencial que el almacenamiento de la clave privada sea tratado con sumo cuidado y protección y es responsabilidad del programador/arquitecto. Si se pierde, el agente pierde la capacidad de firma y por ende su identidad no puede ser verificada.

**Evaluación: 8.5/10**
- ✅ Azure Key Vault como ejemplo concreto y equivalentes multi-cloud
- ✅ Responsabilidad del desarrollador/arquitecto
- ✅ Consecuencia correcta: sin clave = sin firma
- ⚠️ Faltó mencionar **HSMs** (Hardware Security Modules) — hardware físico dedicado, nivel máximo de seguridad
- ⚠️ Dato importante: se puede ejecutar `rotateVerificationMethod()` para generar nueva clave ANTES de perder la vieja. Si ya la perdiste completamente sin backup, la identidad del agente está efectivamente muerta

---

**Ejercicio 3:** En `verifySignature()`, ¿en qué escenario real habría más de un candidato? Traza paso a paso.

**Respuesta del estudiante:**
Hay más de un `candidateMethods` cuando ha habido rotación de claves. Cuando se pasa un `keyId` específico, se prueba directamente ese candidato; si no, se prueba con todas las firmas activas en `authentication`.

**Evaluación: 6.0/10**
- ✅ Identifica la rotación como escenario
- ✅ Comportamiento con/sin keyId correcto
- ⚠️ No trazó paso a paso como pedía el ejercicio
- ⚠️ Error conceptual: después de `rotateVerificationMethod()`, `authentication` solo contiene la clave nueva. La clave vieja queda en `verificationMethod` pero ya no en `authentication`, por lo que el filtro `activeKeyIds.has(method.id)` solo matcheará UNA clave. El `for` loop existe como diseño defensivo para el caso general (implementaciones custom con múltiples claves activas simultáneas)

---

**Ejercicio 4:** Después de rotación, ¿qué pasa con `verificationMethod` y `authentication`? ¿Por qué no se elimina la clave vieja?

**Respuesta del estudiante:**
El array agrega (acumula), la clave vieja continúa en el documento como referencia histórica y en el `authentication` se reemplaza el `verificationMethodId`.

**Evaluación: 7.0/10**
- ✅ `verificationMethod` acumula y `authentication` reemplaza — correcto
- ✅ Referencia histórica — parcialmente correcto
- ⚠️ Faltó la razón funcional principal: la clave vieja se mantiene para **verificar firmas antiguas**. Si un agente firmó algo con #key-1 hace 3 meses y luego rotó a #key-2, necesitas la clave pública #key-1 para verificar esa firma histórica. Sin ella en el documento, pierdes esa capacidad.

---

**Ejercicio 5:** ¿Por qué Content-Digest usa base64 y `signMessage()` retorna hex? ¿Qué estándar dicta cada formato?

**Respuesta del estudiante:**
Content-Digest garantiza que el mensaje no ha sido modificado, mientras que signMessage firma el mensaje con la clave privada. El primero busca integridad; el segundo busca autenticidad.

**Evaluación: 3.5/10**
- ⚠️ Respondió una pregunta diferente. La pregunta era sobre **codificación** (formato de representación: base64 vs hex), no sobre función (integridad vs autenticidad).
- La respuesta esperada: Content-Digest usa base64 porque lo dictan el RFC 9530 (HTTP Digest Fields) y RFC 8941 (HTTP Structured Fields) — valores binarios en headers HTTP van en base64. signMessage() usa hex por convención del ecosistema cripto/EVM — todas las herramientas (ethers.js, @noble/curves, direcciones 0x...) esperan hex. No es decisión arbitraria: cada formato está dictado por el estándar de su contexto.

---

**Ejercicio 6:** ¿Por qué `verifySignature()` es `static` pero `create()` es de instancia?

**Respuesta del estudiante:**
`verifySignature` no requiere de una instancia, es resolución y matemáticas. `create` requiere generar una instancia concreta de un agent DID Document específica del agente.

**Evaluación: 6.5/10**
- ✅ Dirección correcta: verify no necesita instancia, create sí
- ⚠️ Faltó la razón técnica concreta: `create()` necesita `this.signer` (el wallet del controller) y `this.network` (la red blockchain) — propiedades de instancia. `verifySignature()` solo necesita `resolver` y `registry` que son estáticos. No es que create necesite "instancia del agente" (el agente aún no existe) sino que necesita saber **quién** lo crea (signer) y **dónde** (network).

---

### Evaluación consolidada — Módulo 5

| Ejercicio | Nota | Fortaleza | Área de mejora |
|-----------|------|-----------|----------------|
| 1. keccak256 vs SHA-256 | 7.5 | Economía de dependencias | 16 bytes ≠ 16 bits, consistencia ecosistema |
| 2. Almacenamiento clave privada | 8.5 | Ejemplos multi-cloud | HSMs, rotate-before-lost |
| 3. Múltiples candidateMethods | 6.0 | Identifica rotación | No trazó paso a paso |
| 4. verificationMethod vs authentication | 7.0 | Mecanismo correcto | Faltó razón funcional (firmas históricas) |
| 5. Base64 vs hex | 3.5 | — | Respondió función en vez de codificación |
| 6. Static vs instancia | 6.5 | Dirección correcta | Faltó this.signer y this.network |

**Promedio Módulo 5: 6.5/10** ✅ Aprobado

**Progreso general:**

| Módulo | Promedio | Tendencia |
|--------|---------|-----------|
| Módulo 1 | 7.8/10 | — |
| Módulo 2 | 8.0/10 | ↑ |
| Módulo 3 | 7.2/10 | ↓ |
| Módulo 4 | 7.8/10 | ↑ |
| Módulo 5 | 6.5/10 | ↓ |

**Análisis:** Este fue el módulo más técnico y se refleja en los resultados. Las fortalezas siguen siendo las decisiones arquitectónicas (ejercicios 1 y 2). Las áreas críticas de mejora: (1) **Precisión de unidades** — 16 bits vs 16 bytes es un error de 8x que en un contexto técnico/presentación importa mucho; (2) **Leer exactamente qué se pregunta** — el ejercicio 5 preguntaba formato de codificación y se respondió sobre función, ante la comunidad distinguir estas capas es fundamental; (3) **Trazar flujos paso a paso** — cuando un ejercicio pide secuencia, seguir el código línea por línea, no responder de forma general. Consejo: **Afirmación → Variable/línea de código concreta → Consecuencia**.

---

## Módulo 6 — Resolvers y Registry: de local a producción

### Objetivos de aprendizaje
- Entender los 4 tipos de resolver disponibles
- Dominar la arquitectura del UniversalResolverClient
- Comprender HTTP y JSON-RPC como fuentes de documentos
- Conocer el sistema de registry (InMemory y EVM)
- Entender caching, failover y observabilidad

### 6.1 Resolver — ¿Qué es y por qué importa?
- Componente que traduce un DID → su DID Document
- Sin resolver, nadie puede verificar la identidad de un agente
- Analogía: el resolver es al DID lo que DNS es a un dominio

### 6.2 InMemoryDIDResolver
- `Map<string, AgentDIDDocument>` en memoria
- Operaciones: `registerDocument()`, `resolve()`, `remove()`
- Deep-clona documentos (JSON.parse/stringify) para evitar mutación accidental
- Uso: testing, desarrollo local, demos

### 6.3 UniversalResolverClient — El resolver de producción
- **Componentes:** Registry + DocumentSource + FallbackResolver + Cache
- **Flujo de resolución:**
  1. Busca en cache (TTL-based) → si hit, retorna inmediatamente
  2. Si miss, consulta el registry (on-chain) → obtiene `documentRef`
  3. Busca el documento en el document source (HTTP, JSON-RPC, IPFS)
  4. Si falla, intenta fallback resolver (ej: InMemory)
  5. Valida que el DID del documento coincida
  6. Cachea y retorna
- **Cache TTL:** configurable (default 60s)
- **Observabilidad:** emite `ResolverResolutionEvent` en cada etapa
  - Stages: `cache-hit`, `cache-miss`, `registry-lookup`, `source-fetch`, `source-fetched`, `fallback`, `resolved`, `error`
- **Estadísticas:** `getCacheStats()` → `{ hits, misses, size }`

### 6.4 HttpDIDDocumentSource
- Obtiene documentos por HTTP/HTTPS
- **IPFS support:** detecta `ipfs://` → resuelve vía gateways configurables
  - Default gateways: Cloudflare IPFS + ipfs.io
- **Multi-URL failover:** si hay múltiples endpoints, intenta cada uno
- **Inyección de fetch:** puedes pasar tu propia implementación de `fetch`
- **Manejo de errores:** distingue entre 404 (null) y errors de red (throw)

### 6.5 JsonRpcDIDDocumentSource
- Obtiene documentos vía JSON-RPC 2.0
- Método por defecto: `agent_resolveDocumentRef`
- **Multi-endpoint failover:** intenta cada endpoint secuencialmente
- **Custom transport:** puedes inyectar tu propio mecanismo de transporte
- **Error codes:** 404 y -32004 se tratan como "not found" (null)
- **Custom headers:** configurable (ej: auth tokens)

### 6.6 Registry — ¿Qué es?
- Componente que almacena el ancla mínima de cada DID
- Record: `{ did, controller, createdAt, revokedAt?, documentRef? }`
- Operaciones: `register()`, `revoke()`, `getRecord()`, `isRevoked()`, `setDocumentReference()`
- Dos implementaciones: InMemory y EVM

### 6.7 InMemoryAgentRegistry
- `Map<string, AgentRegistryRecord>` en memoria
- Registro idempotente (si ya existe, no error)
- Guard checks: setDocumentReference y revoke requieren que exista el DID

### 6.8 EvmAgentRegistry — Adaptador blockchain
- Implementa `AgentRegistry` delegando a `EvmAgentRegistryContract`
- Soporta confirmación de transacción opcional (`awaitTransactionConfirmation`)
- Register: llama `registerAgent()` + opcionalmente `setDocumentRef()`
- Revoke: llama `revokeAgent()`
- Normaliza timestamps Unix → ISO-8601

### 6.9 EthersAgentRegistryContractClient
- Wraps de ethers.js Contract para implementar `EvmAgentRegistryContract`
- Decodifica tuplas on-chain (tanto array como object form)
- Usa `normalizeTimestampToIso()` para convertir Unix strings a ISO

### 6.10 Configuración de perfiles de producción
- `useProductionResolverFromHttp()`: conecta HTTP + IPFS gateways + cache + events
- `useProductionResolverFromJsonRpc()`: conecta JSON-RPC endpoints + cache + events
- `useProductionResolver()`: configuración manual con componentes custom

### Ejercicios del Módulo 6
1. Configura un UniversalResolverClient con 2 endpoints HTTP y verifica que el failover funciona
2. Explica qué pasa cuando un endpoint HTTP falla pero el de IPFS está disponible
3. ¿Por qué el cache TTL es importante para disponibilidad?
4. Traza el flujo de resolución cuando el DID no está en cache

### Talking Points para la comunidad
- "El resolver es diseñado para producción: cache TTL, failover multi-endpoint, IPFS gateways, observabilidad"
- "Soportamos HTTP y JSON-RPC como fuentes — compatible con cualquier infraestructura"
- "La telemetría de resolución permite monitorear SLOs en producción real"
- "IPFS nos da almacenamiento descentralizado sin costo de gas para los documentos completos"

---

## Módulo 7 — Smart Contract, Seguridad y Preparación para la Comunidad

### Objetivos de aprendizaje
- Entender el smart contract `AgentRegistry.sol` en detalle
- Conocer el modelo de seguridad: delegación, transferencia de ownership, políticas de revocación
- Comprender las 11+5 validaciones de conformancia
- Prepararse para presentar el proyecto a la comunidad

### 7.1 AgentRegistry.sol — Anatomía
- **Struct `AgentRecord`:** did, controller, createdAt, revokedAt, documentRef, exists, owner
- **Almacenamiento:** `mapping(string => AgentRecord)` — DID string como key
- **Timestamps:** almacenados como string de Unix epoch (convertidos con `_timestampToString()`)

### 7.2 Funciones del contrato
| Función | Acceso | Descripción |
|---|---|---|
| `registerAgent(did, controller)` | Público (una vez) | Registra nuevo agente, asigna `msg.sender` como owner |
| `revokeAgent(did)` | Owner + delegados | Revoca DID permanentemente |
| `setDocumentRef(did, documentRef)` | Solo owner | Actualiza referencia al documento off-chain |
| `setRevocationDelegate(did, delegate, authorized)` | Solo owner | Autoriza/desautoriza delegados de revocación |
| `transferAgentOwnership(did, newOwner)` | Solo owner | Transfiere ownership operativo |
| `getAgentRecord(did)` | View (público) | Retorna el registro on-chain |
| `isRevoked(did)` | View (público) | Verifica estado de revocación |
| `isRevocationDelegate(did, delegate)` | View (público) | Verifica si una dirección es delegado |

### 7.3 Eventos
- `AgentRegistered(did, controller, createdAt)` — agente registrado
- `AgentRevoked(did, revokedAt)` — agente revocado
- `RevocationDelegateUpdated(did, delegate, authorized)` — delegado actualizado
- `AgentOwnershipTransferred(did, previousOwner, newOwner)` — ownership transferido

### 7.4 Modelo de revocación
- **Owner revocation:** el owner del registro puede revocar directamente
- **Delegated revocation:** el owner puede autorizar delegados con `setRevocationDelegate()`
- **Authorization check:** `_isAuthorizedRevoker()` → owner || delegado autorizado
- **Permanencia:** una vez revocado, no hay mecanismo de "un-revoke"
- **Caso de uso:** una organización puede tener un equipo de seguridad como delegados de revocación

### 7.5 Ownership Transfer
- El owner puede transferir el control operativo a otra dirección
- Emite evento para auditabilidad
- No afecta al `controller` del DID Document (son capas diferentes)

### 7.6 Seguridad y modelo de amenazas
| Amenaza | Mitigación |
|---|---|
| Robo de clave privada | Revocación inmediata, keys nunca salen del proceso del agente |
| Suplantación de DID | DID derivado de hash criptográfico, verificable |
| Manipulación de documento | Hash on-chain asegura integridad |
| Replay attack HTTP | Timestamp en firmas + skew máximo (300s) |
| Manipulación de registry | Smart contract con control de acceso owner-only |

### 7.7 Mejores prácticas de seguridad
1. Almacenar claves privadas en secure enclaves o HSMs
2. TLS para toda comunicación con resolvers
3. Validar hash del documento vs ancla on-chain en cada resolución
4. Rate limiting en endpoints de resolver
5. Monitorear eventos de revocación inesperados
6. Rotación proactiva de claves (recomendado cada 90 días)
7. Principio de mínimo privilegio en capabilities declaradas

### 7.8 Conformancia — Los 16 controles
- **11 MUST:** campos requeridos, operaciones core, separación on/off-chain
- **5 SHOULD:** resolver universal, normalización temporal, interoperabilidad, políticas de revocación, trazabilidad
- **Estado actual:** 16/16 PASS
- **Comando de validación:** `npm run conformance:rfc001`

### 7.9 Preparación para la comunidad
#### ¿Qué preguntas te van a hacer?
1. "¿En qué se diferencia de did:ethr o did:web?" → Metadatos de agente, protección IP, flotas
2. "¿Por qué no usan ZKPs?" → Roadmap Phase 3 (F3-03), se planea para verificación de capabilities
3. "¿Cómo escala?" → Mínimo on-chain, off-chain escalable horizontalmente
4. "¿Funciona con LangChain/CrewAI?" → Plugin en roadmap (F1-03, F2-04)
5. "¿Hay auditoría del contrato?" → En roadmap (F1-05 Slither/Mythril, F3-04 formal)
6. "¿Qué blockchain usan?" → Cualquier EVM, referencia en Polygon
7. "¿Cómo revoco si pierdo las claves?" → Delegados de revocación autorizados previamente
8. "¿Es compatible con W3C?" → Sí, extiende DID Core 1.0

#### Estructura recomendada para la presentación
1. **Problema** (2 min): los agentes IA actúan sin identidad verificable
2. **Solución** (3 min): Agent-DID — pasaporte digital para agentes
3. **Demo en vivo** (5 min): crear → firmar → verificar → revocar
4. **Arquitectura** (3 min): diagrama híbrido on-chain/off-chain
5. **RFC-001** (2 min): estándar abierto, 16/16 controles pasando
6. **Roadmap** (2 min): Python SDK, LangChain plugin, W3C submission
7. **Call to action** (1 min): contribuir, usar, dar feedback

### Ejercicios del Módulo 7
1. Lee `AgentRegistry.sol` completo y explica cada función
2. ¿En qué escenario usarías `setRevocationDelegate()`?
3. Ejecuta `npm run conformance:rfc001` y lee cada resultado
4. Prepara una demostración en vivo del flujo crear → firmar → verificar → revocar
5. Practica respondiendo las 8 preguntas frecuentes de la sección 7.9

### Talking Points para la comunidad
- "RFC-001 es un estándar abierto — no un producto propietario"
- "Tenemos 16 controles de conformancia comprobados en CI"
- "El contrato soporta delegación de revocación — modelo de gobernanza empresarial"
- "Toda la operación cripto usa bibliotecas auditadas — no reinventamos la rueda"
- "El roadmap incluye Python SDK, plugins para frameworks de agentes, y submission a W3C"

---

## Resumen de Tecnologías Cubiertas

| Tecnología | Dónde se aprende | Uso en el proyecto |
|---|---|---|
| W3C DID Core 1.0 | Módulo 2 | Fundamento del estándar de identidad |
| JSON-LD | Módulo 2 | Formato del DID Document con semántica |
| Ed25519 (EdDSA) | Módulo 3 | Firma y verificación de mensajes y HTTP |
| SHA-256 | Módulo 3 | Hashing de metadata para protección de IP |
| RFC 9421 (HTTP Message Signatures) | Módulo 3 | Autenticación HTTP agent-to-service |
| TypeScript | Módulos 5-6 | Lenguaje de implementación del SDK |
| ethers.js v6 | Módulos 5-6 | Interacción con blockchain EVM |
| @noble/curves | Módulos 3, 5 | Criptografía Ed25519 |
| JSON-RPC 2.0 | Módulo 6 | Protocolo para resolución de documentos |
| IPFS | Módulo 6 | Almacenamiento descentralizado de documentos |
| Solidity | Módulo 7 | Smart contract para registry on-chain |
| Hardhat | Módulo 7 | Framework de desarrollo de contratos |
| EVM (Ethereum Virtual Machine) | Módulos 6-7 | Runtime para contratos inteligentes |
| Verifiable Credentials (VC) | Módulo 4 | Certificaciones de cumplimiento |

---

## Prerequisitos y Recursos

### Para seguir este curso necesitas:
- Node.js 18+ instalado
- npm
- El repositorio clonado y con dependencias instaladas:
  ```bash
  npm install
  npm --prefix sdk install
  npm --prefix contracts install
  ```

### Recursos externos recomendados:
- [W3C DID Core 1.0](https://www.w3.org/TR/did-core/)
- [Ed25519 — RFC 8032](https://tools.ietf.org/html/rfc8032)
- [HTTP Message Signatures — RFC 9421](https://www.rfc-editor.org/rfc/rfc9421)
- [Solidity Docs](https://docs.soliditylang.org/)
- [@noble/curves](https://github.com/paulmillr/noble-curves)

---

**Siguiente paso:** Responder "Listo" en el chat para comenzar con el Módulo 1 de forma interactiva.
