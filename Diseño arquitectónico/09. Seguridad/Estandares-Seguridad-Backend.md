# Estándares de Seguridad - Backend CAIL
## Checklist por Contribuidor

**Responsable:** Erick Gaona (Test & Security)  
**Versión:** 9.0 | **Fecha:** 13 Enero 2026

---

## Estructura de Microservicios y Responsables

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ASIGNACIÓN DE MÓDULOS                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  cail/functions/                                                            │
│  ├── usuarios/     → Alex Ramírez + Sebastián Calderón                     │
│  ├── ofertas/      → Erick Gaona + Carlos Mejía                            │
│  └── matching/     → Dara + Cristóbal Espinosa                             │
│                                                                             │
│  Adicional:                                                                 │
│  └── Auth (JWT)    → Carlos Mejía                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Resumen de Tests (70 Total)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ESTADO DE TESTS - 13/01/2026                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  MÓDULO USUARIOS (Alex + Sebastián)                                         │
│  ├── Tests de Seguridad: 22/22 ✅ PASAN                                     │
│  └── Tests de Integración: 7 tests                                          │
│  └── TOTAL: 29 tests                                                        │
│                                                                             │
│  MÓDULO OFERTAS (Erick + Carlos)                                            │
│  ├── Tests de Seguridad: 17/17 ✅ PASAN                                     │
│  └── Tests de Integración: 5 tests                                          │
│  └── TOTAL: 22 tests                                                        │
│                                                                             │
│  MÓDULO MATCHING (Dara + Cristóbal)                                         │
│  ├── Tests de Seguridad: 14/15 ⚠️ (1 falla - esperando implementación)     │
│  └── Tests de Integración: 4 tests                                          │
│  └── TOTAL: 19 tests                                                        │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════    │
│  TOTAL: 70 tests | 69 pasan (99%) | 1 falla (matching)                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# DESGLOSE DETALLADO DE TESTS

## 1. Tests de USUARIOS (29 tests)

### 1.1 Security Headers - Helmet (6 tests) ✅

| # | Test | ¿Qué Verifica? | ¿Por qué es importante? |
|---|------|----------------|-------------------------|
| 1 | `X-Content-Type-Options: nosniff` | Que el header esté presente con valor "nosniff" | **Previene MIME sniffing**: Evita que el navegador "adivine" el tipo de archivo, previniendo que un archivo malicioso se ejecute como script |
| 2 | `X-Frame-Options presente` | Que el header X-Frame-Options exista | **Previene Clickjacking**: Impide que tu sitio sea cargado en un iframe de otro sitio malicioso |
| 3 | `X-XSS-Protection o CSP` | Que tenga alguna protección XSS | **Previene XSS**: Activa el filtro anti-XSS del navegador o usa CSP para controlar scripts |
| 4 | `Content-Security-Policy` | Que el header CSP esté presente | **Controla recursos**: Define qué scripts, estilos e imágenes puede cargar la página |
| 5 | `Strict-Transport-Security` | Que HSTS esté presente | **Fuerza HTTPS**: Obliga al navegador a usar siempre HTTPS, evitando ataques man-in-the-middle |
| 6 | `NO expone X-Powered-By` | Que NO exista el header X-Powered-By | **Oculta tecnología**: No revelar que usamos Express/Node reduce información para atacantes |

### 1.2 Rate Limiting (3 tests) ✅

| # | Test | ¿Qué Verifica? | ¿Por qué es importante? |
|---|------|----------------|-------------------------|
| 7 | `Headers Rate Limit presentes` | Que las respuestas incluyan headers de límite | **Informa al cliente**: El cliente sabe cuántas peticiones le quedan |
| 8 | `Rate Limit en /auth/login` | Que login tenga límite de intentos | **Previene brute force**: Un atacante no puede probar miles de contraseñas |
| 9 | `Rate Limit en /auth/register` | Que register tenga límite | **Previene spam**: Evita creación masiva de cuentas falsas |

### 1.3 Auth Bypass Prevention (4 tests) ✅

| # | Test | ¿Qué Verifica? | ¿Por qué es importante? |
|---|------|----------------|-------------------------|
| 10 | `GET /users/profile sin token → 401` | Acceso sin autenticación es rechazado | **Protege datos**: Sin token válido, no puedes ver perfiles |
| 11 | `Token malformado → 401` | Token inventado es rechazado | **Valida tokens**: No acepta cualquier string como token |
| 12 | `Token sin "Bearer" → 401` | Formato incorrecto es rechazado | **Estándar OAuth2**: Requiere el prefijo Bearer según estándares |
| 13 | `Authorization vacío → 401` | Header vacío es rechazado | **No acepta vacíos**: Debe haber un token real |

