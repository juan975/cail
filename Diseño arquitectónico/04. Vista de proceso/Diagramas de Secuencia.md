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
<img width="1136" height="849" alt="1" src="https://github.com/user-attachments/assets/72482b9d-cfc5-4113-9ec0-28ce133b89a9" />


### CU02: Administración de Candidatos
Detalla el registro del postulante, integrando validaciones externas automáticas (Registro Civil y Senescyt) antes de la aprobación.
<img width="1157" height="1075" alt="2" src="https://github.com/user-attachments/assets/586c2882-a788-433c-8cad-938481b86eab" />


### CU03: Definición de Vacantes
Muestra la creación de una oferta laboral por parte del Reclutador y el flujo de autorización requerido por un Gerente.
<img width="1187" height="884" alt="3" src="https://github.com/user-attachments/assets/421cbb70-5473-4c82-ba3c-031ed1a522a5" />


### CU04: Gestión del Ciclo de Vida de la Oferta
Documenta las operaciones de mantenimiento: edición de datos y el cierre/retiro de la vacante por parte del Reclutador.
<img width="1217" height="1001" alt="4" src="https://github.com/user-attachments/assets/851cb7b8-eb53-4f00-873e-5cdbf7858e52" />


### CU05: Gestión de Postulaciones (Vista Reclutador)
Representa cómo el reclutador visualiza y filtra los candidatos que se han postulado a una oferta específica (ej. por puntaje).
<img width="1297" height="836" alt="5" src="https://github.com/user-attachments/assets/d952e386-adac-4dba-b038-445d8ae31382" />


### CU06: Clasificación y Analítica de Talento
Ilustra el panel de analítica del Administrador para agrupar candidatos verificados según criterios profesionales.
<img width="1368" height="851" alt="6" src="https://github.com/user-attachments/assets/86ce2491-ff3a-4509-8885-f76771e700dd" />


---

## II. Procesos de Negocio Detallados y Motores

Estos 5 diagramas profundizan en la lógica interna, algoritmos y reglas de negocio específicas (Includes/Extends) que complementan los módulos anteriores.

### 7. Motor de Clasificación de Ofertas
Detalla el algoritmo interno que analiza el texto de la oferta para sugerir categorías (Industria, Nivel) antes de la publicación.
<img width="1096" height="907" alt="7" src="https://github.com/user-attachments/assets/bfbb0d5d-6df2-4fa4-8043-bdacf08f69f6" />


### 8. Motor de Recomendación y Catálogo
Explica la lógica del sistema para realizar "Matching" masivo, enviar notificaciones a candidatos y calcular KPIs de demanda.
<img width="1233" height="1112" alt="8" src="https://github.com/user-attachments/assets/50767575-788e-4576-a919-fbc79314e66f" />


### 9. Proceso Detallado de Postulación (Vista Candidato)
Describe la experiencia del usuario al postular, detallando la lógica de carga obligatoria de CV (Include) y opcional de Carta (Extend).
<img width="1372" height="1158" alt="9" src="https://github.com/user-attachments/assets/c924e1ac-65ba-4a59-97dd-a5de59efb2d5" />


### 10. Búsqueda y Filtrado Administrativo
Muestra la lógica dinámica del sistema para filtrar postulaciones por rango de fechas o búsqueda de texto específica (Lógica de la Bolsa).
<img width="1437" height="1067" alt="10" src="https://github.com/user-attachments/assets/06c30f79-8546-4c09-ab63-490fd71ca4d9" />


### 11. Evaluación y Aceptación Final
Documenta el flujo de decisión final sobre un postulante: revisión del perfil y la bifurcación lógica entre "Seleccionar" y "Rechazar".
<img width="1132" height="981" alt="11" src="https://github.com/user-attachments/assets/ab676aa7-6cfe-4213-9d1f-d3203a066fce" />



