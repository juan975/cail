<p align="right">
  <img src="https://i.postimg.cc/13qQdqZs/utpllogo.png" alt="Logo UTPL" width="150"/>
</p>


#  Diagramas de Casos de Uso 

## ¿Qué son los diagramas de casos de uso?

Los **diagramas de casos de uso** son una herramienta fundamental del Lenguaje Unificado de Modelado (UML) que se utilizan para describir gráficamente las **funcionalidades de un sistema** desde la perspectiva del usuario. Representan las interacciones entre los **"actores"** (usuarios o sistemas externos) y el **"sistema"** para alcanzar un objetivo específico.

En esencia, este diagrama no describe *cómo* funciona el sistema internamente, sino *qué* hace el sistema en respuesta a las solicitudes de un actor para proporcionarle un resultado de valor.

## Estructura General

  * **Actor:** Representa cualquier entidad externa que interactúa con el sistema (un usuario humano, otro software, un dispositivo).
  * **Caso de Uso:** Representa una funcionalidad específica que el sistema proporciona para entregar un resultado de valor al actor (ej. "Publicar Oferta Laboral", "Validar Candidato").
  * **Relaciones:**
      * **Asociación:** Una línea sólida que conecta a un actor con un caso de uso. Indica que el actor participa en esa funcionalidad.
      * **Inclusión (`<<include>>`):** Una flecha punteada que indica que un caso de uso *siempre* invoca a otro (ej. "Administrar Postulaciones" `<<include>>` "Evaluar Perfil"). Se usa para reutilizar funcionalidad obligatoria.
      * **Extensión (`<<extend>>`):** Una flecha punteada que indica que un caso de uso *opcionalmente* puede extender a otro (ej. "Buscar Ofertas" `<<extend>>` "Aplicar Filtros Avanzados").

-----

## 1\. MÓDULO GESTIÓN DE PERFILES

Este módulo detalla los procesos de registro, validación y administración de los actores principales.

### Diagrama 1.1: Administración de Empleadores

**Descripción Técnica:**
Este diagrama modela el flujo de alta de una nueva empresa en la plataforma.

1.  **Actores:** Gerente, Recursos Humanos, Usuario, Empresa, CAIL.
2.  **Proceso de Registro:** El **Usuario** (representante de la empresa) inicia el proceso "Ingresar datos de empresa".
3.  **Validación:** Se desencadena una inclusión (`<<include>>`) hacia el proceso "Validar empresas".
4.  **Aprobación:** El actor **CAIL** (Cámara de Industrias) interviene como entidad certificadora para validar la legitimidad de la empresa.

