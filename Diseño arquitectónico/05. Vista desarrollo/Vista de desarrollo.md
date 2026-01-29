<p align='center'>
  <img src='https://github.com/user-attachments/assets/899a06d7-01dd-4f33-b0cf-48b36b632b6f' height="150">
</p>

<h1 align='center'>
  Vista de Implementación
  <br>
  "Aplicación Bolsa de Empleos CAIL"
</h1>

---

## ¿Qué es CI/CD?

**CI/CD** es un acrónimo que engloba las prácticas de Integración Continua y Entrega/Despliegue Continuo. Estas metodologías, basadas en la automatización, buscan optimizar los procesos de desarrollo de software a través de la integración frecuente de cambios de código, la automatización de pruebas y la implementación automatizada de aplicaciones.

**Integración Continua (CI):** Consiste en la fusión frecuente de los cambios de código de múltiples desarrolladores en un repositorio compartido. Cada integración se verifica mediante una compilación automática y pruebas unitarias, lo que permite detectar y solucionar errores de manera temprana en el ciclo de desarrollo.

**Entrega/Despliegue Continuo (CD):** Amplía la CI al automatizar el proceso de entrega de software a un entorno de producción o preproducción. Los cambios de código que han superado las pruebas de CI se despliegan de forma automática, lo que reduce el tiempo de salida al mercado y mejora la calidad del software.

---

## ¿Qué es DevOps?

DevOps es una metodología de desarrollo de software que busca acortar el ciclo de vida del desarrollo de sistemas y proporcionar una entrega continua de alta calidad. A través de la automatización de procesos, la colaboración entre equipos de desarrollo y operaciones, y la adopción de una cultura de mejora continua, DevOps permite a las organizaciones responder más rápidamente a las necesidades del mercado y entregar productos de software de mayor calidad.

**Características clave de DevOps:**

- **Colaboración entre equipos:** DevOps fomenta una cultura de colaboración entre los equipos de desarrollo y operaciones, rompiendo los silos tradicionales y promoviendo una visión compartida.
- **Automatización:** La automatización de tareas repetitivas, como la integración continua, las pruebas automatizadas y el despliegue, reduce el riesgo de errores humanos y acelera los procesos.
- **Entrega continua:** DevOps busca entregar software de forma continua y frecuente, lo que permite obtener feedback más rápido de los usuarios y realizar ajustes de manera ágil.
- **Mejora continua:** DevOps es un proceso iterativo que se basa en la mejora continua. Los equipos utilizan métricas y datos para identificar áreas de mejora y realizar ajustes en sus procesos.
- **Cultura de la fiabilidad:** DevOps pone énfasis en la fiabilidad del software, asegurando que las aplicaciones funcionen de manera correcta y estén disponibles en todo momento.

---

## Flujo DevOps para el Proyecto CAIL

<img width="1899" height="1400" alt="Pipeline DevOps CAIL" src="https://github.com/user-attachments/assets/4800feb0-fb71-4e42-adac-4ead76b2452b" />

### Descripción del Pipeline

| **Fase** | **Herramienta** | **Descripción** |
|----------|-----------------|-----------------|
| **Plan** | **Jira, Discord, GitHub Projects** | Jira se utiliza para gestionar las historias de usuario, sprints y backlog del proyecto. Discord facilita la comunicación instantánea entre los miembros del equipo. GitHub Projects vincula el progreso de las tareas directamente con el código fuente. |
| **Code** | **Node.js, TypeScript, React Native, GitHub** | Node.js y TypeScript se usan para programar el backend (microservicios). React Native permite desarrollar las aplicaciones móvil y web con código compartido. GitHub es el repositorio central y única fuente de verdad para todo el código. |
| **Build** | **Docker, Vite, Metro** | Docker crea contenedores del backend, encapsulando todas las dependencias y asegurando portabilidad. Vite compila la aplicación web. Metro bundlea la aplicación móvil React Native. |
| **Test** | **Jest, GitHub Actions, SonarCloud** | Jest ejecuta pruebas unitarias y de integración en backend y frontend. GitHub Actions orquesta la ejecución automática de pruebas en cada push. SonarCloud realiza análisis estático de código para detectar vulnerabilidades. |
| **Release** | **GitHub Actions, Fastlane** | GitHub Actions automatiza la creación de releases y artefactos (imágenes Docker, APK/IPA). Fastlane automatiza la firma y preparación de apps móviles para publicación en tiendas. |
| **Deploy** | **Google Cloud Functions, Firebase Hosting, Google Play** | Google Cloud Functions ejecuta los microservicios en la nube con escalado automático. Firebase Hosting despliega la aplicación web con CDN global. Google Play publica la aplicación móvil Android. |
| **Operate** | **Firebase (Auth, Firestore, Storage), WSO2** | Firebase proporciona autenticación, base de datos NoSQL y almacenamiento de archivos. WSO2 API Manager gestiona las APIs del proyecto, aplicando rate limiting, autenticación y logging centralizado. |
| **Monitor** | **Sentry, Firebase Analytics, Cloud Logging** | Sentry detecta y reporta errores en tiempo real. Firebase Analytics proporciona métricas de uso. Cloud Logging centraliza los logs de los microservicios para debugging y auditoría. |

