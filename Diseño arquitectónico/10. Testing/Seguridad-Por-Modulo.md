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

## 2. Tests por Microservicio

### 2.1 Matching (62 tests) ✅

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

### 2.2 Usuarios (29 tests) - 23 pasan

| Categoría | Tests | Descripción |
|-----------|-------|-------------|
| **Security Headers** | 6 | Helmet (X-Frame-Options, CSP, HSTS) |
| **Rate Limiting** | 3 | Límites en login y registro |
| **Auth Bypass** | 4 | Tokens inválidos, sin token |
| **Input Validation** | 3 | Emails inválidos, passwords vacíos |
| **Injection** | 4 | SQL, NoSQL, XSS, Template |
| **Integración** | 9 | Register, Login, Profile |

**Tests importantes:**
- ✅ Sin token → 401 Unauthorized
- ✅ Token malformado → 401 
- ✅ Headers de seguridad presentes
- ⚠️ 6 tests fallan (requieren Firebase real)

### 2.3 Ofertas (22 tests) - 21 pasan

| Categoría | Tests | Descripción |
|-----------|-------|-------------|
| **Security Headers** | 3 | Helmet básico |
| **Rate Limiting** | 1 | Headers presentes |
| **Auth & Authorization** | 5 | CRUD protegido |
| **Input Validation** | 2 | Parámetros maliciosos |
| **Injection Prevention** | 2 | NoSQL, XSS |
| **Integración** | 5 | CRUD, filtros |
| **Rutas públicas** | 4 | GET /offers sin auth |

**Tests importantes:**
- ✅ Rutas públicas funcionan sin auth
- ✅ Rutas protegidas requieren token
- ✅ Inyección NoSQL manejada

---

## 3. Capas de Seguridad

### 3.1 Helmet (Headers HTTP)
```
X-Content-Type-Options: nosniff     → Previene MIME sniffing
X-Frame-Options: DENY               → Previene clickjacking
Content-Security-Policy             → Controla recursos cargados
Strict-Transport-Security           → Fuerza HTTPS
```

### 3.2 Rate Limiting
```
General:    100 peticiones / 15 min
Login:      10 intentos / 15 min
Registro:   5 intentos / 1 hora
```

### 3.3 JWT Authentication
```
Algoritmo:   HS256
Expiración:  7 días
Validación:  Firebase Admin SDK
```

### 3.4 Bcrypt (Contraseñas)
```
Rounds:      10 (2^10 iteraciones)
Resultado:   Hash irreversible
```

### 3.5 Validación de Archivos
```
Tipo:        Solo PDF
Tamaño:      Máximo 5 MB
Validación:  MIME type real
```

### 3.6 Manejo de Errores
```
Desarrollo:  Stack trace visible
Producción:  Solo mensaje genérico
```

---

## 4. WSO2 API Gateway

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ESTADO WSO2                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ✅ Gateway desplegado (Docker)                                            │
│  ✅ 3 APIs publicadas:                                                     │
│     • /usuarios  → puerto 8080                                             │
│     • /ofertas   → puerto 8083                                             │
│     • /matching  → puerto 8084                                             │
│  ✅ OAuth2 activo (requiere token)                                         │
│                                                                             │
│  Beneficios:                                                                │
│  • Rate limiting centralizado                                               │
│  • Logs de todas las peticiones                                            │
│  • Blacklist de IPs                                                        │
│  • Un solo punto de entrada                                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. SonarCloud

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SONARCLOUD                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ✅ Configurado en repositorio juan975/cail                                │
│  ✅ GitHub Actions workflow activo                                         │
│  ✅ Analiza código en cada push                                            │
│                                                                             │
│  Qué detecta:                                                               │
│  • Vulnerabilidades de seguridad                                           │
│  • Code smells                                                              │
│  • Bugs potenciales                                                        │
│  • Código duplicado                                                        │
│                                                                             │
│  Fixes aplicados:                                                           │
│  • ReDoS en Email.ts (límite 254 chars antes de regex)                     │
│  • Math.random → crypto.randomBytes para passwords                         │
│  • API Keys movidas a variables de entorno                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Comandos para Ejecutar Tests

```bash
# === MATCHING ===
cd cail/functions/matching
npm test                    # Todos los tests
npm test -- --coverage      # Con cobertura

# === USUARIOS ===
cd cail/functions/usuarios
npm test                    # Todos los tests

# === OFERTAS ===
cd cail/functions/ofertas
npm test                    # Todos los tests

# === SOLO TESTS DE SEGURIDAD ===
npm test -- --testPathPattern=security

# === TEST ESPECÍFICO ===
npm test -- --testNamePattern="Helmet"
```

---

## 7. Resumen Final

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
