# Seguridad y Testing - Backend CAIL

**Proyecto:** CAIL - Centro de Asistencia e Inserción Laboral  
**Fecha:** Enero 2026  
**Responsable:** Erick Gaona (Test & Security)

---

## 1. Resumen Ejecutivo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MÉTRICAS OFICIALES                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Tests Totales:              113                                           │
│   Tests que Pasan:            106 (94%)                                     │
│   Capas de Seguridad:         6                                             │
│   Microservicios:             3 (Usuarios, Ofertas, Matching)              │
│   Análisis SonarCloud:        ✅ Configurado                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. ¿Qué es la Seguridad? 



Imagina que tu API es un **edificio de oficinas** y cada petición es un **visitante**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    🏢 SIN GUARDIA (Sin Seguridad)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Visitante → Entra directamente a Oficina 1 (Usuarios)                    │
│   Visitante → Entra directamente a Oficina 2 (Ofertas)                     │
│   Visitante → Entra directamente a Oficina 3 (Matching)                    │
│                                                                             │
│   ⚠️ PROBLEMA: Cualquiera entra sin identificarse                          │
│   ⚠️ PROBLEMA: No hay registro de quién entró                              │
│   ⚠️ PROBLEMA: Pueden entrar con "maletas sospechosas" (inyecciones)       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                    🛡️ CON GUARDIA (Con Seguridad)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Visitante llega a RECEPCIÓN (API Gateway)                                │
│                                                                             │
│   El guardia verifica:                                                      │
│   ├── 1️⃣ ¿Trae identificación? (JWT Token)                                │
│   ├── 2️⃣ ¿La identificación es válida? (Verificación Firebase)            │
│   ├── 3️⃣ ¿Tiene permiso para esta oficina? (Roles: CANDIDATO/RECLUTADOR)  │
│   ├── 4️⃣ ¿Ha venido demasiadas veces hoy? (Rate Limiting)                 │
│   ├── 5️⃣ ¿Trae algo sospechoso? (Validación de entrada)                   │
│   └── 6️⃣ ¿Está en la lista negra? (IP Blacklist)                          │
│                                                                             │
│   ✅ Si pasa TODO → Puede entrar                                            │
│   ❌ Si falla ALGO → "Lo siento, no puede pasar"                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```


## 3. Tests por Microservicio

### 3.1 Matching (62 tests) ✅

| Categoría | Tests | Descripción |
|-----------|-------|-------------|
| **Seguridad** | 14 | Headers HTTP, Rate Limit, Auth, Inyección |
| **Integración** | 11 | Endpoints, Health Check, Edge Cases |
| **Lógica de Negocio** | 16 | Algoritmo de scoring, validaciones |
| **Scoring Funcional** | 21 | Habilidades, nivel, ponderación |

**Tests importantes:**
- ✅ Algoritmo de scoring calcula correctamente (40% similitud + 30% obligatorias + 15% deseables + 15% nivel)
- ✅ Habilidades coinciden case-insensitive y con match parcial
- ✅ Límite de 10 postulaciones/día se respeta
- ✅ Ordenamiento por score descendente funciona

### 3.2 Usuarios (29 tests) 

| Categoría | Tests | Descripción |
|-----------|-------|-------------|
| **Security Headers** | 6 | Helmet (X-Frame-Options, CSP, HSTS) |
| **Rate Limiting** | 3 | Límites en login y registro |
| **Auth Bypass** | 4 | Tokens inválidos, sin token |
| **Input Validation** | 3 | Emails inválidos, passwords vacíos |
| **Injection** | 4 | SQL, NoSQL, XSS, Template |
| **Integración** | 9 | Register, Login, Profile |


### 3.3 Ofertas (22 tests)

| Categoría | Tests | Descripción |
|-----------|-------|-------------|
| **Security Headers** | 3 | Helmet básico |
| **Rate Limiting** | 1 | Headers presentes |
| **Auth & Authorization** | 5 | CRUD protegido |
| **Input Validation** | 2 | Parámetros maliciosos |
| **Injection Prevention** | 2 | NoSQL, XSS |
| **Integración** | 5 | CRUD, filtros |
| **Rutas públicas** | 4 | GET /offers sin auth |


## 4. Capas de Seguridad Implementadas

### 4.1 Helmet (Headers HTTP)

Son como las **cámaras de seguridad y alarmas** del edificio - no detienen al atacante directamente, pero lo disuaden y registran todo.

```
X-Content-Type-Options: nosniff     → "No puedes disfrazarte de otro tipo de archivo"
X-Frame-Options: DENY               → "No puedes meter mi página dentro de otra"
Content-Security-Policy             → "Solo puedes cargar recursos de estos lugares"
Strict-Transport-Security           → "Siempre debes usar HTTPS (conexión segura)"
```

### 4.2 Rate Limiting

```
General:    100 peticiones / 15 min   → "100 entradas cada 15 minutos"
Login:      10 intentos / 15 min      → "10 intentos de contraseña, luego espera"
Registro:   5 intentos / 1 hora       → "No puedes crear 100 cuentas en 1 hora"
```

### 4.3 JWT Authentication

Es tu **credencial de empleado** con tu foto, nombre y cargo que caduca cada cierto tiempo.

```
Algoritmo:   HS256                    → Firma digital que no se puede falsificar
Expiración:  7 días                   → "Tu credencial vence en 7 días"
Validación:  Firebase Admin SDK       → Sistema central verifica autenticidad
```

### 4.4 Bcrypt (Contraseñas)

Es como una **caja fuerte unidireccional** - puedes meter algo, pero nadie puede sacarlo ni el guardia.

```
Rounds:      10 (2^10 iteraciones)    → "1,024 vueltas de mezcla"
Resultado:   Hash irreversible        → Imposible recuperar contraseña original
```

### 4.5 Validación de Archivos

Es como el **detector de metales** en la entrada - revisamos que no traigas nada peligroso.

```
Tipo:        Solo PDF                 → "Solo puedes traer documentos PDF"
Tamaño:      Máximo 5 MB              → "Nada más grande que 5MB"
Validación:  MIME type real           → "Verificamos que realmente sea PDF, no virus disfrazado"
```

### 4.6 Manejo de Errores Seguro

Si hay un error, no le decimos al atacante exactamente qué salió mal.

```
Desarrollo:  Stack trace visible      → Para debugging
Producción:  Solo mensaje genérico    → "Algo salió mal" (sin dar pistas)
```

---

## 5. WSO2 API Gateway

WSO2 es como la **RECEPCIÓN PRINCIPAL** del edificio - TODO el mundo pasa por aquí primero.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   ANTES (Sin WSO2) - Cada puerta abierta                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                         INTERNET                                            │
│                            │                                                │
│              ┌─────────────┼─────────────┐                                 │
│              │             │             │                                  │
│              ▼             ▼             ▼                                  │
│         [Usuarios]    [Ofertas]    [Matching]                              │
│           :8080         :8083        :8084                                 │
│                                                                             │
│   ⚠️ Cada servicio expuesto directamente                                   │
│   ⚠️ Si bloqueas un atacante, debes hacerlo en 3 lugares                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                   DESPUÉS (Con WSO2) - Una sola entrada                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                         INTERNET                                            │
│                            │                                                │
│                            ▼                                                │
│                    ┌──────────────┐                                        │
│                    │   WSO2 API   │  ← ÚNICO PUNTO DE ENTRADA              │
│                    │   Gateway    │                                        │
│                    │   :8243      │                                        │
│                    └──────┬───────┘                                        │
│              ┌────────────┼────────────┐                                   │
│              ▼            ▼            ▼                                    │
│         [Usuarios]   [Ofertas]   [Matching]                                │
│                                                                             │
│   ✅ Todo pasa por WSO2 primero                                            │
│   ✅ Un solo lugar para controlar, monitorear, bloquear                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Estado actual:**
- ✅ Gateway desplegado en Docker
- ✅ 3 APIs publicadas: `/usuarios`, `/ofertas`, `/matching`
- ✅ OAuth2 activo (requiere token para acceder)

---

## 6. SonarCloud (Análisis Estático)

SonarCloud es como un **inspector de calidad** que revisa tu edificio buscando grietas, cables sueltos y puertas sin cerradura ANTES de que alguien las explote.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SONARCLOUD                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ✅ Configurado en repositorio juan975/cail                                │
│  ✅ GitHub Actions workflow activo                                         │
│  ✅ Analiza código en cada push automáticamente                            │
│                                                                             │
│  Qué detecta:                                                               │
│  • 🔴 Vulnerabilidades (puertas abiertas)                                  │
│  • 🟡 Code smells (malas prácticas)                                        │
│  • 🟠 Bugs potenciales (cables sueltos)                                    │
│  • 📋 Código duplicado                                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Vulnerabilidades corregidas:**

| Problema | Riesgo | Solución |
|----------|--------|----------|
| ReDoS en Email.ts | Regex podía congelar servidor | Limitar a 254 caracteres antes de regex |
| Math.random() en passwords | Contraseñas predecibles | Usar `crypto.randomBytes()` |
| API Keys hardcodeadas | Exposición de credenciales | Mover a variables de entorno |

---



## 8. Estándares Seguidos

| Estándar | Descripción | Aplicado en |
|----------|-------------|-------------|
| **OWASP Top 10** | Prevención de vulnerabilidades web comunes | Inyección, XSS, Auth |
| **OWASP ASVS** | Verificación de seguridad de aplicaciones | Tests de seguridad |
| **RFC 5321** | Límite de 254 caracteres en emails | Validación Email.ts |

> **Nota:** NIST SP 800-53 - Controles de seguridad generales

---

## 9. Resumen Final

| Área | Estado | Notas |
|------|--------|-------|
| **Tests Automatizados** | ✅ 113 tests | 94% pasan |
| **Helmet (Headers)** | ✅ Implementado | 6 headers de seguridad |
| **Rate Limiting** | ✅ Implementado | Por IP y por endpoint |
| **JWT Auth** | ✅ Implementado | Firebase Admin SDK |
| **Bcrypt** | ✅ Implementado | 10 rounds |
| **Validación CV** | ✅ Implementado | Solo PDF, max 5MB |
| **WSO2 Gateway** | ✅ Configurado | 3 APIs publicadas |
| **SonarCloud** | ✅ Configurado | Análisis automático |

---

*Documento actualizado - Enero 2026*  
*Proyecto CAIL - Backend Security & Testing*
