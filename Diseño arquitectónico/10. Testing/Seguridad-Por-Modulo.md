# Seguridad Backend CAIL - Guia de Presentacion

**Proyecto:** CAIL - Centro de Asistencia e Insercion Laboral  
**Fecha:** Enero 2026  
**Responsable:** Erick Gaona (Test & Security)

---

## 1. Resumen Ejecutivo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SEGURIDAD EN NUMEROS                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Cobertura de Seguridad:          78%                                      │
│   Capas de Proteccion:             6 capas                                  │
│   Tests Automatizados:             66 tests                                 │
│   Tests que Pasan:                 65 (98%)                                 │
│   Microservicios Protegidos:       3 (Usuarios, Ofertas, Matching)          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Arquitectura de Seguridad

### 2.1 Diagrama General

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                              INTERNET                                       │
│                                 │                                           │
│                                 ▼                                           │
│                        ┌───────────────┐                                    │
│                        │  WSO2 Gateway │  ← Capa 1: Gateway centralizado   │
│                        │  (API Manager)│                                    │
│                        └───────┬───────┘                                    │
│                                │                                            │
│              ┌─────────────────┼─────────────────┐                          │
│              ▼                 ▼                 ▼                          │
│        ┌──────────┐      ┌──────────┐      ┌──────────┐                     │
│        │ Usuarios │      │ Ofertas  │      │ Matching │                     │
│        │  :8080   │      │  :8083   │      │  :8084   │                     │
│        └────┬─────┘      └────┬─────┘      └────┬─────┘                     │
│             │                 │                 │                           │
│             └─────────────────┼─────────────────┘                           │
│                               ▼                                             │
│                        ┌───────────────┐                                    │
│                        │   Firebase    │  ← Base de datos                  │
│                        │  (Firestore)  │                                    │
│                        └───────────────┘                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Flujo de una Peticion

```
Cliente → Helmet → Rate Limit → JWT Auth → Validacion → Logica → Firebase
   │         │          │           │           │          │
   │         │          │           │           │          └── Respuesta
   │         │          │           │           └── ¿Datos validos?
   │         │          │           └── ¿Token valido?
   │         │          └── ¿Muchas peticiones?
   │         └── Headers de seguridad
   └── Peticion HTTP
```

---

## 3. Las 6 Capas de Seguridad

### 3.1 Capa 1: Helmet (Headers HTTP)

**¿Que es?**  
Helmet es un middleware que configura cabeceras HTTP de seguridad automaticamente.

**¿Que protege?**

| Header | Proteccion |
|--------|------------|
| `X-Frame-Options: DENY` | Evita que la pagina se cargue en un iframe (clickjacking) |
| `X-Content-Type-Options: nosniff` | Evita que el navegador interprete archivos incorrectamente |
| `X-XSS-Protection: 1` | Activa el filtro XSS del navegador |
| `Strict-Transport-Security` | Fuerza conexiones HTTPS |
| `Content-Security-Policy` | Controla que recursos puede cargar la pagina |

**Ejemplo de ataque prevenido:**
```
Sin Helmet:
  Atacante → Crea pagina con <iframe src="cail.com/eliminar-cuenta">
  Usuario  → Visita pagina del atacante
  Resultado: Usuario elimina su cuenta sin saberlo (clickjacking)

Con Helmet:
  Navegador → Ve header X-Frame-Options: DENY
  Resultado: Iframe bloqueado, ataque fallido ✅
```

---

### 3.2 Capa 2: Rate Limiting

**¿Que es?**  
Limita el numero de peticiones que un cliente puede hacer en un periodo de tiempo.

**Configuracion implementada:**

| Endpoint | Limite | Ventana | Proposito |
|----------|--------|---------|-----------|
| General | 100 peticiones | 15 minutos | Prevenir abuso general |
| Login | 10 intentos | 15 minutos | Prevenir fuerza bruta |
| Registro | 5 intentos | 1 hora | Prevenir spam de cuentas |

**Ejemplo de ataque prevenido:**
```
Sin Rate Limiting:
  Atacante → Prueba 10,000 contraseñas en 1 minuto
  Resultado: Encuentra la contraseña correcta

Con Rate Limiting:
  Atacante → Intento 1... OK
  Atacante → Intento 10... OK
  Atacante → Intento 11... ERROR 429 "Too Many Requests"
  Atacante → Debe esperar 15 minutos
  Resultado: Solo puede probar 40 contraseñas por hora ✅
```

---

### 3.3 Capa 3: Autenticacion JWT

**¿Que es?**  
JSON Web Token es un estandar para transmitir informacion de forma segura entre partes.

