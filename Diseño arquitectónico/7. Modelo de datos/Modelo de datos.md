<p align="right">
  <img src="https://i.postimg.cc/13qQdqZs/utpllogo.png" alt="Logo UTPL" width="150"/>
</p>

# Modelo de Datos - Bolsa de Empleo CAIL

## ¿Qué es un modelo de datos?
Un modelo de datos es una representación estructurada que define cómo se organizan, almacenan y manipulan los datos dentro de un sistema o base de datos. Es un diseño conceptual y lógico que describe:

- **Entidades:** Objetos o conceptos del mundo real, como *Postulantes*, *Empresas* u *Ofertas*.
- **Atributos:** Propiedades o características de las entidades, como el *RUC* de una empresa o el *salario* de una oferta.
- **Relaciones:** Conexiones o asociaciones entre entidades, como la relación entre un *Candidato* y sus *Postulaciones*.

El propósito principal de este modelo es asegurar la **integridad**, **eficiencia** y **escalabilidad** de la información gestionada por la plataforma de empleo.

---

##  Estructura del Modelo de Datos (CAIL)
El modelo diseñado para la Bolsa de Empleo CAIL es un **modelo Relacional Normalizado**, estructurado en los siguientes elementos clave derivados del diagrama técnico:

---

## 1. Entidades Principales
Representan los actores y objetos centrales del negocio:

- **CUENTA:**  
  Entidad central de autenticación. Almacena los datos de acceso (email, password) compartidos por todos los usuarios.

- **POSTULANTE:**  
  Representa al candidato. Contiene datos personales (cédula, fecha de nacimiento) y se vincula 1:1 con CUENTA.

- **EMPRESA:**  
  Representa a la organización empleadora. Almacena RUC, razón social y estado de validación.

- **RECLUTADOR:**  
  Usuario que gestiona la empresa. Se vincula a una EMPRESA y a una CUENTA.

- **OFERTA:**  
  La vacante laboral publicada. Contiene los detalles del puesto y requisitos.

- **POSTULACION:**  
  Entidad transaccional que conecta a un POSTULANTE con una OFERTA.

---

## 2. Atributos Clave
Campos más relevantes del esquema:

- **En CUENTA:**  
  `password_hash` (seguridad), `tipo_usuario` (rol), `fecha_registro`.

- **En EMPRESA:**  
  `ruc` (identificador único), `estado_validacion`.

- **En OFERTA:**  
  `modalidad` (presencial/remoto), `rango_salarial`, `estado_oferta` (activa/cerrada).

- **En POSTULACION:**  
  `cv_adjunto_path` (ruta del archivo), `estado` (en revisión/rechazado).

---

## 3. Relaciones y Cardinalidad

### 🔹 Herencia / Especialización (1:1)
- Una **CUENTA** puede ser un **ADMINISTRADOR**, un **RECLUTADOR** o un **POSTULANTE**.

### 🔹 Gestión Corporativa (1:N)
- Una **EMPRESA** puede tener múltiples **RECLUTADORES**.
- Una **EMPRESA** publica muchas **OFERTAS**.

### 🔹 Hoja de Vida del Postulante (1:N)
- Un **POSTULANTE** tiene múltiples registros de **FORMACION**.
- Un **POSTULANTE** tiene múltiples registros de **EXPERIENCIA**.
- Un **POSTULANTE** posee múltiples **HABILIDADES** y **COMPETENCIAS**.

### 🔹 Proceso de Selección (N:M mediante POSTULACION)
- Un **POSTULANTE** puede postular a muchas **OFERTAS**.
- Una **OFERTA** puede recibir muchas **POSTULACIONES**.

---

## 📊 Diagrama Entidad-Relación (ERD)
A continuación, se presenta el modelo lógico detallado con todas las tablas, claves primarias (PK) y foráneas (FK):

<img width="1369" height="685" alt="image" src="https://github.com/user-attachments/assets/3075d9ac-ce7b-4e0d-8acf-e44b39fc857d" />

---

## 4. Modelo de Datos en Firestore (Implementación)

El modelo conceptual anterior se implementa en **Firebase Firestore** como una base de datos NoSQL orientada a documentos. A continuación se presenta el esquema de colecciones utilizado en producción:

### Diagrama de Colecciones Firestore

![Diagrama Firestore](assets/Diagrama_Firestore.png)

---

### 4.1 Colecciones Principales

#### USUARIOS
Colección central de autenticación vinculada a Firebase Auth.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `uid` | string (PK) | Firebase Auth UID - Identificador único del usuario |
| `email` | string | Correo electrónico del usuario |
| `rol` | string | Tipo de usuario: `candidato` o `empresa` |

---

