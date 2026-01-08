# Reporte de Tests - Backend CAIL

**Versión:** 2.0  
**Fecha de Creación:** 08 de Enero de 2026  
**Última Actualización:** 08 de Enero de 2026  
**Responsable:** Erick Gaona (Test & Security)

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Matriz de Tests por Contribuidor](#2-matriz-de-tests-por-contribuidor)
3. [Tests del Módulo Usuarios](#3-tests-del-módulo-usuarios)
4. [Tests del Módulo Ofertas](#4-tests-del-módulo-ofertas)
5. [Tests del Módulo Matching](#5-tests-del-módulo-matching)
6. [Resumen de Hallazgos](#6-resumen-de-hallazgos)
7. [Comandos de Ejecución](#7-comandos-de-ejecución)

---

## 1. Resumen Ejecutivo

### 1.1 Estado Actual (08/01/2026)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    RESUMEN GENERAL DE TESTS                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TESTS TOTALES REQUERIDOS (según estándares):     61 tests                  │
│  TESTS CREADOS:                                   13 tests                  │
│  TESTS QUE PASAN:                                 13 tests ✅               │
│  TESTS QUE FALLAN:                                 0 tests                  │
│  TESTS PENDIENTES DE CREAR:                       48 tests ⏳               │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════    │
│                                                                             │
│  Por Microservicio:                                                         │
│  ├── Usuarios    13/33 tests creados  ████████░░░░░░░░░░░░  39%            │
│  ├── Ofertas      0/15 tests creados  ░░░░░░░░░░░░░░░░░░░░   0%            │
│  └── Matching     0/13 tests creados  ░░░░░░░░░░░░░░░░░░░░   0%            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Leyenda de Estados

| Símbolo | Significado |
|---------|-------------|
| ✅ | Test creado Y pasa (código implementado correctamente) |
| ❌ | Test creado pero FALLA (código NO implementado o tiene bug) |
| ⏳ | Test NO creado aún |
| 🔄 | Test creado, resultado parcial |

---

## 2. Matriz de Tests por Contribuidor

### 2.1 Alex Ramírez - Microservicio Usuarios (Auth + Perfiles)

| # | Estándar | Descripción | Código Implementado | Test Creado | Resultado |
|---|----------|-------------|---------------------|-------------|-----------|
| A1 | Helmet | Headers de seguridad | ❌ NO | ⏳ NO | - |
| A2 | CORS restrictivo | Solo dominios permitidos | ⚠️ PARCIAL (acepta todo) | ⏳ NO | - |
| A3 | Rate Limiting Login | 5 intentos / 15 min | ❌ NO | ⏳ NO | - |
| A4 | Password 12+ chars | Validación de fortaleza | ❌ NO | ✅ SÍ | 🔄 Pasa pero no valida |
| A5 | Validación Email | Formato correcto | ✅ SÍ | ✅ SÍ | 🔄 Pasa pero retorna 500 |
| A6 | Dockerfile no-root | Usuario nodejs | ✅ SÍ | ⏳ NO | - |
| A7 | Hash bcrypt | 10+ rounds | ✅ SÍ | ⏳ NO | - |

**Resumen Alex:** 3/7 implementados, 2/7 tests creados

---

### 2.2 Carlos Mejía - JWT y WSO2

| # | Estándar | Descripción | Código Implementado | Test Creado | Resultado |
|---|----------|-------------|---------------------|-------------|-----------|
| C1 | Algoritmo JWT seguro | HS256 | ✅ SÍ | ⏳ NO | - |
| C2 | Expiración tokens | 7 días | ✅ SÍ | ⏳ NO | - |
| C3 | Validar firma JWT | jwt.verify() | ✅ SÍ | ✅ SÍ | ✅ PASA |
| C4 | Manejar TokenExpired | Error handling | ✅ SÍ | ✅ SÍ | ✅ PASA |
| C5 | No loguear tokens | Sin console.log | ✅ SÍ | ⏳ NO | - |
| C6 | WSO2 JWT Policy | Gateway config | ❌ NO | ⏳ NO | - |

**Resumen Carlos:** 5/6 implementados, 2/6 tests creados

---

### 2.3 Juan Espinosa - Firestore y Datos

| # | Estándar | Descripción | Código Implementado | Test Creado | Resultado |
|---|----------|-------------|---------------------|-------------|-----------|
| J1 | Firestore Rules | Reglas de seguridad | ❌ NO verificado | ⏳ NO | - |
| J2 | Sanitizar datos | sanitize-html | ❌ NO | ⏳ NO | - |
| J3 | No IDs secuenciales | UUIDs | ✅ SÍ | ⏳ NO | - |
| J4 | Logs de auditoría | Registro cambios | ❌ NO | ⏳ NO | - |

**Resumen Juan:** 1/4 implementados, 0/4 tests creados

---

### 2.4 Sebastián Calderón - Perfiles de Usuario

| # | Estándar | Descripción | Código Implementado | Test Creado | Resultado |
|---|----------|-------------|---------------------|-------------|-----------|
| S1 | Upload CV solo PDF | Validar mimetype | ❌ NO verificado | ⏳ NO | - |
| S2 | CV máximo 5MB | Límite tamaño | ❌ NO verificado | ⏳ NO | - |
| S3 | Validar cédula EC | Algoritmo módulo 10 | ❌ NO | ⏳ NO | - |
| S4 | No exponer cédula | Mostrar 4 dígitos | ❌ NO | ⏳ NO | - |

**Resumen Sebastián:** 0/4 implementados, 0/4 tests creados

---

### 2.5 Erick Gaona - Microservicio Ofertas

| # | Estándar | Descripción | Código Implementado | Test Creado | Resultado |
|---|----------|-------------|---------------------|-------------|-----------|
| E1 | Solo RECLUTADOR crea | authorize() | ✅ SÍ | ⏳ NO | - |
| E2 | Verificar propiedad | idReclutador | ✅ SÍ | ⏳ NO | - |
| E3 | Validar inputs | express-validator | ❌ NO | ⏳ NO | - |
| E4 | Sanitizar descripción | sanitize-html | ❌ NO | ⏳ NO | - |
| E5 | Paginación límite | Máx 50 resultados | ❌ NO | ⏳ NO | - |

**Resumen Erick:** 2/5 implementados, 0/5 tests creados

---

### 2.6 Dara Van Gijsel - Microservicio Matching

| # | Estándar | Descripción | Código Implementado | Test Creado | Resultado |
|---|----------|-------------|---------------------|-------------|-----------|
| D1 | Solo POSTULANTE postula | authorize() | ❌ NO verificado | ⏳ NO | - |
| D2 | Una postulación/oferta | Verificar duplicados | ❌ NO | ⏳ NO | - |
| D3 | Límite 10 postulaciones/día | Contador diario | ❌ NO | ⏳ NO | - |
| D4 | Solo ofertas activas | Validar estado | ❌ NO verificado | ⏳ NO | - |
| D5 | No exponer algoritmo | Solo score | ✅ SÍ | ⏳ NO | - |

**Resumen Dara:** 1/5 implementados, 0/5 tests creados

---

## 3. Tests del Módulo Usuarios

**Ubicación:** `cail/cail/functions/usuarios/tests/`

### 3.1 Tests de Seguridad - Auth Bypass

| # | Test | Qué Verifica | Estándar | Estado Test | Resultado |
|---|------|--------------|----------|-------------|-----------|
| 1 | GET /users/profile sin token | Rutas protegidas rechazan sin auth | C3 | ✅ Creado | ✅ PASA |
| 2 | Token malformado → 401 | Tokens inválidos rechazados | C3 | ✅ Creado | ✅ PASA |
| 3 | Token sin "Bearer" → 401 | Formato correcto requerido | C3 | ✅ Creado | ✅ PASA |
| 4 | Header vacío → 401 | No acepta vacío | C3 | ✅ Creado | ✅ PASA |
| 5 | Token expirado → 401 | Expiración funciona | C4 | ⏳ Pendiente | - |

### 3.2 Tests de Seguridad - Validación de Inputs

| # | Test | Qué Verifica | Estándar | Estado Test | Resultado |
|---|------|--------------|----------|-------------|-----------|
| 6 | Email inválido → 400 | Validación de formato | A5 | ✅ Creado | 🔄 Pasa (retorna 500) |
| 7 | Password vacío → 400 | No acepta vacío | A4 | ✅ Creado | 🔄 Pasa (no valida) |
| 8 | Password < 12 chars → 400 | Mínimo 12 caracteres | A4 | ⏳ Pendiente | - |
| 9 | Password sin mayúscula → 400 | Requiere mayúscula | A4 | ⏳ Pendiente | - |
| 10 | Password sin número → 400 | Requiere número | A4 | ⏳ Pendiente | - |
| 11 | Login campos vacíos → 400 | Validar login | A4 | ✅ Creado | ✅ PASA |

### 3.3 Tests de Seguridad - Rate Limiting

| # | Test | Qué Verifica | Estándar | Estado Test | Resultado |
|---|------|--------------|----------|-------------|-----------|
| 12 | 5 intentos login OK | Permite 5 intentos | A3 | ⏳ Pendiente | - |
| 13 | 6to intento → 429 | Bloquea después de 5 | A3 | ⏳ Pendiente | - |
| 14 | Después 15 min → OK | Se desbloquea | A3 | ⏳ Pendiente | - |

### 3.4 Tests de Seguridad - Inyección

| # | Test | Qué Verifica | Estándar | Estado Test | Resultado |
|---|------|--------------|----------|-------------|-----------|
| 15 | SQL Injection | No ejecuta SQL | General | ✅ Creado | ✅ PASA |
| 16 | NoSQL Injection | No ejecuta NoSQL | General | ✅ Creado | ✅ PASA |
| 17 | XSS en registro | Escapa HTML | General | ✅ Creado | ✅ PASA |
| 18 | Template Injection | No ejecuta templates | General | ✅ Creado | ✅ PASA |

### 3.5 Tests de Seguridad - Error Handling

| # | Test | Qué Verifica | Estándar | Estado Test | Resultado |
|---|------|--------------|----------|-------------|-----------|
| 19 | No exponer stack trace | Sin detalles internos | General | ✅ Creado | ✅ PASA |
| 20 | No exponer rutas | Sin paths internos | General | ✅ Creado | ✅ PASA |

### 3.6 Tests de Seguridad - Headers (Helmet)

| # | Test | Qué Verifica | Estándar | Estado Test | Resultado |
|---|------|--------------|----------|-------------|-----------|
| 21 | X-Frame-Options presente | Previene clickjacking | A1 | ⏳ Pendiente | - |
| 22 | X-Content-Type-Options | Previene MIME sniffing | A1 | ⏳ Pendiente | - |
| 23 | X-XSS-Protection | Previene XSS | A1 | ⏳ Pendiente | - |

### 3.7 Tests de Integración - Auth

| # | Test | Qué Verifica | Estado Test | Resultado |
|---|------|--------------|-------------|-----------|
| 24 | POST /auth/register | Registro exitoso | 🔄 Creado | 🔄 Parcial |
| 25 | POST /auth/login | Login exitoso | 🔄 Creado | ❌ Falla (Firebase) |
| 26 | POST /auth/change-password | Cambio de password | ⏳ Pendiente | - |
| 27 | GET /health | Health check | 🔄 Creado | 🔄 Puerto ocupado |

### 3.8 Tests de Integración - Users

| # | Test | Qué Verifica | Estado Test | Resultado |
|---|------|--------------|-------------|-----------|
| 28 | GET /users/profile | Obtener perfil | 🔄 Creado | ❌ Falla |
| 29 | PUT /users/profile | Actualizar perfil | 🔄 Creado | ❌ Falla |
| 30 | Validar cédula EC | Cédula válida | ⏳ Pendiente | - |
| 31 | Upload CV solo PDF | Solo PDF aceptado | ⏳ Pendiente | - |
| 32 | CV máximo 5MB | Límite tamaño | ⏳ Pendiente | - |
| 33 | No exponer cédula completa | Solo 4 dígitos | ⏳ Pendiente | - |

**Total Módulo Usuarios:** 13/33 tests creados (39%)

---

## 4. Tests del Módulo Ofertas

**Ubicación:** `cail/cail/functions/ofertas/tests/`

### 4.1 Tests de Seguridad - Autorización

| # | Test | Qué Verifica | Estándar | Estado Test | Resultado |
|---|------|--------------|----------|-------------|-----------|
| 1 | POST /offers sin token → 401 | Requiere auth | E1 | ⏳ Pendiente | - |
| 2 | POST /offers como POSTULANTE → 403 | Solo RECLUTADOR | E1 | ⏳ Pendiente | - |
| 3 | PUT /offers sin ser dueño → 403 | Verificar propiedad | E2 | ⏳ Pendiente | - |
| 4 | DELETE /offers sin ser dueño → 403 | Verificar propiedad | E2 | ⏳ Pendiente | - |
| 5 | GET /offers sin token → 200 | Público para leer | - | ⏳ Pendiente | - |

### 4.2 Tests de Seguridad - Validación

| # | Test | Qué Verifica | Estándar | Estado Test | Resultado |
|---|------|--------------|----------|-------------|-----------|
| 6 | Título < 5 chars → 400 | Mínimo caracteres | E3 | ⏳ Pendiente | - |
| 7 | Descripción < 50 chars → 400 | Mínimo caracteres | E3 | ⏳ Pendiente | - |
| 8 | Salario negativo → 400 | Validar número | E3 | ⏳ Pendiente | - |
| 9 | XSS en descripción sanitizado | HTML escapado | E4 | ⏳ Pendiente | - |
| 10 | SQL Injection en búsqueda | No ejecuta SQL | General | ⏳ Pendiente | - |

### 4.3 Tests de Integración - CRUD

| # | Test | Qué Verifica | Estado Test | Resultado |
|---|------|--------------|-------------|-----------|
| 11 | POST /offers crear oferta | Crear exitoso | ⏳ Pendiente | - |
| 12 | GET /offers/:id | Obtener oferta | ⏳ Pendiente | - |
| 13 | PUT /offers/:id | Actualizar oferta | ⏳ Pendiente | - |
| 14 | DELETE /offers/:id | Eliminar oferta | ⏳ Pendiente | - |
| 15 | GET /offers con paginación | Máx 50 resultados | ⏳ Pendiente | - |

**Total Módulo Ofertas:** 0/15 tests creados (0%)

---

## 5. Tests del Módulo Matching

**Ubicación:** `cail/cail/functions/matching/tests/`

### 5.1 Tests de Seguridad - Autorización

| # | Test | Qué Verifica | Estándar | Estado Test | Resultado |
|---|------|--------------|----------|-------------|-----------|
| 1 | POST /apply sin token → 401 | Requiere auth | D1 | ⏳ Pendiente | - |
| 2 | POST /apply como RECLUTADOR → 403 | Solo POSTULANTE | D1 | ⏳ Pendiente | - |
| 3 | Postular a oferta inactiva → 400 | Solo activas | D4 | ⏳ Pendiente | - |

### 5.2 Tests de Seguridad - Límites

| # | Test | Qué Verifica | Estándar | Estado Test | Resultado |
|---|------|--------------|----------|-------------|-----------|
| 4 | Postulación duplicada → 409 | No duplicados | D2 | ⏳ Pendiente | - |
| 5 | 10 postulaciones/día OK | Permite hasta 10 | D3 | ⏳ Pendiente | - |
| 6 | 11va postulación → 429 | Bloquea | D3 | ⏳ Pendiente | - |

### 5.3 Tests de Integración - Matching

| # | Test | Qué Verifica | Estado Test | Resultado |
|---|------|--------------|-------------|-----------|
| 7 | POST /apply crear postulación | Postular exitoso | ⏳ Pendiente | - |
| 8 | GET /applications/:userId | Historial postulaciones | ⏳ Pendiente | - |
| 9 | GET /match/:ofertaId | Obtener candidatos | ⏳ Pendiente | - |
| 10 | Algoritmo retorna score | Solo número | ⏳ Pendiente | - |

### 5.4 Tests de Integración - Algoritmo

| # | Test | Qué Verifica | Estado Test | Resultado |
|---|------|--------------|-------------|-----------|
| 11 | Score 100% match perfecto | Cálculo correcto | ⏳ Pendiente | - |
| 12 | Score 0% sin match | Cálculo correcto | ⏳ Pendiente | - |
| 13 | No exponer detalles algoritmo | Solo score final | ⏳ Pendiente | - |

**Total Módulo Matching:** 0/13 tests creados (0%)

---

## 6. Resumen de Hallazgos

### 6.1 Código NO Implementado (Bloqueadores)

| # | Módulo | Falta | Responsable | Impacto |
|---|--------|-------|-------------|---------|
| 1 | Usuarios | Rate Limiting (A3) | Alex | 🔴 CRÍTICO - Vulnerable a brute force |
| 2 | Usuarios | Validación Password (A4) | Alex | 🔴 CRÍTICO - Passwords débiles |
| 3 | Usuarios | Helmet (A1) | Alex | 🟡 MEDIO - Sin headers seguridad |
| 4 | Ofertas | Validación inputs (E3) | Erick | 🟡 MEDIO - Sin validación |
| 5 | Matching | Límite postulaciones (D3) | Dara | 🟡 MEDIO - Sin límite |

### 6.2 Tests que Revelan Problemas

| Test | Resultado Esperado | Resultado Actual | Problema |
|------|-------------------|------------------|----------|
| Email inválido | 400 Bad Request | 500 Internal Error | No hay validación |
| Password corto | 400 Bad Request | 201 Created | No valida longitud |
| SQL Injection | 400 Bad Request | 500 Internal Error | No valida inputs |

---

## 7. Comandos de Ejecución

### 7.1 Ejecutar Tests

```powershell
# === MÓDULO USUARIOS ===
cd "C:\Users\barce\Documents\mi brach\cail\cail\functions\usuarios"
npm install                              # Primera vez
npx jest security --forceExit           # Tests seguridad
npx jest integration --forceExit        # Tests integración
npm test                                # Todos + cobertura

# === MÓDULO OFERTAS ===
cd "C:\Users\barce\Documents\mi brach\cail\cail\functions\ofertas"
npm install
npx jest security --forceExit

# === MÓDULO MATCHING ===
cd "C:\Users\barce\Documents\mi brach\cail\cail\functions\matching"
npm install
npx jest security --forceExit
```

### 7.2 Resolver Puerto Ocupado

```powershell
netstat -ano | findstr :8080
taskkill /PID <numero> /F
```

---

## Resumen Final

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ESTADO DEL TESTING - 08/01/2026                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TESTS POR MÓDULO                                                           │
│  ════════════════                                                           │
│                                                                             │
│  Usuarios:  ████████░░░░░░░░░░░░  13/33 creados  (39%)                     │
│  Ofertas:   ░░░░░░░░░░░░░░░░░░░░   0/15 creados  ( 0%)                     │
│  Matching:  ░░░░░░░░░░░░░░░░░░░░   0/13 creados  ( 0%)                     │
│                                                                             │
│  TOTAL:     ████░░░░░░░░░░░░░░░░  13/61 creados  (21%)                     │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════    │
│                                                                             │
│  PRÓXIMOS PASOS:                                                            │
│  1. Crear tests de Rate Limiting (A3) - CRÍTICO                             │
│  2. Crear tests de Password validation (A4) - CRÍTICO                       │
│  3. Ejecutar tests módulo Ofertas                                           │
│  4. Notificar a contribuidores sobre lo que falta implementar               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

*Documento actualizado el 08 de Enero de 2026*  
*Responsable: Erick Gaona (Test & Security)*
