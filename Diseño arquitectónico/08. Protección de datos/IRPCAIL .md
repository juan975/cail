# Plan de Respuesta a Incidentes (IRP)

## Objetivo
Establecer un protocolo estandarizado basado en **NIST SP 800-61** para la identificación, gestión, contención, comunicación y recuperación ante incidentes de ciberseguridad que afecten la plataforma.

---

## Equipo de Respuesta (CSIRT)

### Líder de Incidente (Gerencia)
Responsable de la toma de decisiones críticas, tales como:
- Aislar servidores.
- Suspender servicios.
- Autorizar comunicaciones oficiales.

### Líder Técnico (DevSecOps)
Responsable de:
- Analizar el impacto técnico.
- Ejecutar la contención y erradicación.
- Aplicar parches, restauraciones y validaciones post-incidente.

### Oficial Legal / Protección de Datos
Responsable de:
- Determinar si el incidente constituye una violación de datos personales.
- Gestionar notificaciones obligatorias ante la Autoridad de Protección de Datos.
- Evaluar obligaciones de comunicación hacia usuarios afectados.

---

## Clasificación de Severidad del Incidente

### S3 – Baja Severidad
**Ejemplos:** intentos fallidos de inicio de sesión, escaneo de puertos, alertas triviales del WAF.  
**Tiempo de respuesta:** < 24 horas.

### S2 – Severidad Media
**Ejemplos:** degradación parcial del servicio, defacement del sitio, actividad anómala no crítica.  
**Tiempo de respuesta:** < 4 horas.

### S1 – Severidad Crítica
**Ejemplos:** fuga confirmada de datos personales (*Data Breach*), compromiso de credenciales administrativas, ransomware, caída total del servicio.  
**Tiempo de respuesta:** inmediata (< 1 hora).

---

## Estrategia Preventiva

- Integración de **SonarQube (SAST)** en el pipeline CI/CD para detectar vulnerabilidades antes del despliegue.
- Implementación de un **WAF perimetral** para mitigar ataques OWASP Top 10 (SQLi, XSS, RFI, bots, etc.).
- Uso obligatorio de HTTPS/TLS 1.3.
- Reglas de firewall y segmentación por zonas (pública, privada, base de datos).
- Monitoreo continuo con alertas en tiempo real (SIEM recomendado).

---

## Ciclo de Vida del IRP
Basado en NIST SP 800-61:

1. **Preparación**  
   Entrenamiento del CSIRT, herramientas, documentación, simulacros.

2. **Detección / Análisis**  
   Identificación de alertas, verificación, clasificación y severidad.

3. **Contención**  
   Aislamiento del ataque, bloqueo de IPs, deshabilitación de accesos, snapshots forenses.

4. **Erradicación**  
   Eliminación de la amenaza: parches, limpieza de archivos maliciosos, rotación de credenciales.

5. **Recuperación**  
   Restauración de servicios, validación de integridad, monitoreo reforzado.

6. **Lecciones Aprendidas**  
   Informe post-mortem, actualización de políticas, mejora de controles.


