# CAIL Backend - Clean Architecture + Serverless

Backend del **Sistema de Reclutamiento CAIL** construido siguiendo los principios de Clean Architecture para garantizar un código escalable, mantenible y testeable.

## Stack Tecnológico

| Componente | Tecnología |
| :--- | :--- |
| **Runtime** | Node.js 20 |
| **Lenguaje** | TypeScript 5.3.3 |
| **Framework** | Express.js |
| **Base de Datos** | Firebase Firestore |
| **Autenticación** | Firebase Auth + JWT |
| **Arquitectura** | Clean Architecture (3 capas) |
| **Despliegue** | Google Cloud Run (Docker) |

---

## Estructura del Proyecto

La estructura sigue un diseño modular basado en dominios, separando las reglas de negocio de los detalles de infraestructura.

```text
backend/
├── src/
│   ├── shared/                   # Código compartido entre módulos
│   │   ├── domain/               # Entidades y Value Objects base
│   │   │   ├── entities/
│   │   │   └── value-objects/    # Ej: Email, UserId
│   │   └── infrastructure/
│   │       ├── config/           # Configuración (Firebase, Env)
│   │       ├── middleware/       # Middleware (Auth, Error Handling)
│   │       └── utils/            # Utilidades (JWT, Response formatters)
│   │
│   ├── modules/                  # Módulos de lógica de negocio
│   │   ├── auth/                 # Módulo de Autenticación
│   │   │   ├── domain/           # Reglas de negocio y contratos
│   │   │   │   ├── entities/     # Account
│   │   │   │   └── repositories/ # Interfaces (IAccountRepository)
│   │   │   ├── application/      # Casos de uso
│   │   │   │   ├── use-cases/    # RegisterUser, LoginUser
│   │   │   │   └── dtos/         # Data Transfer Objects
│   │   │   └── infrastructure/   # Implementaciones técnicas
│   │   │       ├── repositories/ # FirestoreAccountRepository
│   │   │       ├── controllers/  # AuthController
│   │   │       └── routes/       # Definición de rutas Express
│   │   │
│   │   ├── users/                # Gestión de Usuarios y Perfiles
│   │   ├── offers/               # Gestión de Ofertas laborales
│   │   └── matching/             # Algoritmos de Postulación y Matching
│   │
│   └── index.ts                  # Punto de entrada de la aplicación
│
├── .env                          # Variables de entorno (Local)
├── .env.example                  # Plantilla de variables de entorno
├── serviceAccountKey.json        # Credenciales de Firebase (Privado)
├── Dockerfile                    # Configuración de imagen Docker
├── package.json                  # Dependencias y scripts
└── tsconfig.json                 # Configuración de TypeScript
```


---

## Instalación y Configuración

### 1. Requisitos Previos

- Node.js 20+
- npm 10+
- Git
- Cuenta de Firebase

### 2. Clonar el Repositorio

```bash
git clone https://github.com/juan975/cail.git
cd cail/backend
