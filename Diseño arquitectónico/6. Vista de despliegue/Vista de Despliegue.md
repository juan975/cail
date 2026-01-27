<p align="right">
  <img src="https://i.postimg.cc/13qQdqZs/utpllogo.png" alt="Logo UTPL" width="150"/>
</p>

<h1 align='center'>
  Vista de Despliegue
  <br>
  "Aplicación Bolsa de Empleos CAIL"
</h1>

---

## ¿Qué es un Diagrama de Despliegue?

Un **diagrama de despliegue** es un tipo de diagrama UML que modela la arquitectura física de un sistema de software. Representa la **configuración en tiempo de ejecución** desde una perspectiva estática, visualizando cómo los componentes de software se distribuyen en los nodos de hardware e infraestructura.

En el contexto de CAIL, este diagrama muestra:
- Los dispositivos cliente (móvil y web) donde se ejecutan las aplicaciones.
- La infraestructura en la nube (Google Cloud Platform).
- Los servicios de backend (Firebase) y el API Gateway (WSO2).
- Las conexiones y protocolos de comunicación entre todos los componentes.

---

## Diagrama de Despliegue (Bolsa de Empleos CAIL)

<img width="975" height="573" alt="Diagrama de Despliegue CAIL" src="https://github.com/user-attachments/assets/5858a6bc-3e86-4cb6-82ee-c6b9cd87f16f" />



---

## Descripción de los Componentes

El diagrama de despliegue de CAIL describe la arquitectura de una aplicación multiplataforma (Web y Móvil) orientada a la intermediación laboral. A continuación, se detallan los componentes y sus interacciones:

---

### 1. Dispositivos Cliente

#### 1.1 Smartphone (Aplicación Móvil)

| Aspecto | Descripción |
|---------|-------------|
| **Tipo de Nodo** | `<<device>>` Smartphone |
| **Sistema Operativo** | Android / iOS |
| **Tecnología** | React Native + Expo SDK 51 |

**Componentes internos:**

- **React Native App:**
  - Aplicación móvil desarrollada con React Native 0.74 y Expo, que permite a candidatos y reclutadores interactuar con la plataforma desde sus dispositivos móviles.
  
- **Subcomponentes:**
  - `Screens/`: Pantallas de la interfaz de usuario (Login, Registro, Perfil, Ofertas, Postulaciones).
  - `Services/`: Servicios de comunicación con el backend (`auth.service.ts`, `api.service.ts`).
  - `Components/`: Componentes reutilizables de UI.
  - `Config/`: Configuración de Firebase y endpoints.

**Almacenamiento local:**
- **Expo SecureStore:** Almacenamiento seguro de tokens JWT y credenciales.

---

#### 1.2 PC/Laptop (Aplicación Web)

| Aspecto | Descripción |
|---------|-------------|
| **Tipo de Nodo** | `<<device>>` PC / Laptop |
| **Navegador** | Chrome, Firefox, Safari, Edge |
| **Tecnología** | React 18 + Vite + TypeScript |

**Componentes internos:**

- **React Web App:**
  - Aplicación web SPA (Single Page Application) que ofrece la misma funcionalidad que la versión móvil, optimizada para pantallas de escritorio.
  
- **Subcomponentes:**
  - `Screens/`: Vistas de la aplicación web.
  - `Services/`: Capa de servicios para comunicación HTTP.
  - `Components/`: Componentes React reutilizables.
  - `Styles/`: Estilos CSS y temas visuales.

**Almacenamiento local:**
- **LocalStorage / SessionStorage:** Para datos no sensibles y preferencias.
- **Cookies HttpOnly:** Para tokens de sesión (cuando aplique).

---

### 2. WSO2 API Manager (API Gateway)

| Aspecto | Descripción |
|---------|-------------|
| **Tipo de Nodo** | `<<execution environment>>` API Gateway |
| **Puerto HTTPS** | 8243 |
| **Puerto Admin** | 9443 |
| **Versión** | WSO2 API Manager 4.x |

**Descripción:**

WSO2 API Manager actúa como el **punto único de entrada** para todas las solicitudes provenientes de las aplicaciones cliente. Funciona como intermediario entre los clientes y los microservicios, proporcionando:

**Funciones principales:**

| Función | Descripción |
|---------|-------------|
| **Enrutamiento** | Redirige las solicitudes REST al microservicio correspondiente |
| **Rate Limiting** | Control de tráfico (100 req/15min general, 10 req/15min auth) |
| **Autenticación** | Validación de tokens JWT antes de permitir acceso |
| **Throttling** | Políticas de uso por suscripción y usuario |
| **Logging** | Registro centralizado de todas las peticiones |
| **Seguridad** | Protección contra ataques comunes (DDoS, injection) |

**APIs Publicadas:**