### 1.4 Input Validation (3 tests) ✅

| # | Test | ¿Qué Verifica? | ¿Por qué es importante? |
|---|------|----------------|-------------------------|
| 14 | `Email inválido → error` | "not-an-email" es rechazado | **Valida formato**: Solo acepta emails reales |
| 15 | `Password vacío → error` | No permite password vacío | **Requiere password**: Cuenta sin password = vulnerable |
| 16 | `Campos vacíos en login → error` | Login vacío falla | **Requiere credenciales**: No intenta autenticar sin datos |

### 1.5 Injection Prevention (4 tests) ✅

| # | Test | ¿Qué Verifica? | ¿Por qué es importante? |
|---|------|----------------|-------------------------|
| 17 | `SQL Injection manejado` | `'; DROP TABLE users; --` no ejecuta SQL | **Previene borrado de datos**: Un atacante no puede ejecutar SQL |
| 18 | `NoSQL Injection manejado` | `{"$gt": ""}` no ejecuta query | **Previene bypass auth**: No puede obtener datos con operadores NoSQL |
| 19 | `XSS manejado` | `<script>alert("xss")</script>` no ejecuta | **Previene robo de sesión**: Scripts maliciosos no se ejecutan |
| 20 | `Template Injection manejado` | `{{7*7}}` no evalúa templates | **Previene ejecución de código**: Templates maliciosos no funcionan |

### 1.6 Error Handling (2 tests) ✅

| # | Test | ¿Qué Verifica? | ¿Por qué es importante? |
|---|------|----------------|-------------------------|
| 21 | `No expone stack trace` | Errores no muestran código interno | **Oculta implementación**: Atacantes no ven rutas de archivos |
| 22 | `No expone rutas internas` | No muestra `/src/` o `node_modules` | **Seguridad por oscuridad**: Menos información = menos vectores de ataque |

### 1.7 Tests de Integración (7 tests)

| # | Test | ¿Qué Verifica? |
|---|------|----------------|
| 23 | `GET /health → 200` | Servidor está funcionando |
| 24 | `POST /auth/register crea usuario` | Registro funciona |
| 25 | `POST /auth/login autentica` | Login funciona |
| 26 | `Login con credenciales inválidas → 401` | Rechaza credenciales incorrectas |
| 27 | `GET /users/profile con token → 200` | Perfil accesible con auth |
| 28 | `GET /users/profile sin token → 401` | Perfil protegido |
| 29 | `PUT /users/profile actualiza` | Actualización funciona |

---

## 2. Tests de OFERTAS (22 tests)

### 2.1 Security Headers - Helmet (3 tests) ✅

| # | Test | ¿Qué Verifica? | ¿Por qué es importante? |
|---|------|----------------|-------------------------|
| 1 | `X-Content-Type-Options: nosniff` | Header anti-MIME sniffing | Previene ejecución de archivos maliciosos |
| 2 | `Content-Security-Policy` | CSP presente | Controla qué scripts pueden ejecutarse |
| 3 | `NO expone X-Powered-By` | Oculta tecnología | No revela que usamos Node/Express |

### 2.2 Rate Limiting (1 test) ✅

| # | Test | ¿Qué Verifica? | ¿Por qué es importante? |
|---|------|----------------|-------------------------|
| 4 | `Headers Rate Limit presentes` | Límite de peticiones activo | Previene abuso de la API |

### 2.3 Auth & Authorization (5 tests) ✅

| # | Test | ¿Qué Verifica? | ¿Por qué es importante? |
|---|------|----------------|-------------------------|
| 5 | `POST /offers sin token → 401` | Crear oferta requiere auth | Solo usuarios autenticados crean ofertas |
| 6 | `PUT /offers/:id sin token → 401` | Editar oferta requiere auth | Protege ofertas de edición anónima |
| 7 | `DELETE /offers/:id sin token → 401` | Eliminar requiere auth | No se borran ofertas sin permiso |
| 8 | `GET /offers/my-offers sin token → 401` | Mis ofertas requiere auth | Protege lista personal |
| 9 | `Token inválido → 401` | Token falso rechazado | No acepta tokens inventados |

