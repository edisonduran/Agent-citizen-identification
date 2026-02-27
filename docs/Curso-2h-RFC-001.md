# Curso práctico (2 horas) — Agent-DID RFC-001

## 0) Objetivo del curso

Al finalizar este curso vas a poder:

1. Explicar RFC-001 en términos técnicos y de negocio.
2. Ejecutar el flujo completo create → sign → verify → resolve → revoke.
3. Interpretar conformance y smokes operativos.
4. Entender la política on-chain de revocación/delegación.
5. Defender decisiones de arquitectura (on-chain/off-chain, resolver HA, interoperabilidad).

---

## 1) Estructura del curso (120 min)

- **Módulo 1 (15 min):** Fundamentos y problema que resuelve
- **Módulo 2 (20 min):** Modelo RFC-001 y arquitectura
- **Módulo 3 (25 min):** SDK explicado de extremo a extremo
- **Módulo 4 (20 min):** Resolver de producción y operación HA
- **Módulo 5 (20 min):** Contrato EVM y política de revocación
- **Módulo 6 (15 min):** Validación, conformance y cierre
- **Q&A (5 min)**

---

## 2) Requisitos previos

No necesitas saber todo de blockchain, pero sí:

- uso básico de terminal,
- lectura básica de JSON,
- noción básica de firma digital (privada firma / pública verifica).

Entorno recomendado:

- Node.js 18+
- npm
- Repo clonado en local

---

## 3) Módulo 1 — Fundamentos (15 min)

### 3.1 Qué es Agent-DID

- Un estándar para identidad verificable de agentes de IA.
- Provee autenticidad, trazabilidad y gobernanza.

### 3.2 Qué problema resuelve

- Suplantación de agentes.
- Falta de control de vigencia.
- Dificultad para auditar cambios.

### 3.3 Resultado esperado

Al final del módulo debes poder explicar en 30 segundos:

> “Agent-DID es un pasaporte criptográfico para agentes que permite verificar quién los controla, qué versión/estado tienen y si están vigentes.”

---

## 4) Módulo 2 — Especificación y arquitectura (20 min)

### 4.1 Documento DID (off-chain)

Campos clave:

- `id`
- `controller`
- `created` / `updated`
- `agentMetadata.coreModelHash`
- `agentMetadata.systemPromptHash`
- `verificationMethod`
- `authentication`

### 4.2 Registry (on-chain)

- Ancla identidad mínima.
- Mantiene estado de revocación.
- Guarda referencia al documento (`documentRef`).

### 4.3 Resolver universal

- Consulta registry.
- Obtiene documento en fuentes HTTP/IPFS/JSON-RPC.
- Usa caché y failover.

### 4.4 Ejercicio corto (3 min)

Responde:

1. ¿Por qué no guardar todo on-chain?
2. ¿Qué pasa si `documentRef` no se resuelve?

Respuesta esperada:

1. Costo/rigidez; off-chain da flexibilidad.
2. Debe activarse failover y, si todo falla, error operativo.

---

## 5) Módulo 3 — SDK end-to-end (25 min)

### 5.1 APIs esenciales

- `create(params)`
- `signMessage(payload, privateKey)`
- `verifySignature(did, payload, signature)`
- `signHttpRequest(params)`
- `verifyHttpRequestSignature(...)`
- `resolve(did)`
- `updateDidDocument(...)`
- `rotateVerificationMethod(...)`
- `revokeDid(did)`

### 5.2 Laboratorio guiado (10 min)

Ejecuta:

```bash
npm run conformance:rfc001
```

Luego revisa estos archivos:

- `sdk/examples/e2e-smoke.js`
- `sdk/src/core/AgentIdentity.ts`
- `sdk/tests/AgentIdentity.test.ts`

### 5.3 Qué observar

- Flujo de firma válido antes de revocación.
- Verificación inválida después de revocación.
- Comportamiento de firmas HTTP con componentes protegidos.

---

## 6) Módulo 4 — Operación HA del resolver (20 min)

### 6.1 Capacidades implementadas

- caché TTL,
- failover multi-endpoint,
- soporte `ipfs://` por gateways,
- telemetría de eventos.

### 6.2 Drills operativos

Ejecuta:

```bash
npm run smoke:ha
npm run smoke:rpc
```

### 6.3 Lectura operativa

- Runbook: `docs/RFC-001-Resolver-HA-Runbook.md`
- Busca SLO, alertas y plan de incidente.

### 6.4 Pregunta de control

Si el endpoint primario cae, ¿qué debe pasar?

Respuesta esperada:

- resolver sigue con secundarios,
- emite eventos de failover,
- mantiene continuidad de resolución.

---

