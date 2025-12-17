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

### Historias de Usuario y DevOps

En CAIL, las historias de usuario no solo representan funcionalidad, sino también prácticas DevOps:

* Cada historia debe ser **desplegable de forma independiente**.
* Debe poder validarse mediante **pruebas automatizadas**.
* Su finalización implica que el código está listo para pasar por el pipeline CI/CD.

Esto asegura entregas incrementales, continuas y de alta calidad.

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
