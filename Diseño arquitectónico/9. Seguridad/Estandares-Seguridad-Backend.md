# Estándares de Seguridad - Backend CAIL
## Checklist por Contribuidor

**Responsable:** Erick Gaona (Test & Security)  
**Versión:** 7.0 | **Fecha:** 08 Enero 2026

---

## Estructura de Microservicios

```
cail/functions/
├── usuarios/     (Puerto 8080) → Alex Ramírez + Carlos + Juan + Sebastián
├── ofertas/      (Puerto 8083) → Carlos Mejía + Erick Gaona  
└── matching/     (Puerto 8084) → Dara Van Gijsel
```

---

## Resumen de Tests por Módulo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TESTS REQUERIDOS POR MÓDULO                              │
│                    (Responsable de crear tests: Erick Gaona)                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  MÓDULO USUARIOS (Alex + Carlos + Juan + Sebastián)                         │
│  └── Total: 33 tests                                                        │
│      ├── Seguridad Auth:     20 tests  ──► 13 CREADOS ✅                    │
│      ├── Integración Auth:    5 tests  ──►  0 creados ⏳                    │
│      └── Perfiles:            8 tests  ──►  0 creados ⏳                    │
│                                                                             │
│  MÓDULO OFERTAS (Carlos + Erick)                                            │
│  └── Total: 15 tests                                                        │
│      ├── Seguridad:          10 tests  ──►  0 creados ⏳                    │
│      └── Integración:         5 tests  ──►  0 creados ⏳                    │
│                                                                             │
│  MÓDULO MATCHING (Dara)                                                     │
│  └── Total: 13 tests                                                        │
│      ├── Seguridad:           6 tests  ──►  0 creados ⏳                    │
│      └── Integración:         7 tests  ──►  0 creados ⏳                    │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════    │
│  TOTAL PROYECTO: 61 tests requeridos | 13 creados (21%)                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Alex Ramírez - Microservicio Usuarios

**Módulo:** `functions/usuarios/` (Auth + Perfiles)

### Checklist de Seguridad

| # | Requerimiento | Estado | Cómo Implementar |
|---|---------------|--------|------------------|
| A1 | Helmet (headers seguridad) | ⚠️ FALTA | `npm i helmet` + `app.use(helmet())` |
| A2 | CORS restrictivo | ⚠️ PARCIAL | Cambiar `origin: true` → `['https://cail.ec']` |
| A3 | Rate Limiting en Login | ⚠️ FALTA | `npm i express-rate-limit` (5 intentos/15min) |
| A4 | Password 12+ caracteres | ⚠️ FALTA | Agregar validación en registro |
| A5 | Validación de Email | ✅ OK | Ya existe en `Email.ts` |
| A6 | Dockerfile no-root | ✅ OK | `USER nodejs` ya existe |
| A7 | Hash con bcrypt | ✅ OK | Ya usa bcrypt 10 rounds |

### 🧪 Tests Derivados (Erick crea, Alex implementa)

| Test | Verifica Estándar | Estado Test | Estado Código |
|------|-------------------|-------------|---------------|
| Headers X-Frame-Options presente | A1 | ⏳ Pendiente | ❌ No implementado |
| Headers X-Content-Type-Options presente | A1 | ⏳ Pendiente | ❌ No implementado |
| CORS rechaza origen no permitido | A2 | ⏳ Pendiente | ⚠️ Parcial |
| Login 6to intento → 429 | A3 | ⏳ Pendiente | ❌ No implementado |
| Login después 15min → OK | A3 | ⏳ Pendiente | ❌ No implementado |
| Password < 12 chars → 400 | A4 | ⏳ Pendiente | ❌ No implementado |
| Password sin mayúscula → 400 | A4 | ⏳ Pendiente | ❌ No implementado |
| Password sin número → 400 | A4 | ⏳ Pendiente | ❌ No implementado |
| Email inválido → 400 | A5 | ✅ Creado | ⚠️ Retorna 500 |

**Total tests para Alex:** 9 tests

### Código que DEBE agregar:

```typescript
// src/index.ts - AGREGAR al inicio
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Después de crear app
app.use(helmet());

// Rate limit para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Demasiados intentos, espere 15 minutos' }
});
app.use('/auth/login', loginLimiter);

// CORS restrictivo (cambiar el actual)
app.use(cors({
  origin: ['https://cail.ec', 'https://app.cail.ec'],
  credentials: true
}));
```

```typescript
// Agregar validación de password en RegisterUser.usecase.ts
const validatePassword = (password: string): void => {
  if (password.length < 12) {
    throw new AppError(400, 'Password debe tener mínimo 12 caracteres');
  }
  if (!/[A-Z]/.test(password)) {
    throw new AppError(400, 'Password debe tener al menos una mayúscula');
  }
  if (!/[0-9]/.test(password)) {
    throw new AppError(400, 'Password debe tener al menos un número');
  }
};
```

