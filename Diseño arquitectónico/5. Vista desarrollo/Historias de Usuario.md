<p align='center'>
  <img src='https://github.com/user-attachments/assets/899a06d7-01dd-4f33-b0cf-48b36b632b6f' height="150">
</p>

<h1 align='center'>Historias Épicas y de Usuario</h1>


### ¿Qué es una Historia de Usuario?

Una **Historia de Usuario** es una descripción corta y simple de una funcionalidad del sistema vista desde la perspectiva del usuario final o de un actor relevante. No es una especificación técnica detallada, sino un recordatorio de una conversación que debe ocurrir entre los miembros del equipo.

La forma clásica de una historia de usuario es:

> **Como** [tipo de usuario]
> **quiero** [objetivo o acción]
> **para** [beneficio o valor que obtiene].

Este formato permite centrar el desarrollo en el **valor entregado al usuario**, más que en la solución técnica.

---

### ¿Qué es una Épica?

Una **Épica** es una historia de usuario de gran tamaño que representa un **objetivo de alto nivel** del sistema y que no puede ser implementada en un solo sprint. Por esta razón, una épica se descompone en múltiples historias de usuario más pequeñas, manejables y estimables.

En el contexto de CAIL, las épicas suelen corresponder a:

* Módulos funcionales completos (Gestión de Perfiles, Gestión de Ofertas, Postulaciones, Matching, etc.).
* Capacidades clave del negocio (registro de empresas, validación de candidatos, publicación de ofertas).

---

### Relación entre Casos de Uso, Épicas e Historias de Usuario

Existe una relación directa entre los artefactos UML definidos y las historias ágiles:

* **Caso de Uso:** Describe *qué* hace el sistema desde un punto de vista funcional.
* **Épica:** Agrupa uno o varios casos de uso relacionados bajo un objetivo común.
* **Historia de Usuario:** Detalla una interacción específica del actor con el sistema, derivada de un caso de uso.

De esta forma:

* Un **diagrama de casos de uso** puede dar origen a una o varias **épicas**.
* Cada **épica** se descompone en **historias de usuario**.

Esto garantiza consistencia entre análisis, diseño y desarrollo.

---

### Criterios de Aceptación

Cada historia de usuario debe incluir **criterios de aceptación**, los cuales definen las condiciones mínimas que deben cumplirse para considerar la historia como completada.

Los criterios de aceptación:

* Son claros, medibles y verificables.
* Sirven como base para las **pruebas funcionales y automatizadas** dentro del pipeline CI.
* Reducen ambigüedades entre desarrollo, QA y stakeholders.

Ejemplo:

* *Dado* que el usuario está autenticado,
* *Cuando* ingresa sus datos correctamente,
* *Entonces* el sistema guarda la información y muestra un mensaje de confirmación.

---

### Estructura Estándar de una Historia de Usuario

Cada historia de usuario en este documento seguirá la siguiente estructura:

* **ID**
* **Nombre**
* **Épica Asociada**
* **Descripción (Como / Quiero / Para)**
* **Criterios de Aceptación**
* **Prioridad**
* **Dependencias (si aplica)**

---

A continuación, se presentan las **Épicas del proyecto CAIL**, junto con sus respectivas historias de usuario, organizadas por módulos funcionales.

## ÉPICA HE-01 — Gestión de Empresas

**Descripción de la Épica:**
Esta épica cubre todo el ciclo de vida de las **empresas dentro de la plataforma CAIL**, desde su registro inicial hasta su validación y administración. Permite garantizar que solo empresas legítimas y aprobadas puedan publicar ofertas laborales, asegurando la confiabilidad de la bolsa de empleo.

**Actores principales:** Empresa, Gerente

---

### HU-01 — Registrar Empresa

* **Épica Asociada:** HE-01 — Gestión de Empresas
* **Actor:** Empresa

