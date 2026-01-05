
---

# Guía Completa de Configuración - CAIL Backend

**Fecha**: Enero 2026

**Versión**: 1.0

---

## Tabla de Contenido

1. [Requisitos Previos](https://www.google.com/search?q=%231-requisitos-previos)
2. [Instalación de Herramientas](https://www.google.com/search?q=%232-instalaci%C3%B3n-de-herramientas)
3. [Clonar el Repositorio](https://www.google.com/search?q=%233-clonar-el-repositorio)
4. [Configuración del Entorno](https://www.google.com/search?q=%234-configuraci%C3%B3n-del-entorno)
5. [Ejecutar el Backend](https://www.google.com/search?q=%235-ejecutar-el-backend)
6. [Probar con Postman](https://www.google.com/search?q=%236-probar-con-postman)
7. [Crear tu Módulo](https://www.google.com/search?q=%237-crear-tu-m%C3%B3dulo)
8. [Workflow con Git](https://www.google.com/search?q=%238-workflow-con-git)
9. [Docker (Opcional)](https://www.google.com/search?q=%239-docker-opcional)
10. [Solución de Problemas](https://www.google.com/search?q=%2310-soluci%C3%B3n-de-problemas)

---

## 1. Requisitos Previos

Antes de empezar, tener:

* Una cuenta de GitHub
* Conexión a Internet
* Windows 10/11, macOS, o Linux
* Al menos 5GB de espacio en disco
* Permisos de administrador en tu PC

---

## 2. Instalación de Herramientas

### 2.1 Instalar Node.js (OBLIGATORIO)

**Windows / macOS:**

1. Ve a: [https://nodejs.org/](https://nodejs.org/)
2. Descarga la versión **LTS** (20.x.x)
3. Ejecuta el instalador
4. Acepta todas las opciones por defecto
5. Reinicia tu terminal/PowerShell

**Verificar instalación:**

```bash
node --version # Debe mostrar: v20.x.x
npm --version  # Debe mostrar: v10.x.x

```

*Si no muestra las versiones, reinicia tu PC.*

### 2.2 Instalar Git (OBLIGATORIO)

**Windows:**

1. Ve a: [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Descarga e instala aceptando todas las opciones por defecto.

**macOS:**

```bash
# Instalar Homebrew primero (si no lo tienes)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar Git
brew install git

```

**Verificar instalación:**

```bash
git --version # Debe mostrar: git version 2.x.x

```

### 2.4 Instalar Postman (para probar APIS)

1. Ve a: [https://www.postman.com/downloads/](https://www.postman.com/downloads/)
2. Crea una cuenta gratuita.

### 2.5 Instalar Docker Desktop (para probar contenerizacion)

1. Ve a: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. Descarga, instala y reinicia tu PC.
3. **Verificar:**

```bash
docker --version # Debe mostrar: Docker version 24.x.x

```

---

## 3. Clonar el Repositorio


### 3.2 Clonar el proyecto

**Opción 1: Con HTTPS (Recomendado)**

```bash
# Navega a donde quieres guardar el proyecto
cd C:\Users\TU-USUARIO\Desktop        # Windows
cd ~/Desktop                           # macOS/Linux

# Clona el repositorio
git clone https://github.com/juan975/cail.git

# Entra a la carpeta del backend
cd cail/backend

```

**Opción 2: Con SSH**

```bash
git clone git@github.com:juan975/cail.git
cd cail/backend

```

---

## 4. Configuración del Entorno

### 4.1 Instalar dependencias

```bash
# Asegúrate de estar en la carpeta backend
npm install

```

### 4.2 Crear archivo .env (copiar y pegar lo que mande al whatsapp)


```bash
# Copia el archivo de ejemplo
copy .env.example .env        # Windows PowerShell
cp .env.example .env          # macOS / Linux / Git Bash

```

Abre el archivo `.env` y pega el contenido (reemplaza los valores):

```text
NODE_ENV=development
PORT=8080
FIREBASE_PROJECT_ID=cail-backend-prod
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_CLAVE_PRIVADA_AQUI\n-----END PRIVATE KEY-----\n"
JWT_SECRET=...
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=http://localhost:8081,http://localhost:19006,http://localhost:3000

```

### 4.3 Agregar Service Account Key de Firebase

1. Descarga el archivo `serviceAccountKey.json` compartido (tambien por whastapp).
2. Colócalo en la raíz de la carpeta `backend/`.

**Estructura esperada:**

```text
backend/
├── .env
├── serviceAccountKey.json
├── node_modules/
└── src/

```

### 4.4 Verificar configuración

```bash
# Windows
dir
# macOS/Linux
ls -la

```

---

## 5. Ejecutar el Backend

### 5.1 Modo Desarrollo

```bash
npm run dev

```

**Éxito:** Si ves `Server running on port 8080` y `Health check: http://localhost:8080/health`.

### 5.2 Probar en el navegador

Visita: `http://localhost:8080/health`
Deberías recibir un JSON con `"status": "healthy"`.

---

## 6. Probar con Postman

### 6.1 Importar colección

1. Abre Postman > **Import**.
2. Selecciona: `backend/postman/CAIL_Backend.postman_collection.json`.

### 6.2 Pruebas básicas

* **Test 1:** `GET /health` (200 OK).
* **Test 2 (Registro):** `POST /api/v1/auth/register` con JSON de usuario.
* **Test 3 (Login):** `POST /api/v1/auth/login`. **Copia el Token**.
* **Test 4 (Perfil):** `GET /api/v1/users/profile` usando el Bearer Token.

---

## 7. Crear tu Módulo

### 7.1 Estructura del Proyecto

```text
src/
├── shared/             # Infraestructura y utilidades comunes
└── modules/            # Módulos de negocio (auth, users, offers, matching)

```

### 7.3 Crear estructura (Ejemplo Módulo Ofertas)

**Bash:**

```bash
mkdir -p src/modules/offers/{domain/{entities,repositories},application/{use-cases,dtos},infrastructure/{repositories,controllers,routes}}

```

### 7.4 Plantillas de Código

*(Utiliza las plantillas de Entity, Repository, Use Case, Controller y Routes proporcionadas en el documento original para mantener el estándar de Clean Architecture).*

---

## 8. Workflow con Git

### 8.1 Actualizar rama local

```bash
git checkout main
git pull origin main

```

### 8.3 Commits (Convención)

* `feat:` Nuevas funcionalidades.
* `fix:` Corrección de errores.
* `docs:` Cambios en documentación.

---

## 9. Docker (Opcional)

```bash
# Construir
docker build -t cail-backend:v1.0 .
# Correr
docker run -d -p 8080:8080 --name cail-backend --env-file .env cail-backend:v1.0

```

---

## 10. Algunos posibles problemas

* **Puerto ocupado:** Cambia `PORT` en `.env` o mata el proceso en el 8080.
* **Firebase Error:** Verifica la existencia de `serviceAccountKey.json`.
* **Missing Module:** Borra `node_modules` y ejecuta `npm install`.

---

### Checklist Final

* [ ] Node.js v20+ instalado.
* [ ] `.env` y `serviceAccountKey.json` presentes.
* [ ] `npm run dev` sin errores.
* [ ] Health check responde correctamente.


# Gracias :)