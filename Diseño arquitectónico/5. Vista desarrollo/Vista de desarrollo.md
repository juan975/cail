
<p align='center'>
  <img src='https://github.com/user-attachments/assets/899a06d7-01dd-4f33-b0cf-48b36b632b6f' height="150">
</p>

<h1 align='center'>
  Pipeline de Desarrollo y Operaciones
    

  Proyecto "CAIL"
</h1>

## ¿Qué es CI/CD?

**CI/CD** es la columna vertebral de las prácticas modernas de desarrollo de software. Es un acrónimo que representa la **Integración Continua (Continuous Integration )** y la **Entrega o Despliegue Continuo (Continuous Delivery/Deployment)**. El objetivo de este pipeline es automatizar las fases de construcción, prueba y despliegue de nuestro proyecto, permitiéndonos entregar valor de forma más rápida, segura y fiable.

*   **Integración Continua (CI):** Es la práctica de fusionar automáticamente los cambios de código de todos los desarrolladores en un repositorio central varias veces al día. Cada vez que se sube nuevo código, un proceso automático se dispara para compilar la aplicación y ejecutar un conjunto de pruebas unitarias y de integración. Esto nos permite detectar y corregir errores de forma casi inmediata, evitando problemas complejos en el futuro.

*   **Entrega/Despliegue Continuo (CD):** Es la extensión lógica de la CI. Una vez que el código ha superado todas las pruebas automatizadas, el pipeline de CD se encarga de empaquetar la aplicación y desplegarla automáticamente en uno o más entornos (como desarrollo, pruebas o producción). Esto elimina los procesos de despliegue manuales, que son lentos y propensos a errores, garantizando que una nueva versión de CAIL pueda estar en manos de los usuarios en cuestión de minutos.

## ¿Qué es DevOps?

**DevOps** es una cultura y una metodología de trabajo que une a los equipos de Desarrollo de Software (Dev) y Operaciones de TI (Ops) para construir, probar y lanzar software de manera más rápida y fiable. En lugar de trabajar en silos aislados, DevOps fomenta la colaboración, la comunicación y una responsabilidad compartida sobre el ciclo de vida completo de la aplicación.

Para el proyecto CAIL, adoptar una cultura DevOps significa:
- **Automatización Extrema:** Automatizamos todo lo posible, desde las pruebas hasta el despliegue y el monitoreo.
- **Ciclos Rápidos:** Entregamos mejoras y nuevas funcionalidades en ciclos cortos e iterativos.
- **Feedback Constante:** Utilizamos herramientas de monitoreo para entender cómo se usa nuestra aplicación y detectar problemas proactivamente.
- **Calidad Integrada:** La responsabilidad por la calidad del software no recae solo en un equipo de QA, sino en todos los involucrados en el proyecto.

## Flujo DevOps para el Proyecto CAIL

<img width="1899" height="1400" alt="Pipeline" src="https://github.com/user-attachments/assets/4800feb0-fb71-4e42-adac-4ead76b2452b" />


### Descripción del Pipeline

| **Fase** | **Herramientas Propuestas** | **Descripción en el Contexto de CAIL** |
|:---|:---|:---|
| **Plan** | **Jira / Trello, Discord, GitHub Projects** | Se utiliza **Jira** o **Trello** para la gestión ágil de historias de usuario, tareas y sprints. **Discord** sirve como canal de comunicación instantánea para el equipo. **GitHub Projects** se usa para vincular el progreso de las tareas directamente con el código. |
| **Code** | **Node.js (Backend ), React (Frontend Web), React Native (Móvil), GitHub** | El backend se desarrolla en **Node.js** por su eficiencia en operaciones I/O. La interfaz web se construye con **React** y la aplicación móvil con **React Native** para reutilizar lógica. **GitHub** es nuestro repositorio central y única fuente de verdad para todo el código. |
| **Build** | **Docker, Vite / Webpack** | **Docker** se utiliza para crear contenedores consistentes y portables de nuestro backend, garantizando que funcione igual en cualquier entorno. **Vite** o **Webpack** se encargan de compilar y empaquetar el código de nuestras aplicaciones frontend. |
| **Test** | **Jest, Detox, Firebase Test Lab, GitHub Actions** | **Jest** se usa para pruebas unitarias tanto en frontend como en backend. **Detox** nos permite realizar pruebas End-to-End en la app móvil. **Firebase Test Lab** ejecuta pruebas en una granja de dispositivos reales. **GitHub Actions** orquesta la ejecución de todas estas pruebas automáticamente en cada `push`. |
| **Release** | **GitHub Actions, Fastlane** | **GitHub Actions** automatiza la creación de *releases*, generando los artefactos de la aplicación (imágenes de Docker, paquetes APK/IPA). **Fastlane** automatiza el proceso de firma y preparación de las apps móviles para su publicación en las tiendas. |
| **Deploy** | **Firebase Hosting, Google Cloud Run, Google Play / App Store** | El frontend web se despliega en **Firebase Hosting** por su CDN global. El backend contenedorizado se despliega en **Google Cloud Run** para una escalabilidad automática y sin servidor. Las aplicaciones móviles se publican en **Google Play Store** y **Apple App Store**. |
| **Operate** | **Firebase (Auth, Firestore, Storage)** | Utilizamos los servicios gestionados de **Firebase** para la operación diaria: **Authentication** para el manejo de usuarios, **Firestore** como nuestra base de datos NoSQL principal, y **Cloud Storage** para almacenar archivos como los CVs de los candidatos. |
| **Monitor** | **Sentry, Google Analytics / Firebase Analytics** | **Sentry** se integra en todas nuestras aplicaciones para la detección y reporte de errores en tiempo real. **Google Analytics** (para la web) y **Firebase Analytics** (para el móvil) nos proporcionan métricas clave sobre el comportamiento y la interacción de los usuarios. |

