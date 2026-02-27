# Manual de capacitación — Agent-DID RFC-001

## 0) Cómo usar este manual

Este documento está pensado para que puedas aprender **desde cero**, sin asumir conocimientos previos.

Objetivo: al terminar, vas a poder explicar y operar la especificación RFC-001 con seguridad.

Estrategia de aprendizaje:

1. Primero entiendes el problema (qué resuelve Agent-DID).
2. Luego entiendes el modelo mental (cómo está construido).
3. Después aterrizas en APIs, contrato y operación real.
4. Finalmente ejecutas validaciones y casos de uso.

---

## 1) ¿Qué es Agent-DID?

**Agent-DID** es una forma estándar de darle identidad verificable a un agente de IA.

En simple:

- Es como un “pasaporte digital” para un agente.
- Permite saber **quién lo controla**, **qué versión es**, **si está revocado o no**, y **si sus firmas son válidas**.
- Todo esto de manera criptográfica, trazable y auditable.

### 1.1 ¿Qué problema resuelve?

Sin Agent-DID, en un ecosistema de agentes hay riesgos como:

- Suplantación (un agente falso haciéndose pasar por uno legítimo).
- Falta de trazabilidad (no saber quién lo creó o cambió).
- No-repudio débil (discutir si una acción realmente la hizo ese agente).
- Mala gobernanza (sin forma estándar de revocar o delegar control).

Agent-DID resuelve esto con identidad + firma + resolución + revocación.

### 1.2 ¿Qué NO es Agent-DID?

- No es “proof of personhood” para humanos.
- No es un wallet por sí mismo.
- No reemplaza W3C DID: lo extiende para agentes.

---

## 2) ¿Por qué existe esta especificación?

### 2.1 Motivo técnico

Porque un agente necesita tres capas para operar con confianza:

1. **Identidad estable**: un DID que lo represente.
2. **Estado evolutivo**: el documento puede cambiar versión, claves o metadatos.
3. **Control de vigencia**: revocación y verificación en tiempo real.

### 2.2 Motivo de negocio

Permite construir ecosistemas de agentes con:

- Cumplimiento/auditoría.
- Integraciones B2B y API trust.
- Menor riesgo de fraude operacional.

### 2.3 Motivo operativo

Te da un contrato claro de operación:

- cómo se registra,
- cómo se verifica,
- cómo se revoca,
- cómo se monitorea.

---

## 3) ¿Para qué sirve en la práctica?

### 3.1 Casos de uso reales

1. **Agente de soporte corporativo**
   - Firma requests a APIs internas.
   - Backend verifica DID + firma + estado no revocado.

2. **Marketplace de agentes**
   - Cada agente publica DID y capacidades.
   - Comprador valida integridad antes de contratar.

3. **Flota de agentes empresariales**
   - Muchos agentes bajo un controller/fleet.
   - Revocación rápida si un agente se compromete.

4. **A2A (agente a agente)**
   - Un agente recibe instrucción de otro y valida identidad criptográfica.

5. **Auditoría y compliance**
   - Evidencia de evolución (historial de documento y claves).
   - Evidencia de revocación y delegación formal.

---

## 4) El modelo mental correcto (clave para entender todo)

Piensa en 3 piezas:

1. **Documento DID (off-chain)**: contiene identidad detallada del agente.
2. **Registry (on-chain)**: contiene anclaje mínimo + estado de revocación.
3. **Resolver**: une ambas partes para responder “¿esta identidad es válida ahora?”.

### 4.1 Qué va on-chain y qué off-chain

- On-chain (mínimo): DID, controller, referencia del documento, revocación.
- Off-chain: documento completo JSON-LD, capacidades, certificaciones, metadata.

¿Por qué híbrido?

- On-chain = confianza fuerte y estado compartido.
- Off-chain = flexibilidad, menor costo y mayor expresividad.

---

## 5) Anatomía del Agent-DID Document (qué significa cada campo)

Campos esenciales:

- `id`: identificador único del agente.
- `controller`: quién gobierna ese agente.
- `created` / `updated`: timestamps de ciclo de vida.
- `agentMetadata.coreModelHash`: hash de modelo base.
- `agentMetadata.systemPromptHash`: hash de prompt base.
- `verificationMethod`: claves públicas para verificar firmas.
- `authentication`: claves activas para autenticación.

Campos opcionales importantes:

- `capabilities`: qué puede hacer.
- `memberOf`: pertenencia a flota.
- `complianceCertifications`: evidencias VC.