#### CANDIDATOS
Perfil extendido para usuarios de tipo candidato.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string (PK) | Firestore Document ID |
| `usuario_uid` | string (FK) | Referencia a `USUARIOS.uid` |
| `ciudad` | string | Ciudad de residencia |
| `competencias` | array | Lista de competencias del candidato |
| `habilidades_tecnicas` | array | Habilidades técnicas declaradas |
| `cv_url` | string | URL del CV almacenado en Firebase Storage |
| `embedding_habilidades` | vector<768> | Vector de embeddings para matching (opcional) |
| `fecha_actualizacion` | timestamp | Última actualización del perfil |
| `fecha_sincronizacion` | timestamp | Sincronización con sistema de matching |

---

#### EMPRESAS
Perfil de organizaciones empleadoras.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string (PK) | Document ID (ej: RUC de la empresa) |
| `usuario_uid` | string (FK) | Referencia a `USUARIOS.uid` |
| `nombre_comercial` | string | Nombre comercial de la empresa |
| `razon_social` | string | Razón social legal |
| `ruc` | string | Registro Único de Contribuyentes |
| `tipo_empresa` | string | Clasificación de la empresa |
| `estado_validacion` | string | Estado de verificación |
| `contacto` | map | Datos de contacto (teléfono, dirección) |
| `created_at` | timestamp | Fecha de registro |

---

#### OFERTAS
Vacantes laborales publicadas por empresas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string (PK) | Firestore Document ID |
| `empresa_id` | string (FK) | Referencia a `EMPRESAS.id` |
| `empresa` | string | Nombre de empresa (denormalizado para consultas) |
| `ciudad` | string | Ubicación de la vacante |
| `descripcion` | string | Descripción del puesto |
| `competencias_requeridas` | array | Competencias necesarias |
| `experiencia_requerida` | string | Nivel de experiencia |
| `formacion_requerida` | string | Formación académica mínima |
| `estado` | string | `ACTIVA` o `CERRADA` |
| `createdAt` | timestamp | Fecha de creación |
| `fechaPublicacion` | timestamp | Fecha de publicación |
| `embedding_oferta` | vector<768> | Vector de embeddings para matching (opcional) |

---

#### POSTULACIONES
Entidad transaccional que conecta candidatos con ofertas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string (PK) | Firestore Document ID |
| `id_oferta` | string (FK) | Referencia a `OFERTAS.id` |
| `id_postulante` | string (FK) | Referencia a `CANDIDATOS.id` |
| `estado` | string | `PENDIENTE`, `ACEPTADO`, `RECHAZADO` |
| `fecha_postulacion` | timestamp | Fecha de postulación |
| `created_at` | timestamp | Fecha de creación del registro |

---

#### CATALOGS
Colección auxiliar para catálogos del sistema (áreas, habilidades, niveles).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string (PK) | Identificador del catálogo (ej: `areas`, `skills`, `levels`) |
| `items` | array | Lista de elementos `[{id, name}, ...]` |

---

### 4.2 Relaciones Lógicas

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    RELACIONES ENTRE COLECCIONES                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   USUARIOS ──────┬────────── 1:1 ──────────── CANDIDATOS                   │
│                  │                            (tiene_perfil)                │
│                  │                                                          │
│                  └────────── 1:1 ──────────── EMPRESAS                     │
│                                               (tiene_perfil)                │
│                                                                             │
│   EMPRESAS ─────────────── 1:N ──────────── OFERTAS                        │
│                                              (publica)                      │
│                                                                             │
│   OFERTAS ──────────────── 1:N ──────────── POSTULACIONES                  │
│                                              (recibe)                       │
│                                                                             │
│   CANDIDATOS ───────────── 1:N ──────────── POSTULACIONES                  │
│                                              (envía)                        │
│                                                                             │
│   CATALOGS ─ ─ ─ ─ ─ ─ ─  lookup ─ ─ ─ ─ ─  OFERTAS                        │
│                                              (sirve_de_catalogo)            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 4.3 Consideraciones de Diseño NoSQL

| Aspecto | Decisión | Justificación |
|---------|----------|---------------|
| **Denormalización** | Campo `empresa` duplicado en OFERTAS | Evita joins costosos en consultas frecuentes |
| **Embeddings** | Campos `vector<768>` opcionales | Soporte para matching semántico con IA |
| **Referencias** | Foreign Keys como strings | Firestore no soporta FK nativas, se validan en código |
| **Catálogos** | Colección separada | Centraliza valores válidos para dropdowns y validaciones |
| **Timestamps** | Campos de auditoría | Trazabilidad de creación y actualización |

---

### 4.4 Índices Recomendados

Para optimizar las consultas más frecuentes:

```javascript
// Ofertas activas por ciudad
ofertas: { ciudad: ASC, estado: ASC, fechaPublicacion: DESC }

// Postulaciones por candidato
postulaciones: { id_postulante: ASC, fecha_postulacion: DESC }

// Postulaciones por oferta
postulaciones: { id_oferta: ASC, estado: ASC }

// Candidatos por ciudad
candidatos: { ciudad: ASC, fecha_actualizacion: DESC }
```

---

*Modelo de datos actualizado - Febrero 2026*