| API | Contexto | Endpoint Backend |
|-----|----------|------------------|
| CAILUsuariosAPI | `/usuarios` | `host.docker.internal:8080` |
| CAILOfertasAPI | `/ofertas` | `host.docker.internal:8083` |
| CAILMatchingAPI | `/matching` | `host.docker.internal:8084` |

---

### 3. Google Cloud Platform (Servidor de Producción)

| Aspecto | Descripción |
|---------|-------------|
| **Tipo de Nodo** | `<<execution environment>>` Cloud Platform |
| **Región** | us-central1 |
| **Servicio** | Google Cloud Functions (2nd Gen) |

**Descripción:**

Google Cloud Platform aloja los microservicios de backend como **Cloud Functions**, proporcionando escalabilidad automática, alta disponibilidad y un modelo de pago por uso.

---

#### 3.1 Microservicio Usuarios (`usuarios-function`)

| Aspecto | Descripción |
|---------|-------------|
| **Puerto Local** | 8080 |
| **Runtime** | Node.js 18 |
| **Framework** | Express.js + TypeScript |

**Responsabilidades:**
- Gestión de autenticación (login, registro, cambio de contraseña).
- Administración de perfiles de candidatos y reclutadores.
- Validación de identidad y datos personales.
- Gestión de CV (upload, actualización, eliminación).

**Endpoints principales:**
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registro de usuarios
- `GET /users/profile` - Obtener perfil
- `PUT /users/profile` - Actualizar perfil
- `POST /users/cv` - Subir CV (PDF, máx 5MB)

---

#### 3.2 Microservicio Ofertas (`ofertas-function`)

| Aspecto | Descripción |
|---------|-------------|
| **Puerto Local** | 8083 |
| **Runtime** | Node.js 18 |
| **Framework** | Express.js + TypeScript |

**Responsabilidades:**
- CRUD de ofertas laborales.
- Publicación y gestión del ciclo de vida de vacantes.
- Filtrado y búsqueda de ofertas.
- Control de acceso basado en roles (solo RECLUTADOR puede crear/editar).

**Endpoints principales:**
- `GET /offers` - Listar ofertas (público)
- `GET /offers/:id` - Detalle de oferta (público)
- `POST /offers` - Crear oferta (protegido - RECLUTADOR)
- `PUT /offers/:id` - Actualizar oferta (protegido)
- `DELETE /offers/:id` - Eliminar oferta (protegido)

---

#### 3.3 Microservicio Matching (`matching-function`)

| Aspecto | Descripción |
|---------|-------------|
| **Puerto Local** | 8084 |
| **Runtime** | Node.js 18 |
| **Framework** | Express.js + TypeScript |

**Responsabilidades:**
- Algoritmo de emparejamiento candidato-oferta.
- Cálculo de scores de compatibilidad.
- Gestión de postulaciones.
- Notificaciones de matches relevantes.

**Algoritmo de Scoring:**
```
Score Total = (40% × Similitud Habilidades) 
            + (30% × Habilidades Obligatorias)
            + (15% × Habilidades Deseables)
            + (15% × Nivel de Experiencia)
```

**Endpoints principales:**
- `POST /matching/apply` - Postularse a oferta
- `GET /matching/my-applications` - Mis postulaciones
- `GET /matching/offer/:id/applications` - Postulantes por oferta

---

### 4. Firebase (Backend as a Service)

| Aspecto | Descripción |
|---------|-------------|
| **Tipo de Nodo** | `<<execution environment>>` BaaS |
| **Proyecto** | cail-backend-prod |
| **Región** | us-central |

**Descripción:**

Firebase proporciona servicios de backend gestionados que complementan la arquitectura de microservicios, ofreciendo autenticación, base de datos y almacenamiento.

---

#### 4.1 Firebase Authentication

| Aspecto | Descripción |
|---------|-------------|
| **Función** | Gestión de identidades y sesiones |
| **Métodos** | Email/Password |
| **Tokens** | JWT con expiración configurable |

**Características:**
- Generación y validación de tokens JWT.
- Gestión de sesiones de usuario.
- Integración con Admin SDK en el backend.
- Soporte para MFA (opcional).

---

#### 4.2 Cloud Firestore

| Aspecto | Descripción |
|---------|-------------|
| **Tipo** | Base de datos NoSQL documental |
| **Modo** | Native Mode |
| **Consistencia** | Strong consistency |

**Colecciones principales:**

| Colección | Descripción |
|-----------|-------------|
| `usuarios` | Datos de candidatos y reclutadores |
| `empresas` | Información de empresas registradas |
| `ofertas` | Vacantes laborales publicadas |
| `postulaciones` | Registros de aplicaciones a ofertas |
| `formacion` | Historial académico de candidatos |
| `experiencia` | Experiencia laboral de candidatos |

