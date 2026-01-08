# Estándares de Seguridad - Backend CAIL
## Checklist por Contribuidor

**Responsable:** Erick Gaona (Test & Security)  
**Versión:** 6.0 | **Fecha:** 08 Enero 2026

---

## Estructura de Microservicios

```
cail/functions/
├── usuarios/     (Puerto 8080) → Alex Ramírez
├── ofertas/      (Puerto 8083) → Erick Gaona  
└── matching/     (Puerto 8084) → Juan/Dara
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

## 5. Erick Gaona - Microservicio Ofertas

**Módulo:** `functions/ofertas/`

### Checklist de Seguridad

| # | Requerimiento | Estado | Cómo Implementar |
|---|---------------|--------|------------------|
| E1 | Solo RECLUTADOR crea ofertas | ✅ OK | `authorize('RECLUTADOR')` |
| E2 | Verificar propiedad | ✅ OK | Valida `idReclutador` |
| E3 | Validar inputs | ⚠️ FALTA | `npm i express-validator` |
| E4 | Sanitizar descripción | ⚠️ FALTA | `npm i sanitize-html` |
| E5 | Paginación con límite | ⚠️ FALTA | Máximo 50 resultados |

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
┌───────────────────────────────────────────────────────────────┐
│               PORCENTAJE DE CUMPLIMIENTO                      │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  Alex (Usuarios)     ████████░░░░░░░░  50%                   │
│  Carlos (JWT)        ████████████████  95%                   │
│  Juan (Firestore)    ██████░░░░░░░░░░  40%                   │
│  Sebastián (Perfiles)██████░░░░░░░░░░  40%                   │
│  Erick (Ofertas)     ██████████░░░░░░  60%                   │
│  Dara (Matching)     ██████░░░░░░░░░░  40%                   │
│                                                               │
│  TOTAL PROYECTO: ~55%                                         │
│                                                               │
└───────────────────────────────────────────────────────────────┘
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
```

---

*Documento simplificado - Solo checklists por contribuidor*  
*Responsable: Erick Gaona (Test & Security)*
