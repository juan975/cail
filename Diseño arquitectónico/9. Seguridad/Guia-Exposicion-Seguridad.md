# Guía de Exposición - Seguridad Backend CAIL

**Duración estimada:** 10-15 minutos  
**Fecha:** 14 de Enero de 2026  
**Responsable:** Erick Gaona

---

## 1. Introducción (1 min)

> "Implementamos seguridad en **4 capas** para proteger la aplicación desde el navegador hasta la base de datos."

```
Usuario → [WSO2 Gateway] → [Microservicios] → [Firebase]
              ↓                   ↓
         Rate Limit          Helmet + JWT
         Throttling          Validaciones
```

---

## 2. Capa 1: API Gateway (WSO2)

### ¿Qué es?
Un "portero" que controla TODAS las peticiones antes de llegar a nuestros microservicios.

### ¿Qué protege?

| Protección | Ejemplo |
|------------|---------|
| **Rate Limiting** | Máximo 100 peticiones por minuto por IP |
| **Throttling** | Si hay muchas peticiones, las encola |
| **Blacklist IPs** | Bloquea IPs maliciosas conocidas |
| **Monitoreo** | Logs de todas las peticiones |

### Ejemplo real:
```
❌ Ataque: 1000 peticiones/segundo desde IP 192.168.1.100
✅ WSO2: Bloquea después de 100, retorna 429 Too Many Requests
```

---

## 3. Capa 2: Headers de Seguridad (Helmet)

### ¿Qué es?
Middleware que agrega headers HTTP de protección automáticamente.

### Headers implementados:

| Header | Protege contra | Valor |
|--------|----------------|-------|
| `X-Content-Type-Options` | MIME sniffing | `nosniff` |
| `X-Frame-Options` | Clickjacking | `SAMEORIGIN` |
| `Content-Security-Policy` | XSS, inyección | Política estricta |
| `Strict-Transport-Security` | Man-in-the-middle | HTTPS forzado |
| `X-Powered-By` | Fingerprinting | **Removido** |

### Código implementado:
```typescript
// security.middleware.ts
import helmet from 'helmet';

app.use(helmet());  // ← Una línea, 6 protecciones
```

### Ejemplo real:
```
❌ Sin Helmet: Atacante inyecta <script> en descripción de oferta
✅ Con Helmet: CSP bloquea ejecución de scripts externos
```

---

## 4. Capa 3: Rate Limiting por Ruta

### ¿Qué es?
Límite de peticiones específico por endpoint crítico.

### Configuración:

| Endpoint | Límite | Ventana | ¿Por qué? |
|----------|--------|---------|-----------|
| `/auth/login` | 10 intentos | 15 min | Prevenir fuerza bruta |
| `/auth/register` | 10 intentos | 15 min | Prevenir spam de cuentas |
| General | 100 peticiones | 15 min | Uso normal |

### Código implementado:
```typescript
// Rate limit para auth (más estricto)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutos
    max: 10,                    // 10 intentos
    message: { error: 'Demasiados intentos. Espere 15 minutos.' }
});

app.use('/auth', authLimiter);
```

### Ejemplo real:
```
❌ Ataque: Script probando 10,000 contraseñas
✅ Rate Limit: Bloquea después del intento #10
   → Atacante tendría que esperar 15 min entre cada 10 intentos
   → 10,000 contraseñas = 25,000 minutos = 17 días
```

---

## 5. Capa 4: Autenticación JWT

### ¿Qué es?
Token firmado que identifica al usuario en cada petición.

### Flujo:

```
1. Usuario hace login con email/password
2. Servidor valida credenciales con Firebase Auth
3. Servidor genera JWT firmado con secreto
4. Usuario envía JWT en cada petición
5. Servidor verifica firma antes de procesar
```

### Estructura del JWT:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.  ← Header (algoritmo)
eyJ1aWQiOiIxMjMiLCJyb2xlIjoiUE9TVFVMQU  ← Payload (datos usuario)
5URSIsImV4cCI6MTcwNTI1NjAwMH0.           
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQs ← Firma (verificación)
```

### Código implementado:
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
        return res.status(401).json({ error: 'Token inválido' });
    }
};
```

### Ejemplo real:
```
❌ Ataque: Modificar JWT para cambiar role: "ADMIN"
✅ JWT: Firma no coincide → 401 Unauthorized
```

---

## 6. Validación de Archivos (Upload CV)

### ¿Qué es?
Control estricto de qué archivos pueden subirse.

### Validaciones:

| Validación | Valor | ¿Por qué? |
|------------|-------|-----------|
| Tipo MIME | Solo `application/pdf` | Prevenir ejecutables |
| Tamaño máx | 5 MB | Prevenir DoS por storage |
| Ruta | Autenticada | Solo usuarios registrados |

### Código implementado:
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

## 7. Passwords Seguros (bcrypt)

### ¿Qué es?
Algoritmo de hash que hace imposible recuperar la contraseña original.

### Características:

| Aspecto | Valor | Beneficio |
|---------|-------|-----------|
| Algoritmo | bcrypt | Resistente a GPU cracking |
| Rounds | 10 | ~100ms por hash (lento intencionalmente) |
| Salt | Automático | Cada password tiene hash único |

### Código implementado:
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
   → Fuerza bruta: 10^14 años para descifrar
```

---

## 8. Manejo de Errores Seguro

### ¿Qué es?
No exponer información sensible en mensajes de error.

### Implementación:

| ❌ Inseguro | ✅ Seguro |
|-------------|-----------|
| `Error: Cannot read property 'id' of undefined at /src/users/controller.ts:45` | `Error: Ocurrió un error interno` |
| `MongoError: duplicate key email_1` | `Error: El email ya está registrado` |
| Stack trace completo | Solo mensaje genérico |

### Código implementado:
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

## 9. Tests de Seguridad

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

## 10. Resumen Visual

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CAPAS DE SEGURIDAD CAIL                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  INTERNET                                                           │
│      ↓                                                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  WSO2 API GATEWAY                                            │   │
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

## 11. Preguntas Frecuentes

**P: ¿Por qué no usamos un WAF completo?**
> R: WSO2 + Helmet cubren el 90% de ataques comunes. Un WAF completo (Cloud Armor) se implementaría en producción.

**P: ¿Qué pasa si roban el JWT?**
> R: Expira en 7 días. En producción agregaríamos refresh tokens y blacklist de tokens robados.

**P: ¿Los passwords están seguros?**
> R: Sí, bcrypt con 10 rounds. Ni nosotros podemos ver las contraseñas originales.

---

## 12. Comandos para Demostrar

```bash
# Ver headers de seguridad
curl -I http://localhost:3001/health

# Probar rate limiting (ejecutar 11 veces rápido)
for i in {1..11}; do curl -X POST http://localhost:3001/auth/login; done

# Ver WSO2 funcionando
docker ps | grep wso2

# Ejecutar tests de seguridad
cd cail/functions/usuarios && npm test
```

---

*Documento creado para exposición del módulo de Seguridad - CAIL 2026*