## Stack Tecnológico Detallado

La selección de tecnologías para el proyecto CAIL se ha realizado con base en criterios de rendimiento, escalabilidad, ecosistema y la unificación del desarrollo web y móvil.

### Backend

El backend de CAIL está diseñado para ser una plataforma robusta, segura y escalable, sirviendo como la API central para todas las aplicaciones cliente.

| Tecnología | Rol en el Proyecto | Justificación Técnica |
|:---|:---|:---|
| **Node.js** | **Entorno de Ejecución** | Elegido por su modelo de I/O no bloqueante, ideal para una aplicación que manejará múltiples conexiones concurrentes (búsquedas, postulaciones). Su ecosistema (NPM) es vasto y se integra perfectamente con el resto de nuestro stack. |
| **TypeScript** | **Lenguaje de Programación** | Se utiliza para añadir tipado estático al backend, lo que reduce errores en tiempo de ejecución, mejora la legibilidad del código y facilita la mantenibilidad a largo plazo, un pilar de la calidad del software (ISO/IEC 25010). |
| **Fastify** | **Framework Web** | Seleccionado por su enfoque en el alto rendimiento y bajo overhead. Su arquitectura basada en plugins fomenta un código modular y su velocidad en el enrutamiento de peticiones lo hace ideal para una API de alto tráfico que interactúa con Firestore. |
| **Firestore (en modo Nativo)** | **Base de Datos Principal** | **Firestore es el corazón de nuestro almacenamiento de datos.** Se elige por su modelo de datos flexible (NoSQL basado en documentos), su capacidad de escalado masivo y automático, y sus potentes capacidades de consulta en tiempo real. Su integración nativa con Firebase Authentication y Cloud Functions nos permite construir lógicas de negocio complejas y seguras directamente en la nube. |
| **Firebase (Servicios Adicionales)** | **Autenticación y Almacenamiento** | Además de Firestore, utilizamos otros servicios de Firebase para acelerar el desarrollo: **Firebase Authentication** gestiona de forma segura todo el ciclo de vida de los usuarios (login, registro, etc.), y **Cloud Storage** es la solución ideal para almacenar archivos binarios como los CVs de los candidatos y las imágenes de perfil de las empresas. |
| **Docker** | **Contenerización** | Aunque gran parte de la lógica puede residir en Cloud Functions, el uso de Docker sigue siendo valioso para cualquier servicio de backend personalizado (ej. un procesador de datos intensivo) que necesitemos desplegar. Crea un entorno de ejecución inmutable y reproducible. |
| **JWT (JSON Web Tokens)** | **Autenticación y Autorización** | Los tokens generados por Firebase Authentication (que son JWTs) se utilizan para proteger nuestra API. El backend verifica la validez de estos tokens en cada petición para autorizar el acceso a los recursos de Firestore, asegurando que un usuario solo pueda acceder a los datos que le corresponden. |

### Frontend

El frontend de CAIL se construye sobre una base de código unificada para web y móvil, maximizando la reutilización de componentes, lógica y esfuerzo de desarrollo.

| Tecnología | Rol en el Proyecto | Justificación Técnica |
|:---|:---|:---|
| **React Native 0.74 + React 18** | **Framework Principal** | Es el corazón de nuestra aplicación. Nos permite escribir el código una vez en TypeScript y compilarlo para crear una aplicación nativa para iOS, Android y, crucialmente, para la web, logrando una cobertura total de plataformas. |
| **Expo SDK 51** | **Plataforma de Desarrollo** | Expo abstrae y simplifica gran parte de la complejidad del desarrollo nativo. Proporciona un conjunto de APIs y herramientas (como `expo-font`, `expo-status-bar`) que aceleran el desarrollo, facilitan las actualizaciones (EAS) y garantizan el acceso a funcionalidades nativas de forma consistente. |
| **React Native Web 0.19** | **Compilador para Web** | Esta librería es la pieza clave que nos permite tomar nuestros componentes de React Native y renderizarlos como HTML y CSS en un navegador web. Esto hace posible nuestra estrategia de base de código única, asegurando que la experiencia de usuario sea coherente entre la app móvil y la plataforma web. |
| **UI/Helpers Nativos** | **Librerías de Interfaz y Utilidades** | Utilizamos un conjunto de librerías de alta calidad del ecosistema Expo/React Native: **`@expo/vector-icons`** y **`lucide-react`** para una iconografía rica y consistente, **`react-native-safe-area-context`** para respetar los notches y áreas seguras de los dispositivos, y **`expo-linear-gradient`** para efectos visuales avanzados. |
| **Tooling (Herramientas)** | **Compilación y Transpilación** | **TypeScript 5** nos proporciona el tipado estático. **Babel** (con `babel-preset-expo`) se encarga de transpilar el código moderno de JavaScript y JSX para que sea compatible con todas las plataformas. **Metro** (vía `@expo/metro-runtime`) es el bundler optimizado para React Native, responsable de empaquetar todo nuestro código y assets de forma eficiente. |