---

## 2. Carlos Mejía - JWT y WSO2

**Módulo:** Trabaja sobre `functions/usuarios/` (parte JWT)

### Checklist de Seguridad

| # | Requerimiento | Estado | Evidencia |
|---|---------------|--------|-----------|
| C1 | Algoritmo JWT seguro | ✅ OK | HS256 (default) |
| C2 | Expiración de tokens | ✅ OK | `expiresIn: '7d'` |
| C3 | Validar firma JWT | ✅ OK | `jwt.verify()` |
| C4 | Manejar TokenExpired | ✅ OK | Ya manejado |
| C5 | No loguear tokens | ✅ OK | No se loguean |
| C6 | WSO2 JWT Policy | ⚠️ PENDIENTE | Configurar en wso2/ |

### 🧪 Tests Derivados (Erick crea, Carlos implementa)

| Test | Verifica Estándar | Estado Test | Estado Código |
|------|-------------------|-------------|---------------|
| Token sin auth → 401 | C3 | ✅ Creado | ✅ Implementado |
| Token malformado → 401 | C3 | ✅ Creado | ✅ Implementado |
| Token sin Bearer → 401 | C3 | ✅ Creado | ✅ Implementado |
| Token expirado → 401 | C4 | ✅ Creado | ✅ Implementado |
| Algoritmo es HS256 | C1 | ⏳ Pendiente | ✅ Implementado |
| Token expira en 7d | C2 | ⏳ Pendiente | ✅ Implementado |

**Total tests para Carlos:** 6 tests (4 creados, 2 pendientes)

### Código existente (CORRECTO):

```typescript
// auth.middleware.ts - Ya está bien implementado
export const authenticate = async (req, res, next) => {
  const token = authHeader.substring(7);
  const decoded = jwt.verify(token, config.jwt.secret);
  req.user = decoded;
  next();
};
```

### Pendiente WSO2:
- Configurar política JWT en WSO2 API Gateway
- Todas las rutas deben validar JWT en el gateway

---

## 3. Juan Espinosa - Firestore y Usuarios

**Módulo:** Trabaja sobre `functions/usuarios/` (Firestore)

### Checklist de Seguridad

| # | Requerimiento | Estado | Cómo Implementar |
|---|---------------|--------|------------------|
| J1 | Firestore Security Rules | ⚠️ VERIFICAR | Crear/verificar reglas |
| J2 | Sanitizar datos | ⚠️ FALTA | `npm i sanitize-html` |
| J3 | No IDs secuenciales | ✅ OK | Usa UUIDs |
| J4 | Logs de auditoría | ⚠️ FALTA | Registrar cambios |

### 🧪 Tests Derivados (Erick crea, Juan implementa)

| Test | Verifica Estándar | Estado Test | Estado Código |
|------|-------------------|-------------|---------------|
| SQL Injection no ejecuta | J2 | ✅ Creado | ✅ Firestore escapa |
| NoSQL Injection no ejecuta | J2 | ✅ Creado | ✅ Firestore escapa |
| XSS sanitizado | J2 | ✅ Creado | ⚠️ Parcial |
| IDs son UUIDs no secuenciales | J3 | ⏳ Pendiente | ✅ Implementado |

**Total tests para Juan:** 4 tests (3 creados, 1 pendiente)

### Código que DEBE agregar:

```javascript
// firestore.rules - CREAR O VERIFICAR
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /cuentas/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /ofertas/{ofertaId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        get(/databases/$(database)/documents/cuentas/$(request.auth.uid)).data.tipoUsuario == 'RECLUTADOR';
    }
  }
}
```

---

## 4. Sebastián Calderón - Perfiles de Usuario

**Módulo:** Trabaja sobre `functions/usuarios/` (Perfiles)

### Checklist de Seguridad

| # | Requerimiento | Estado | Cómo Implementar |
|---|---------------|--------|------------------|
| S1 | Upload CV solo PDF | ⚠️ VERIFICAR | Validar mimetype |
| S2 | CV máximo 5MB | ⚠️ VERIFICAR | Configurar multer |
| S3 | Validar cédula EC | ⚠️ FALTA | Algoritmo módulo 10 |
| S4 | No exponer cédula completa | ⚠️ FALTA | Mostrar solo 4 dígitos |

### 🧪 Tests Derivados (Erick crea, Sebastián implementa)