**Descripción:**
**Como** representante de una empresa,
**quiero** registrar los datos básicos de mi empresa (RUC, nombre, dirección y correo electrónico),
**para** poder publicar ofertas laborales en la plataforma CAIL.

**Prioridad:** Alta

---

### HU-02 — Validar Empresa

* **Épica Asociada:** HE-01 — Gestión de Empresas
* **Actor:** Gerente

**Descripción:**
**Como** gerente del sistema,
**quiero** revisar la información registrada por una empresa,
**para** aprobarla o rechazarla antes de que pueda operar en la plataforma.

**Prioridad:** Alta

---

### HU-03 — Gestionar Empresa

* **Épica Asociada:** HE-01 — Gestión de Empresas
* **Actor:** Gerente

**Descripción:**
**Como** gerente del sistema,
**quiero** administrar las empresas registradas,
**para** gestionar su vigencia, estado y asignar reclutadores autorizados.

**Prioridad:** Media

---

## ÉPICA HE-02 — Gestión de Oferta Laboral

**Descripción de la Épica:**
Esta épica abarca el proceso completo de **creación, aprobación, publicación, mantenimiento y cierre de las ofertas laborales** dentro de la plataforma CAIL. Su objetivo es garantizar que las vacantes sigan un flujo controlado y validado antes de ser visibles para los candidatos, asegurando calidad, trazabilidad y orden en la bolsa de empleo.

**Actores principales:** Empresa, Gerente, Reclutador

---

### HU-04 — Registrar Oferta

* **Épica Asociada:** HE-02 — Gestión de Oferta Laboral
* **Actor:** Empresa

**Descripción:**
**Como** empresa,
**quiero** registrar una nueva oferta laboral,
**para** que un reclutador pueda gestionarla y publicarla en la plataforma.

**Prioridad:** Alta

---

### HU-05 — Aprobar Oferta

* **Épica Asociada:** HE-02 — Gestión de Oferta Laboral
* **Actor:** Gerente

**Descripción:**
**Como** gerente,
**quiero** revisar las ofertas laborales generadas,
**para** aprobarlas y permitir que sean publicadas en la bolsa de empleo.

**Prioridad:** Alta

---

### HU-06 — Publicar Oferta

* **Épica Asociada:** HE-02 — Gestión de Oferta Laboral
* **Actor:** Reclutador

**Descripción:**
**Como** reclutador,
**quiero** publicar una oferta previamente aprobada,
**para** que sea visible para los candidatos en la versión web y móvil de CAIL.

**Prioridad:** Alta

---

### HU-07 — Actualizar Oferta

* **Épica Asociada:** HE-02 — Gestión de Oferta Laboral
* **Actor:** Reclutador

**Descripción:**
**Como** reclutador,
**quiero** modificar los detalles de una oferta laboral,
**para** mantenerla actualizada según las necesidades de la empresa.

**Prioridad:** Media

---

### HU-08 — Cerrar Oferta

* **Épica Asociada:** HE-02 — Gestión de Oferta Laboral
* **Actor:** Reclutador

**Descripción:**
**Como** reclutador,
**quiero** cerrar una oferta laboral publicada,
**para** detener nuevas postulaciones.

**Prioridad:** Media

---

## ÉPICA HE-03 — Gestión de Candidatos

**Descripción de la Épica:**
Esta épica contempla los procesos necesarios para la **gestión integral del perfil del candidato** dentro de la plataforma CAIL, incluyendo el registro de información personal y profesional, la validación de identidad y formación académica mediante entidades externas, y la actualización continua del currículum vitae.

**Actores principales:** Candidato, Bolsa

---

### HU-09 — Registrar Datos Personales

* **Épica Asociada:** HE-03 — Gestión de Candidatos
* **Actor:** Candidato

**Descripción:**
**Como** candidato,
**quiero** registrar mis datos personales y profesionales,
**para** completar mi perfil dentro de la plataforma.

**Prioridad:** Alta

---

### HU-10 — Validar Identidad