---

## Stack Tecnológico

### Backend

| Tecnología | Rol en el Proyecto | Justificación Técnica |
|:---|:---|:---|
| **Node.js 18** | Entorno de Ejecución | Modelo de I/O no bloqueante, ideal para múltiples conexiones concurrentes. Ecosistema NPM vasto e integración perfecta con Firebase. |
| **TypeScript 5** | Lenguaje de Programación | Tipado estático que reduce errores en tiempo de ejecución, mejora legibilidad y facilita mantenibilidad a largo plazo. |
| **Express.js** | Framework Web | Framework minimalista y flexible para construir APIs REST. Gran ecosistema de middleware para seguridad y validación. |
| **Firebase Admin SDK** | Backend Services | Integración nativa con Authentication, Firestore y Storage. Permite lógica de negocio segura directamente en la nube. |
| **Docker** | Contenerización | Crea entornos de ejecución inmutables y reproducibles. Facilita el desarrollo local y despliegue en producción. |
| **JWT** | Autenticación | Tokens generados por Firebase Auth para proteger la API. Verificación en cada petición para autorizar acceso a recursos. |

### Frontend

| Tecnología | Rol en el Proyecto | Justificación Técnica |
|:---|:---|:---|
| **React Native 0.74** | Framework Principal | Código único para iOS, Android y Web. Maximiza reutilización de componentes y lógica de negocio. |
| **Expo SDK 51** | Plataforma de Desarrollo | Abstrae complejidad del desarrollo nativo. APIs consistentes, actualizaciones OTA y acceso a funcionalidades nativas. |
| **React 18** | Framework Web | Componentes declarativos, Virtual DOM eficiente y ecosistema maduro para aplicaciones SPA. |
| **Vite** | Build Tool (Web) | Compilación ultrarrápida con HMR. Optimización automática para producción. |
| **TypeScript 5** | Lenguaje | Tipado estático compartido con backend. IntelliSense mejorado y detección temprana de errores. |

---

## Estructura de Componentes de Desarrollo

La arquitectura de CAIL sigue un patrón de **microservicios** organizados por dominio de negocio, con separación clara entre las capas de presentación (frontend) y lógica de negocio (backend).

### Estructura Detallada del Repositorio

```
cail/
├── 📁 cail/                          # Código fuente principal
│   ├── 📁 functions/                 # Microservicios (Cloud Functions)
│   │   ├── 📁 usuarios/              # Microservicio de Usuarios
│   │   │   ├── 📁 src/
│   │   │   │   ├── 📁 auth/          # Módulo de autenticación
│   │   │   │   │   ├── application/  # Casos de uso, DTOs
│   │   │   │   │   └── infrastructure/ # Controllers, Routes
│   │   │   │   ├── 📁 users/         # Módulo de usuarios
│   │   │   │   ├── 📁 shared/        # Middleware, utilidades
│   │   │   │   └── index.ts          # Entry point
│   │   │   ├── 📁 tests/             # Tests unitarios y de integración
│   │   │   ├── Dockerfile
│   │   │   └── package.json
│   │   │
│   │   ├── 📁 ofertas/               # Microservicio de Ofertas
│   │   │   ├── 📁 src/
│   │   │   │   ├── 📁 offers/        # CRUD de ofertas
│   │   │   │   ├── 📁 shared/
│   │   │   │   └── index.ts
│   │   │   ├── 📁 tests/
│   │   │   └── package.json
│   │   │
│   │   └── 📁 matching/              # Microservicio de Matching
│   │       ├── 📁 src/
│   │       │   ├── 📁 matching/      # Algoritmo de emparejamiento
│   │       │   ├── 📁 shared/
│   │       │   └── index.ts
│   │       ├── 📁 tests/
│   │       └── package.json
│   │
│   ├── 📁 src/                       # Aplicación Móvil (React Native)
│   │   ├── 📁 screens/               # Pantallas de la app
│   │   ├── 📁 components/            # Componentes reutilizables
│   │   ├── 📁 services/              # Servicios de API
│   │   └── 📁 config/                # Configuración Firebase
│   │
│   ├── 📁 web/                       # Aplicación Web (React + Vite)
│   │   ├── 📁 src/
│   │   │   ├── 📁 screens/           # Vistas web
│   │   │   ├── 📁 components/        # Componentes UI
│   │   │   └── 📁 services/          # Servicios de API
│   │   └── vite.config.ts
│   │
│   ├── 📁 infrastructure/            # Docker Compose, WSO2
│   │   └── docker-compose.yml
│   │
│   └── 📁 wso2/api-definitions/      # Definiciones de APIs
│       ├── usuarios-api.yaml
│       ├── ofertas-api.yaml
│       └── matching-api.yaml
│
├── 📁 Diseño arquitectónico/         # Documentación SAD
│
├── firebase.json                     # Configuración Firebase
├── firestore.rules                   # Reglas de seguridad Firestore
└── sonar-project.properties          # Configuración SonarCloud
```