### 5.1 ¿Por qué hash y no texto plano?

Porque protege IP sensible.

- No expones prompt/modelo completo.
- Sí puedes demostrar integridad (si cambia, cambia el hash).

---

## 6) Flujo completo de vida de un agente

### 6.1 Registro

1. Creas el documento DID.
2. Lo registras (anclas) en registry.
3. Guardas la referencia del documento (`documentRef`).

### 6.2 Resolución y verificación

1. Recibes DID o `Signature-Agent`.
2. Resolver consulta registry + documento.
3. Verificas firma con clave pública del DID document.
4. Verificas que no esté revocado.

### 6.3 Evolución

- DID se mantiene estable.
- Cambian campos de `updated`, metadata, claves, etc.
- Registry apunta a nueva referencia.

### 6.4 Revocación

- Marca de no-vigencia.
- Desde ese momento las verificaciones deben fallar.

---

## 7) SDK: qué APIs existen y para qué sirve cada una

Referencia funcional (implementada):

- `create(params)`
- `signMessage(payload, privateKey)`
- `signHttpRequest(params)`
- `resolve(did)`
- `verifySignature(did, payload, signature)`
- `verifyHttpRequestSignature(...)`
- `updateDidDocument(did, patch)`
- `rotateVerificationMethod(did)`
- `revokeDid(did)`
- `getDocumentHistory(did)`

### 7.1 `create(params)`

Qué hace:

- Crea DID document completo.
- Hashea metadata sensible.
- Registra documento en resolver/registry configurado.

Por qué importa:

- Es el punto de nacimiento confiable de la identidad.

### 7.2 `signMessage` y `verifySignature`

Qué hacen:

- Firmar payload con clave privada del agente.
- Verificar firma usando clave pública del DID document.

Por qué importa:

- Garantiza autenticidad + no repudio técnico.

### 7.3 `signHttpRequest` y `verifyHttpRequestSignature`

Qué hacen:

- Firmar request HTTP (componentes críticos como método/host/date/content-digest).
- Verificar headers de firma + DID + revocación.

Por qué importa:

- Seguridad en integraciones API entre agentes/sistemas.

### 7.4 `resolve(did)`

Qué hace:

- Recupera documento vigente y valida estado según registry/resolver.

Por qué importa:

- Sin resolución no hay confianza verificable en runtime.

### 7.5 `updateDidDocument` y `rotateVerificationMethod`

Qué hacen:

- Permiten evolución controlada.
- Añaden trazabilidad de cambios.

Por qué importa:

- Todo sistema real evoluciona; la identidad debe soportarlo sin romperse.

### 7.6 `revokeDid`

Qué hace:

- Invalida operativamente la identidad.

Por qué importa:

- Es tu “freno de emergencia” de seguridad y gobernanza.

---

## 8) Resolver: cómo funciona de verdad

Hay tres niveles:

1. **In-memory**: útil para desarrollo local.
2. **HTTP/IPFS source**: obtiene documento por referencia con failover.
3. **JSON-RPC source**: resolución por endpoints RPC con failover.

### 8.1 Capacidades de producción implementadas

- Caché TTL.
- Failover multi-endpoint.
- Soporte `ipfs://` vía gateways.
- Telemetría por eventos de resolución.

Eventos típicos:

- `cache-hit`, `cache-miss`, `registry-lookup`, `source-fetch`, `source-fetched`, `fallback`, `resolved`, `error`.

### 8.2 ¿Para qué sirve la telemetría?

- Medir latencia real.
- Ver degradaciones.
- Detectar dependencia defectuosa.
- Operar SLO/alertas.

---

## 9) Contrato EVM: gobernanza y política de revocación

Funciones base:

- `registerAgent`
- `setDocumentRef`
- `revokeAgent`
- `getAgentRecord`
- `isRevoked`

Política formal añadida:

- `setRevocationDelegate`
- `isRevocationDelegate`
- `transferAgentOwnership`

### 9.1 Regla de autorización actual

Un DID puede ser revocado por:

- `owner` del registro, o
- delegado autorizado explícitamente para ese DID.

Esto te da continuidad operacional sin perder control.

---

## 10) Seguridad: qué debes cuidar sí o sí

1. **Llaves privadas**
   - Nunca hardcodearlas.
   - Usar secretos/entornos seguros.

2. **Revocación rápida**
   - Tener playbook de incidente.
   - Ejecutar smoke de política regularmente.