### 2.4 Input Validation (2 tests) ✅

| # | Test | ¿Qué Verifica? | ¿Por qué es importante? |
|---|------|----------------|-------------------------|
| 10 | `limit=-1 manejado` | Parámetros negativos controlados | No crashea con valores inválidos |
| 11 | `ID muy largo manejado` | ID de 1000 chars no causa problema | Previene buffer overflow |

### 2.5 Injection Prevention (2 tests) ✅

| # | Test | ¿Qué Verifica? | ¿Por qué es importante? |
|---|------|----------------|-------------------------|
| 12 | `NoSQL Injection en query` | `{"$gt":""}` no funciona | Firestore escapa automáticamente |
| 13 | `XSS en query params` | `<script>` no ejecuta | No hay XSS en búsquedas |

### 2.6 Error Handling (2 tests) ✅

| # | Test | ¿Qué Verifica? | ¿Por qué es importante? |
|---|------|----------------|-------------------------|
| 14 | `Oferta inexistente → 404` | ID falso retorna 404 | Respuesta apropiada |
| 15 | `No expone información sensible` | Sin stack trace en errores | Seguridad de información |

### 2.7 Public vs Protected (2 tests) ✅

| # | Test | ¿Qué Verifica? | ¿Por qué es importante? |
|---|------|----------------|-------------------------|
| 16 | `GET /offers funciona sin auth` | Lista pública de ofertas | Cualquiera puede ver ofertas |
| 17 | `GET /offers/:id sin auth ≠ 401` | Detalle público | Ver oferta individual es público |

### 2.8 Tests de Integración (5 tests)

| # | Test | ¿Qué Verifica? |
|---|------|----------------|
| 18 | `GET /health → 200` | Servidor funcionando |
| 19 | `GET /offers retorna lista` | Lista de ofertas funciona |
| 20 | `GET /offers con filtros` | Filtrado funciona |
| 21 | `GET /offers/:id inválido → 404` | ID inexistente |
| 22 | `POST /offers sin auth → 401` | Protección de creación |

---

## 3. Tests de MATCHING (19 tests)

### 3.1 Security Headers - Helmet (3 tests) ✅

| # | Test | ¿Qué Verifica? | ¿Por qué es importante? |
|---|------|----------------|-------------------------|
| 1 | `X-Content-Type-Options: nosniff` | Header anti-MIME sniffing | Seguridad del navegador |
| 2 | `Content-Security-Policy` | CSP presente | Control de scripts |
| 3 | `NO expone X-Powered-By` | Oculta tecnología | Información mínima |

### 3.2 Rate Limiting (1 test) ✅

| # | Test | ¿Qué Verifica? | ¿Por qué es importante? |
|---|------|----------------|-------------------------|
| 4 | `Headers Rate Limit` | Límite activo | Previene spam de postulaciones |

### 3.3 Auth Protection (5 tests) ⚠️

| # | Test | ¿Qué Verifica? | Estado |
|---|------|----------------|--------|
| 5 | `POST /matching/apply sin token → 401` | Postular requiere auth | ✅ PASA |
| 6 | `GET /matching/applications sin token → 401` | Ver aplicaciones requiere auth | ✅ PASA |
| 7 | `GET /matching/my-applications sin token → 401` | Mis postulaciones requiere auth | ❌ FALLA (ruta no implementada) |
| 8 | `Token inválido → 401` | Token falso rechazado | ✅ PASA |
| 9 | `Token expirado → 401` | Token viejo rechazado | ✅ PASA |

### 3.4 Input Validation (2 tests) ✅

| # | Test | ¿Qué Verifica? | ¿Por qué es importante? |
|---|------|----------------|-------------------------|
| 10 | `POST sin idOferta manejado` | Requiere ID de oferta | Validación de entrada |
| 11 | `ID vacío manejado` | No crashea con vacío | Robustez |

### 3.5 Injection Prevention (2 tests) ✅

| # | Test | ¿Qué Verifica? | ¿Por qué es importante? |
|---|------|----------------|-------------------------|
| 12 | `NoSQL Injection en idOferta` | `{"$gt":""}` no funciona | Seguridad de datos |
| 13 | `XSS en parámetros` | Scripts no ejecutan | Previene XSS |

### 3.6 Error Handling (2 tests) ✅