## 7) Módulo 5 — Contrato y gobernanza (20 min)

### 7.1 Funciones clave del contrato

- `registerAgent`
- `setDocumentRef`
- `revokeAgent`
- `getAgentRecord`
- `isRevoked`

### 7.2 Política formal (SHOULD-04)

- `setRevocationDelegate`
- `isRevocationDelegate`
- `transferAgentOwnership`

Regla:

- revoca `owner` o delegado autorizado por DID.

### 7.3 Prueba operativa

```bash
npm run smoke:policy
```

### 7.4 Qué valida esta prueba

- no autorizado no puede revocar,
- delegado sí puede (si fue autorizado),
- ownership transfer cambia control efectivo.

---

## 8) Módulo 6 — Conformance y lectura de resultados (15 min)

### 8.1 Comando maestro

```bash
npm run conformance:rfc001
```

### 8.2 Qué incluye

- SDK build
- SDK tests
- smoke:policy
- smoke:ha
- smoke:rpc
- smoke:e2e
- resumen MUST/SHOULD desde checklist

### 8.3 Criterio de éxito actual del proyecto

- MUST: 11 PASS
- SHOULD: 5 PASS

---

## 9) Casos de uso explicados (para presentar a negocio)

### Caso 1: API Zero-Trust para agentes

- Agente firma request HTTP.
- API verifica DID + firma + no revocado.
- Reduce riesgo de bot spoofing.

### Caso 2: Flota de agentes corporativos

- Cada agente con DID único.
- Controller central + políticas de revocación.
- Trazabilidad y compliance por agente.

### Caso 3: Respuesta a incidente

- Agente comprometido.
- Owner/delegate revoca.
- Todas las validaciones posteriores fallan.

### Caso 4: Interoperabilidad entre implementaciones

- Vectores compartidos (`fixtures`).
- Distintas implementaciones validan misma firma/vector.
- Menor ambigüedad de integración.

---

## 10) Checklist de evaluación del alumno

## Nivel 1 — Comprensión

- [ ] Puede explicar qué es Agent-DID en 1 minuto.
- [ ] Distingue on-chain vs off-chain.
- [ ] Entiende `controller` vs `owner` vs `delegate`.

## Nivel 2 — Operación

- [ ] Ejecuta `conformance:rfc001` sin ayuda.
- [ ] Interpreta resumen MUST/SHOULD.
- [ ] Identifica qué smoke valida cada riesgo.

## Nivel 3 — Implementación

- [ ] Explica APIs principales del SDK.
- [ ] Explica política de revocación del contrato.
- [ ] Diseña un caso de uso propio con flujo completo.

---

## 11) Examen rápido (10 preguntas)

1. ¿Qué valida `verifySignature` además de la firma?
2. ¿Por qué se usa `documentRef`?
3. ¿Qué diferencia hay entre `resolve` y `verifySignature`?
4. ¿Qué protege `content-digest` en firma HTTP?
5. ¿Qué evento de resolver indica caché efectiva?
6. ¿Cuándo usar `rotateVerificationMethod`?
7. ¿Quién puede revocar on-chain?
8. ¿Qué prueba valida failover RPC?
9. ¿Qué prueba valida política de delegación?
10. ¿Cuál es el criterio de conformidad actual?

Clave resumida:

1) revocación + clave activa, 2) anclaje on-chain, 3) resolución vs autenticidad, 4) integridad de body, 5) `cache-hit`, 6) higiene de llaves, 7) owner/delegate, 8) `smoke:rpc`, 9) `smoke:policy`, 10) MUST/SHOULD en PASS.

---

## 12) Plan de estudio posterior (si quieres profundizar)

Semana 1:

- Repetir laboratorio completo 3 veces.
- Explicar con tus palabras cada módulo.

Semana 2:

- Diseñar un caso de uso real de tu empresa.
- Mapear riesgos + controles RFC por etapa.

Semana 3:

- Probar integración de un servicio externo con firma HTTP.
- Añadir un test de regresión específico para ese servicio.

---

## 13) Materiales recomendados para ti (orden)

1. `docs/Manual-Capacitacion-RFC-001.md`
2. `docs/RFC-001-Agent-DID-Specification.md`
3. `docs/RFC-001-Compliance-Checklist.md`
4. `docs/RFC-001-Resolver-HA-Runbook.md`
5. `sdk/examples/e2e-smoke.js`

---

## 14) Cierre

Si dominas este curso, ya puedes:

- liderar una sesión técnica de RFC-001,
- defender la arquitectura frente a seguridad/arquitectura,
- ejecutar y explicar evidencias de conformidad,
- operar el sistema en condiciones reales de resiliencia.