| Test | Verifica Estándar | Estado Test | Estado Código |
|------|-------------------|-------------|---------------|
| Upload archivo .exe → 400 | S1 | ⏳ Pendiente | ❌ No verificado |
| Upload PDF > 5MB → 400 | S2 | ⏳ Pendiente | ❌ No verificado |
| Cédula inválida → 400 | S3 | ⏳ Pendiente | ❌ No implementado |
| Cédula válida → 200 | S3 | ⏳ Pendiente | ❌ No implementado |
| Response muestra ****1234 | S4 | ⏳ Pendiente | ❌ No implementado |
| GET /profile no expone cédula completa | S4 | ⏳ Pendiente | ❌ No implementado |

**Total tests para Sebastián:** 6 tests (0 creados)

### Código que DEBE agregar:

```typescript
// Validador de cédula ecuatoriana
const validarCedulaEC = (cedula: string): boolean => {
  if (!/^\d{10}$/.test(cedula)) return false;
  const provincia = parseInt(cedula.substring(0, 2));
  if (provincia < 1 || provincia > 24) return false;
  
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;
  for (let i = 0; i < 9; i++) {
    let valor = parseInt(cedula.charAt(i)) * coeficientes[i];
    if (valor > 9) valor -= 9;
    suma += valor;
  }
  const verificador = (10 - (suma % 10)) % 10;
  return verificador === parseInt(cedula.charAt(9));
};
```

---

## 5. Carlos Mejía + Erick Gaona - Microservicio Ofertas

**Módulo:** `functions/ofertas/`  
**Responsables:** Carlos Mejía (código) + Erick Gaona (código + tests)

### Checklist de Seguridad

| # | Requerimiento | Estado | Cómo Implementar |
|---|---------------|--------|------------------|
| E1 | Solo RECLUTADOR crea ofertas | ✅ OK | `authorize('RECLUTADOR')` |
| E2 | Verificar propiedad | ✅ OK | Valida `idReclutador` |
| E3 | Validar inputs | ⚠️ FALTA | `npm i express-validator` |
| E4 | Sanitizar descripción | ⚠️ FALTA | `npm i sanitize-html` |
| E5 | Paginación con límite | ⚠️ FALTA | Máximo 50 resultados |

### 🧪 Tests Derivados (Erick crea Y implementa)

| Test | Verifica Estándar | Estado Test | Estado Código |
|------|-------------------|-------------|---------------|
| POST /offers sin token → 401 | E1 | ⏳ Pendiente | ✅ Implementado |
| POST /offers como POSTULANTE → 403 | E1 | ⏳ Pendiente | ✅ Implementado |
| PUT /offers sin ser dueño → 403 | E2 | ⏳ Pendiente | ✅ Implementado |
| DELETE /offers sin ser dueño → 403 | E2 | ⏳ Pendiente | ✅ Implementado |
| Título < 5 chars → 400 | E3 | ⏳ Pendiente | ❌ No implementado |
| Descripción < 50 chars → 400 | E3 | ⏳ Pendiente | ❌ No implementado |
| Salario negativo → 400 | E3 | ⏳ Pendiente | ❌ No implementado |
| XSS en descripción sanitizado | E4 | ⏳ Pendiente | ❌ No implementado |
| GET /offers?limit=100 → máx 50 | E5 | ⏳ Pendiente | ❌ No implementado |
| SQL Injection en búsqueda | General | ⏳ Pendiente | ✅ Firestore |

**Total tests para Erick (Ofertas):** 10 tests (0 creados)

### Código que DEBO agregar:

```typescript
// validators/oferta.validator.ts - CREAR
import { body, query } from 'express-validator';
import sanitizeHtml from 'sanitize-html';

export const crearOfertaValidator = [
  body('titulo')
    .isLength({ min: 5, max: 100 })
    .trim()
    .escape(),
  body('descripcion')
    .isLength({ min: 50, max: 5000 })
    .customSanitizer(val => sanitizeHtml(val, {
      allowedTags: ['b', 'i', 'ul', 'li', 'p'],
      allowedAttributes: {}
    })),
  body('salarioMin')
    .isNumeric()
    .isFloat({ min: 0 }),
  body('salarioMax')
    .isNumeric()
    .custom((val, { req }) => val >= req.body.salarioMin)
];

export const buscarOfertasValidator = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .toInt()
];
```

---

## 6. Dara Van Gijsel - Microservicio Matching

**Módulo:** `functions/matching/`

### Checklist de Seguridad

| # | Requerimiento | Estado | Cómo Implementar |
|---|---------------|--------|------------------|
| D1 | Solo POSTULANTE puede postular | ⚠️ VERIFICAR | `authorize('POSTULANTE')` |
| D2 | Una postulación por oferta | ⚠️ FALTA | Verificar duplicados |
| D3 | Límite 10 postulaciones/día | ⚠️ FALTA | Contador diario |
| D4 | Solo ofertas activas | ⚠️ VERIFICAR | Validar estado |
| D5 | No exponer algoritmo | ✅ OK | Solo retorna score |