| # | Test | ¿Qué Verifica? | ¿Por qué es importante? |
|---|------|----------------|-------------------------|
| 14 | `No expone stack trace` | Errores limpios | Seguridad información |
| 15 | `Oferta inexistente → 404` | Respuesta apropiada | UX correcta |

### 3.7 Tests de Integración (4 tests)

| # | Test | ¿Qué Verifica? |
|---|------|----------------|
| 16 | `GET /health → 200` | Servidor funcionando |
| 17 | `GET /matching/oferta/:id maneja inexistente` | Oferta no encontrada |
| 18 | `POST /matching/apply sin auth → 401` | Protección |
| 19 | `GET /matching/applications sin auth → 401` | Protección |

---

## Responsabilidades por Contribuidor

### Alex Ramírez + Sebastián Calderón - USUARIOS

| Código que deben implementar | Estado |
|------------------------------|--------|
| CORS restrictivo (solo dominios permitidos) | ⚠️ Pendiente |
| Validación password 12+ caracteres | ⚠️ Pendiente |
| Validación cédula ecuatoriana | ⚠️ Pendiente |
| Upload CV solo PDF y máx 5MB | ⚠️ Verificar |

### Erick Gaona + Carlos Mejía - OFERTAS

| Código implementado | Estado |
|---------------------|--------|
| Helmet (Security Headers) | ✅ Implementado |
| Rate Limiting | ✅ Implementado |
| Auth middleware | ✅ Implementado |
| Autorización por rol | ✅ Implementado |

| Código pendiente | Estado |
|------------------|--------|
| express-validator para inputs | ⚠️ Pendiente |
| Sanitizar descripción HTML | ⚠️ Pendiente |
| Límite de paginación (máx 50) | ⚠️ Pendiente |

### Carlos Mejía - AUTH (JWT)

| Código implementado | Estado |
|---------------------|--------|
| Algoritmo HS256 | ✅ OK |
| Expiración 7 días | ✅ OK |
| Validación de firma | ✅ OK |
| Manejo TokenExpired | ✅ OK |

### Dara + Cristóbal Espinosa - MATCHING

| Código pendiente | Estado |
|------------------|--------|
| Ruta /matching/my-applications | ❌ Falta (causa 1 test fallido) |
| Solo POSTULANTE puede postular | ⚠️ Verificar |
| Verificar postulación duplicada | ⚠️ Pendiente |
| Límite 10 postulaciones/día | ⚠️ Pendiente |

---

## Comandos de Ejecución

```powershell
# ===== EJECUTAR TODOS LOS TESTS =====

# Usuarios (29 tests)
cd "C:\Users\barce\Documents\mi brach\cail\cail\functions\usuarios"
npm test --forceExit

# Ofertas (22 tests)
cd "C:\Users\barce\Documents\mi brach\cail\cail\functions\ofertas"
npm test --forceExit

# Matching (19 tests)
cd "C:\Users\barce\Documents\mi brach\cail\cail\functions\matching"
npm test --forceExit

# ===== SOLO TESTS DE SEGURIDAD =====

# Usuarios (22 tests seguridad)
npx jest security --forceExit

# Ofertas (17 tests seguridad)
npx jest security --forceExit

# Matching (15 tests seguridad)
npx jest security --forceExit
```

---

## Seguridad Implementada (Resumen)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ✅ YA IMPLEMENTADO (por Erick)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🛡️  HELMET (Security Headers):                                            │
│  ├── X-Content-Type-Options: nosniff                                        │
│  ├── X-Frame-Options: SAMEORIGIN                                            │
│  ├── Content-Security-Policy                                                │
│  ├── Strict-Transport-Security (HSTS)                                       │
│  ├── X-XSS-Protection                                                       │
│  └── Oculta X-Powered-By                                                    │
│                                                                             │
│  ⏱️  RATE LIMITING:                                                         │
│  ├── General: 100 peticiones / 15 minutos                                   │
│  └── Auth: 10 peticiones / 15 minutos (login/register)                      │
│                                                                             │
│  📁 ARCHIVOS CREADOS:                                                       │
│  ├── usuarios/src/shared/middleware/security.middleware.ts                  │
│  ├── ofertas/src/shared/middleware/security.middleware.ts                   │
│  └── matching/src/shared/middleware/security.middleware.ts                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

*Documento v9.0 - Con desglose detallado de tests*  
*Responsable: Erick Gaona (Test & Security)*
