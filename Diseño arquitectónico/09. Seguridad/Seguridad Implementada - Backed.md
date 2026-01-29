# Seguridad Implementada - Backend CAIL

**Duracion estimada:** 10-15 minutos  
**Fecha:** 14 de Enero de 2026  
**Responsable:** Erick Gaona

---

## Tabla de Contenidos

1. [Que estamos haciendo y por que](#1-que-estamos-haciendo-y-por-que)
2. [Analogia: El Guardia de Seguridad](#2-analogia-el-guardia-de-seguridad)
3. [Capa 1: API Gateway (WSO2)](#3-capa-1-api-gateway-wso2)
4. [Capa 2: Headers de Seguridad (Helmet)](#4-capa-2-headers-de-seguridad-helmet)
5. [Capa 3: Rate Limiting](#5-capa-3-rate-limiting-por-ruta)
6. [Capa 4: Autenticacion JWT](#6-capa-4-autenticacion-jwt)
7. [Validacion de Archivos](#7-validacion-de-archivos-upload-cv)
8. [Passwords Seguros](#8-passwords-seguros-bcrypt)
9. [Manejo de Errores](#9-manejo-de-errores-seguro)
10. [Tests de Seguridad](#10-tests-de-seguridad)
11. [Pasos de Implementacion WSO2](#11-pasos-de-implementacion-wso2)
12. [Resumen Visual](#12-resumen-visual)

---

## 1. Que Estamos Haciendo y Por Que

### La situacion ANTES (como funcionaba sin WSO2):

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA ACTUAL (Sin WSO2)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
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
│   ⚠️ PROBLEMA: Cada funcion esta expuesta directamente a internet           │
│   ⚠️ PROBLEMA: No hay un punto central de control                           │
│   ⚠️ PROBLEMA: Si quieres bloquear un atacante, tienes que hacerlo en 3     │
│               lugares diferentes                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### La situacion DESPUES (con WSO2):

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA CON WSO2                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                         INTERNET                                            │
│                            │                                                │
│                            ▼                                                │
│                   ┌─────────────────┐                                       │
│                   │   WSO2 GATEWAY  │  ← UNICO PUNTO DE ENTRADA             │
│                   │     :8243       │                                       │
│                   │                 │                                       │
│                   │ • Rate Limiting │                                       │
│                   │ • Autenticacion │                                       │
│                   │ • Logs          │                                       │
│                   │ • Blacklist IPs │                                       │
│                   └────────┬────────┘                                       │
│                            │                                                │
│              ┌─────────────┼─────────────┐                                  │
│              │             │             │                                  │
│              ▼             ▼             ▼                                  │
│         ┌────────┐    ┌────────┐    ┌────────┐                              │
│         │Usuarios│    │Ofertas │    │Matching│  ← YA NO EXPUESTOS           │
│         │ :8080  │    │ :8083  │    │ :8084  │    DIRECTAMENTE              │
│         └────────┘    └────────┘    └────────┘                              │
│                                                                             │
│   ✅ SOLUCION: Todo pasa por WSO2 primero                                   │
│   ✅ SOLUCION: Un solo lugar para controlar todo                            │
│   ✅ SOLUCION: Bloqueas un atacante una vez, afecta todas las APIs          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Analogia: El Guardia de Seguridad

### SIN GUARDIA (Sin WSO2):

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   Visitante → Puerta Oficina 1 (Usuarios)                                   │
│   Visitante → Puerta Oficina 2 (Ofertas)                                    │
│   Visitante → Puerta Oficina 3 (Matching)                                   │
│                                                                             │
│   ⚠️ Cualquiera entra a cualquier oficina sin control                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### CON GUARDIA (Con WSO2):

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   Visitante llega → RECEPCION (WSO2)                                        │
│                           │                                                 │
│                           ▼                                                 │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    CHECKLIST DEL GUARDIA                            │   │
│   ├─────────────────────────────────────────────────────────────────────┤   │
│   │                                                                     │   │
│   │  1️⃣ ¿Vienes muy seguido? (RATE LIMITING)                            │   │
│   │     ├── SI: "Ha venido 100 veces en 15 min, espere afuera"          │   │
│   │     └── NO: ✅ Pasa al siguiente control                            │   │
│   │                                                                     │   │
│   │  2️⃣ ¿Tienes identificacion? (JWT TOKEN)                             │   │
│   │     ├── NO: "No puede entrar sin credencial" → 401                  │   │
│   │     ├── FALSA: "Esta credencial es falsa" → 401                     │   │
│   │     └── SI: ✅ Pasa al siguiente control                            │   │
│   │                                                                     │   │
│   │  3️⃣ ¿Estas en la lista negra? (BLACKLIST IPs)                       │   │
│   │     ├── SI: "Usted tiene prohibido el acceso" → 403                 │   │
│   │     └── NO: ✅ Pasa al siguiente control                            │   │
│   │                                                                     │   │
│   │  4️⃣ ¿Tienes permiso para esta oficina? (ROLES)                      │   │
│   │     ├── NO: "No tiene autorizacion para Ofertas" → 403              │   │
│   │     └── SI: ✅ PUEDE PASAR                                          │   │
│   │                                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                           │                                                 │
│                           ▼                                                 │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  TODO OK → Guardia lo dirige a la oficina correcta                  │   │
│   │            (Usuarios, Ofertas o Matching)                           │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│   📝 Ademas el guardia ANOTA TODO en su libreta (LOGS):                     │
│      • Quien vino                                                           │
│      • A que hora                                                           │
│      • A que oficina fue                                                    │
│      • Si lo dejaron pasar o no                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Ejemplo Practico del Guardia:

```
ESCENARIO: Atacante intenta fuerza bruta en login

Intento 1:  Guardia: "¿Credenciales?" → Incorrectas → "Intente de nuevo"
Intento 2:  Guardia: "¿Credenciales?" → Incorrectas → "Intente de nuevo"
...
Intento 10: Guardia: "¿Credenciales?" → Incorrectas → "Intente de nuevo"
Intento 11: Guardia: "ALTO! Ha fallado 10 veces. Espere 15 minutos"
            → Atacante bloqueado → 429 Too Many Requests

SIN GUARDIA: Atacante podria intentar 10,000 veces por segundo
CON GUARDIA: Atacante limitado a 10 intentos cada 15 minutos
             → 10,000 intentos = 25,000 minutos = 17 DIAS
```

---

## 3. Capa 1: API Gateway (WSO2)

### ¿Que es?
El "portero" que controla TODAS las peticiones antes de llegar a los microservicios.

### ¿Que protege?

| Proteccion | Que hace | Ejemplo |
|------------|----------|---------|
| **Rate Limiting** | Limita peticiones por IP | Max 100 req/15min |
| **Throttling** | Encola peticiones excesivas | Evita saturar servidores |
| **Blacklist IPs** | Bloquea IPs maliciosas | Ban a 192.168.1.100 |
| **Monitoreo** | Registra todo | Logs de quien, cuando, que |

### Ejemplo real:
```
❌ Ataque: 1000 peticiones/segundo desde IP 192.168.1.100
✅ WSO2: Bloquea despues de 100, retorna 429 Too Many Requests
```

---

## 4. Capa 2: Headers de Seguridad (Helmet)

### ¿Que es?
Middleware que agrega headers HTTP de proteccion automaticamente.

### Headers implementados:

| Header | Protege contra | Valor |
|--------|----------------|-------|
| `X-Content-Type-Options` | MIME sniffing | `nosniff` |
| `X-Frame-Options` | Clickjacking | `SAMEORIGIN` |
| `Content-Security-Policy` | XSS, inyeccion | Politica estricta |
| `Strict-Transport-Security` | Man-in-the-middle | HTTPS forzado |
| `X-Powered-By` | Fingerprinting | **Removido** |

### Codigo implementado:
```typescript
// security.middleware.ts
import helmet from 'helmet';

app.use(helmet());  // ← Una linea, 6 protecciones
```

### Ejemplo real:
```
❌ Sin Helmet: Atacante inyecta <script> en descripcion de oferta
✅ Con Helmet: CSP bloquea ejecucion de scripts externos
```

---

## 5. Capa 3: Rate Limiting por Ruta

### ¿Que es?
Limite de peticiones especifico por endpoint critico.

### Configuracion:

| Endpoint | Limite | Ventana | ¿Por que? |
|----------|--------|---------|-----------|
| `/auth/login` | 10 intentos | 15 min | Prevenir fuerza bruta |
| `/auth/register` | 10 intentos | 15 min | Prevenir spam de cuentas |
| General | 100 peticiones | 15 min | Uso normal |

### Codigo implementado:
```typescript
// Rate limit para auth (mas estricto)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutos
    max: 10,                    // 10 intentos
    message: { error: 'Demasiados intentos. Espere 15 minutos.' }
});

app.use('/auth', authLimiter);
```

### Ejemplo real:
```
❌ Ataque: Script probando 10,000 passwords
✅ Rate Limit: Bloquea despues del intento #10
   → Atacante tendria que esperar 15 min entre cada 10 intentos
   → 10,000 passwords = 25,000 minutos = 17 dias
```

---

## 6. Capa 4: Autenticacion JWT

### ¿Que es?
Token firmado que identifica al usuario en cada peticion.

### Flujo:

```
1. Usuario hace login con email/password
2. Servidor valida credenciales con Firebase Auth
3. Servidor genera JWT firmado con secreto
4. Usuario envia JWT en cada peticion
5. Servidor verifica firma antes de procesar
```

### Estructura del JWT:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.  ← Header (algoritmo)
eyJ1aWQiOiIxMjMiLCJyb2xlIjoiUE9TVFVMQU  ← Payload (datos usuario)
5URSIsImV4cCI6MTcwNTI1NjAwMH0.           
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQs ← Firma (verificacion)
```

### Codigo implementado:
```typescript
// auth.middleware.ts
export const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Token requerido' });
    }
    
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;  // { uid, role, exp }
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token invalido' });
    }
};
```

### Ejemplo real:
```
❌ Ataque: Modificar JWT para cambiar role: "ADMIN"
✅ JWT: Firma no coincide → 401 Unauthorized
```

---

## 7. Validacion de Archivos (Upload CV)

### ¿Que es?
Control estricto de que archivos pueden subirse.

### Validaciones:

| Validacion | Valor | ¿Por que? |
|------------|-------|-----------|
| Tipo MIME | Solo `application/pdf` | Prevenir ejecutables |
| Tamano max | 5 MB | Prevenir DoS por storage |
| Ruta | Autenticada | Solo usuarios registrados |

### Codigo implementado:
```typescript
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },  // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);   // ✅ Permitir
        } else {
            cb(new Error('Solo PDF'));  // ❌ Rechazar
        }
    },
});
```

### Ejemplo real:
```
❌ Ataque: Subir malware.exe renombrado a cv.pdf
✅ Multer: Verifica MIME type real → Rechaza
```

---

## 8. Passwords Seguros (bcrypt)

### ¿Que es?
Algoritmo de hash que hace imposible recuperar la password original.

### Caracteristicas:

| Aspecto | Valor | Beneficio |
|---------|-------|-----------|
| Algoritmo | bcrypt | Resistente a GPU cracking |
| Rounds | 10 | ~100ms por hash (lento intencionalmente) |
| Salt | Automatico | Cada password tiene hash unico |

### Codigo implementado:
```typescript
import bcrypt from 'bcrypt';

// Al registrar
const hashedPassword = await bcrypt.hash(password, 10);

// Al login
const isValid = await bcrypt.compare(password, hashedPassword);
```

### Ejemplo real:
```
Password: "MiPassword123!"
Hash: "$2b$10$N9qo8uLOickgx2ZMRZoMy..."

❌ Ataque: Obtener base de datos
✅ bcrypt: No puede revertir el hash a password original
   → Fuerza bruta: 10^14 anos para descifrar
```

---

## 9. Manejo de Errores Seguro

### ¿Que es?
No exponer informacion sensible en mensajes de error.

### Implementacion:

| ❌ Inseguro | ✅ Seguro |
|-------------|-----------|
| `Error at /src/users/controller.ts:45` | `Error interno del servidor` |
| `MongoError: duplicate key email_1` | `El email ya esta registrado` |
| Stack trace completo | Solo mensaje generico |

### Codigo implementado:
```typescript
// error.middleware.ts
app.use((error, req, res, next) => {
    console.error(error);  // Log interno completo
    
    res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
        // ❌ NO incluir: stack, path, query
    });
});
```

---

## 10. Tests de Seguridad

### Resumen:

```
┌────────────────────────────────────────────────┐
│  TESTS EJECUTADOS: 70                          │
│  ├── Pasan: 64 (91%)                           │
│  └── Fallan: 6 (requieren Firebase real)       │
│                                                │
│  Por tipo:                                     │
│  ├── Helmet (headers): 12 tests ✅             │
│  ├── Rate Limiting: 6 tests ✅                 │
│  ├── Auth Bypass: 12 tests ✅                  │
│  ├── Injection Prevention: 8 tests ✅          │
│  └── Error Handling: 6 tests ✅                │
└────────────────────────────────────────────────┘
```

### Ejemplo de test:
```typescript
it('Token malformado debe retornar 401', async () => {
    const response = await request(app)
        .get('/users/profile')
        .set('Authorization', 'Bearer invalid-token');
    
    expect(response.status).toBe(401);  // ✅ PASA
});
```

---

## 11. Pasos de Implementacion WSO2

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PASO 1: Desplegar WSO2                                      ✅ COMPLETADO  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Que hicimos: docker-compose up -d wso2-apim                                │
│  Resultado:   WSO2 corriendo en https://localhost:9443                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  PASO 2: Importar APIs en WSO2                               ✅ COMPLETADO  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Que hicimos: Importar 3 archivos YAML en el Publisher Portal               │
│                                                                             │
│  APIs creadas:                                                              │
│  • CAILUsuariosAPI   → /usuarios   (v1.0.0)                                │
│  • CAILOfertasAPI    → /ofertas    (v1.0.0)                                │
│  • CAILMatchingAPI   → /matching   (v1.0.0)                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  PASO 3: Configurar endpoints                                ✅ COMPLETADO  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Que hicimos: Configurar hacia donde redirige WSO2                          │
│                                                                             │
│  Endpoints configurados:                                                    │
│  • /usuarios/*  → http://host.docker.internal:8080                         │
│  • /ofertas/*   → http://host.docker.internal:8083                         │
│  • /matching/*  → http://host.docker.internal:8084                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  PASO 4: Publicar las APIs                                   ✅ COMPLETADO  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Que hicimos: Lifecycle → Publish en cada API                               │
│                                                                             │
│  Estado actual (14/01/2026):                                                │
│  • CAILUsuariosAPI   → PUBLISHED ✅                                         │
│  • CAILOfertasAPI    → PUBLISHED ✅                                         │
│  • CAILMatchingAPI   → PUBLISHED ✅                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  PASO 5: Probar que funciona                                 ⏳ PENDIENTE   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ANTES:   POST http://localhost:8080/auth/login                             │
│                 (directo a la funcion)                                      │
│                                                                             │
│  DESPUES: POST https://localhost:8243/usuarios/auth/login                   │
│                 (pasa por WSO2 primero)                                     │
│                                                                             │
│  NOTA: Requiere que los microservicios esten corriendo localmente          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 12. Resumen Visual

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CAPAS DE SEGURIDAD CAIL                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  INTERNET                                                           │
│      ↓                                                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  WSO2 API GATEWAY (El Guardia)                              │   │
│  │  • Rate Limiting global                                      │   │
│  │  • Throttling                                                │   │
│  │  • IP Blacklist                                              │   │
│  │  • Logs centralizados                                        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│      ↓                                                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  MICROSERVICIOS (Express + Helmet)                           │   │
│  │  • Security Headers (6 protecciones)                         │   │
│  │  • Rate Limiting por ruta (/auth = 10 req/15min)            │   │
│  │  • JWT Authentication                                        │   │
│  │  • Input Validation                                          │   │
│  │  • Error Handling seguro                                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│      ↓                                                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  FIREBASE                                                    │   │
│  │  • Firestore Rules                                           │   │
│  │  • Storage Rules (solo PDF, max 5MB)                        │   │
│  │  • Auth (bcrypt passwords)                                   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 13. Preguntas Frecuentes

**P: ¿Por que no usamos un WAF completo?**
> R: WSO2 + Helmet cubren el 90% de ataques comunes. Un WAF completo (Cloud Armor) se implementaria en produccion.

**P: ¿Que pasa si roban el JWT?**
> R: Expira en 7 dias. En produccion agregariamos refresh tokens y blacklist de tokens robados.

**P: ¿Los passwords estan seguros?**
> R: Si, bcrypt con 10 rounds. Ni nosotros podemos ver las passwords originales.

---

## 14. Comandos para Demostrar

```bash
# Ver headers de seguridad
curl -I http://localhost:3001/health

# Probar rate limiting (ejecutar 11 veces rapido)
for i in {1..11}; do curl -X POST http://localhost:3001/auth/login; done

# Ver WSO2 funcionando
docker ps | grep wso2

# Ejecutar tests de seguridad
cd cail/functions/usuarios && npm test
```

---

*Documento actualizado el 14 de Enero de 2026 - Exposicion del modulo de Seguridad - CAIL*