### Organización por Capas (Clean Architecture)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ARQUITECTURA POR CAPAS                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                      INFRASTRUCTURE LAYER                           │   │
│   │   Controllers, Routes, Middleware, External Services                │   │
│   │   (Express, Firebase SDK, WSO2)                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                       APPLICATION LAYER                             │   │
│   │   Use Cases, DTOs, Application Services                             │   │
│   │   (RegisterUser, CreateOffer, ApplyToOffer)                         │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                         DOMAIN LAYER                                │   │
│   │   Entities, Value Objects, Domain Services                          │   │
│   │   (User, Offer, Application, Email, Password)                       │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DIAGRAMA DE COMPONENTES - CAIL                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                        CAPA DE PRESENTACIÓN                         │   │
│   │   ┌─────────────────────┐       ┌─────────────────────┐             │   │
│   │   │    📱 Mobile App    |       │     💻 Web App     │             │   │
│   │   │   (React Native)    │       │   (React + Vite)    │             │   │
│   │   └──────────┬──────────┘       └──────────┬──────────┘             │   │
│   └──────────────┼─────────────────────────────┼────────────────────────┘   │
│                  └──────────────┬──────────────┘                            │
│                                 │ HTTP/HTTPS                                │
│   ┌─────────────────────────────▼───────────────────────────────────────┐   │
│   │                     WSO2 API GATEWAY                                │   │
│   │         Rate Limiting │ JWT Validation │ Logging                    │   │
│   └─────────────────────────────┬───────────────────────────────────────┘   │
│                                 │                                           │
│   ┌─────────────────────────────▼───────────────────────────────────────┐   │
│   │                    GOOGLE CLOUD FUNCTIONS                           │   │
│   │   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐         │   │
│   │   │   Usuarios    │   │    Ofertas    │   │   Matching    │         │   │
│   │   │   Function    │   │   Function    │   │   Function    │         │   │
│   │   └───────┬───────┘   └───────┬───────┘   └───────┬───────┘         │   │
│   └───────────┼───────────────────┼───────────────────┼─────────────────┘   │
│               └───────────────────┼───────────────────┘                     │
│                                   │                                         │
│   ┌───────────────────────────────▼─────────────────────────────────────┐   │
│   │                          FIREBASE                                   │   │
│   │   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐         │   │
│   │   │     Auth      │   │   Firestore   │   │    Storage    │         │   │
│   │   └───────────────┘   └───────────────┘   └───────────────┘         │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Cronograma de Desarrollo

<h3>Backend</h3>

**1. Requerimientos y Diseño**
- Análisis de requisitos: Identificar funcionalidades del sistema (autenticación, ofertas, matching).
- Diseño de arquitectura: Definir estructura de microservicios (usuarios, ofertas, matching).
- Definición de modelos de datos: Diseñar colecciones Firestore y relaciones.
- Definición de API: Crear contratos de endpoints (OpenAPI/Swagger).

**2. Configuración Inicial**
- Configuración del entorno de desarrollo (VS Code, Node.js, TypeScript).
- Creación de repositorios y pipelines CI/CD (GitHub Actions).
- Configuración de Google Cloud Functions.
- Configuración de Firebase (Auth, Firestore, Storage).

