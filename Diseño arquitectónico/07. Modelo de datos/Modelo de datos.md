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