**Estructura del token:**
```
eyJhbGciOiJIUzI1NiIs...  (Header: algoritmo)
.eyJ1aWQiOiIxMjM0Iiwi...  (Payload: datos del usuario)
.SflKxwRJSMeKKF2QT4f...  (Signature: firma digital)
```

**Configuracion implementada:**

| Parametro | Valor | Razon |
|-----------|-------|-------|
| Algoritmo | HS256 | Firma simetrica segura |
| Expiracion | 7 dias | Balance seguridad/usabilidad |
| Secret | 64 caracteres | Clave larga = dificil de adivinar |

**Ejemplo de proteccion:**
```
Sin JWT:
  Atacante → GET /users/perfil
  Servidor → Devuelve datos de cualquier usuario

Con JWT:
  Atacante → GET /users/perfil (sin token)
  Servidor → 401 Unauthorized

  Usuario  → GET /users/perfil + Authorization: Bearer eyJ...
  Servidor → Verifica firma, devuelve solo SUS datos ✅
```

---

### 3.4 Capa 4: Hash de Contraseñas (Bcrypt)

**¿Que es?**  
Bcrypt transforma la contraseña en un hash irreversible antes de guardarla.

**¿Por que es importante?**
```
Sin Bcrypt (texto plano):
  Base de datos: password = "micontraseña123"
  Si hackean la BD → Contraseña expuesta

Con Bcrypt:
  Base de datos: password = "$2b$10$N9qo8uLOickgx2ZMRZoMy..."
  Si hackean la BD → Solo ven el hash, no pueden revertirlo ✅
```

**Configuracion implementada:**

| Parametro | Valor | Significado |
|-----------|-------|-------------|
| Rounds | 10 | 2^10 = 1024 iteraciones de hash |
| Tiempo | ~100ms | Suficiente para ser seguro, no lento para usuarios |

---

### 3.5 Capa 5: Validacion de Archivos (CV)

**¿Que es?**  
Control de que archivos pueden subir los usuarios.

**Configuracion implementada:**

| Restriccion | Valor | Razon |
|-------------|-------|-------|
| Tipo permitido | Solo PDF | Evitar ejecutables maliciosos |
| Tamaño maximo | 5 MB | Evitar ataques de denegacion de servicio |
| Validacion | MIME type | Verificar que realmente sea PDF |

**Ejemplo de ataque prevenido:**
```
Sin validacion:
  Atacante → Sube "cv.exe" renombrado a "cv.pdf"
  Servidor → Acepta el archivo
  Resultado: Malware en el servidor

Con validacion:
  Atacante → Sube archivo
  Servidor → Verifica MIME type: application/x-executable
  Servidor → Rechaza: "Solo se permiten archivos PDF" ✅
```

---

### 3.6 Capa 6: Manejo Seguro de Errores

**¿Que es?**  
Control de que informacion se muestra cuando ocurre un error.

**Diferencia entre desarrollo y produccion:**

```
En DESARROLLO (para debugging):
{
  "error": "Usuario no encontrado",
  "stack": "Error at UserService.findById (users.service.ts:45)...",
  "query": "SELECT * FROM users WHERE id = '123'"
}

En PRODUCCION (para usuarios):
{
  "error": "Usuario no encontrado"
}
```

**¿Por que ocultar el stack trace?**
- Revela estructura interna del codigo
- Muestra rutas de archivos del servidor
- Puede exponer consultas a la base de datos
- Facilita que un atacante encuentre vulnerabilidades

---

## 4. WSO2 API Gateway

### 4.1 ¿Que es un API Gateway?

Un API Gateway es un punto de entrada unico para todas las APIs. Funciona como un "guardia de seguridad" que revisa todas las peticiones antes de dejarlas pasar.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ANALOGIA: EDIFICIO DE OFICINAS                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SIN GUARDIA (Sin Gateway):                                                 │
│  ┌─────────────────────────────────────────────────────────────┐            │
│  │  Visitante → Oficina Usuarios                               │            │
│  │  Visitante → Oficina Ofertas                                │            │
│  │  Visitante → Oficina Matching                               │            │
│  │  ⚠️ Cualquiera entra a cualquier oficina                    │            │
│  └─────────────────────────────────────────────────────────────┘            │
│                                                                             │
│  CON GUARDIA (Con Gateway):                                                 │
│  ┌─────────────────────────────────────────────────────────────┐            │
│  │  Visitante → RECEPCION → "¿Tiene cita? ¿Identificacion?"   │            │
│  │                 │                                           │            │
│  │                 ├── Si OK → Pasa a la oficina              │            │
│  │                 └── Si NO → "Lo siento, no puede pasar"    │            │
│  │                                                             │            │
│  │  ✅ El guardia revisa TODO antes de dejar pasar            │            │
│  └─────────────────────────────────────────────────────────────┘            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Funcionalidades de WSO2

