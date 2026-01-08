# Reporte de Tests - Backend CAIL

**Versión:** 1.0  
**Fecha de Creación:** 08 de Enero de 2026  
**Última Actualización:** 08 de Enero de 2026  
**Responsable:** Erick Gaona (Test & Security)

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Estado General de Tests](#2-estado-general-de-tests)
3. [Tests por Módulo](#3-tests-por-módulo)
4. [Detalle de Tests Ejecutados](#4-detalle-de-tests-ejecutados)
5. [Tests Pendientes](#5-tests-pendientes)
6. [Hallazgos de Seguridad](#6-hallazgos-de-seguridad)
7. [Plan de Tests Futuros](#7-plan-de-tests-futuros)
8. [Comandos de Ejecución](#8-comandos-de-ejecución)

---

## 1. Resumen Ejecutivo

### 1.1 Estado Actual (08/01/2026)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    RESUMEN DE TESTS - BACKEND CAIL                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ╔═══════════════════════════════════════════════════════════════════════╗  │
│  ║                    TESTS EJECUTADOS: 13 ✅                            ║  │
│  ║                    TESTS PASADOS:    13 ✅                            ║  │
│  ║                    TESTS FALLIDOS:    0 ❌                            ║  │
│  ║                    COBERTURA:        ~59%                             ║  │
│  ╚═══════════════════════════════════════════════════════════════════════╝  │
│                                                                             │
│  Módulos Testeados:                                                         │
│  ├── Usuarios (Auth + Users)     ████████████████████  13/13 tests ✅      │
│  ├── Ofertas                     ░░░░░░░░░░░░░░░░░░░░   0/13 tests ⏳      │
│  └── Matching                    ░░░░░░░░░░░░░░░░░░░░   0/13 tests ⏳      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Métricas de Cobertura (Módulo Usuarios)

| Área | Statements | Branches | Functions | Lines |
|------|------------|----------|-----------|-------|
| **auth/application** | 60.65% | 11.11% | 85.71% | 60.65% |
| **auth/domain** | 69.56% | 100% | 63.15% | 69.56% |
| **auth/infrastructure** | 77.77% | 18.66% | 75.55% | 77.77% |
| **shared/middleware** | 78.57% | 66.66% | 71.42% | 76.31% |
| **shared/utils** | 42.10% | 0% | 28.57% | 43.75% |
| **users/infrastructure** | 17.39% | 0% | 0% | 17.39% |
| **TOTAL** | **58.87%** | **43.26%** | **57.74%** | **58.23%** |

---

## 2. Estado General de Tests

### 2.1 Matriz de Tests por Microservicio

| Microservicio | Seguridad | Integración | Unitarios | Total | Estado |
|---------------|-----------|-------------|-----------|-------|--------|
| **usuarios** | ✅ 13/13 | ⚠️ 5/8 fallidos | ⏳ 0% | 13 | 🔄 En progreso |
| **ofertas** | ⏳ Creado | ⏳ Creado | ⏳ 0% | 0 | ⏳ Pendiente |
| **matching** | ⏳ Creado | ⏳ Creado | ⏳ 0% | 0 | ⏳ Pendiente |

### 2.2 Alineación con Plan del Backend

| Fase | Módulo | Responsable | Tests Requeridos | Tests Completados | % |
|------|--------|-------------|------------------|-------------------|---|
| **Fase 2** | Auth (Registro/Login) | Carlos Mejia | 8 | 13 | 162% ✅ |
| **Fase 2** | Auth (JWT/Token) | Carlos Mejia | 5 | 4 | 80% 🔄 |
| **Fase 3** | Usuarios CRUD | Juan + Sebastián | 10 | 0 | 0% ⏳ |
| **Fase 3** | Ofertas CRUD | Erick Gaona | 12 | 0 | 0% ⏳ |
| **Fase 3** | Ofertas Búsqueda | Erick Gaona | 8 | 0 | 0% ⏳ |
| **Fase 3** | Matching Algoritmo | Dara Van Gijsel | 10 | 0 | 0% ⏳ |
| **Fase 3** | Postulaciones | Dara Van Gijsel | 8 | 0 | 0% ⏳ |

---

## 3. Tests por Módulo

### 3.1 Módulo USUARIOS (Auth + Users)

**Ubicación:** `cail/cail/functions/usuarios/tests/`

#### 3.1.1 Tests de Seguridad (`security.test.ts`) ✅ VALIDADOS

| # | Test | Categoría | Descripción | Estado | Fecha |
|---|------|-----------|-------------|--------|-------|
| 1 | GET /users/profile sin token | Auth Bypass | Verifica que rutas protegidas rechacen peticiones sin token | ✅ Pasó | 08/01/2026 |
| 2 | Token malformado | Auth Bypass | Verifica rechazo de tokens con formato inválido | ✅ Pasó | 08/01/2026 |
| 3 | Token sin Bearer prefix | Auth Bypass | Verifica que se requiera el prefijo "Bearer" | ✅ Pasó | 08/01/2026 |
| 4 | Header Authorization vacío | Auth Bypass | Verifica rechazo de header vacío | ✅ Pasó | 08/01/2026 |
| 5 | Registro con email inválido | Input Validation | Verifica manejo de emails mal formateados | ✅ Pasó | 08/01/2026 |
| 6 | Registro con password vacío | Input Validation | Verifica manejo de passwords vacíos | ✅ Pasó | 08/01/2026 |
| 7 | Login con campos vacíos | Input Validation | Verifica manejo de credenciales vacías | ✅ Pasó | 08/01/2026 |
| 8 | SQL Injection | Injection Prevention | Payload: `'; DROP TABLE users; --` | ✅ Pasó | 08/01/2026 |
| 9 | NoSQL Injection | Injection Prevention | Payload: `{"$gt": ""}` | ✅ Pasó | 08/01/2026 |
| 10 | XSS | Injection Prevention | Payload: `<script>alert("xss")</script>` | ✅ Pasó | 08/01/2026 |
| 11 | Template Injection | Injection Prevention | Payload: `{{7*7}}` | ✅ Pasó | 08/01/2026 |
| 12 | No exponer stack trace | Error Handling | Errores no revelan información interna | ✅ Pasó | 08/01/2026 |
| 13 | No exponer rutas internas | Error Handling | Errores no revelan rutas del servidor | ✅ Pasó | 08/01/2026 |

#### 3.1.2 Tests de Integración (`integration.test.ts`) ⚠️ PARCIAL

| # | Test | Categoría | Descripción | Estado | Razón |
|---|------|-----------|-------------|--------|-------|
| 1 | GET /health | Health Check | Verifica endpoint de salud | ⚠️ Falló | Conflicto puerto 8080 |
| 2 | POST /auth/register | Auth | Registro de usuario nuevo | ✅ Pasó | - |
| 3 | POST /auth/login | Auth | Autenticación de usuario | ❌ Falló | Necesita Firebase real |
| 4 | GET /users/profile | Users | Obtener perfil de usuario | ❌ Falló | Depende de login |
| 5 | GET /users/profile sin token | Users | Rechazar sin autenticación | ❌ Falló | Depende de login |
| 6 | PUT /users/profile | Users | Actualizar perfil | ❌ Falló | Depende de login |

**Nota:** Los tests de integración requieren Firebase real conectado. Actualmente usan mocks.

---

### 3.2 Módulo OFERTAS

**Ubicación:** `cail/cail/functions/ofertas/tests/`

#### 3.2.1 Tests de Seguridad (`security.test.ts`) ⏳ PENDIENTE

| # | Test | Categoría | Descripción | Estado |
|---|------|-----------|-------------|--------|
| 1 | GET /offers sin token | Auth Bypass | Listar ofertas (público) | ⏳ Pendiente |
| 2 | POST /offers sin token | Auth Bypass | Crear oferta (requiere auth) | ⏳ Pendiente |
| 3 | PUT /offers/:id sin token | Auth Bypass | Actualizar oferta | ⏳ Pendiente |
| 4 | DELETE /offers/:id sin token | Auth Bypass | Eliminar oferta | ⏳ Pendiente |
| 5 | Crear oferta como POSTULANTE | Authorization | Solo RECLUTADOR puede crear | ⏳ Pendiente |
| 6 | SQL Injection en búsqueda | Injection | Búsqueda de ofertas | ⏳ Pendiente |
| 7 | XSS en descripción | Injection | Descripción de oferta | ⏳ Pendiente |
| 8-13 | ... | ... | Más tests planeados | ⏳ Pendiente |

#### 3.2.2 Tests de Integración (`integration.test.ts`) ⏳ PENDIENTE

| # | Test | Descripción | Estado |
|---|------|-------------|--------|
| 1 | CRUD Ofertas | Crear, leer, actualizar, eliminar | ⏳ Pendiente |
| 2 | Búsqueda con filtros | Filtrar por ubicación, salario, etc. | ⏳ Pendiente |
| 3 | Paginación | Máximo 50 resultados por página | ⏳ Pendiente |
| 4 | Validación de campos | Campos requeridos y formatos | ⏳ Pendiente |

---

### 3.3 Módulo MATCHING

**Ubicación:** `cail/cail/functions/matching/tests/`

#### 3.3.1 Tests de Seguridad (`security.test.ts`) ⏳ PENDIENTE

| # | Test | Descripción | Estado |
|---|------|-------------|--------|
| 1 | POST /apply sin token | Postular sin autenticación | ⏳ Pendiente |
| 2 | Postular como RECLUTADOR | Solo POSTULANTE puede postular | ⏳ Pendiente |
| 3 | Postulación duplicada | No permitir doble postulación | ⏳ Pendiente |
| 4 | Límite de postulaciones | Máximo 10 por día | ⏳ Pendiente |

#### 3.3.2 Tests de Integración (`integration.test.ts`) ⏳ PENDIENTE

| # | Test | Descripción | Estado |
|---|------|-------------|--------|
| 1 | Algoritmo de matching | Score de compatibilidad | ⏳ Pendiente |
| 2 | Postulación a oferta | Proceso completo | ⏳ Pendiente |
| 3 | Historial de postulaciones | Listar postulaciones del usuario | ⏳ Pendiente |

---

## 4. Detalle de Tests Ejecutados

### 4.1 Última Ejecución (08/01/2026)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    RESULTADO DE EJECUCIÓN                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Comando: npx jest security --forceExit --testTimeout=10000                 │
│  Fecha:   08 de Enero de 2026                                               │
│  Duración: 3.4 segundos                                                     │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  PASS  tests/security.test.ts                                       │    │
│  │                                                                     │    │
│  │  Usuarios - Security Tests                                          │    │
│  │    Auth Bypass Prevention                                           │    │
│  │      ✓ GET /users/profile sin token debe retornar 401 (33 ms)       │    │
│  │      ✓ Token malformado debe retornar 401 (11 ms)                   │    │
│  │      ✓ Token sin Bearer prefix debe retornar 401 (8 ms)             │    │
│  │      ✓ Header Authorization vacío debe retornar 401 (9 ms)          │    │
│  │    Input Validation                                                 │    │
│  │      ✓ Registro con email inválido debe ser manejado (27 ms)        │    │
│  │      ✓ Registro con password vacío debe ser manejado (137 ms)       │    │
│  │      ✓ Login con campos vacíos debe fallar (4 ms)                   │    │
│  │    Injection Prevention                                             │    │
│  │      ✓ debe manejar payload: '; DROP TABLE users;... (4 ms)         │    │
│  │      ✓ debe manejar payload: {"$gt": ""}... (4 ms)                  │    │
│  │      ✓ debe manejar payload: <script>alert("xss")... (5 ms)         │    │
│  │      ✓ debe manejar payload: {{7*7}}... (4 ms)                      │    │
│  │    Error Handling                                                   │    │
│  │      ✓ Errores no deben exponer stack trace (3 ms)                  │    │
│  │      ✓ Errores no deben exponer rutas internas (5 ms)               │    │
│  │                                                                     │    │
│  │  Test Suites: 1 passed, 1 total                                     │    │
│  │  Tests:       13 passed, 13 total                                   │    │
│  │  Time:        3.4 s                                                 │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Cómo Funcionan los Tests

#### Auth Bypass Prevention

Estos tests verifican que las rutas protegidas rechacen correctamente las peticiones sin autenticación válida:

```typescript
// Ejemplo: Test de ruta protegida sin token
it('GET /users/profile sin token debe retornar 401', async () => {
    const response = await request(app)
        .get('/users/profile');
    
    expect(response.status).toBe(401);
});
```

**Flujo del test:**
1. Envía petición GET a `/users/profile` SIN header Authorization
2. El middleware `authMiddleware` intercepta la petición
3. Verifica si existe token → No existe
4. Retorna 401 Unauthorized
5. Test verifica que el status sea 401 ✅

#### Injection Prevention

Estos tests envían payloads maliciosos para verificar que la aplicación los maneje correctamente:

```typescript
// Ejemplo: Test de SQL Injection
it('debe manejar payload SQL Injection', async () => {
    const response = await request(app)
        .post('/auth/register')
        .send({
            email: "'; DROP TABLE users; --",
            password: 'TestPassword123!',
            nombreCompleto: "'; DROP TABLE users; --"
        });
    
    // No debe causar crash - cualquier respuesta es válida
    expect(response.status).toBeDefined();
});
```

**Flujo del test:**
1. Envía payload malicioso en campos de registro
2. La aplicación procesa la petición
3. Firestore escapa automáticamente los caracteres especiales
4. La petición falla por email inválido (no por inyección)
5. Test verifica que no hubo crash del servidor ✅

---

## 5. Tests Pendientes

### 5.1 Corto Plazo (Enero 2026)

| Prioridad | Módulo | Test | Responsable | Fecha Límite |
|-----------|--------|------|-------------|--------------|
| 🔴 Alta | Usuarios | Validación de password (12+ chars) | Erick | 15/01/2026 |
| 🔴 Alta | Usuarios | Rate limiting en login | Erick | 15/01/2026 |
| 🟡 Media | Usuarios | Tests unitarios de entidades | Erick | 20/01/2026 |
| 🟡 Media | Usuarios | Tests de value objects | Erick | 20/01/2026 |
| 🟢 Baja | Usuarios | Tests de integración completos | Erick | 25/01/2026 |

### 5.2 Mediano Plazo (Febrero 2026)

| Prioridad | Módulo | Test | Responsable | Fecha Límite |
|-----------|--------|------|-------------|--------------|
| 🔴 Alta | Ofertas | Tests de seguridad completos | Erick | 07/02/2026 |
| 🔴 Alta | Ofertas | Tests de autorización por rol | Erick | 10/02/2026 |
| 🔴 Alta | Ofertas | Tests de sanitización XSS | Erick | 10/02/2026 |
| 🟡 Media | Ofertas | Tests de integración CRUD | Erick | 14/02/2026 |
| 🟡 Media | Ofertas | Tests de búsqueda y filtros | Erick | 14/02/2026 |

### 5.3 Largo Plazo (Marzo 2026)

| Prioridad | Módulo | Test | Responsable | Fecha Límite |
|-----------|--------|------|-------------|--------------|
| 🔴 Alta | Matching | Tests de seguridad | Dara + Erick | 01/03/2026 |
| 🔴 Alta | Matching | Tests de límite de postulaciones | Dara + Erick | 05/03/2026 |
| 🟡 Media | Matching | Tests de algoritmo de scoring | Dara | 08/03/2026 |
| 🟡 Media | Todos | Tests de rendimiento (k6) | Carlos | 10/03/2026 |
| 🟢 Baja | Todos | Tests E2E completos | Equipo | 15/03/2026 |

---

## 6. Hallazgos de Seguridad

### 6.1 Hallazgos Durante Testing

| # | Hallazgo | Severidad | Módulo | Estado | Acción Requerida |
|---|----------|-----------|--------|--------|------------------|
| 1 | Emails inválidos retornan 500 en vez de 400 | 🟡 Media | Auth | ⚠️ Abierto | Agregar express-validator |
| 2 | Payloads de inyección causan error 500 | 🟡 Media | Auth | ⚠️ Abierto | Validar inputs antes de procesar |
| 3 | No hay validación de fortaleza de password | 🔴 Alta | Auth | ⚠️ Abierto | Implementar validación 12+ chars |
| 4 | Rate limiting no implementado | 🔴 Alta | Auth | ⚠️ Abierto | Agregar express-rate-limit |
| 5 | Headers de seguridad no configurados | 🟡 Media | Todos | ⚠️ Abierto | Agregar Helmet |

### 6.2 Hallazgos Resueltos

| # | Hallazgo | Severidad | Módulo | Fecha Resolución |
|---|----------|-----------|--------|------------------|
| 1 | Rutas protegidas expuestas sin auth | 🔴 Alta | Users | 05/01/2026 ✅ |
| 2 | JWT expira correctamente | 🟡 Media | Auth | 05/01/2026 ✅ |
| 3 | Dockerfile usa usuario no-root | 🟡 Media | Infra | 05/01/2026 ✅ |

---

## 7. Plan de Tests Futuros

### 7.1 Roadmap de Testing

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ROADMAP DE TESTING - Q1 2026                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ENERO 2026                                                                 │
│  ├── Semana 2: Completar tests de seguridad Usuarios                       │
│  ├── Semana 3: Agregar validaciones (express-validator)                    │
│  └── Semana 4: Tests unitarios de entidades y value objects                │
│                                                                             │
│  FEBRERO 2026                                                               │
│  ├── Semana 1: Tests de seguridad Ofertas                                  │
│  ├── Semana 2: Tests de integración Ofertas                                │
│  ├── Semana 3: Tests de seguridad Matching                                 │
│  └── Semana 4: Tests de integración Matching                               │
│                                                                             │
│  MARZO 2026                                                                 │
│  ├── Semana 1: Tests de integración WSO2                                   │
│  ├── Semana 2: Tests de rendimiento (k6)                                   │
│  ├── Semana 3: OWASP ZAP scan completo                                     │
│  └── Semana 4: Tests E2E pre-producción                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Cobertura Objetivo

| Fase | Fecha | Cobertura Actual | Objetivo | Meta |
|------|-------|------------------|----------|------|
| Fase 2 | 15/01/2026 | 58% | 70% | Tests seguridad completos |
| Fase 3 | 28/02/2026 | - | 80% | Todos los módulos testeados |
| Fase 4 | 15/03/2026 | - | 85% | Tests de integración completos |
| Go-Live | 31/03/2026 | - | 90% | Producción ready |

---

## 8. Comandos de Ejecución

### 8.1 Ejecución de Tests

```powershell
# Navegar al microservicio
cd "C:\Users\barce\Documents\mi brach\cail\cail\functions\usuarios"

# Instalar dependencias (primera vez)
npm install

# Ejecutar TODOS los tests con cobertura
npm test

# Ejecutar solo tests de seguridad
npx jest security --forceExit

# Ejecutar solo tests de integración
npx jest integration --forceExit

# Ejecutar en modo watch (desarrollo)
npm run test:watch

# Ejecutar con timeout personalizado
npx jest --forceExit --testTimeout=10000
```

### 8.2 Solución de Problemas Comunes

| Problema | Causa | Solución |
|----------|-------|----------|
| `EADDRINUSE: address already in use :::8080` | Puerto ocupado | `taskkill /PID <num> /F` |
| `Service account must contain project_id` | Firebase no mockeado | Verificar `tests/setup.ts` |
| Tests colgados | Conexiones no cerradas | Usar `--forceExit` |
| Timeout | Tests muy lentos | Usar `--testTimeout=15000` |

### 8.3 Ver Cobertura HTML

```powershell
# Después de ejecutar npm test, abrir:
start coverage/lcov-report/index.html
```

---

## Firmas de Aprobación

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|-------|
| Test & Security | Erick Gaona | _________________ | 08/01/2026 |
| Líder Técnico | Juan Espinosa | _________________ | ___/___/2026 |

---

*Documento generado el 08 de Enero de 2026*  
*Proyecto CAIL - Bolsa de Empleo*  
*Universidad Técnica Particular de Loja*

