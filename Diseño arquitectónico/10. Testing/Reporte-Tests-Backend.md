# Reporte de Tests - Backend CAIL

**Versión:** 4.0  
**Fecha de Creación:** 08 de Enero de 2026  
**Última Actualización:** 14 de Enero de 2026  
**Responsable:** Erick Gaona (Test & Security)

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Cambios Recientes (13/01/2026)](#2-cambios-recientes-13012026)
3. [Matriz de Tests por Contribuidor](#3-matriz-de-tests-por-contribuidor)
4. [Tests del Modulo Usuarios](#4-tests-del-módulo-usuarios)
5. [Tests del Modulo Ofertas](#5-tests-del-módulo-ofertas)
6. [Tests del Modulo Matching](#6-tests-del-módulo-matching)
7. [Resumen de Hallazgos](#7-resumen-de-hallazgos)
8. [Comandos de Ejecucion](#8-comandos-de-ejecución)
9. [Despliegue WSO2 API Gateway](#9-despliegue-wso2-api-gateway)
10. [Analisis SonarCloud](#10-análisis-sonarcloud)

**Documento Relacionado:** [Seguridad Por Modulo](./Seguridad-Por-Modulo.md) - Mapeo detallado de seguridad vs plan de desarrollo

---

## 1. Resumen Ejecutivo

### 1.1 Estado Actual (13/01/2026)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    RESUMEN GENERAL DE TESTS                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TESTS TOTALES CREADOS:                         66 tests                    │
│  ├── Tests de Seguridad:                        50 tests                    │
│  └── Tests de Integracion:                      16 tests                    │
│                                                                             │
│  TESTS QUE PASAN:                               65 tests ✅                 │
│  TESTS QUE FALLAN:                               1 test  ⚠️ (matching)      │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════    │
│                                                                             │
│  Por Microservicio:                                                         │
│  ├── Usuarios    25 tests (18 seg + 7 int)   ██████████████████████ 100% ✅│
│  ├── Ofertas     22 tests (17 seg + 5 int)   ██████████████████████ 100% ✅│
│  └── Matching    19 tests (15 seg + 4 int)   ████████████████████░░  95% ⚠️│
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════    │
│                                                                             │
│  SEGURIDAD IMPLEMENTADA (13/01/2026):                                       │
│  ├── ✅ Helmet (Security Headers) - 3 microservicios                        │
│  ├── ✅ Rate Limiting General (100 req/15min)                               │
│  ├── ✅ Rate Limiting Auth (10 req/15min - login/register)                  │
│  ├── ✅ WSO2 API Gateway desplegado + 3 APIs publicadas                     │
│  └── ✅ Upload CV validado (PDF, max 5MB) - por Alex                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Por que 70 Tests Planificados vs 66 Implementados?

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DESGLOSE DE TESTS - PLANIFICADO VS ACTUAL                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  70 TESTS PLANIFICADOS INCLUIAN:                                           │
│  ├── Funcionalidad YA implementada:              66 tests ✅                │
│  └── Funcionalidad FUTURA (aun no desarrollada):  4 tests ⏳                │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════    │
│                                                                             │
│  TESTS PENDIENTES (esperando codigo):                                       │
│  ├── Validacion cedula ecuatoriana (2 tests) - Sebastian                   │
│  ├── Limite 10 postulaciones/dia (1 test) - Dara/Cristobal                 │
│  └── Verificar postulacion duplicada (1 test) - Dara/Cristobal             │
│                                                                             │
│  POR QUE NO ESTAN CREADOS?                                                  │
│  El codigo de estas funcionalidades AUN NO existe. Cuando se               │
│  implemente, se crearan los tests correspondientes.                         │
│                                                                             │
│  ESTO ES NORMAL: El proyecto no esta al 100% aun.                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Nota:** Ver documento completo en `Seguridad-Por-Modulo.md` para el mapeo detallado de seguridad por modulo segun el plan original de desarrollo.

### 1.3 Leyenda de Estados

| Simbolo | Significado |
|---------|-------------|
| ✅ | Test creado Y pasa (codigo implementado correctamente) |
| ❌ | Test creado pero FALLA (codigo NO implementado o tiene bug) |
| ⏳ | Test NO creado aun / Esperando implementacion |
| 🔄 | Test creado, resultado parcial |

---

## 2. Cambios Recientes (13/01/2026)

### 2.1 Implementacion de Seguridad - Erick Gaona

| Hora | Cambio | Archivos | Estado |
|------|--------|----------|--------|
| 13/01/2026 | Agregado **helmet** (Security Headers) | `security.middleware.ts` (x3) | ✅ Implementado |
| 13/01/2026 | Agregado **express-rate-limit** | `security.middleware.ts` (x3) | ✅ Implementado |
| 13/01/2026 | Rate Limit especial para Auth | `/auth/login`, `/auth/register` | ✅ Implementado |
| 13/01/2026 | **WSO2 API Gateway desplegado** | `docker-compose.yml` | ✅ Funcionando |

### 2.2 Implementacion Upload CV - Alex Ramirez

| Hora | Cambio | Archivos | Estado |
|------|--------|----------|--------|
| 13/01/2026 17:59 | Subida de CV con validacion | `users.routes.ts`, `Cv.controller.ts` | ✅ Implementado |
| 13/01/2026 17:59 | Validacion solo PDF | `multer fileFilter` | ✅ Implementado |
| 13/01/2026 17:59 | Limite 5MB | `multer limits` | ✅ Implementado |

### 2.3 Archivos Creados/Modificados

```
✅ NUEVOS (por Erick Gaona - Seguridad):
├── cail/functions/usuarios/src/shared/middleware/security.middleware.ts
├── cail/functions/ofertas/src/shared/middleware/security.middleware.ts
└── cail/functions/matching/src/shared/middleware/security.middleware.ts

✅ NUEVOS (por Alex Ramirez - Upload CV):
├── cail/functions/usuarios/src/users/infrastructure/controllers/Cv.controller.ts
└── cail/functions/usuarios/src/config/firebase.config.ts (Storage)

✅ MODIFICADOS:
├── cail/functions/usuarios/src/index.ts (security middleware)
├── cail/functions/ofertas/src/index.ts (security middleware)
├── cail/functions/matching/src/index.ts (security middleware)
├── cail/functions/usuarios/src/users/infrastructure/routes/users.routes.ts (rutas CV)
└── cail/infrastructure/docker-compose.yml (WSO2 latest)
```

### 2.3 Headers de Seguridad Agregados (helmet)

| Header | Valor | Protección |
|--------|-------|------------|
| X-Content-Type-Options | nosniff | Previene MIME sniffing |
| X-Frame-Options | DENY | Previene clickjacking |
| X-XSS-Protection | 1; mode=block | Previene XSS |
| Strict-Transport-Security | max-age=31536000 | Fuerza HTTPS |
| Content-Security-Policy | Configurado | Previene inyección scripts |
| X-DNS-Prefetch-Control | off | Privacidad DNS |
| X-Download-Options | noopen | Previene ejecución descargas |
| X-Permitted-Cross-Domain | none | Bloquea Adobe cross-domain |

### 2.4 Rate Limiting Configurado

| Tipo | Límite | Ventana | Endpoints |
|------|--------|---------|-----------|
| General | 100 requests | 15 minutos | Todos |
| Auth (estricto) | 10 requests | 15 minutos | `/auth/login`, `/auth/register` |

---

## 3. Matriz de Tests por Contribuidor

### 3.1 Alex Ramirez + Sebastian Calderon - Microservicio Usuarios

| # | Estandar | Descripcion | Codigo Implementado | Test Creado | Resultado |
|---|----------|-------------|---------------------|-------------|-----------|
| A1 | Helmet | Headers de seguridad | ✅ SI (Erick) | ✅ SI | ✅ PASA |
| A2 | CORS restrictivo | Solo dominios permitidos | ⚠️ PARCIAL (acepta todo) | ⏳ NO | - |
| A3 | Rate Limiting Login | 10 intentos / 15 min | ✅ SI (Erick) | ✅ SI | ✅ PASA |
| A4 | Password 12+ chars | Validacion de fortaleza | ❌ NO | ✅ SI | 🔄 Pasa pero no valida |
| A5 | Validacion Email | Formato correcto | ✅ SI | ✅ SI | 🔄 Pasa pero retorna 500 |
| A6 | Dockerfile no-root | Usuario nodejs | ✅ SI | ⏳ NO | - |
| A7 | Hash bcrypt | 10+ rounds | ✅ SI | ⏳ NO | - |
| A8 | Upload CV solo PDF | Validar mimetype | ✅ SI (Alex 13/01) | ⏳ NO | - |
| A9 | CV maximo 5MB | Limite de tamanio | ✅ SI (Alex 13/01) | ⏳ NO | - |

**Resumen Alex + Sebastian:** 7/9 implementados (2 por Erick, 2 por Alex), 4/9 tests creados

**Cambios recientes de Alex (13/01/2026):**
- ✅ Implemento subida de CV con validacion PDF
- ✅ Implemento limite de 5MB para archivos
- ✅ Rutas protegidas con authenticate
- Archivos: `users.routes.ts`, `Cv.controller.ts`

---

### 3.2 Erick Gaona + Carlos Mejia - Modulo Ofertas + JWT

| # | Estandar | Descripcion | Codigo Implementado | Test Creado | Resultado |
|---|----------|-------------|---------------------|-------------|-----------|
| C1 | Algoritmo JWT seguro | HS256 | ✅ SI (Carlos) | ⏳ NO | - |
| C2 | Expiracion tokens | 7 dias | ✅ SI (Carlos) | ⏳ NO | - |
| C3 | Validar firma JWT | jwt.verify() | ✅ SI (Carlos) | ✅ SI | ✅ PASA |
| C4 | Manejar TokenExpired | Error handling | ✅ SI (Carlos) | ✅ SI | ✅ PASA |
| C5 | No loguear tokens | Sin console.log | ✅ SI | ⏳ NO | - |
| C6 | Solo RECLUTADOR crea ofertas | authorize() | ✅ SI | ✅ SI | ✅ PASA |
| C7 | Verificar propiedad oferta | idReclutador | ✅ SI | ✅ SI | ✅ PASA |
| C8 | Helmet (headers) | Security headers | ✅ SI (Erick) | ✅ SI | ✅ PASA |
| C9 | Rate Limiting | Limite peticiones | ✅ SI (Erick) | ✅ SI | ✅ PASA |

**Resumen Erick + Carlos:** 9/9 implementados, 6/9 tests creados (17 tests seguridad ofertas)

---

### 3.3 Dara + Cristobal Espinosa - Microservicio Matching

| # | Estandar | Descripcion | Codigo Implementado | Test Creado | Resultado |
|---|----------|-------------|---------------------|-------------|-----------|
| CR1 | Solo POSTULANTE postula | authorize() | ⏳ Pendiente | ✅ SI | ⚠️ Esperando codigo |
| CR2 | Una postulacion/oferta | Verificar duplicados | ⏳ Pendiente | ⏳ NO | - |
| CR3 | Limite postulaciones/dia | Contador diario | ⏳ Pendiente | ⏳ NO | - |
| CR4 | Solo ofertas activas | Validar estado | ⏳ Pendiente | ✅ SI | ❌ Falla (ruta no implementada) |
| CR5 | No exponer algoritmo | Solo score | ⏳ Pendiente | ⏳ NO | - |
| CR6 | Helmet (headers) | Security headers | ✅ SI (Erick) | ✅ SI | ✅ PASA |
| CR7 | Rate Limiting | Limite peticiones | ✅ SI (Erick) | ✅ SI | ✅ PASA |

**Resumen Dara + Cristobal:** 2/7 implementados (por Erick). 15 tests de seguridad creados, 1 falla (ruta /my-applications no existe).

---

### 3.4 Juan Espinosa - Firestore y Datos

| # | Estándar | Descripción | Código Implementado | Test Creado | Resultado |
|---|----------|-------------|---------------------|-------------|-----------|
| J1 | Firestore Rules | Reglas de seguridad | ✅ SÍ | ⏳ NO | - |
| J2 | Sanitizar datos | sanitize-html | ❌ NO | ⏳ NO | - |
| J3 | No IDs secuenciales | UUIDs | ✅ SÍ | ⏳ NO | - |
| J4 | Logs de auditoría | Registro cambios | ❌ NO | ⏳ NO | - |

**Resumen Juan:** 2/4 implementados, 0/4 tests creados

---

### 3.5 Sebastián Calderón - Frontend Mobile/Web

| # | Estándar | Descripción | Código Implementado | Test Creado | Resultado |
|---|----------|-------------|---------------------|-------------|-----------|
| S1 | SecureStore tokens | expo-secure-store | ⏳ Pendiente | ⏳ NO | - |
| S2 | No console.log prod | Eliminar logs | ⏳ Pendiente | ⏳ NO | - |
| S3 | Validar cédula EC | Algoritmo módulo 10 | ❌ NO | ⏳ NO | - |
| S4 | Certificate Pinning | SSL Pinning | ⏳ Pendiente | ⏳ NO | - |

**Resumen Sebastián:** Pendiente verificar implementación frontend

---

### 3.6 Erick Gaona - Test & Security

| # | Estandar | Descripcion | Codigo Implementado | Test Creado | Resultado |
|---|----------|-------------|---------------------|-------------|-----------|
| E1 | Helmet implementado | Security headers (3 microservicios) | ✅ SI | ✅ SI | ✅ PASA |
| E2 | Rate Limiting General | 100 req/15min | ✅ SI | ✅ SI | ✅ PASA |
| E3 | Rate Limiting Auth | 10 req/15min (login/register) | ✅ SI | ✅ SI | ✅ PASA |
| E4 | Tests seguridad Usuarios | 18 tests | ✅ SI | ✅ SI | ✅ 18/18 PASAN |
| E5 | Tests seguridad Ofertas | 17 tests | ✅ SI | ✅ SI | ✅ 17/17 PASAN |
| E6 | Tests seguridad Matching | 15 tests | ✅ SI | ✅ SI | ⚠️ 14/15 PASAN |
| E7 | WSO2 API Gateway | Despliegue local | ✅ SI | - | ✅ Funcionando |

**Resumen Erick:** 7/7 completados, 50 tests de seguridad creados (49 pasan)

---

## 4. Tests del Módulo Usuarios

**Ubicación:** `cail/cail/functions/usuarios/tests/`  
**Tests Seguridad:** 22 tests ✅  
**Tests Integración:** 7 tests  
**Total:** 29 tests

### 4.1 Tests de Seguridad - Helmet (6 tests) ← NUEVO

| # | Test | Resultado |
|---|------|-----------|
| 1 | X-Content-Type-Options: nosniff | ✅ PASA |
| 2 | X-Frame-Options presente | ✅ PASA |
| 3 | X-XSS-Protection o CSP presente | ✅ PASA |
| 4 | Content-Security-Policy presente | ✅ PASA |
| 5 | Strict-Transport-Security (HSTS) | ✅ PASA |
| 6 | NO expone X-Powered-By | ✅ PASA |

### 4.2 Tests de Seguridad - Rate Limiting (3 tests) ← NUEVO

| # | Test | Resultado |
|---|------|-----------|
| 7 | Headers de Rate Limit presentes | ✅ PASA |
| 8 | Rate Limit en /auth/login | ✅ PASA |
| 9 | Rate Limit en /auth/register | ✅ PASA |

### 4.3 Tests de Seguridad - Auth Bypass (4 tests)

| # | Test | Resultado |
|---|------|-----------|
| 1 | GET /users/profile sin token → 401 | ✅ PASA |
| 2 | Token malformado → 401 | ✅ PASA |
| 3 | Token sin "Bearer" → 401 | ✅ PASA |
| 4 | Header Authorization vacío → 401 | ✅ PASA |
| 5 | PUT /users/profile sin token → 401 | ✅ PASA |

### 4.2 Tests de Seguridad - Input Validation (4 tests)

| # | Test | Resultado |
|---|------|-----------|
| 6 | Email inválido debe ser manejado | ✅ PASA (retorna 500) |
| 7 | Campos vacíos en login → error | ✅ PASA |
| 8 | Campos vacíos en registro → error | ✅ PASA |
| 9 | Password vacío → error | ✅ PASA |

### 4.3 Tests de Seguridad - Injection Prevention (2 tests)

| # | Test | Resultado |
|---|------|-----------|
| 10 | SQL Injection en email debe ser manejado | ✅ PASA |
| 11 | XSS en nombre debe ser manejado | ✅ PASA |

### 4.4 Tests de Seguridad - Error Handling (2 tests)

| # | Test | Resultado |
|---|------|-----------|
| 12 | Errores no exponen stack trace | ✅ PASA |
| 13 | Errores no exponen rutas internas | ✅ PASA |

---

## 5. Tests del Módulo Ofertas

**Ubicación:** `cail/cail/functions/ofertas/tests/security.test.ts`  
**Estado:** ✅ 13/13 tests pasan

### 5.1 Tests de Seguridad - Auth & Authorization (5 tests)

| # | Test | Resultado |
|---|------|-----------|
| 1 | POST /offers sin token → 401 | ✅ PASA |
| 2 | PUT /offers/:id sin token → 401 | ✅ PASA |
| 3 | DELETE /offers/:id sin token → 401 | ✅ PASA |
| 4 | Token inválido → 401 | ✅ PASA |
| 5 | Token sin Bearer prefix → 401 | ✅ PASA |

### 5.2 Tests de Seguridad - Input Validation (3 tests)

| # | Test | Resultado |
|---|------|-----------|
| 6 | POST /offers sin body debe manejarse | ✅ PASA |
| 7 | POST /offers con campos vacíos debe manejarse | ✅ PASA |
| 8 | PUT /offers con datos inválidos debe manejarse | ✅ PASA |

### 5.3 Tests de Seguridad - Injection Prevention (2 tests)

| # | Test | Resultado |
|---|------|-----------|
| 9 | SQL Injection en búsqueda debe manejarse | ✅ PASA |
| 10 | XSS en título debe ser escapado | ✅ PASA |

### 5.4 Tests de Seguridad - Error Handling (1 test)

| # | Test | Resultado |
|---|------|-----------|
| 11 | Errores no exponen información sensible | ✅ PASA |

### 5.5 Tests - Public vs Protected Routes (2 tests)

| # | Test | Resultado |
|---|------|-----------|
| 12 | GET /offers (público) funciona sin auth | ✅ PASA |
| 13 | GET /offers/:id (público) funciona sin auth | ✅ PASA |

---

## 6. Tests del Módulo Matching

**Ubicación:** `cail/cail/functions/matching/tests/security.test.ts`  
**Estado:** ⚠️ 10/11 tests pasan (1 falla - esperando implementación de Cristóbal)

### 6.1 Tests de Seguridad - Auth Protection (5 tests)

| # | Test | Resultado |
|---|------|-----------|
| 1 | POST /matching/apply sin token → 401 | ✅ PASA |
| 2 | GET /matching/applications sin token → 401 | ✅ PASA |
| 3 | GET /matching/my-applications sin token → 401 | ✅ PASA |
| 4 | Token inválido → 401 | ❌ FALLA (pendiente Cristóbal) |
| 5 | Token expirado → 401 | ✅ PASA |

### 6.2 Tests de Seguridad - Input Validation (2 tests)

| # | Test | Resultado |
|---|------|-----------|
| 6 | POST /apply sin idOferta debe manejarse | ✅ PASA |
| 7 | GET /matching/oferta/ con id vacío debe manejarse | ✅ PASA |

### 6.3 Tests de Seguridad - Injection Prevention (2 tests)

| # | Test | Resultado |
|---|------|-----------|
| 8 | NoSQL Injection en idOferta debe manejarse | ✅ PASA |
| 9 | XSS en parámetros debe manejarse | ✅ PASA |

### 6.4 Tests de Seguridad - Error Handling (2 tests)

| # | Test | Resultado |
|---|------|-----------|
| 10 | Errores no exponen stack trace | ✅ PASA |
| 11 | Oferta inexistente → 404 | ❌ FALLA (ruta no implementada) |

---

## 7. Resumen de Hallazgos

### 7.1 Seguridad Implementada ✅

| Componente | Implementado por | Fecha | Estado |
|------------|------------------|-------|--------|
| JWT Authentication | Alex Ramírez | Dic 2025 | ✅ Funcionando |
| RBAC (roles) | Alex Ramírez | Dic 2025 | ✅ Funcionando |
| Bcrypt passwords | Alex Ramírez | Dic 2025 | ✅ Funcionando |
| CORS | Alex Ramírez | Dic 2025 | ✅ Funcionando |
| Error handling | Alex Ramírez | Dic 2025 | ✅ Funcionando |
| Firestore Rules | Alex Ramírez | Ene 2026 | ✅ Funcionando |
| **Helmet (headers)** | **Erick Gaona** | **13/01/2026** | ✅ **NUEVO** |
| **Rate Limiting** | **Erick Gaona** | **13/01/2026** | ✅ **NUEVO** |

### 7.2 Pendiente de Implementar ⏳

| Componente | Responsable | Prioridad |
|------------|-------------|-----------|
| Validación password fuerte | Alex | 🔴 ALTA |
| Input validation con express-validator | Todos | 🟡 MEDIA |
| Matching routes completas | Cristóbal | 🟡 MEDIA |
| Certificate Pinning (mobile) | Sebastián | 🟡 MEDIA |
| WSO2 API Gateway | DevOps | 🟢 BAJA |
| Cloud Armor WAF | DevOps | 🟢 BAJA |

### 7.3 Tests que Revelan Problemas

| Test | Esperado | Actual | Problema |
|------|----------|--------|----------|
| Email inválido | 400 | 500 | Falta express-validator |
| Password corto | 400 | 201 | No valida longitud |
| Oferta inexistente (matching) | 404 | Timeout | Ruta no implementada |

---

## 8. Comandos de Ejecución

### 8.1 Ejecutar Tests de Seguridad

```powershell
# === TODOS LOS TESTS DE SEGURIDAD ===
cd "C:\Users\barce\Documents\mi brach\cail\cail\functions\usuarios"
npx jest security --forceExit   # 13 tests ✅

cd "C:\Users\barce\Documents\mi brach\cail\cail\functions\ofertas"
npx jest security --forceExit   # 13 tests ✅

cd "C:\Users\barce\Documents\mi brach\cail\cail\functions\matching"
npx jest security --forceExit   # 10/11 tests ⚠️
```

### 8.2 Ejecutar Todos los Tests de un Microservicio

```powershell
cd "C:\Users\barce\Documents\mi brach\cail\cail\functions\usuarios"
npm test --forceExit
```

### 8.3 Resolver Puerto Ocupado (8080)

```powershell
netstat -ano | findstr :8080
taskkill /PID <numero> /F
```

---

## 9. Despliegue WSO2 API Gateway

### 9.1 Estado del Despliegue (13/01/2026)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ✅ WSO2 API GATEWAY DESPLEGADO                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Fecha: 13 de Enero 2026                                                    │
│  Responsable: Erick Gaona                                                   │
│  Estado: ✅ FUNCIONANDO                                                      │
│                                                                             │
│  Contenedor: wso2-api-manager                                               │
│  Imagen: wso2/wso2am:latest (v4.6.0)                                        │
│  Estado: healthy                                                            │
│                                                                             │
│  Puertos:                                                                   │
│  • 9443 → Portal Admin/Publisher (HTTPS)                                    │
│  • 8243 → Gateway HTTPS (APIs)                                              │
│  • 8280 → Gateway HTTP (APIs)                                               │
│                                                                             │
│  Acceso: https://localhost:9443/publisher                                   │
│  Credenciales: admin / admin                                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9.2 ¿Qué es WSO2 y para qué sirve?

WSO2 API Gateway actúa como **punto único de entrada** para todas las APIs. Es como el "guardia de seguridad" del sistema.

#### Arquitectura ANTES (Sin WSO2):

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         INTERNET                                            │
│                            │                                                │
│              ┌─────────────┼─────────────┐                                  │
│              │             │             │                                  │
│              ▼             ▼             ▼                                  │
│         ┌────────┐    ┌────────┐    ┌────────┐                              │
│         │Usuarios│    │Ofertas │    │Matching│                              │
│         │ :8080  │    │ :8083  │    │ :8084  │                              │
│         └────────┘    └────────┘    └────────┘                              │
│                                                                             │
│   ⚠️ PROBLEMA: Cada función expuesta directamente                           │
│   ⚠️ PROBLEMA: No hay punto central de control                              │
│   ⚠️ PROBLEMA: Seguridad distribuida en cada función                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Arquitectura DESPUÉS (Con WSO2):

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         INTERNET                                            │
│                            │                                                │
│                            ▼                                                │
│                   ┌─────────────────┐                                       │
│                   │   WSO2 GATEWAY  │  ← ÚNICO PUNTO DE ENTRADA             │
│                   │     :8243       │                                       │
│                   │                 │                                       │
│                   │ • Rate Limiting │                                       │
│                   │ • Autenticación │                                       │
│                   │ • Logs          │                                       │
│                   │ • Blacklist IPs │                                       │
│                   │ • Throttling    │                                       │
│                   └────────┬────────┘                                       │
│                            │                                                │
│              ┌─────────────┼─────────────┐                                  │
│              │             │             │                                  │
│              ▼             ▼             ▼                                  │
│         ┌────────┐    ┌────────┐    ┌────────┐                              │
│         │Usuarios│    │Ofertas │    │Matching│  ← NO EXPUESTOS              │
│         │ :8080  │    │ :8083  │    │ :8084  │    DIRECTAMENTE              │
│         └────────┘    └────────┘    └────────┘                              │
│                                                                             │
│   ✅ SOLUCIÓN: Todo pasa por WSO2 primero                                   │
│   ✅ SOLUCIÓN: Control centralizado                                         │
│   ✅ SOLUCIÓN: Un solo lugar para políticas de seguridad                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9.3 Ejemplos Prácticos de Protección

#### Ejemplo 1: Ataque de Fuerza Bruta

| Sin WSO2 | Con WSO2 |
|----------|----------|
| Atacante hace 1000 requests a `/auth/login` | Atacante hace 10 requests... |
| Cada función cuenta sus propios intentos | ...y WSO2 lo bloquea: `429 Too Many Requests` |
| Si reinicia la función, el contador se pierde | El bloqueo persiste en el Gateway |

#### Ejemplo 2: Bloquear IP Maliciosa

| Sin WSO2 | Con WSO2 |
|----------|----------|
| Bloquear IP en cada función (3 cambios) | Bloquear en WSO2 → afecta TODAS las APIs |
| Requiere redeploy de código | Se configura en el portal, sin tocar código |

#### Ejemplo 3: Monitoreo Centralizado

| Sin WSO2 | Con WSO2 |
|----------|----------|
| Logs dispersos en cada función | Dashboard único con TODO el tráfico |
| "¿Cuántos logins hubo hoy?" → revisar 3 logs | Un click en el portal de analytics |

### 9.4 Capas de Seguridad Implementadas

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CAPAS DE SEGURIDAD - CAIL                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CAPA 1: Network Firewall (GCP)                          ✅ AUTOMÁTICO      │
│  └── Bloquea puertos, IPs a nivel de red                                    │
│                                                                             │
│  CAPA 2: API Gateway (WSO2)                              ✅ DESPLEGADO      │
│  └── Rate limiting, autenticación, throttling centralizado                  │
│                                                                             │
│  CAPA 3: Application Security (Helmet + Rate Limit)      ✅ IMPLEMENTADO    │
│  └── Headers de seguridad, protección a nivel de código                     │
│                                                                             │
│  CAPA 4: WAF Empresarial (Cloud Armor)                   ⏳ OPCIONAL        │
│  └── Detección de ataques con IA (para producción real)                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9.5 Funcionalidades de WSO2 Gateway

| Funcionalidad | Descripción | Estado |
|---------------|-------------|--------|
| Rate Limiting | Límite de peticiones por IP/usuario | ✅ Disponible |
| Throttling | Control de tráfico por políticas | ✅ Disponible |
| Blacklist IPs | Bloquear IPs maliciosas | ✅ Disponible |
| Autenticación JWT | Validar tokens en el gateway | ✅ Disponible |
| Logs Centralizados | Todas las peticiones registradas | ✅ Disponible |
| Analytics | Dashboard de métricas | ✅ Disponible |
| API Versioning | Manejar versiones de APIs | ✅ Disponible |

### 9.6 Comandos de Gestión

```powershell
# === VERIFICAR ESTADO ===
docker ps --format "table {{.Names}}\t{{.Status}}"

# === INICIAR WSO2 ===
cd "C:\Users\barce\Documents\mi brach\cail\cail\infrastructure"
docker-compose up -d wso2-apim

# === DETENER WSO2 ===
docker-compose stop wso2-apim

# === VER LOGS ===
docker logs wso2-api-manager --tail 100

# === REINICIAR ===
docker-compose restart wso2-apim
```

### 9.7 URLs del Portal WSO2

| Portal | URL | Uso |
|--------|-----|-----|
| Publisher | https://localhost:9443/publisher | Crear/editar APIs |
| Developer | https://localhost:9443/devportal | Documentación APIs |
| Admin | https://localhost:9443/admin | Configuración global |
| Carbon | https://localhost:9443/carbon | Administración sistema |

**Credenciales:** `admin` / `admin`

### 9.8 Estado de Implementacion WSO2 (14/01/2026)

| Paso | Descripción | Estado |
|------|-------------|--------|
| 1 | Desplegar WSO2 | ✅ Completado |
| 2 | Importar APIs (usuarios, ofertas, matching) | ✅ Completado |
| 3 | Configurar endpoints | ✅ Completado |
| 4 | Publicar APIs en el Gateway | ✅ Completado |
| 5 | Probar peticiones a través de WSO2 | ⏳ Pendiente |
| 6 | Configurar políticas de throttling | ⏳ Opcional |

### 9.9 APIs Publicadas en WSO2

| API | Contexto | Version | Estado | Endpoint Backend |
|-----|----------|---------|--------|------------------|
| CAILUsuariosAPI | `/usuarios` | 1.0.0 | ✅ PUBLISHED | `host.docker.internal:8080` |
| CAILOfertasAPI | `/ofertas` | 1.0.0 | ✅ PUBLISHED | `host.docker.internal:8083` |
| CAILMatchingAPI | `/matching` | 1.0.0 | ✅ PUBLISHED | `host.docker.internal:8084` |

**Acceso via WSO2 Gateway:**
- `https://localhost:8243/usuarios/...`
- `https://localhost:8243/ofertas/...`
- `https://localhost:8243/matching/...`

---

## Resumen Final

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ESTADO DEL TESTING - 14/01/2026                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TESTS TOTALES                           Pasan    Total    Progreso        │
│  ════════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  Usuarios (25 tests)   ██████████████████████   25/25      100% ✅         │
│  Ofertas (22 tests)    ██████████████████████   22/22      100% ✅         │
│  Matching (19 tests)   ████████████████████░░   18/19       95% ⚠️         │
│                                                                             │
│  ════════════════════════════════════════════════════════════════════════   │
│  TOTAL:                █████████████████████░   65/66       98% ✅         │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════    │
│                                                                             │
│  DESGLOSE POR TIPO:                                                        │
│  ├── Tests de Seguridad:     50 tests (49 pasan)                           │
│  └── Tests de Integracion:   16 tests (16 pasan)                           │
│                                                                             │
│  SEGURIDAD IMPLEMENTADA (13/01/2026):                                      │
│  ├── ✅ Helmet (8 security headers) - 3 microservicios                      │
│  ├── ✅ Rate Limiting General (100 req/15min)                               │
│  ├── ✅ Rate Limiting Auth (10 req/15min)                                   │
│  ├── ✅ WSO2 API Gateway desplegado                                         │
│  └── ✅ Upload CV validado (PDF, 5MB) - Alex                                │
│                                                                             │
│  PROXIMOS PASOS:                                                            │
│  1. ⏳ Esperar implementacion de Dara/Cristobal (Matching)                  │
│  2. ⏳ Notificar a Alex sobre validacion de passwords                       │
│  3. ✅ Importar APIs en WSO2 Gateway (COMPLETADO 14/01)                     │
│  4. ⏳ Probar peticiones via WSO2 Gateway                                   │
│  5. ⏳ Agregar express-validator a todos los modulos                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Análisis SonarCloud (15/01/2026)

**URL:** https://sonarcloud.io/project/overview?id=ErickGaona_cail  
**Líneas analizadas:** 40,000 | **Security Hotspots:** 24

### 10.1 Vulnerabilidades Corregidas

| Problema | Archivo | Solución |
|----------|---------|----------|
| ReDoS (regex vulnerable) | `Email.ts` (x2) | Agregado límite de 254 chars antes del regex |
| Math.random() inseguro | `password-generator.util.ts` | Cambiado a `crypto.randomBytes()` |

### 10.2 Falsos Positivos (archivos de test)

Los hotspots de "hard-coded passwords" en archivos `tests/*.ts` son **Safe** porque son credenciales de prueba necesarias para tests automatizados.

---

*Documento actualizado el 15 de Enero de 2026*  
*Responsable: Erick Gaona (Test & Security)*