**Seguridad:**
- Firestore Security Rules para control de acceso.
- Validación de UID en cada documento.
- Cifrado AES-256 en reposo.

---

#### 4.3 Cloud Storage

| Aspecto | Descripción |
|---------|-------------|
| **Función** | Almacenamiento de archivos |
| **Bucket** | cail-backend-prod.appspot.com |

**Archivos almacenados:**
- CVs de candidatos (formato PDF, máx 5MB).
- Fotos de perfil.
- Logos de empresas.
- Documentos de verificación.

**Seguridad:**
- Validación de tipo MIME (solo PDF para CVs).
- Límite de tamaño por archivo.
- URLs firmadas con expiración.

---

## Flujo General del Sistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FLUJO DE COMUNICACIÓN                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   1. USUARIO INTERACTÚA                                                     │
│      ┌──────────────┐                                                       │
│      │  📱 Móvil    │──┐                                                    │
│      │  React Native│  │                                                    │
│      └──────────────┘  │      HTTP/HTTPS                                    │
│                        ├─────────────────────┐                              │
│      ┌──────────────┐  │                     │                              │
│      │  💻 Web      │──┘                     │                              │
│      │  React+Vite  │                        ▼                              │
│      └──────────────┘              ┌─────────────────┐                      │
│                                    │   WSO2 API      │                      │
│   2. API GATEWAY PROCESA           │   Gateway       │                      │
│      • Valida token JWT            │   :8243         │                      │
│      • Aplica rate limiting        └────────┬────────┘                      │
│      • Enruta al microservicio              │                               │
│                                             │ HTTP                          │
│                                             ▼                               │
│   3. MICROSERVICIOS EJECUTAN     ┌─────────────────────────────────────┐   │
│                                  │     GOOGLE CLOUD PLATFORM           │   │
│                                  │  ┌─────────┬─────────┬─────────┐    │   │
│                                  │  │Usuarios │ Ofertas │Matching │    │   │
│                                  │  │ :8080   │  :8083  │  :8084  │    │   │
│                                  │  └────┬────┴────┬────┴────┬────┘    │   │
│                                  └───────┼─────────┼─────────┼─────────┘   │
│                                          │         │         │              │
│   4. FIREBASE PERSISTE                   │   TCP   │         │              │
│                                          ▼         ▼         ▼              │
│                                  ┌─────────────────────────────────────┐   │
│                                  │          FIREBASE                   │   │
│                                  │  ┌──────────┬──────────┬─────────┐  │   │
│                                  │  │   Auth   │Firestore │ Storage │  │   │
│                                  │  └──────────┴──────────┴─────────┘  │   │
│                                  └─────────────────────────────────────┘   │
│                                                                             │
│   5. RESPUESTA RETORNA                                                      │
│      Firebase → Microservicio → WSO2 → Cliente                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Protocolos de Comunicación

| Conexión | Protocolo | Puerto | Descripción |
|----------|-----------|--------|-------------|
| Cliente → WSO2 | HTTPS | 8243 | Solicitudes REST cifradas con TLS 1.3 |
| WSO2 → Microservicios | HTTP | 8080, 8083, 8084 | Comunicación interna en red privada |
| Microservicios → Firebase | TCP/HTTPS | 443 | SDK de Firebase Admin |
| Microservicios → Firestore | gRPC | 443 | Conexión nativa de Firestore |

---

## Consideraciones de Seguridad en el Despliegue

| Capa | Medida de Seguridad |
|------|---------------------|
| **Perímetro** | Cloud Armor (GCP), WAF en WSO2 |
| **Gateway** | Rate limiting, validación JWT, throttling |
| **Aplicación** | Helmet (headers), bcrypt, validación de inputs |
| **Datos** | Cifrado AES-256, Firestore Rules, backups automáticos |
| **Transporte** | TLS 1.3 obligatorio, certificate pinning (móvil) |

---

## Escalabilidad y Alta Disponibilidad

| Componente | Estrategia |
|------------|------------|
| **Cloud Functions** | Escalado automático basado en demanda (0 a N instancias) |
| **Firestore** | Distribución automática, sin límite de escrituras |
| **Storage** | CDN global para entrega de archivos |
| **WSO2** | Configuración de clustering para alta disponibilidad |

---

## Ambientes de Despliegue

| Ambiente | Propósito | URL Base |
|----------|-----------|----------|
| **Desarrollo** | Pruebas locales | `http://localhost:808X` |
| **Staging** | Pruebas de integración | `https://staging-api.cail.ec` |
| **Producción** | Usuarios finales | `https://api.cail.ec` |

---

**Documento elaborado por:** Equipo CAIL  
**Fecha:** Enero 2026  
**Versión:** 1.0