![WhatsApp Image 2025-11-26 at 07 18 40](https://github.com/user-attachments/assets/e298a77b-a8af-4c1b-b725-cffe86971140)


### Diagrama 1.2: Administración de Candidatos

**Descripción Técnica:**
Describe el registro del perfil profesional del postulante y su validación cruzada con entes gubernamentales.

1.  **Actores:** Candidato, Registro Civil, Senescyt, Bolsa.
2.  **Ingreso de Datos:** El **Candidato** ejecuta la acción "Ingresar datos del postulante".
3.  **Sub-procesos (`<<include>>`):** El sistema obliga a completar dos flujos:
      * "Ingresar información personal".
      * "Ingresar información profesional".
4.  **Interoperabilidad:**
      * La "Validar cedula" se realiza contra el actor externo **Registro Civil**.
      * La "Validar candidatos" (títulos) se consulta con el actor externo **Senescyt**.
5.  **Confirmación:** El actor **Bolsa** actúa como orquestador final del registro.
![WhatsApp Image 2025-11-26 at 07 18 40 (1)](https://github.com/user-attachments/assets/7fc32c2b-acaf-4af2-a06d-fd303273338b)
-----

## 2\. MÓDULO GESTIÓN DE OFERTAS LABORALES

Abarca el ciclo de vida completo de una vacante, desde su creación hasta su cierre.

### Diagrama 2.1: Definición de Vacantes

**Descripción Técnica:**
Muestra la creación estructurada de una oferta de empleo.

1.  **Actores:** Gerente, Reclutador, Usuario, Oferta, Bolsa.
2.  **Creación:** El **Reclutador** o **Gerente** inicia el caso de uso "Ingresar oferta laboral".
3.  **Estructura de Datos (`<<include>>`):**
      * Se define la "Descripción de oferta" (título, salario, modalidad).
      * Se establecen los "Perfiles requeridos" (competencias, experiencia).
4.  **Publicación:** Finalmente, el **Usuario** ejecuta la acción "Publicar postulación", haciendo visible la oferta en la **Bolsa**.
![WhatsApp Image 2025-11-26 at 07 19 44](https://github.com/user-attachments/assets/d2f2f38a-f621-498a-ba44-1760c2032548)


### Diagrama 2.2: Gestión del Ciclo de Vida de la Oferta

**Descripción Técnica:**
Este diagrama detalla el mantenimiento y cierre de las ofertas existentes.

1.  **Actores:** Gerente, Reclutador, Usuario, Bolsa.
2.  **Administración Activa:** El **Reclutador** gestiona la oferta mediante "Administrar oferta", lo que incluye (`<<include>>`):
      * "Verificar oferta": Monitoreo de estado.
      * "Actualizar oferta": Modificación de datos.
3.  **Cierre de Ciclo:** Para las ofertas que han concluido, se ejecuta "Administrar ofertas finalizadas".
4.  **Acciones de Cierre (`<<extends>>`):**
      * "Archivar oferta": Para guardar histórico.
      * "Retirar oferta": Para eliminarla de la vista pública en la **Bolsa**.
![WhatsApp Image 2025-11-26 at 07 19 45](https://github.com/user-attachments/assets/7daabef9-da53-4cfd-ae9c-cdd15c2b6529)

-----

## 3\. MÓDULO DESCUBRIMIENTO Y POSTULACIÓN

Se centra en la inteligencia de negocio para conectar candidatos con ofertas (Matching) y analítica.

### Diagrama 3.1: Clasificación de Talento

**Descripción Técnica:**
Ilustra cómo el **Administrador** y la **Bolsa** analizan la base de datos de candidatos.

1.  **Actores:** Administrador, Bolsa.
2.  **Análisis Individual:** El proceso "Analizar candidato" se extiende (`<<extend>>`) para permitir análisis por:
      * Competencia, Experiencia, Formación y Ubicación.
3.  **Segmentación:** El proceso "Clasificar perfiles" permite agrupar el talento por (`<<extend>>`):
      * Áreas profesionales, Niveles de experiencia y Sectores económicos.


![WhatsApp Image 2025-11-26 at 07 21 38](https://github.com/user-attachments/assets/6b27aba3-460e-4a27-ba42-67fd87cf6a92)

### Diagrama 3.2: Clasificación de Ofertas

**Descripción Técnica:**
Similar al anterior, pero enfocado en la demanda laboral.

1.  **Actores:** Administrador, Bolsa.
2.  **Análisis de Requerimientos:** "Analizar perfiles requeridos" desglosa la demanda por (`<<extend>>`):
      * Competencias, Experiencia, Formación y Ubicación.
3.  **Segmentación de Mercado:** "Clasificar ofertas" permite al sistema organizar las vacantes por (`<<extend>>`):
      * Tipo de empleo, Industria y Nivel jerárquico, facilitando la búsqueda en la **Bolsa**.

![WhatsApp Image 2025-11-26 at 07 21 38 (1)](https://github.com/user-attachments/assets/6f8ab1d3-2fd6-431b-b89f-701994699f73)

### Diagrama 3.3: Administración de Catálogo de Ofertas

**Descripción Técnica:**
Define las herramientas de notificación y métricas del sistema.

1.  **Actores:** Administrador, Candidato, Bolsa.
2.  **Sistema de Recomendación:** "Recomendar ofertas" y "Notificar nuevas ofertas" utilizan extensiones (`<<extend>>`) para enviar alertas personalizadas por **Perfil profesional** o **Sector** al **Candidato**.
3.  **Analítica de Mercado:** El **Administrador** utiliza "Monitorear la demanda" (extendido por sector/ubicación).
4.  **KPIs:** El proceso "Mantener indicadores" genera métricas de vacantes cubiertas vs. activas (`<<extend>>`).
![WhatsApp Image 2025-11-26 at 07 21 40](https://github.com/user-attachments/assets/e8208938-00a3-4ef6-adcc-1b549c75d583)

-----

## 4\. MÓDULO GESTIÓN DE POSTULACIONES

Detalla la interacción directa entre el candidato y la oferta, y la gestión de los aplicantes.

### Diagrama 4.1: Postulación a Oferta

**Descripción Técnica:**
El flujo crítico donde se concreta la aplicación.

1.  **Actores:** Candidato, Postulación, Bolsa.
2.  **Aplicación:** El **Candidato** inicia "Postular a oferta".
3.  **Requisitos (`<<include>>` / `<<extend>>`):**
      * Es obligatorio (`<<include>>`) "Ingresar CV".
      * Es opcional (`<<extend>>`) "Ingresar carta de presentación".
4.  **Seguimiento:** El sistema permite "Ver estado de postulación", el cual incluye "Notificación de Cambios" (`<<include>>`) por parte de la **Bolsa**.
![WhatsApp Image 2025-11-26 at 07 22 46](https://github.com/user-attachments/assets/a0c5e915-e4ee-4474-b335-1dae40c09aa1)

### Diagrama 4.2: Administrar Postulaciones

**Descripción Técnica:**
Herramientas para que el **Candidato** o la **Bolsa** gestionen las aplicaciones realizadas.

1.  **Actores:** Candidato, Bolsa.
2.  **Gestión:** El actor accede a "Administrar postulaciones" y "Filtrar postulaciones".
3.  **Búsqueda y Filtrado:** El sistema permite filtrar las postulaciones mediante criterios como "Filtrar por fecha" o "Buscar postulación" (`<<extend>>`).
![WhatsApp Image 2025-11-26 at 07 22 46 (1)](https://github.com/user-attachments/assets/f7a5e303-2f08-414a-9e1c-016077ff79f3)

### Diagrama 4.3: Aceptación de Postulante

**Descripción Técnica:**
Cubre la etapa final del proceso de selección por parte del **Usuario** (Empresa).

1.  **Actores:** Usuario, Bolsa.
2.  **Evaluación:** Se inicia con "Evaluar postulación", que incluye obligatoriamente (`<<includes>>`) el proceso de "Evaluar Perfil".
3.  **Decisión:** El sistema ofrece dos caminos extendidos (`<<extends>>`) basados en el resultado de la evaluación:
      * "Seleccionar postulante": Marca al candidato como elegido.
      * "Rechazar postulante": Descarta la aplicación.
![WhatsApp Image 2025-11-26 at 07 22 46 (2)](https://github.com/user-attachments/assets/47c7643c-603f-488b-9d51-23b68bf14e0d)


## Especificaciones de casos de uso

- **Empresa registra Oferta**
- **Gerente aprueba Oferta**
- **Reclutador publica Oferta**
- **Reclutador selecciona Postulacion**
- **Reclutador actualiza Oferta**
- **Candidato postula Oferta**
- **Candidato revisa Postulacion**
- **Matching analiza Candidato**
- **Matching busca Candidato**
- **Administrador genera Oferta**
- **RegistroCivil verifica Candidato**
- **Senecyt verifica Candidato**
- **Gerente gestiona Empresa**
- **Reclutador modifica Oferta**
- **Reclutador selecciona Candidato**
- **Matching notifica Candidato**
- **Matching procesa Oferta**
- **Candidato consulta Oferta**
- **Candidato consulta Postulacion**
- **Postulacion asocia Candidato**
- **Postulacion asocia Oferta**
- **Reclutador representa Empresa**
- **RegistroCivil valida Usuario**
- **Senecyt valida Usuario**


