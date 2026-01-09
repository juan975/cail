# CAIL - Microservicios

Arquitectura de microservicios para el Sistema de Reclutamiento CAIL.

## Estructura del Proyecto

```
cail/
├── backend/                   # Monolito original (deprecated)
├── functions/                 # Microservicios (Cloud Functions)
│   ├── usuarios/             # Auth + Profiles (puerto 8082)
│   ├── ofertas/              # Ofertas laborales (puerto 8083)
│   └── matching/             # Matching candidato-oferta (puerto 8084)
├── shared/
│   └── cail-common/          # Librería compartida
├── infrastructure/
│   ├── docker-compose.yml    # Orquestación local con WSO2
│   └── wso2/                 # Configuración WSO2 API Manager
└── wso2/
    └── api-definitions/      # OpenAPI specs para WSO2
```

## Requisitos

- Node.js 20+
- Docker y Docker Compose
- Cuenta de Google Cloud (para deploy)
- Credenciales de Firebase

## Inicio Rápido

### 1. Configurar variables de entorno

```bash
cd infrastructure
cp .env.example .env
# Editar .env con tus credenciales de Firebase
```

### 2. Instalar dependencias

```bash
# Librería compartida
cd shared/cail-common
npm install
npm run build

# Funciones
cd ../../functions/usuarios && npm install
cd ../ofertas && npm install
cd ../matching && npm install
```

### 3. Ejecutar en desarrollo

**Opción A: Cada función por separado**

```bash
# Terminal 1
cd functions/usuarios
npm run dev

# Terminal 2
cd functions/ofertas
npm run dev

# Terminal 3
cd functions/matching
npm run dev
```

**Opción B: Con Docker Compose (incluye WSO2)**

```bash
cd infrastructure
docker-compose up
```

### 4. Verificar servicios

```bash
curl http://localhost:8082/health  # Usuarios
curl http://localhost:8083/health  # Ofertas
curl http://localhost:8084/health  # Matching
```

## Endpoints

### Usuarios (Puerto 8082)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/register` | Registro de usuario |
| POST | `/auth/login` | Login |
| POST | `/auth/change-password` | Cambiar contraseña |
| GET | `/users/profile` | Obtener perfil |
| PUT | `/users/profile` | Actualizar perfil |

### Ofertas (Puerto 8083)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/offers` | Listar ofertas |
| GET | `/offers/:id` | Obtener oferta |
| POST | `/offers` | Crear oferta |
| PUT | `/offers/:id` | Actualizar oferta |
| DELETE | `/offers/:id` | Eliminar oferta |

### Matching (Puerto 8084)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/matching/oferta/:id` | Candidatos rankeados |
| POST | `/matching/apply` | Aplicar a oferta |
| GET | `/matching/applications` | Mis aplicaciones |

## Despliegue a Google Cloud Functions

```bash
# Desde cada carpeta de función
cd functions/usuarios
npm run deploy

cd ../ofertas
npm run deploy

cd ../matching
npm run deploy
```

## Arquitectura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   App Móvil     │────▶│  WSO2 Gateway   │────▶│ Cloud Functions │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │    Firestore    │
                                                │   (3 esquemas)  │
                                                └─────────────────┘
```

## Licencia

MIT