**3. Desarrollo**
- Implementación de modelos y esquemas de base de datos.
- Desarrollo de endpoints:
  - Autenticación y autorización (registro, login, cambio de contraseña).
  - CRUD de usuarios y perfiles.
  - CRUD de ofertas laborales.
  - Algoritmo de matching candidato-oferta.
- Implementación de middleware de seguridad (Helmet, Rate Limiting).
- Manejo de errores y validación de datos.

**4. Pruebas y Validación**
- Creación de pruebas unitarias con Jest.
- Pruebas de integración con Supertest.
- Pruebas de seguridad (OWASP, inyección, XSS).
- Análisis estático con SonarCloud.

**5. Implementación y Despliegue**
- Preparación de la base de datos de producción.
- Despliegue en Google Cloud Functions.
- Configuración de WSO2 API Gateway.
- Configuración de monitoreo y logs.

---

<h3>Frontend</h3>

**1. Requerimientos y Diseño**
- Análisis de requisitos: Definir experiencia de usuario (UX) para candidatos y reclutadores.
- Wireframes y prototipos: Crear bocetos en Figma.
- Definición de arquitectura: Estructura de componentes, navegación y estados.

**2. Configuración Inicial**
- Configuración del entorno (Expo, React Native, Vite).
- Instalación de dependencias y configuración de herramientas.
- Configuración del diseño base y tema visual.

**3. Desarrollo**
- Creación de componentes base (botones, inputs, cards).
- Implementación de navegación y rutas.
- Integración con APIs del backend.
- Desarrollo de pantallas:
  - Autenticación (Login, Registro Candidato, Registro Empleador).
  - Perfil de usuario y gestión de CV.
  - Catálogo y detalle de ofertas.
  - Postulaciones y seguimiento.
- Estilizado y responsividad.

**4. Pruebas y Validación**
- Pruebas de componentes.
- Pruebas funcionales de flujos críticos.
- Validación de diseño responsivo.
- Pruebas de rendimiento.

**5. Implementación y Despliegue**
- Build de producción.
- Despliegue web en Firebase Hosting.
- Publicación en Google Play Store.
- Configuración de monitoreo con Firebase Analytics.

---

<h3>Actividades Entregables</h3>

**Backend**

| # | Actividad | Fecha Inicio | Fecha Fin | Responsable |
|---|-----------|--------------|-----------|-------------|
| 1 | Diseñar modelos de datos y endpoints | 15/11/2025 | 22/11/2025 | Juan Espinosa |
| 2 | Implementar microservicio de usuarios (auth, profile) | 25/11/2025 | 06/12/2025 | Carlos Mejía |
| 3 | Implementar microservicio de ofertas (CRUD) | 09/12/2025 | 20/12/2025 | Carlos Mejía |
| 4 | Implementar microservicio de matching | 06/01/2026 | 17/01/2026 | Juan Espinosa |
| 5 | Implementar seguridad (Helmet, Rate Limiting, JWT) | 13/01/2026 | 17/01/2026 | Erick Gaona |
| 6 | Pruebas de seguridad y análisis SonarCloud | 13/01/2026 | 20/01/2026 | Erick Gaona |
| 7 | Desplegar WSO2 API Gateway | 13/01/2026 | 14/01/2026 | Erick Gaona |

**Frontend**

| # | Actividad | Fecha Inicio | Fecha Fin | Responsable |
|---|-----------|--------------|-----------|-------------|
| 1 | Crear wireframes y prototipos UI/UX | 15/11/2025 | 22/11/2025 | Dara Van Gijsel |
| 2 | Implementar componentes base y tema visual | 25/11/2025 | 29/11/2025 | Sebastián Calderón |
| 3 | Desarrollar pantallas de autenticación | 02/12/2025 | 13/12/2025 | Sebastián Calderón |
| 4 | Desarrollar pantallas de candidato (perfil, ofertas) | 16/12/2025 | 10/01/2026 | Sebastián Calderón |
| 5 | Desarrollar pantallas de reclutador (ofertas, postulantes) | 06/01/2026 | 17/01/2026 | Sebastián Calderón |
| 6 | Integrar APIs y validar flujos completos | 13/01/2026 | 20/01/2026 | Sebastián Calderón |
| 7 | Pruebas funcionales y corrección de bugs | 20/01/2026 | 24/01/2026 | Equipo completo |

---


