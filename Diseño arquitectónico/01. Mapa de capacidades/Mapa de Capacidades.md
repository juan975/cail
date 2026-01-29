<p align="right">
  <img src="https://i.postimg.cc/13qQdqZs/utpllogo.png" alt="Logo UTPL" width="150"/>
</p>



<h1 align='center'>
  Mapa de Capacidades de la Aplicación Bolsa de Empleos
  <br>
  "CAIL"
</h1>


---

## ¿Qué es un Mapa de Capacidades?

Un **Mapa de Capacidades** es una herramienta visual que ayuda a estructurar y definir las funciones y habilidades esenciales de un sistema o aplicación. Su propósito es ofrecer una visión clara de las capacidades que un sistema debe tener para cumplir sus objetivos.

En el contexto de una aplicación de software, un mapa de capacidades permite:
- Identificar las áreas clave de funcionalidad.
- Agrupar actividades relacionadas.
- Visualizar cómo se interconectan los diferentes módulos del sistema.

---

### Estructura de este Mapa de Capacidades

Este mapa de capacidades detalla el flujo completo de una plataforma de bolsa de empleos. Los módulos están organizados de manera jerárquica y secuencial, permitiendo a los desarrolladores, diseñadores y *stakeholders* entender el alcance de cada funcionalidad, desde el registro inicial hasta la aceptación del postulante.

---

## Mapa de Capacidades de la Aplicación Bolsa de Empleos - "CAIL" 

![Mapa de Capacidades](https://github.com/user-attachments/assets/162efbbe-a985-4a0c-9532-a4e8ad182aff)

Este mapa fue diseñado para una aplicación integral de gestión de postulaciones. La aplicación se organiza en **cuatro grandes áreas de capacidad**, que cubren todo el ciclo de vida del reclutamiento:

1. [**Gestión de Perfiles**](#1-gestión-de-perfiles)
2. [**Gestión de Ofertas Laborales**](#2-gestión-de-ofertas-laborales)
3. [**Descubrimiento y Postulación**](#3-descubrimiento-y-postulación)
4. [**Gestión de Postulaciones**](#4-gestión-de-postulaciones)

---

# Descripción de las Áreas de Capacidad

A continuación, se detallan los módulos y funcionalidades de cada área principal.

---

## 1. **Gestión de Perfiles**

Esta área abarca la administración de los actores clave del sistema: los empleadores (empresas) y los candidatos (postulantes).

* [1.1. Administración de empleadores](#11-administración-de-empleadores)
* [1.2. Administración de candidatos](#12-administración-de-candidatos)

### 1.1. Administración de empleadores
Define las capacidades para que las empresas se registren y sean validadas en la plataforma.

- **Adm. de empleadores:** Permite registrar los datos de la empresa.
- **Validar empresas:** Proceso para verificar y validar la autenticidad de la empresa registrada.

### 1.2. Administración de candidatos
Se centra en la captura completa y estructurada del perfil del postulante.

- **Ingresar datos de candidatos:** Formulario para información personal, de ubicación y profesional (formación, habilidades técnicas, competencias, experiencia).
- **Perfiles requeridos:** Define los campos y requisitos mínimos del perfil.
- **Validar candidatos:** Proceso para verificar la información y autenticidad del candidato.

---

## 2. **Gestión de Ofertas Laborales**

Esta área se enfoca en el ciclo de vida de una vacante, desde su creación hasta su publicación y gestión continua.

* [2.1. Definición de vacantes](#21-definición-de-vacantes)
* [2.2. Gestión del ciclo de vida de la oferta](#22-gestión-del-ciclo-de-vida-de-la-oferta)

### 2.1. Definición de vacantes
Capacidades para crear una oferta de trabajo detallada.

- **Ingresar oferta laboral:** Campos para descripción, prioridad, salario, modalidad y ubicación.
- **Competencias:** Sección para definir las competencias, formación y experiencia requeridas.
- **Publicar oferta laboral:** Acción final para hacer visible la vacante.

### 2.2. Gestión del ciclo de vida de la oferta
Permite administrar las ofertas publicadas a lo largo del tiempo.

- **Administrar oferta:** Funciones para verificar el estado de una oferta (publicada, en vigencia, en cierre) y actualizarla.
- **Administrar ofertas finalizadas:** Capacidades para archivar ofertas cerradas y refinar búsquedas de ofertas antiguas.

---

## 3. **Descubrimiento y Postulación**

Esta área contiene el núcleo de la plataforma: la conexión entre candidatos y ofertas. Incluye los motores de búsqueda, filtros y el proceso de postulación.

* [3.1. Gestión de Postulaciones (Búsqueda)](#31-gestión-de-postulaciones-búsqueda)
* [3.2. Clasificación de talentos](#32-clasificación-de-talentos)
* [3.3. Clasificación de ofertas](#33-clasificación-de-ofertas)
* [3.4. Administración de catálogo de ofertas](#34-administración-de-catálogo-de-ofertas)
* [3.5. Postulación a oferta](#35-postulación-a-oferta)

### 3.1. Gestión de Postulaciones (Búsqueda)
Herramientas de filtrado para que los candidatos encuentren vacantes.

- **Filtros:** Capacidad de filtrar postulaciones populares, por fecha, por competencias, por experiencia y por formación.

### 3.2. Clasificación de talentos
Módulo para analizar y segmentar a los candidatos registrados.

- **Análisis y clasificación:** Permite analizar candidatos y clasificarlos por competencias, experiencia, formación, ubicación, perfiles profesionales, niveles de experiencia y sectores económicos.

### 3.3. Clasificación de ofertas
Módulo para analizar y segmentar las ofertas de trabajo disponibles.

- **Análisis y clasificación:** Permite analizar perfiles requeridos y clasificarlos por competencias, experiencia, formación, ubicación, tipo de empleo, industria y nivel jerárquico.

### 3.4. Administración de catálogo de ofertas
Funcionalidades para gestionar la visualización y descubrimiento de ofertas.

- **Catálogo de ofertas:** Resumir ofertas, notificar nuevas ofertas (por perfil profesional o sector), monitorear la demanda (por sector o ubicación) y mantener indicadores (de vacantes cubiertas o activas).

### 3.5. Postulación a oferta
Flujo que sigue el candidato para aplicar a una vacante.

- **Postular:** Incluye la presentación de la oferta, la carga o selección del CV, y la presentación del canal de postulación.
- **Notificación:** Avisos sobre el estado de la postulación y cambios en la misma.

---

## 4. **Gestión de Postulaciones**

Esta área final cubre el *backend* de la gestión de talento: la administración, revisión y aceptación de las postulaciones recibidas por parte de los empleadores.

* [4.1. Administrar Postulaciones](#41-administrar-postulaciones)
* [4.2. Aceptación de postulante](#42-aceptación-de-postulante)

### 4.1. Administrar Postulaciones
Panel de control del empleador para gestionar a los candidatos que han aplicado.

- **Filtros y Búsqueda:** Herramientas para filtrar postulaciones por fecha y buscar por postulación.

### 4.2. Aceptación de postulante
Flujo de decisión final del empleador sobre un candidato.

- **Evaluación:** Incluye la evaluación de postulantes y la revisión del perfil.
- **Decisión:** Capacidades para seleccionar candidatos y rechazar a otros.

---