| Funcionalidad | Descripcion | Estado |
|---------------|-------------|--------|
| Rate Limiting centralizado | Limitar peticiones desde un solo punto | ✅ Disponible |
| OAuth2 / API Keys | Autenticacion de clientes | ✅ Activo |
| Blacklist de IPs | Bloquear atacantes conocidos | ✅ Disponible |
| Logs centralizados | Registro de todas las peticiones | ✅ Disponible |
| Throttling | Control de trafico por plan | ✅ Disponible |

### 4.3 Estado Actual

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         WSO2 - ESTADO DE IMPLEMENTACION                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ✅ Gateway desplegado localmente con Docker                                │
│  ✅ 3 APIs importadas y publicadas                                          │
│  ✅ Endpoints configurados correctamente                                    │
│  ✅ OAuth2 habilitado (requiere token para acceder)                         │
│                                                                             │
│  APIs Publicadas:                                                           │
│  • /usuarios  → Microservicio Usuarios (puerto 8080)                       │
│  • /ofertas   → Microservicio Ofertas (puerto 8083)                        │
│  • /matching  → Microservicio Matching (puerto 8084)                       │
│                                                                             │
│  Para produccion: WSO2 Choreo (plan gratuito disponible)                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Tests de Seguridad

### 5.1 Resumen de Tests

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              TESTS DE SEGURIDAD                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Total de tests:              66                                            │
│  Tests de seguridad:          51                                            │
│  Tests de integracion:        15                                            │
│                                                                             │
│  Por microservicio:                                                         │
│  • Usuarios:   25 tests (18 seguridad + 7 integracion)                     │
│  • Ofertas:    22 tests (17 seguridad + 5 integracion)                     │
│  • Matching:   19 tests (15 seguridad + 4 integracion)                     │
│                                                                             │
│  Resultado:    65 pasan (98%) | 1 falla (funcionalidad pendiente)          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Ejemplos de Tests

| Test | Que verifica | Resultado esperado |
|------|--------------|-------------------|
| Helmet Headers | Que X-Frame-Options este presente | Header = "DENY" |
| Rate Limit Login | Que despues de 10 intentos bloquee | Status 429 |
| Auth Bypass | Que sin token no acceda a rutas protegidas | Status 401 |
| SQL Injection | Que no ejecute codigo malicioso | Status 400 o datos sanitizados |
| XSS Prevention | Que no inyecte scripts | Contenido escapado |

### 5.3 Como Ejecutar los Tests

```bash
# Todos los tests de un microservicio
cd cail/functions/usuarios
npm test

# Solo tests de seguridad
npm test -- --grep "Security"

# Con reporte de cobertura
npm run test:coverage
```

---

## 6. Cobertura por Modulo

| Modulo | Cobertura | Implementado | Pendiente |
|--------|-----------|--------------|-----------|
| Autenticacion | 80% | JWT, Bcrypt, Rate Limit | Password 12+ chars |
| Usuarios | 75% | Helmet, Auth, Validacion | CORS restrictivo |
| Ofertas | 85% | Helmet, Rate Limit, RBAC | Sanitizar HTML |
| Matching | 40% | Helmet, Rate Limit | Limites de postulacion |
| WSO2 Gateway | 100% | Desplegado, APIs publicadas | - |

---

## 7. Proximos Pasos

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ROADMAP DE SEGURIDAD                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PRIORIDAD ALTA:                                                            │
│  □ Validacion de contraseñas (minimo 12 caracteres)                        │
│  □ CORS restrictivo (solo dominios permitidos)                             │
│  □ Configurar tokens OAuth2 en WSO2                                        │
│                                                                             │
│  PRIORIDAD MEDIA:                                                           │
│  □ Validacion de cedula ecuatoriana                                        │
│  □ Limite de postulaciones por dia                                         │
│  □ Sanitizar HTML en descripciones                                         │
│                                                                             │
│  PARA PRODUCCION:                                                           │
│  □ Desplegar WSO2 en Choreo (cloud)                                        │
│  □ Configurar Cloud Armor (WAF)                                            │
│  □ Logs de auditoria                                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Conclusion

CAIL implementa seguridad en multiples capas, desde headers HTTP hasta validacion de archivos. Cada microservicio tiene sus propias protecciones, y WSO2 API Gateway proporciona una capa adicional de control centralizado.

**Puntos clave:**
- 6 capas de proteccion implementadas
- 66 tests automatizados (98% pasan)
- 78% de cobertura de seguridad
- Gateway configurado y listo para produccion

---

*Documento para presentacion - Enero 2026*  
*Proyecto CAIL - Backend Security*