* **Épica Asociada:** HE-03 — Gestión de Candidatos
* **Actor:** Bolsa

**Descripción:**
**Como** sistema de la bolsa de empleo,
**quiero** consultar al Registro Civil,
**para** verificar la identidad del candidato.

**Prioridad:** Alta

---

### HU-11 — Validar Títulos

* **Épica Asociada:** HE-03 — Gestión de Candidatos
* **Actor:** Bolsa

**Descripción:**
**Como** sistema de la bolsa de empleo,
**quiero** validar el título del candidato en la Senescyt,
**para** asegurar la veracidad de su formación académica.

**Prioridad:** Alta

---

### HU-12 — Actualizar CV

* **Épica Asociada:** HE-03 — Gestión de Candidatos
* **Actor:** Candidato

**Descripción:**
**Como** candidato,
**quiero** actualizar mi CV, habilidades y experiencia,
**para** mantener actualizado mi perfil profesional.

**Prioridad:** Media

---

## ÉPICA HE-04 — Descubrimiento y Consulta de Oferta

**Descripción de la Épica:**  
Esta épica permite al candidato **explorar, filtrar y mantenerse informado** sobre las ofertas laborales disponibles en la plataforma CAIL, facilitando la identificación de oportunidades acordes a su perfil profesional.

**Actores principales:** Candidato, Administrador

---

### HU-13 — Consultar Catálogo de Ofertas

- **Épica Asociada:** HE-04 — Descubrimiento y Consulta de Oferta  
- **Actor:** Candidato

**Descripción:**  
**Como** candidato,  
**quiero** explorar todas las ofertas laborales disponibles,  
**para** identificar oportunidades laborales acordes a mi perfil.

**Prioridad:** Alta

---

### HU-14 — Filtrar Ofertas

- **Épica Asociada:** HE-04 — Descubrimiento y Consulta de Oferta  
- **Actor:** Candidato

**Descripción:**  
**Como** candidato,  
**quiero** filtrar las ofertas por experiencia, ubicación, salario y competencias,  
**para** encontrar opciones laborales más relevantes.

**Prioridad:** Media

---

### HU-15 — Notificación de Nuevas Ofertas

- **Épica Asociada:** HE-04 — Descubrimiento y Consulta de Oferta  
- **Actor:** Administrador

**Descripción:**  
**Como** administrador del sistema,  
**quiero** generar y actualizar el catálogo de ofertas laborales,  
**para** que los candidatos tengan acceso permanente a información actualizada.

**Prioridad:** Media

---

## ÉPICA HE-05 — Postulación a Ofertas

**Descripción de la Épica:**  
Esta épica cubre el proceso mediante el cual el candidato puede **postularse a ofertas laborales**, adjuntar la documentación requerida y realizar el **seguimiento del estado de sus postulaciones** dentro de la plataforma CAIL.

**Actor principal:** Candidato

---

### HU-16 — Postular a Oferta

- **Épica Asociada:** HE-05 — Postulación a Ofertas  
- **Actor:** Candidato

**Descripción:**  
**Como** candidato,  
**quiero** postularme a una oferta laboral,  
**para** aplicar directamente desde la web o el móvil.

**Prioridad:** Alta

---

### HU-17 — Adjuntar CV y Carta de Presentación

- **Épica Asociada:** HE-05 — Postulación a Ofertas  
- **Actor:** Candidato

**Descripción:**  
**Como** candidato,  
**quiero** adjuntar mi CV y carta de presentación,  
**para** completar correctamente mi postulación.

**Prioridad:** Media

---

### HU-18 — Consultar Mis Postulaciones

- **Épica Asociada:** HE-05 — Postulación a Ofertas  
- **Actor:** Candidato

**Descripción:**  
**Como** candidato,  
**quiero** revisar mis postulaciones, estados y notificaciones,  
**para** hacer seguimiento de mi proceso de selección.

**Prioridad:** Media

---