3. **Verificación estricta**
   - No confiar sólo en headers: validar DID + firma + revocación.

4. **Evolución auditada**
   - Mantener historial de documento y rotaciones.

5. **Operación HA**
   - Múltiples endpoints por fuente.
   - Failover probado con drills.

---

## 11) Operación y validación (lo que ya dejaste terminado)

Comandos clave:

- `npm run conformance:rfc001`
- `npm run smoke:e2e`
- `npm run smoke:ha`
- `npm run smoke:rpc`
- `npm run smoke:policy`

### 11.1 Qué valida conformance

- Build + tests del SDK.
- Smoke de política on-chain.
- Drill HA.
- Smoke RPC.
- E2E completo SDK+contrato.
- Estado de checklist MUST/SHOULD.

Resultado actual (cerrado):

- MUST: 11 PASS / 0 PARTIAL / 0 FAIL
- SHOULD: 5 PASS / 0 PARTIAL / 0 FAIL

---

## 12) Ejemplos claros de casos de uso (paso a paso)

### Caso A — API corporativa protegida por Agent-DID

Escenario:

- Tu agente llama `POST /approve`.

Flujo:

1. Agente firma request con `signHttpRequest`.
2. API recibe headers de firma + `Signature-Agent`.
3. API ejecuta `verifyHttpRequestSignature`.
4. Si firma válida y DID no revocado, autoriza.

Valor:

- Evitas suplantación de bots internos.

### Caso B — Rotación de clave por política trimestral

Escenario:

- Seguridad exige cambio de clave activa.

Flujo:

1. Ejecutas `rotateVerificationMethod`.
2. `authentication` pasa a nueva clave activa.
3. Firmas nuevas acciones con nueva private key.
4. Verificaciones con clave obsoleta fallan.

Valor:

- Reduces riesgo por exposición prolongada de credenciales.

### Caso C — Incidente y revocación delegada

Escenario:

- Owner no está disponible, pero hay delegado SOC.

Flujo:

1. Owner ya dejó `setRevocationDelegate(did, delegate, true)`.
2. Delegado ejecuta `revokeAgent`.
3. Sistema empieza a rechazar firmas de ese DID.

Valor:

- Respuesta de seguridad sin bloqueo organizacional.

### Caso D — Resolución resiliente en producción

Escenario:

- Endpoint primario de resolución cae.

Flujo:

1. Resolver intenta endpoint A (falla).
2. Cambia a B/C automáticamente.
3. Devuelve documento válido.
4. Segunda consulta sale de caché (`cache-hit`).

Valor:

- Continuidad operacional sin downtime perceptible.

---

## 13) Preguntas frecuentes (FAQ)

### “¿Si cambia el agente, cambia el DID?”

No. Cambia el documento (`updated`, hashes, claves), pero el DID se mantiene.

### “¿Puedo operar sólo en memoria?”

Sí para local/test. Para producción debes usar resolver robusto con failover.

### “¿Por qué separamos controller y owner?”

Porque controller es semántica de identidad; owner es control operativo on-chain.

### “¿Qué pasa si no hay `documentRef`?”

Resolver intenta fallback; en producción debe considerarse estado no conforme/incorrecto.

---

## 14) Ruta de estudio recomendada (para dominarlo)

1. Leer especificación canónica: [docs/RFC-001-Agent-DID-Specification.md](docs/RFC-001-Agent-DID-Specification.md)
2. Revisar checklist: [docs/RFC-001-Compliance-Checklist.md](docs/RFC-001-Compliance-Checklist.md)
3. Ejecutar `npm run conformance:rfc001`
4. Abrir ejemplos:
   - [sdk/examples/e2e-smoke.js](sdk/examples/e2e-smoke.js)
   - [sdk/examples/evm-registry-wiring.ts](sdk/examples/evm-registry-wiring.ts)
5. Estudiar runbook HA: [docs/RFC-001-Resolver-HA-Runbook.md](docs/RFC-001-Resolver-HA-Runbook.md)

---

## 15) Resumen final (qué acabas de terminar)

Terminaste una implementación **completa y conforme** de RFC-001:

- Especificación unificada y clara.
- SDK funcional con ciclo de vida completo.
- Resolver de producción con resiliencia.
- Contrato con política formal de revocación/delegación.
- Conformance automatizado con evidencias reproducibles.

En términos simples: ya no es una idea o borrador; es un estándar **ejecutable, verificable y operable**.
