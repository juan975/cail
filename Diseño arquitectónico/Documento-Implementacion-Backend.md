# Documento de Implementación
## Backend CAIL - Bolsa de Empleo

**Versión:** 1.0  
**Fecha de Creación:** 06 de Enero de 2026  
**Última Actualización:** 06 de Enero de 2026  

---

## Tabla de Contenidos

1. [Información General del Proyecto](#1-información-general-del-proyecto)
2. [Equipo de Desarrollo](#2-equipo-de-desarrollo)
3. [Arquitectura del Sistema](#3-arquitectura-del-sistema)
4. [Cronograma de Implementación](#4-cronograma-de-implementación)
5. [Fases de Desarrollo](#5-fases-de-desarrollo)
6. [Estado Actual del Proyecto](#6-estado-actual-del-proyecto)
7. [Historial de Versiones](#7-historial-de-versiones)
8. [Entregables por Fase](#8-entregables-por-fase)
9. [Riesgos y Mitigaciones](#9-riesgos-y-mitigaciones)
10. [Criterios de Aceptación](#10-criterios-de-aceptación)
11. [Plan de Pruebas](#11-plan-de-pruebas)
12. [Plan de Despliegue](#12-plan-de-despliegue)

---

## 1. Información General del Proyecto

### 1.1 Descripción

El proyecto CAIL (Cámara de Industrias de Loja) es una plataforma de bolsa de empleo que conecta a empresas afiliadas con profesionales locales. El backend se desarrolla bajo una arquitectura Serverless utilizando Node.js y TypeScript.

### 1.2 Datos del Proyecto

| Campo | Valor |
|-------|-------|
| **Nombre del Proyecto** | CAIL - Bolsa de Empleo |
| **Repositorio** | https://github.com/juan975/cail |
| **Rama Principal** | main |
| **Tecnología Backend** | Node.js + TypeScript |
| **Base de Datos** | Firebase Firestore (NoSQL) |
| **Autenticación** | Firebase Auth + JWT |
| **Infraestructura** | Google Cloud Run (Docker) |
| **API Gateway** | WSO2 API Manager |
| **Arquitectura** | Monolito Modular (con plan de migración a Microservicios) |

### 1.3 Objetivos de la Implementación

| # | Objetivo | Prioridad |
|---|----------|-----------|
| 1 | Desarrollar un backend seguro y escalable | Alta |
| 2 | Implementar autenticación robusta con JWT | Alta |
| 3 | Crear APIs RESTful para gestión de usuarios, ofertas y matching | Alta |
| 4 | Cumplir con estándares de seguridad OWASP | Alta |
| 5 | Preparar arquitectura para migración a microservicios | Media |
| 6 | Implementar CI/CD para despliegue automatizado | Media |

---

## 2. Equipo de Desarrollo

### 2.1 Miembros del Equipo

| Nombre | Rol | Email | GitHub | Módulo Asignado |
|--------|-----|-------|--------|-----------------|
| Juan Espinosa | Líder Técnico / Data Architect | jcespinosa9@utpl.edu.ec | juan975 | Firestore + Usuarios (CUENTA, ADMIN) |
| Alex Ramírez | Arquitecto de Software | airamirez9@utpl.edu.ec | ALISrj | Infraestructura + Auth (Config, Registro/Login) |
| Carlos Mejia | Desarrollador Backend | cdmejia4@utpl.edu.ec | cdm18 | Auth (JWT/Token) + WSO2 Gateway |
| Sebastián Calderón | Desarrollador Frontend | sacalderon5@utpl.edu.ec | cbhas | Usuarios (POSTULANTE, RECLUTADOR) |
| Erick Gaona | Test & Security | eogaona@utpl.edu.ec | ErickGaona | Ofertas (CRUD + Búsqueda) + Seguridad |
| Dara Van Gijsel | UX/UI Designer | dvan1@utpl.edu.ec | daravan1 | Matching + Postulación + WSO2 |

### 2.2 Contribuciones al Repositorio (Actualizado al 06/01/2026)

| Desarrollador | Commits Totales | Última Actividad |
|---------------|-----------------|------------------|
| Erick Gaona | 61 | 04/01/2026 |
| Sebastián Calderón | 55 | 03/12/2025 |
| Carlos Mejia | 12 | 05/01/2026 |
| Alex Ramírez | 8 | 17/12/2025 |
| Juan Espinosa | 10 | 25/11/2025 |
| Dara Van Gijsel | 7 | 21/12/2025 |

---

## 3. Arquitectura del Sistema

### 3.1 Arquitectura Actual (Monolito Modular)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ARQUITECTURA ACTUAL - MONOLITO                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                         ┌─────────────────────┐                             │
│                         │    Google Cloud     │                             │
│                         │       Run           │                             │
│                         │                     │                             │
│                         │  ┌───────────────┐  │                             │
│                         │  │ cail-backend  │  │                             │
│                         │  │   (Docker)    │  │                             │
│                         │  │               │  │                             │
│                         │  │ Puerto: 8080  │  │                             │
│                         │  └───────┬───────┘  │                             │
│                         │          │          │                             │
│                         └──────────┼──────────┘                             │
│                                    │                                        │
│                    ┌───────────────┼───────────────┐                        │
│                    │               │               │                        │
│                    ▼               ▼               ▼                        │
│             ┌──────────┐    ┌──────────┐    ┌──────────┐                   │
│             │ Firebase │    │ Firebase │    │  WSO2    │                   │
│             │ Firestore│    │   Auth   │    │ Gateway  │                   │
│             └──────────┘    └──────────┘    └──────────┘                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Estructura del Código

```
cail/backend/
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── .env.example
│
└── src/
    ├── index.ts                    # Servidor Express principal
    │
    ├── modules/
    │   ├── auth/                   # Módulo de Autenticación
    │   │   ├── application/
    │   │   │   ├── dtos/
    │   │   │   └── use-cases/
    │   │   ├── domain/
    │   │   │   ├── entities/
    │   │   │   └── repositories/
    │   │   └── infrastructure/
    │   │       ├── controllers/
    │   │       ├── repositories/
    │   │       └── routes/
    │   │
    │   ├── users/                  # Módulo de Usuarios
    │   ├── offers/                 # Módulo de Ofertas
    │   └── matching/               # Módulo de Matching
    │
    └── shared/
        ├── domain/
        │   └── value-objects/
        └── infrastructure/
            ├── config/
            ├── middleware/
            └── utils/
```

### 3.3 Arquitectura Futura (Microservicios)

| Servicio | Puerto | Responsable | Estado |
|----------|--------|-------------|--------|
| auth-service | 8081 | Alex + Carlos | Planificado |
| users-service | 8082 | Juan + Sebastián | Planificado |
| offers-service | 8083 | Erick | Planificado |
| matching-service | 8084 | Dara | Planificado |

---

## 4. Cronograma de Implementación

### 4.1 Línea de Tiempo General

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CRONOGRAMA DE IMPLEMENTACIÓN 2025-2026                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  NOV 2025        DIC 2025        ENE 2026        FEB 2026        MAR 2026  │
│     │               │               │               │               │       │
│     ▼               ▼               ▼               ▼               ▼       │
│  ┌─────┐         ┌─────┐         ┌─────┐         ┌─────┐         ┌─────┐   │
│  │FASE │         │FASE │         │FASE │         │FASE │         │FASE │   │
│  │  1  │────────>│  2  │────────>│  3  │────────>│  4  │────────>│  5  │   │
│  │     │         │     │         │     │         │     │         │     │   │
│  │Docu-│         │Infra│         │Desa-│         │Inte-│         │Des- │   │
│  │menta│         │estru│         │rrollo│        │gra- │         │plie-│   │
│  │ción │         │ctura│         │Core │         │ción │         │gue  │   │
│  └─────┘         └─────┘         └─────┘         └─────┘         └─────┘   │
│                                                                             │
│  ████████████████ COMPLETADO                                                │
│  ░░░░░░░░░░░░░░░░ EN PROGRESO                                               │
│  ──────────────── PLANIFICADO                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Cronograma Detallado

| Fase | Nombre | Fecha Inicio | Fecha Fin | Estado | Progreso |
|------|--------|--------------|-----------|--------|----------|
| 1 | Documentación y Diseño | 01/11/2025 | 30/11/2025 | ✅ Completado | 100% |
| 2 | Infraestructura y Auth | 01/12/2025 | 15/01/2026 | 🔄 En Progreso | 70% |
| 3 | Desarrollo de Módulos Core | 16/01/2026 | 28/02/2026 | ⏳ Pendiente | 0% |
| 4 | Integración y Testing | 01/03/2026 | 15/03/2026 | ⏳ Pendiente | 0% |
| 5 | Despliegue y Go-Live | 16/03/2026 | 31/03/2026 | ⏳ Pendiente | 0% |

---

## 5. Fases de Desarrollo

### 5.1 FASE 1: Documentación y Diseño (Noviembre 2025) ✅

| Entregable | Responsable | Fecha | Estado |
|------------|-------------|-------|--------|
| Mapa de Capacidades | Sebastián Calderón | 27/11/2025 | ✅ |
| Casos de Uso y Especificaciones | Alex Ramírez + Erick Gaona | 26/11/2025 | ✅ |
| Diagrama de Clases | Erick Gaona | 25/11/2025 | ✅ |
| Diagramas de Secuencia | Erick Gaona | 25/11/2025 | ✅ |
| Vista de Desarrollo | Carlos Mejia | 25/11/2025 | ✅ |
| Modelo de Datos | Juan Espinosa | 27/11/2025 | ✅ |
| Documentos de Protección de Datos | Erick Gaona | 25/11/2025 | ✅ |
| Historias de Usuario | Alex Ramírez | 17/12/2025 | ✅ |

### 5.2 FASE 2: Infraestructura y Autenticación (Diciembre 2025 - Enero 2026) 🔄

| Tarea | Responsable | Fecha Inicio | Fecha Fin | Estado |
|-------|-------------|--------------|-----------|--------|
| 1.1 Configuración del Entorno | Carlos Mejia | 05/01/2026 | 05/01/2026 | ✅ |
| 1.2 Implementación Auth (Registro/Login) | Carlos Mejia | 05/01/2026 | 05/01/2026 | ✅ |
| 1.2 Implementación Auth (JWT/Token) | Carlos Mejia | 05/01/2026 | 05/01/2026 | ✅ |
| 1.3 Configuración Firestore | Carlos Mejia | 05/01/2026 | 05/01/2026 | ✅ |
| 1.4 Integración WSO2 (Auth) | Carlos Mejia | TBD | TBD | ⏳ |
| Sección 12 Seguridad (SAD) | Erick Gaona | 23/12/2025 | 04/01/2026 | ✅ |
| Estándares de Seguridad Backend | Erick Gaona | 04/01/2026 | 04/01/2026 | ✅ |
| Dockerfile Seguro (no-root) | Carlos Mejia | 05/01/2026 | 05/01/2026 | ✅ |

#### Commits Relacionados (Fase 2):

| Fecha | Autor | Commit | Descripción |
|-------|-------|--------|-------------|
| 05/01/2026 | Carlos Mejia | 234bce32 | feat: implementar backend completo CAIL |
| 05/01/2026 | Carlos Mejia | 28e4ee94 | chore: configurar archivos ignore y plantilla de entorno |
| 05/01/2026 | Carlos Mejia | 4e840d4a | chore: agregar .gitignore |
| 04/01/2026 | Erick Gaona | d8a8dce8 | Agregar documento de Estándares de Seguridad |
| 23/12/2025 | Erick Gaona | e740a890 | Agregar Sección 12 de Seguridad ampliada |

### 5.3 FASE 3: Desarrollo de Módulos Core (Enero - Febrero 2026) ⏳

| Módulo | Tarea | Responsable | Fecha Planificada | Estado |
|--------|-------|-------------|-------------------|--------|
| **Usuarios** | 2.1 CRUD CUENTA/ADMIN | Juan Espinosa | 16-23/01/2026 | ⏳ |
| **Usuarios** | 2.1 CRUD POSTULANTE/RECLUTADOR | Sebastián Calderón | 16-23/01/2026 | ⏳ |
| **Usuarios** | 2.2 Lógica de Perfiles | Sebastián Calderón | 24-31/01/2026 | ⏳ |
| **Ofertas** | 3.1 CRUD Ofertas | Erick Gaona | 01-07/02/2026 | ⏳ |
| **Ofertas** | 3.2 Búsqueda de Ofertas | Erick Gaona | 08-14/02/2026 | ⏳ |
| **Matching** | 3.3 Algoritmo de Matching | Dara Van Gijsel | 15-21/02/2026 | ⏳ |
| **Matching** | 3.4 Endpoints de Postulación | Dara Van Gijsel | 22-28/02/2026 | ⏳ |

### 5.4 FASE 4: Integración y Testing (Marzo 2026) ⏳

| Tarea | Responsable | Fecha Planificada | Estado |
|-------|-------------|-------------------|--------|
| 2.4 Integración WSO2 (Usuarios) | Dara Van Gijsel | 01-04/03/2026 | ⏳ |
| 3.5 Integración WSO2 (Ofertas/Matching) | Dara Van Gijsel | 05-08/03/2026 | ⏳ |
| Pruebas de Integración | Todo el equipo | 09-12/03/2026 | ⏳ |
| Pruebas de Seguridad | Erick Gaona | 09-12/03/2026 | ⏳ |
| Corrección de Bugs | Todo el equipo | 13-15/03/2026 | ⏳ |

### 5.5 FASE 5: Despliegue (Marzo 2026) ⏳

| Tarea | Responsable | Fecha Planificada | Estado |
|-------|-------------|-------------------|--------|
| Configuración Cloud Run | Carlos Mejia | 16-18/03/2026 | ⏳ |
| Configuración WSO2 Producción | Dara Van Gijsel | 19-21/03/2026 | ⏳ |
| Despliegue a Staging | Todo el equipo | 22-24/03/2026 | ⏳ |
| Pruebas en Staging | Todo el equipo | 25-27/03/2026 | ⏳ |
| Go-Live Producción | Todo el equipo | 28-31/03/2026 | ⏳ |

---

## 6. Estado Actual del Proyecto

### 6.1 Resumen de Progreso (al 06/01/2026)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PROGRESO GENERAL: 35%                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Documentación          ████████████████████  100%  ✅                      │
│  Infraestructura        ██████████████░░░░░░   70%  🔄                      │
│  Auth (Registro/Login)  ████████████████░░░░   80%  🔄                      │
│  Auth (JWT/Middleware)  ██████████████████░░   90%  🔄                      │
│  Usuarios               ██░░░░░░░░░░░░░░░░░░   10%  ⏳                      │
│  Ofertas                ░░░░░░░░░░░░░░░░░░░░    0%  ⏳                      │
│  Matching               ░░░░░░░░░░░░░░░░░░░░    0%  ⏳                      │
│  WSO2 Integration       ░░░░░░░░░░░░░░░░░░░░    0%  ⏳                      │
│  Seguridad (Docs)       ████████████████████  100%  ✅                      │
│  Seguridad (Impl)       ██████░░░░░░░░░░░░░░   30%  🔄                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Estado por Módulo

| Módulo | Archivos Creados | Funcionalidad | Tests | Documentación |
|--------|------------------|---------------|-------|---------------|
| **auth** | ✅ 8 archivos | 🔄 80% | ⏳ 0% | ✅ 100% |
| **users** | 🔄 4 archivos | ⏳ 10% | ⏳ 0% | ✅ 100% |
| **offers** | ⏳ 1 archivo (placeholder) | ⏳ 0% | ⏳ 0% | ✅ 100% |
| **matching** | ⏳ 1 archivo (placeholder) | ⏳ 0% | ⏳ 0% | ✅ 100% |
| **shared** | ✅ 6 archivos | ✅ 100% | ⏳ 0% | ✅ 100% |

### 6.3 Cumplimiento de Seguridad

| Requerimiento | Estado | Responsable | Observaciones |
|---------------|--------|-------------|---------------|
| Helmet (headers) | ❌ Pendiente | Alex | No instalado |
| CORS configurado | ✅ Implementado | Carlos | Dominios configurables |
| Rate Limiting | ❌ Pendiente | Alex | No instalado |
| Validación Password | ❌ Pendiente | Alex | Sin validación de fortaleza |
| JWT Middleware | ✅ Implementado | Carlos | Funcional |
| Dockerfile no-root | ✅ Implementado | Carlos | USER nodejs |
| Firestore Rules | ⏳ Pendiente | Juan | No creadas |
| Variables de Entorno | ✅ Implementado | Carlos | .env.example existe |
| Estándares Documentados | ✅ Completado | Erick | Documento completo |

---

## 7. Historial de Versiones

### 7.1 Versiones del Frontend (Referencia)

| Versión | Fecha | Autor | Descripción |
|---------|-------|-------|-------------|
| v0.3.4 | 03/12/2025 | Carlos Mejia | Cambio de colores |
| v0.3.3 | 03/12/2025 | Sebastián Calderón | Mejoras interfaz candidato |
| v0.3.2 | 03/12/2025 | Sebastián Calderón | Mejoras interfaz candidato |
| v0.3.1 | 27/11/2025 | Sebastián Calderón | Mejoras interfaz login |
| v0.3.0 | 26/11/2025 | Sebastián Calderón | Mejoras interfaz candidato |
| v0.2.9 | 26/11/2025 | Sebastián Calderón | Mejoras interfaz empleador |

### 7.2 Versiones del Backend

| Versión | Fecha | Autor | Descripción |
|---------|-------|-------|-------------|
| v1.0.0-alpha | 05/01/2026 | Carlos Mejia | Implementación inicial backend completo |
| - | 05/01/2026 | Carlos Mejia | Configuración Dockerfile y Docker Compose |
| - | 05/01/2026 | Carlos Mejia | Configuración .gitignore y .env.example |

### 7.3 Versiones de Documentación de Seguridad

| Versión | Fecha | Autor | Descripción |
|---------|-------|-------|-------------|
| 1.0 | 04/01/2026 | Erick Gaona | Estándares de Seguridad Backend |
| 2.0 | 23/12/2025 | Erick Gaona | Sección 12 SAD - Seguridad Ampliada |
| 1.0 | 25/11/2025 | Erick Gaona | Documentos de Protección de Datos |

---

## 8. Entregables por Fase

### 8.1 Entregables Fase 1 (Completados) ✅

| # | Entregable | Ubicación | Verificado |
|---|------------|-----------|------------|
| 1 | Mapa de Capacidades | Diseño arquitectónico/1. Mapa de capacidades/ | ✅ |
| 2 | Especificaciones de Casos de Uso | Diseño arquitectónico/2. Casos de uso/ | ✅ |
| 3 | Diagrama de Clases | Diseño arquitectónico/3. Vista lógica/ | ✅ |
| 4 | Diagramas de Secuencia | Diseño arquitectónico/4. Vista de proceso/ | ✅ |
| 5 | Vista de Desarrollo | Diseño arquitectónico/5. Vista desarrollo/ | ✅ |
| 6 | Historias de Usuario | Diseño arquitectónico/5. Vista desarrollo/ | ✅ |
| 7 | Modelo de Datos | Diseño arquitectónico/7. Modelo de datos/ | ✅ |
| 8 | Política de Protección de Datos | Diseño arquitectónico/8. Protección de datos/ | ✅ |
| 9 | Términos y Condiciones | Diseño arquitectónico/8. Protección de datos/ | ✅ |
| 10 | Consentimiento Informado | Diseño arquitectónico/8. Protección de datos/ | ✅ |
| 11 | Plan de Respuesta a Incidentes | Diseño arquitectónico/8. Protección de datos/ | ✅ |

### 8.2 Entregables Fase 2 (En Progreso) 🔄

| # | Entregable | Ubicación | Estado |
|---|------------|-----------|--------|
| 1 | Proyecto Backend Node.js | cail/backend/ | ✅ |
| 2 | Dockerfile | cail/backend/Dockerfile | ✅ |
| 3 | Docker Compose | cail/backend/docker-compose.yml | ✅ |
| 4 | Módulo de Autenticación | cail/backend/src/modules/auth/ | ✅ |
| 5 | Middleware de Auth (JWT) | cail/backend/src/shared/infrastructure/middleware/ | ✅ |
| 6 | Configuración Firebase | cail/backend/src/shared/infrastructure/config/ | ✅ |
| 7 | Sección 12 Seguridad (SAD) | Diseño arquitectónico/9. Seguridad/ | ✅ |
| 8 | Estándares de Seguridad Backend | Diseño arquitectónico/9. Seguridad/ | ✅ |
| 9 | Helmet + Rate Limiting | cail/backend/src/ | ❌ Pendiente |
| 10 | Firestore Security Rules | cail/backend/ | ❌ Pendiente |

### 8.3 Entregables Fase 3 (Pendientes) ⏳

| # | Entregable | Responsable | Fecha Estimada |
|---|------------|-------------|----------------|
| 1 | Módulo Usuarios Completo | Juan + Sebastián | 31/01/2026 |
| 2 | Módulo Ofertas Completo | Erick Gaona | 14/02/2026 |
| 3 | Módulo Matching Completo | Dara Van Gijsel | 28/02/2026 |
| 4 | Validadores de Seguridad | Erick Gaona | 14/02/2026 |
| 5 | Tests Unitarios (>80%) | Todo el equipo | 28/02/2026 |

---

## 9. Riesgos y Mitigaciones

| # | Riesgo | Probabilidad | Impacto | Mitigación | Responsable |
|---|--------|--------------|---------|------------|-------------|
| R1 | Retraso en desarrollo de módulos | Media | Alto | Reuniones semanales de seguimiento | Juan (Líder) |
| R2 | Vulnerabilidades de seguridad | Media | Crítico | Revisión de código con checklist de seguridad | Erick |
| R3 | Problemas de integración con WSO2 | Alta | Alto | Pruebas tempranas con gateway mock | Carlos + Dara |
| R4 | Dependencias npm vulnerables | Alta | Medio | npm audit semanal + Dependabot | Erick |
| R5 | Problemas de rendimiento Firestore | Baja | Medio | Índices optimizados + paginación | Juan |
| R6 | Falta de documentación de APIs | Media | Medio | Swagger/OpenAPI obligatorio | Todo el equipo |

---

## 10. Criterios de Aceptación

### 10.1 Criterios Generales

| # | Criterio | Verificación |
|---|----------|--------------|
| 1 | Código compila sin errores | `npm run build` exitoso |
| 2 | Tests pasan con >80% cobertura | `npm run test:coverage` |
| 3 | Sin vulnerabilidades críticas | `npm audit` sin críticas |
| 4 | Cumple estándares de seguridad | Checklist de Erick aprobado |
| 5 | Documentación de API actualizada | Swagger disponible |
| 6 | Code review aprobado | Al menos 1 aprobación |

### 10.2 Criterios por Módulo

#### Auth
- [ ] Registro de usuarios funcional
- [ ] Login genera JWT válido
- [ ] Tokens expiran correctamente
- [ ] Rate limiting en login (5 intentos/15 min)
- [ ] Validación de password (12+ chars, mayúscula, número, símbolo)

#### Usuarios
- [ ] CRUD de cuentas funcional
- [ ] Roles implementados (Postulante, Reclutador, Admin)
- [ ] Validación de cédula ecuatoriana
- [ ] Upload de CV (solo PDF, máx 5MB)
- [ ] Privacidad de datos respetada

#### Ofertas
- [ ] CRUD de ofertas funcional
- [ ] Solo reclutadores crean ofertas
- [ ] Búsqueda con filtros
- [ ] Paginación (máx 50 por página)
- [ ] Descripción sanitizada

#### Matching
- [ ] Algoritmo de puntuación funcional
- [ ] Postulación a ofertas activas
- [ ] Límite de 10 postulaciones/día
- [ ] Evita postulaciones duplicadas

---

## 11. Plan de Pruebas

### 11.1 Tipos de Pruebas

| Tipo | Herramienta | Responsable | Cobertura Mínima |
|------|-------------|-------------|------------------|
| Unitarias | Jest | Cada desarrollador | 80% |
| Integración | Jest + Supertest | Erick | 60% |
| Seguridad | OWASP ZAP + npm audit | Erick | 100% endpoints |
| Rendimiento | k6 / Artillery | Carlos | P95 < 500ms |

### 11.2 Matriz de Pruebas de Seguridad

| Prueba | Herramienta | Frecuencia | Criterio de Aprobación |
|--------|-------------|------------|------------------------|
| Análisis Estático (SAST) | SonarQube / ESLint | Por commit | 0 issues críticos |
| Dependencias Vulnerables | npm audit | Semanal | 0 críticas/altas |
| Análisis Dinámico (DAST) | OWASP ZAP | Por release | 0 alertas altas |
| Secrets en Código | git-secrets / TruffleHog | Por commit | 0 secretos |

---

## 12. Plan de Despliegue

### 12.1 Ambientes

| Ambiente | URL | Propósito | Acceso |
|----------|-----|-----------|--------|
| Development | localhost:8080 | Desarrollo local | Desarrolladores |
| Staging | staging-api.cail.ec | Pruebas pre-producción | Equipo + QA |
| Production | api.cail.ec | Producción | Público |

### 12.2 Pipeline de Despliegue (CI/CD)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PIPELINE DE DESPLIEGUE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   COMMIT        BUILD         TEST          SECURITY       DEPLOY          │
│      │            │             │              │              │             │
│      ▼            ▼             ▼              ▼              ▼             │
│   ┌─────┐     ┌─────┐      ┌─────┐       ┌─────┐        ┌─────┐           │
│   │ git │────>│ npm │─────>│jest │──────>│audit│───────>│Cloud│           │
│   │push │     │build│      │test │       │scan │        │ Run │           │
│   └─────┘     └─────┘      └─────┘       └─────┘        └─────┘           │
│                                                                             │
│   Trigger:     tsc          >80%          0 críticas     Automático        │
│   Push/PR     compile       coverage                      (staging)        │
│                                                                             │
│                                                          Manual            │
│                                                          (production)      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 12.3 Checklist de Despliegue a Producción

- [ ] Todos los tests pasan
- [ ] npm audit sin vulnerabilidades críticas
- [ ] Code review aprobado por al menos 2 personas
- [ ] Documentación actualizada
- [ ] Variables de entorno configuradas en Cloud Run
- [ ] Backup de base de datos (si aplica)
- [ ] Plan de rollback documentado
- [ ] Monitoreo configurado (Cloud Monitoring)
- [ ] Alertas configuradas
- [ ] Aprobación del Líder Técnico

---

## Firmas de Aprobación

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|-------|
| Líder Técnico | Juan Espinosa | _________________ | ___/___/2026 |
| Arquitecto de Software | Alex Ramírez | _________________ | ___/___/2026 |
| Test & Security | Erick Gaona | _________________ | ___/___/2026 |
| Desarrollador Backend | Carlos Mejia | _________________ | ___/___/2026 |

---

*Documento generado el 06 de Enero de 2026*  
*Proyecto CAIL - Bolsa de Empleo*  
*Universidad Técnica Particular de Loja*