## ÉPICA HE-06 — Gestión de Postulaciones (Reclutador)

**Descripción de la Épica:**  
Esta épica describe las funcionalidades que permiten al **reclutador gestionar las postulaciones recibidas**, facilitando la revisión, filtrado, selección de candidatos y el seguimiento del estado del proceso de contratación.

**Actor principal:** Reclutador

---

### HU-19 — Filtrar Postulaciones

- **Épica Asociada:** HE-06 — Gestión de Postulaciones (Reclutador)  
- **Actor:** Reclutador

**Descripción:**  
**Como** reclutador,  
**quiero** filtrar postulantes por competencias, experiencia y ubicación,  
**para** facilitar el proceso de selección.

**Prioridad:** Alta

---

### HU-20 — Seleccionar Candidato

- **Épica Asociada:** HE-06 — Gestión de Postulaciones (Reclutador)  
- **Actor:** Reclutador

**Descripción:**  
**Como** reclutador,  
**quiero** seleccionar al candidato más adecuado,  
**para** avanzar en el proceso de contratación.

**Prioridad:** Alta

---

### HU-21 — Actualizar Estado de Postulación

- **Épica Asociada:** HE-06 — Gestión de Postulaciones (Reclutador)  
- **Actor:** Reclutador

**Descripción:**  
**Como** reclutador,  
**quiero** cambiar el estado de una postulación (Rechazado, En revisión, Seleccionado),  
**para** mantener el proceso documentado y actualizado.

**Prioridad:** Media

---

## ÉPICA HE-07 — Matching Inteligente

**Descripción de la Épica:**  
Esta épica engloba las funcionalidades de **análisis automático y emparejamiento inteligente** entre candidatos y ofertas laborales, con el fin de mejorar la afinidad, eficiencia y proactividad del proceso de reclutamiento en la plataforma CAIL.

**Actor principal:** Bolsa

---

### HU-22 — Analizar Perfil de Candidato

- **Épica Asociada:** HE-07 — Matching Inteligente  
- **Actor:** Bolsa

**Descripción:**  
**Como** sistema de la bolsa de empleo,  
**quiero** evaluar las competencias, formación y experiencia del candidato,  
**para** calcular su afinidad con las ofertas disponibles.

**Prioridad:** Alta

---

### HU-23 — Buscar Candidatos Relevantes

- **Épica Asociada:** HE-07 — Matching Inteligente  
- **Actor:** Bolsa

**Descripción:**  
**Como** sistema de la bolsa de empleo,  
**quiero** encontrar candidatos que coincidan con los requisitos de una oferta laboral,  
**para** mejorar la eficiencia del proceso de reclutamiento.

**Prioridad:** Alta

---

### HU-24 — Notificar Candidato

- **Épica Asociada:** HE-07 — Matching Inteligente  
- **Actor:** Bolsa

**Descripción:**  
**Como** sistema de la bolsa de empleo,  
**quiero** enviar notificaciones automáticas a los candidatos,  
**para** informarles sobre ofertas laborales relevantes acorde a su perfil.

**Prioridad:** Media

---

## ÉPICA HE-08 — Seguridad y Usuario

**Descripción de la Épica:**  
Esta épica abarca las funcionalidades relacionadas con la **autenticación, validación y seguridad de los usuarios**, garantizando el acceso seguro al sistema y el uso correcto de las funcionalidades según el rol asignado.

**Actor principal:** Usuario

---

### HU-25 — Autenticación

- **Épica Asociada:** HE-08 — Seguridad y Usuario  
- **Actor:** Usuario

**Descripción:**  
**Como** usuario del sistema,  
**quiero** iniciar sesión mediante correo electrónico y contraseña,  
**para** acceder a mis funcionalidades según el rol asignado.

**Prioridad:** Alta

---

### HU-26 — Validar Usuario con Registro Civil / SENESCYT

- **Épica Asociada:** HE-08 — Seguridad