### 🧪 Tests Derivados (Erick crea, Dara implementa)

| Test | Verifica Estándar | Estado Test | Estado Código |
|------|-------------------|-------------|---------------|
| POST /apply sin token → 401 | D1 | ⏳ Pendiente | ⚠️ No verificado |
| POST /apply como RECLUTADOR → 403 | D1 | ⏳ Pendiente | ⚠️ No verificado |
| Postular a oferta inactiva → 400 | D4 | ⏳ Pendiente | ⚠️ No verificado |
| Postulación duplicada → 409 | D2 | ⏳ Pendiente | ❌ No implementado |
| 10 postulaciones/día OK | D3 | ⏳ Pendiente | ❌ No implementado |
| 11va postulación → 429 | D3 | ⏳ Pendiente | ❌ No implementado |
| Response solo tiene score | D5 | ⏳ Pendiente | ✅ Implementado |

**Total tests para Dara:** 7 tests (0 creados)

### Código que DEBE agregar:

```typescript
// Verificar postulación duplicada
const existePostulacion = await db.collection('postulaciones')
  .where('postulanteId', '==', userId)
  .where('ofertaId', '==', ofertaId)
  .get();

if (!existePostulacion.empty) {
  throw new AppError(409, 'Ya te postulaste a esta oferta');
}

// Límite diario
const hoy = new Date();
hoy.setHours(0, 0, 0, 0);
const countHoy = await db.collection('postulaciones')
  .where('postulanteId', '==', userId)
  .where('createdAt', '>=', hoy)
  .count().get();

if (countHoy.data().count >= 10) {
  throw new AppError(429, 'Límite de postulaciones diarias alcanzado');
}
```

---

## Resumen de Estado

```
┌───────────────────────────────────────────────────────────────────────────────┐
│               PORCENTAJE DE CUMPLIMIENTO + TESTS                              │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  MÓDULO              Código Impl.    Tests Req.    Tests Creados             │
│  ═══════════════════════════════════════════════════════════════════════════  │
│  Usuarios (Auth)     ████████  60%     25 tests     13 creados (52%)         │
│  Usuarios (Perfiles) ░░░░░░░░   0%      8 tests      0 creados ( 0%)         │
│  Ofertas             ████░░░░  40%     15 tests      0 creados ( 0%)         │
│  Matching            ██░░░░░░  20%     13 tests      0 creados ( 0%)         │
│                                                                               │
│  ═══════════════════════════════════════════════════════════════════════════  │
│                                                                               │
│  TOTAL CÓDIGO:     ~55% implementado                                          │
│  TOTAL TESTS:      13/61 creados (21%)                                        │
│                                                                               │
│  Por Contribuidor (Código):                                                   │
│  • Alex (Usuarios Auth):     43% implementado                                 │
│  • Carlos (JWT + Ofertas):   70% implementado                                 │
│  • Juan (Firestore):         25% implementado                                 │
│  • Sebastián (Perfiles):      0% implementado                                 │
│  • Erick (Ofertas + Tests):  40% implementado                                 │
│  • Dara (Matching):          20% implementado                                 │
│                                                                               │
│  🔴 BLOQUEADORES CRÍTICOS:                                                    │
│  • A3 Rate Limiting - SIN IMPLEMENTAR (vulnerable a brute force)             │
│  • A4 Password validation - SIN IMPLEMENTAR (passwords débiles)               │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## Responsabilidades de Testing

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                    QUIÉN HACE QUÉ                                             │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ERICK GAONA (Test & Security):                                               │
│  ═══════════════════════════════                                              │
│  ✅ Define los estándares de seguridad (este documento)                       │
│  ✅ Crea TODOS los tests (61 tests en total)                                  │
│  ✅ Ejecuta los tests y documenta resultados                                  │
│  ✅ Reporta qué código falta implementar                                      │
│  ✅ Implementa código del módulo Ofertas                                      │
│                                                                               │
│  CADA CONTRIBUIDOR:                                                           │
│  ═══════════════════                                                          │
│  ✅ Implementa el código según los estándares                                 │
│  ✅ Cuando implemente, los tests de Erick PASARÁN                             │
│  ❌ NO crea tests (eso lo hace Erick)                                         │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## Comandos Útiles

```bash
# Verificar vulnerabilidades
npm audit

# Ejecutar tests
npm test

# Ejecutar tests con cobertura
npm run test -- --coverage

# Ejecutar solo tests de seguridad
npx jest security --forceExit
```

---

*Documento v7.0 - Actualizado con tests derivados*  
*Responsable: Erick Gaona (Test & Security)*
