<p align='center'>
  <img src='https://github.com/user-attachments/assets/899a06d7-01dd-4f33-b0cf-48b36b632b6f' height="150">
</p>

<h1 align='center'>
  Vistas de Procesos (Diagramas de Secuencia)
  <br>
  "Aplicación Bolsa de Empleos 'CAIL'"
</h1>

## ¿Qué son las Vistas de Procesos?

Las **Vistas de Procesos**, representadas mediante **Diagramas de Secuencia UML**, modelan el comportamiento dinámico del sistema a través del tiempo. Siguiendo el estándar **ISO/IEC/IEEE 42010**, estas vistas documentan:

 1. **Interacción:** Cómo se comunican los Actores con el Sistema (Vistas y Controladores).<br>
 2. **Flujo de Datos:** El camino que recorre la información desde la entrada hasta la persistencia.<br>
 3. **Lógica de Negocio:** Las reglas y validaciones que ocurren internamente (documentadas mediante notas de "Rationale").<br>
 4. **Temporalidad:** El orden cronológico exacto en que ocurren los eventos.<br>

## Estructura y Patrón de Diseño
Para este proyecto, los diagramas siguen el patrón arquitectónico **"Fat Controller" (Controlador Gordo)**. El controlador actúa como el orquestador central, validando reglas de negocio, comunicándose con servicios externos y gestionando la persistencia.

---

## I. Módulos de Administración (Core)

Estos 6 diagramas detallan las operaciones fundamentales (CRUD) y el ciclo de vida de las entidades principales del sistema.

### CU01: Administración de Empleadores
Describe el flujo de registro de empresas y el proceso de validación y aprobación por parte del Administrador.
![Diagrama CU01](https://github.com/user-attachments/assets/284bdb5a-c695-4fbb-9872-a4f8c4d3ff5f)


### CU02: Administración de Candidatos
Detalla el registro del postulante, integrando validaciones externas automáticas (Registro Civil y Senescyt) antes de la aprobación.
![Diagrama CU02](https://github.com/user-attachments/assets/a8bd267b-3593-41e6-b8d2-e73d43bd3fd3)


### CU03: Definición de Vacantes
Muestra la creación de una oferta laboral por parte del Reclutador y el flujo de autorización requerido por un Gerente.
![Diagrama CU03](https://github.com/user-attachments/assets/eec2f2da-47c0-45f2-b7cf-463fa2388717)


### CU04: Gestión del Ciclo de Vida de la Oferta
Documenta las operaciones de mantenimiento: edición de datos y el cierre/retiro de la vacante por parte del Reclutador.
![Diagrama CU04](https://github.com/user-attachments/assets/1296ea94-e705-45f4-8e76-a9dfe85d10e1)


### CU05: Gestión de Postulaciones (Vista Reclutador)
Representa cómo el reclutador visualiza y filtra los candidatos que se han postulado a una oferta específica (ej. por puntaje).
![Diagrama CU05](https://github.com/user-attachments/assets/d488bfba-4145-4da8-84b4-a9cf9135eeec)


### CU06: Clasificación y Analítica de Talento
Ilustra el panel de analítica del Administrador para agrupar candidatos verificados según criterios profesionales.
![Diagrama CU06](https://github.com/user-attachments/assets/7acaeb95-d155-446b-925c-afe85fb2ebf6)


---

## II. Procesos de Negocio Detallados y Motores

Estos 5 diagramas profundizan en la lógica interna, algoritmos y reglas de negocio específicas (Includes/Extends) que complementan los módulos anteriores.

### 7. Motor de Clasificación de Ofertas
Detalla el algoritmo interno que analiza el texto de la oferta para sugerir categorías (Industria, Nivel) antes de la publicación.
![Diagrama Clasificacion](https://github.com/user-attachments/assets/213524ec-d12e-41df-801e-e3d988e26e2e)


### 8. Motor de Recomendación y Catálogo
Explica la lógica del sistema para realizar "Matching" masivo, enviar notificaciones a candidatos y calcular KPIs de demanda.
![Diagrama Catalogo](https://github.com/user-attachments/assets/2b137789-7671-4a17-976d-8037c59016af)


### 9. Proceso Detallado de Postulación (Vista Candidato)
Describe la experiencia del usuario al postular, detallando la lógica de carga obligatoria de CV (Include) y opcional de Carta (Extend).
![Diagrama Postulacion Detallada](https://github.com/user-attachments/assets/4ae57b64-a695-4342-a455-06a78f7d04f2)


### 10. Búsqueda y Filtrado Administrativo
Muestra la lógica dinámica del sistema para filtrar postulaciones por rango de fechas o búsqueda de texto específica (Lógica de la Bolsa).
![Diagrama Filtrado](https://github.com/user-attachments/assets/dc071437-5c62-49cf-b99d-844da875f779)


### 11. Evaluación y Aceptación Final
Documenta el flujo de decisión final sobre un postulante: revisión del perfil y la bifurcación lógica entre "Seleccionar" y "Rechazar".
![Diagrama Aceptacion](https://github.com/user-attachments/assets/b34083ac-de52-448f-bfee-48fb87b99e57)


