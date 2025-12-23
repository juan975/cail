# 12. SEGURIDAD

## Tabla de Contenidos

- [12.1. Visión General](#121-visión-general)
- [12.2. Seguridad de Aplicaciones Web (OWASP Top 10)](#122-seguridad-de-aplicaciones-web-owasp-top-10)
- [12.3. Seguridad de Aplicaciones Móviles (OWASP Mobile Top 10)](#123-seguridad-de-aplicaciones-móviles-owasp-mobile-top-10)
- [12.4. Gestión de Incidentes (IRP)](#124-gestión-de-incidentes-irp)
- [12.5. Ciclo de Vida de los Datos y Privacidad](#125-ciclo-de-vida-de-los-datos-y-privacidad)
- [12.6. Análisis de Amenazas](#126-análisis-de-amenazas)
- [12.7. Métricas de Seguridad y Monitoreo](#127-métricas-de-seguridad-y-monitoreo)
- [12.8. Cumplimiento y Auditoría](#128-cumplimiento-y-auditoría)
- [12.9. Glosario de Términos de Seguridad](#129-glosario-de-términos-de-seguridad)

---

## 12.1. Visión General

La estrategia de seguridad de CAIL adopta un enfoque de **Defensa en Profundidad** que integra controles técnicos, legales y operativos en múltiples capas del sistema. El diseño de seguridad se alinea con los estándares internacionales y el marco regulatorio ecuatoriano para garantizar la protección integral de los datos de candidatos y empresas.

### Marco Normativo y Estándares

| Estándar / Normativa | Aplicación en CAIL |
|---------------------|-------------------|
| LOPDP (Ley Orgánica de Protección de Datos Personales - Ecuador) | Marco legal principal para tratamiento de datos personales |
| OWASP Top 10 (2021) | Controles de seguridad para aplicación web |
| OWASP Mobile Top 10 (2024) | Controles de seguridad para aplicación móvil React Native |
| NIST SP 800-61 Rev. 2 | Gestión y respuesta a incidentes de ciberseguridad |
| ISO/IEC 27001:2022 | Sistema de Gestión de Seguridad de la Información (objetivo de certificación) |
| NIST Cybersecurity Framework | Estructura para identificar, proteger, detectar, responder y recuperar |

### Principios Rectores de Seguridad

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PRINCIPIOS DE SEGURIDAD CAIL                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │  MINIMIZACIÓN    │  │  CONSENTIMIENTO  │  │  MENOR           │          │
│  │  DE DATOS        │  │  INFORMADO       │  │  PRIVILEGIO      │          │
│  │                  │  │                  │  │                  │          │
│  │ Solo datos       │  │ Clickwrap con    │  │ Acceso basado    │          │
│  │ estrictamente    │  │ firma electró-   │  │ en roles         │          │
│  │ necesarios       │  │ nica simple      │  │ (RBAC)           │          │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘          │
│                                                                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │  DEFENSA EN      │  │  DERECHOS        │  │  SEGURIDAD       │          │
│  │  PROFUNDIDAD     │  │  ARCO+           │  │  POR DISEÑO      │          │
│  │                  │  │                  │  │                  │          │
│  │ Múltiples capas  │  │ Acceso, Rectifi- │  │ Integrada desde  │          │
│  │ de protección    │  │ cación, Elimi-   │  │ el desarrollo    │          │
│  │                  │  │ nación, Oposi-   │  │ (DevSecOps)      │          │
│  │                  │  │ ción, Portabi-   │  │                  │          │
│  │                  │  │ lidad            │  │                  │          │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Arquitectura de Seguridad por Capas

La arquitectura de seguridad de CAIL implementa controles en cada capa del sistema, vinculándose directamente con la **Vista de Despliegue (Sección 9)** para garantizar redundancia y resiliencia:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ARQUITECTURA DE SEGURIDAD                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CAPA 1: PERÍMETRO                                                          │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐               │  │
│  │  │ Cloud Armor │    │    WAF      │    │   DDoS      │               │  │
│  │  │  (GCP)      │    │  (WSO2)     │    │ Protection  │               │  │
│  │  └─────────────┘    └─────────────┘    └─────────────┘               │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│  CAPA 2: GATEWAY Y AUTENTICACIÓN   ▼                                        │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐               │  │
│  │  │ WSO2 API    │    │  Firebase   │    │   Rate      │               │  │
│  │  │ Gateway     │◄──►│   Auth      │    │  Limiting   │               │  │
│  │  │ (TLS 1.3)   │    │  (JWT/OAuth)│    │             │               │  │
│  │  └─────────────┘    └─────────────┘    └─────────────┘               │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│  CAPA 3: APLICACIÓN                ▼                                        │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐               │  │
│  │  │  Input      │    │   RBAC      │    │  Security   │               │  │
│  │  │ Validation  │    │  Firestore  │    │  Headers    │               │  │
│  │  │             │    │   Rules     │    │             │               │  │
│  │  └─────────────┘    └─────────────┘    └─────────────┘               │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│  CAPA 4: DATOS                     ▼                                        │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐               │  │
│  │  │ Cifrado     │    │  Backups    │    │  Auditoría  │               │  │
│  │  │ AES-256     │    │ Automáticos │    │   Logs      │               │  │
│  │  │ (en reposo) │    │  (GCP)      │    │             │               │  │
│  │  └─────────────┘    └─────────────┘    └─────────────┘               │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 12.2. Seguridad de Aplicaciones Web (OWASP Top 10)

Esta sección aborda los riesgos específicos de la plataforma web de CAIL, basándose en el estándar OWASP Top 10 (2021). Los controles implementados se integran en el pipeline de CI/CD como parte de la estrategia DevSecOps.

### Controles Perimetrales y de Red

| Control | Implementación | Propósito |
|---------|---------------|-----------|
| WAF (Web Application Firewall) | Cloud Armor + WSO2 | Bloqueo de SQLi, XSS, bots maliciosos |
| Cifrado en Tránsito | TLS 1.3 obligatorio | Protección de datos en movimiento |
| HSTS (HTTP Strict Transport Security) | Header obligatorio | Forzar conexiones HTTPS |
| CSP (Content Security Policy) | Headers configurados | Prevención de inyección de scripts |

### Matriz de Mitigación OWASP Top 10 Web

| # | Riesgo OWASP | Severidad | Control Implementado | Validación |
|---|-------------|-----------|---------------------|------------|
| A01 | Broken Access Control | Alta | Firestore Security Rules + RBAC en WSO2 | Pruebas de penetración trimestrales |
| A02 | Cryptographic Failures | Alta | TLS 1.3 + AES-256 en reposo + Argon2 para passwords | Escaneo de configuración SSL |
| A03 | Injection | Alta | Firestore SDK (consultas parametrizadas) + Validación de inputs | SAST con SonarQube |
| A04 | Insecure Design | Media | Threat modeling en fase de diseño | Revisión de arquitectura |
| A05 | Security Misconfiguration | Media | IaC (Terraform) + Security Headers automatizados | DAST con OWASP ZAP |
| A06 | Vulnerable Components | Media | Dependabot + npm audit en CI/CD | Escaneo semanal de dependencias |
| A07 | Authentication Failures | Alta | Firebase Auth + MFA opcional + Rate limiting | Monitoreo de intentos fallidos |
| A08 | Software and Data Integrity | Media | Firma de releases + Checksums verificados | Pipeline de CI/CD seguro |
| A09 | Security Logging Failures | Media | Cloud Logging + Alertas en tiempo real | Retención de 90 días |
| A10 | SSRF | Baja | Validación de URLs + Allowlist de dominios | Pruebas de seguridad |

### Diagrama de Flujo: Autenticación Web

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              FLUJO DE AUTENTICACIÓN WEB - CAIL                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────┐         ┌──────────┐         ┌──────────┐         ┌────────┐ │
│  │  Usuario │         │   Web    │         │  WSO2    │         │Firebase│ │
│  │  (Web)   │         │   App    │         │ Gateway  │         │  Auth  │ │
│  └────┬─────┘         └────┬─────┘         └────┬─────┘         └───┬────┘ │
│       │                    │                    │                    │      │
│       │  1. Ingresa        │                    │                    │      │
│       │     credenciales   │                    │                    │      │
│       │───────────────────>│                    │                    │      │
│       │                    │                    │                    │      │
│       │                    │  2. Valida formato │                    │      │
│       │                    │     (sanitización) │                    │      │
│       │                    │────────────────────│                    │      │
│       │                    │                    │                    │      │
│       │                    │  3. POST /auth     │                    │      │
│       │                    │     (TLS 1.3)      │                    │      │
│       │                    │───────────────────>│                    │      │
│       │                    │                    │                    │      │
│       │                    │                    │  4. Rate limit     │      │
│       │                    │                    │     check          │      │
│       │                    │                    │────────────────────│      │
│       │                    │                    │                    │      │
│       │                    │                    │  5. Forward auth   │      │
│       │                    │                    │───────────────────>│      │
│       │                    │                    │                    │      │
│       │                    │                    │  6. Verify password│      │
│       │                    │                    │     (Argon2)       │      │
│       │                    │                    │                    │      │
│       │                    │                    │  7. Generate JWT   │      │
│       │                    │                    │<───────────────────│      │
│       │                    │                    │                    │      │
│       │                    │  8. JWT + Refresh  │                    │      │
│       │                    │     Token          │                    │      │
│       │                    │<───────────────────│                    │      │
│       │                    │                    │                    │      │
│       │  9. Sesión         │                    │                    │      │
│       │     establecida    │                    │                    │      │
│       │<───────────────────│                    │                    │      │
│       │                    │                    │                    │      │
│       │                    │  10. Log evento    │                    │      │
│       │                    │      AUTH_SUCCESS  │                    │      │
│       │                    │───────────────────>│ Cloud Logging      │      │
│       │                    │                    │                    │      │
└───────┴────────────────────┴────────────────────┴────────────────────┴──────┘
```

### Ejemplo de Implementación: Validación de Inputs

```javascript
// Módulo de validación de inputs para formularios web
// Ubicación: src/utils/validation.ts

const VALIDATION_RULES = {
  email: {
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    maxLength: 255,
    sanitize: (value) => value.trim().toLowerCase()
  },
  password: {
    minLength: 12,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: true
  },
  cedula: {
    pattern: /^[0-9]{10}$/,
    sanitize: (value) => value.replace(/\D/g, '')
  }
};

function validateInput(fieldName, value) {
  const rules = VALIDATION_RULES[fieldName];
  if (!rules) {
    throw new SecurityError('INVALID_FIELD', 'Campo no reconocido');
  }

  // Sanitización
  let sanitizedValue = value;
  if (rules.sanitize) {
    sanitizedValue = rules.sanitize(value);
  }

  // Validación de longitud
  if (rules.maxLength && sanitizedValue.length > rules.maxLength) {
    throw new ValidationError('MAX_LENGTH_EXCEEDED');
  }

  // Validación de patrón
  if (rules.pattern && !rules.pattern.test(sanitizedValue)) {
    throw new ValidationError('INVALID_FORMAT');
  }

  // Log de auditoría para intentos de inyección detectados
  if (detectInjectionAttempt(value)) {
    logSecurityEvent('INJECTION_ATTEMPT', { field: fieldName, ip: getClientIP() });
    throw new SecurityError('MALICIOUS_INPUT');
  }

  return sanitizedValue;
}

function detectInjectionAttempt(value) {
  const injectionPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,  // XSS
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION)\b)/gi,      // SQLi
    /(\.\.\/)|(\.\.\\)/g                                      // Path traversal
  ];
  
  return injectionPatterns.some(pattern => pattern.test(value));
}
```

### Seguridad en el Ciclo de Desarrollo (CI/CD)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PIPELINE DevSecOps - CAIL WEB                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   COMMIT          BUILD           TEST            DEPLOY          MONITOR   │
│      │               │               │               │               │      │
│      ▼               ▼               ▼               ▼               ▼      │
│  ┌───────┐      ┌───────┐      ┌───────┐      ┌───────┐      ┌───────┐     │
│  │Secret │      │ SAST  │      │ DAST  │      │ Image │      │ SIEM  │     │
│  │Scan   │      │Sonar- │      │ OWASP │      │ Scan  │      │Alerts │     │
│  │(git-  │      │Qube   │      │  ZAP  │      │Trivy  │      │       │     │
│  │secrets│      │       │      │       │      │       │      │       │     │
│  └───┬───┘      └───┬───┘      └───┬───┘      └───┬───┘      └───┬───┘     │
│      │              │              │              │              │          │
│      ▼              ▼              ▼              ▼              ▼          │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                     SECURITY GATE (OBLIGATORIO)                      │  │
│  │                                                                      │  │
│  │   ✓ 0 secretos expuestos                                            │  │
│  │   ✓ 0 vulnerabilidades críticas/altas                               │  │
│  │   ✓ Cobertura de tests > 80%                                        │  │
│  │   ✓ Dependencias actualizadas                                       │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 12.3. Seguridad de Aplicaciones Móviles (OWASP Mobile Top 10)

Esta sección aborda los riesgos específicos de la aplicación móvil React Native de CAIL, diferenciándose de los controles web al enfocarse en amenazas propias del entorno móvil como almacenamiento local, jailbreaking y comunicaciones inseguras.

### Matriz de Mitigación OWASP Mobile Top 10

| # | Riesgo OWASP Mobile | Severidad | Control Específico Móvil | Validación |
|---|---------------------|-----------|-------------------------|------------|
| M1 | Improper Credential Usage | Alta | Keychain (iOS) / EncryptedSharedPreferences (Android) | Test de almacenamiento |
| M2 | Inadequate Supply Chain Security | Media | npm audit + Firma de APK/IPA | Escaneo de dependencias |
| M3 | Insecure Authentication/Authorization | Alta | Firebase Auth + Biometría opcional + Token refresh | Pruebas de autenticación |
| M4 | Insufficient Input/Output Validation | Alta | Validación en cliente + servidor (nunca solo cliente) | Fuzzing de inputs |
| M5 | Insecure Communication | Alta | Certificate Pinning + TLS 1.3 | Análisis de tráfico |
| M6 | Inadequate Privacy Controls | Alta | Minimización de datos + Permisos explícitos | Revisión de permisos |
| M7 | Insufficient Binary Protections | Media | ProGuard (Android) + Bitcode (iOS) + Detección root/jailbreak | Análisis estático de binario |
| M8 | Security Misconfiguration | Media | Configuración segura por defecto + Flags de seguridad | Checklist de configuración |
| M9 | Insecure Data Storage | Alta | Cifrado local + No almacenar datos sensibles | Análisis forense móvil |
| M10 | Insufficient Cryptography | Media | Algoritmos modernos (AES-256-GCM, SHA-256) | Revisión criptográfica |

### Controles Específicos para Entorno Móvil

#### Detección de Dispositivos Comprometidos (Root/Jailbreak)

```javascript
// Módulo de detección de dispositivos comprometidos
// Ubicación: src/security/deviceIntegrity.ts

import { Platform } from 'react-native';
import JailMonkey from 'jail-monkey';

const SECURITY_CHECKS = {
  isRooted: false,
  isDebugMode: false,
  hasHookingFramework: false,
  isTampered: false
};

async function performDeviceIntegrityCheck() {
  try {
    // Verificar root/jailbreak
    SECURITY_CHECKS.isRooted = JailMonkey.isJailBroken();
    
    // Verificar modo debug
    SECURITY_CHECKS.isDebugMode = JailMonkey.isDebuggedMode();
    
    // Verificar frameworks de hooking (Frida, Xposed)
    SECURITY_CHECKS.hasHookingFramework = await detectHookingFrameworks();
    
    // Verificar integridad de la aplicación
    SECURITY_CHECKS.isTampered = await verifyAppSignature();
    
    if (SECURITY_CHECKS.isRooted || SECURITY_CHECKS.hasHookingFramework) {
      // Registrar evento de seguridad
      logSecurityEvent('COMPROMISED_DEVICE', {
        platform: Platform.OS,
        checks: SECURITY_CHECKS
      });
      
      // Limitar funcionalidad sensible
      return {
        status: 'RESTRICTED',
        allowedFeatures: ['VIEW_JOBS', 'VIEW_PROFILE'],
        blockedFeatures: ['APPLY_JOB', 'EDIT_PROFILE', 'UPLOAD_CV']
      };
    }
    
    return { status: 'TRUSTED', allowedFeatures: 'ALL' };
    
  } catch (error) {
    logSecurityEvent('INTEGRITY_CHECK_FAILED', { error: error.message });
    return { status: 'UNKNOWN', allowedFeatures: 'BASIC' };
  }
}

async function detectHookingFrameworks() {
  const suspiciousProcesses = ['frida', 'frida-server', 'xposed'];
  // Implementación específica por plataforma
  return false;
}
```

#### Almacenamiento Seguro de Credenciales

```javascript
// Módulo de almacenamiento seguro
// Ubicación: src/security/secureStorage.ts

import EncryptedStorage from 'react-native-encrypted-storage';
import * as Keychain from 'react-native-keychain';
import { Platform } from 'react-native';

const STORAGE_CONFIG = {
  android: {
    // Usar EncryptedSharedPreferences (Android Keystore)
    securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE
  },
  ios: {
    // Usar Keychain con protección máxima
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY
  }
};

async function storeSecureToken(key, token) {
  try {
    if (Platform.OS === 'ios') {
      await Keychain.setGenericPassword(key, token, {
        accessible: STORAGE_CONFIG.ios.accessible,
        service: 'com.cail.bolsaempleo'
      });
    } else {
      await EncryptedStorage.setItem(key, token);
    }
    
    return true;
  } catch (error) {
    logSecurityEvent('SECURE_STORAGE_ERROR', { 
      operation: 'STORE',
      error: error.message 
    });
    throw new SecurityError('STORAGE_FAILED');
  }
}

async function retrieveSecureToken(key) {
  try {
    if (Platform.OS === 'ios') {
      const credentials = await Keychain.getGenericPassword({
        service: 'com.cail.bolsaempleo'
      });
      return credentials ? credentials.password : null;
    } else {
      return await EncryptedStorage.getItem(key);
    }
  } catch (error) {
    logSecurityEvent('SECURE_STORAGE_ERROR', { 
      operation: 'RETRIEVE',
      error: error.message 
    });
    return null;
  }
}

async function clearSecureStorage() {
  try {
    await Keychain.resetGenericPassword({ service: 'com.cail.bolsaempleo' });
    await EncryptedStorage.clear();
    return true;
  } catch (error) {
    logSecurityEvent('SECURE_STORAGE_ERROR', { 
      operation: 'CLEAR',
      error: error.message 
    });
    return false;
  }
}
```

#### Certificate Pinning

```javascript
// Configuración de Certificate Pinning
// Ubicación: src/security/networkSecurity.ts

const PINNED_CERTIFICATES = {
  'api.cail.ec': {
    sha256: [
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=', // Primary
      'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB='  // Backup
    ]
  },
  'auth.cail.ec': {
    sha256: [
      'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC=',
      'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD='
    ]
  }
};

function configureNetworkSecurity() {
  return {
    trustKit: {
      enforcePinning: true,
      pinnedDomains: PINNED_CERTIFICATES,
      reportUris: ['https://security.cail.ec/pinning-report'],
      includeSubdomains: true
    },
    headers: {
      'X-App-Version': APP_VERSION,
      'X-Device-ID': getSecureDeviceId(),
      'X-Request-Timestamp': Date.now()
    }
  };
}
```

### Diagrama de Flujo: Autenticación Móvil con Biometría

```
┌─────────────────────────────────────────────────────────────────────────────┐
│           FLUJO DE AUTENTICACIÓN MÓVIL CON BIOMETRÍA - CAIL                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐           │
│  │ Usuario  │     │   App    │     │ Keychain/│     │ Firebase │           │
│  │ (Móvil)  │     │  React   │     │ Keystore │     │   Auth   │           │
│  └────┬─────┘     │  Native  │     └────┬─────┘     └────┬─────┘           │
│       │           └────┬─────┘          │                │                  │
│       │                │                │                │                  │
│       │  1. Solicita   │                │                │                  │
│       │     login      │                │                │                  │
│       │───────────────>│                │                │                  │
│       │                │                │                │                  │
│       │                │  2. Verifica   │                │                  │
│       │                │     integridad │                │                  │
│       │                │     dispositivo│                │                  │
│       │                │────────────────│                │                  │
│       │                │                │                │                  │
│       │  3. Prompt     │                │                │                  │
│       │     biométrico │                │                │                  │
│       │<───────────────│                │                │                  │
│       │                │                │                │                  │
│       │  4. FaceID/    │                │                │                  │
│       │     TouchID    │                │                │                  │
│       │───────────────>│                │                │                  │
│       │                │                │                │                  │
│       │                │  5. Obtener    │                │                  │
│       │                │     refresh    │                │                  │
│       │                │     token      │                │                  │
│       │                │───────────────>│                │                  │
│       │                │                │                │                  │
│       │                │  6. Token      │                │                  │
│       │                │     cifrado    │                │                  │
│       │                │<───────────────│                │                  │
│       │                │                │                │                  │
│       │                │  7. Renovar    │                │                  │
│       │                │     sesión     │                │                  │
│       │                │────────────────────────────────>│                  │
│       │                │                │                │                  │
│       │                │  8. Nuevo JWT  │                │                  │
│       │                │<────────────────────────────────│                  │
│       │                │                │                │                  │
│       │  9. Sesión     │                │                │                  │
│       │     activa     │                │                │                  │
│       │<───────────────│                │                │                  │
│       │                │                │                │                  │
└───────┴────────────────┴────────────────┴────────────────┴──────────────────┘
```

### Configuración de Seguridad por Plataforma

| Aspecto | Android | iOS |
|---------|---------|-----|
| Almacenamiento de credenciales | EncryptedSharedPreferences (Keystore) | Keychain Services |
| Protección de binario | ProGuard + R8 | Bitcode + App Thinning |
| Biometría | BiometricPrompt API | LocalAuthentication (FaceID/TouchID) |
| Network Security | network_security_config.xml | App Transport Security (ATS) |
| Certificate Pinning | OkHttp CertificatePinner | TrustKit |
| Detección root/jailbreak | SafetyNet Attestation + RootBeer | DeviceCheck + Jailbreak detection |

---

## 12.4. Gestión de Incidentes (IRP)

El sistema CAIL cuenta con un Plan de Respuesta a Incidentes (IRP) basado en el estándar NIST SP 800-61 Rev. 2 para la gestión efectiva de eventos de ciberseguridad. Este plan se vincula con los atributos de **Disponibilidad** definidos en la **Vista de Calidad (Sección 11)**.

### Estructura del Equipo CSIRT

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EQUIPO CSIRT - CAIL                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                        ┌─────────────────────┐                              │
│                        │   COMITÉ DE CRISIS  │                              │
│                        │                     │                              │
│                        │  • Gerencia General │                              │
│                        │  • Oficial Legal    │                              │
│                        │  • Líder Técnico    │                              │
│                        └──────────┬──────────┘                              │
│                                   │                                         │
│              ┌────────────────────┼────────────────────┐                    │
│              │                    │                    │                    │
│              ▼                    ▼                    ▼                    │
│  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐         │
│  │  LÍDER TÉCNICO    │ │    DESARROLLO     │ │   COMUNICACIÓN    │         │
│  │                   │ │                   │ │                   │         │
│  │ Juan Espinosa     │ │ Sebastián C.      │ │ Gerencia + Legal  │         │
│  │ jcespinosa9@      │ │ Carlos M.         │ │                   │         │
│  │ utpl.edu.ec       │ │ Alex R.           │ │                   │         │
│  │                   │ │                   │ │                   │         │
│  │ Responsabilidades:│ │ Responsabilidades:│ │ Responsabilidades:│         │
│  │ • Coordinación    │ │ • Contención      │ │ • Notificación    │         │
│  │ • Escalamiento    │ │ • Parches         │ │   usuarios        │         │
│  │ • Decisiones      │ │ • Recuperación    │ │ • Notificación    │         │
│  │   técnicas        │ │                   │ │   autoridades     │         │
│  │                   │ │                   │ │ • Comunicados     │         │
│  └───────────────────┘ └───────────────────┘ └───────────────────┘         │
│              │                    │                    │                    │
│              │                    │                    │                    │
│              ▼                    ▼                    ▼                    │
│  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐         │
│  │   SEGURIDAD       │ │   OPERACIONES     │ │   DOCUMENTACIÓN   │         │
│  │                   │ │                   │ │                   │         │
│  │ Erick Gaona       │ │ Dara Van Gijsel   │ │ Todo el equipo    │         │
│  │ eogaona@          │ │                   │ │                   │         │
│  │ utpl.edu.ec       │ │                   │ │                   │         │
│  │                   │ │                   │ │                   │         │
│  │ Responsabilidades:│ │ Responsabilidades:│ │ Responsabilidades:│         │
│  │ • Análisis        │ │ • Monitoreo       │ │ • Registro        │         │
│  │   forense         │ │ • Logs            │ │   de incidentes   │         │
│  │ • Investigación   │ │ • Métricas        │ │ • Lecciones       │         │
│  │ • Pruebas         │ │                   │ │   aprendidas      │         │
│  └───────────────────┘ └───────────────────┘ └───────────────────┘         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Clasificación de Severidad de Incidentes

| Nivel | Severidad | Tiempo de Respuesta | Ejemplos | Notificación |
|-------|-----------|---------------------|----------|--------------|
| S1 | Crítica | < 1 hora | Data breach, compromiso de admin, caída total, ransomware | Inmediata: CSIRT completo + Gerencia + Autoridad LOPDP (72h) |
| S2 | Alta | < 4 horas | Acceso no autorizado parcial, degradación severa, defacement | CSIRT + Gerencia |
| S3 | Media | < 24 horas | Múltiples intentos fallidos de acceso, vulnerabilidad detectada | Líder técnico + Seguridad |
| S4 | Baja | < 72 horas | Escaneos de puertos, intentos de phishing, anomalías menores | Registro y monitoreo |

### Ciclo de Vida de Respuesta a Incidentes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              CICLO DE VIDA DE RESPUESTA A INCIDENTES                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                                                                     │   │
│   │    ┌───────────┐      ┌───────────┐      ┌───────────┐             │   │
│   │    │    1.     │      │    2.     │      │    3.     │             │   │
│   │    │PREPARACIÓN│─────>│ DETECCIÓN │─────>│CONTENCIÓN │             │   │
│   │    │           │      │& ANÁLISIS │      │           │             │   │
│   │    └───────────┘      └───────────┘      └─────┬─────┘             │   │
│   │         ▲                                      │                    │   │
│   │         │                                      ▼                    │   │
│   │    ┌────┴──────┐      ┌───────────┐      ┌───────────┐             │   │
│   │    │    6.     │      │    5.     │      │    4.     │             │   │
│   │    │ LECCIONES │<─────│RECUPERA-  │<─────│ERRADICA-  │             │   │
│   │    │APRENDIDAS │      │   CIÓN    │      │   CIÓN    │             │   │
│   │    └───────────┘      └───────────┘      └───────────┘             │   │
│   │                                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│   DETALLE DE FASES:                                                         │
│                                                                             │
│   1. PREPARACIÓN                                                            │
│      • Políticas y procedimientos actualizados                              │
│      • Herramientas de respuesta configuradas                               │
│      • Capacitación del equipo CSIRT                                        │
│      • Simulacros trimestrales                                              │
│                                                                             │
│   2. DETECCIÓN Y ANÁLISIS                                                   │
│      • Monitoreo 24/7 con Cloud Security Command Center                     │
│      • Análisis de logs y correlación de eventos                            │
│      • Clasificación de severidad                                           │
│      • Determinación de alcance e impacto                                   │
│                                                                             │
│   3. CONTENCIÓN                                                             │
│      • Aislamiento de sistemas afectados                                    │
│      • Bloqueo de cuentas comprometidas                                     │
│      • Revocación de tokens y sesiones                                      │
│      • Preservación de evidencia                                            │
│                                                                             │
│   4. ERRADICACIÓN                                                           │
│      • Eliminación de malware/accesos maliciosos                            │
│      • Parcheo de vulnerabilidades                                          │
│      • Rotación de credenciales                                             │
│      • Hardening adicional                                                  │
│                                                                             │
│   5. RECUPERACIÓN                                                           │
│      • Restauración de sistemas desde backups verificados                   │
│      • Validación de integridad de datos                                    │
│      • Monitoreo intensivo post-incidente                                   │
│      • Restauración gradual de servicios                                    │
│                                                                             │
│   6. LECCIONES APRENDIDAS                                                   │
│      • Reunión post-mortem (< 5 días después)                               │
│      • Documentación del incidente                                          │
│      • Actualización de procedimientos                                      │
│      • Mejora de controles                                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Escenarios de Breach Response

| Escenario | Acciones Inmediatas | Notificaciones | Plazo Legal |
|-----------|---------------------|----------------|-------------|
| Fuga de CVs/datos personales | Aislamiento de DB, revocación de accesos, análisis forense | Usuarios afectados, Autoridad de Protección de Datos | 72 horas (LOPDP) |
| Compromiso de cuenta admin | Revocación de tokens, rotación de secretos, auditoría de accesos | Gerencia, equipo técnico | Inmediato |
| Ransomware | Aislamiento de red, NO pagar rescate, restaurar desde backup | Gerencia, autoridades, usuarios | Inmediato + 72h |
| Defacement web | Restauración desde backup, análisis de vector de ataque | Comunicación pública si es necesario | 24 horas |

---

## 12.5. Ciclo de Vida de los Datos y Privacidad

El tratamiento de datos personales en CAIL se rige por la Ley Orgánica de Protección de Datos Personales (LOPDP) de Ecuador y las mejores prácticas internacionales de privacidad.

### Tipología de Datos Tratados

| Categoría | Tipo de Datos | Base Legal | Finalidad | Retención |
|-----------|--------------|------------|-----------|-----------|
| Identificación | Cédula, nombres, email | Consentimiento explícito | Creación de cuenta, verificación de identidad | Duración de la cuenta + 6 meses |
| Profesional | CV, experiencia, títulos | Consentimiento explícito | Intermediación laboral | Duración de la cuenta |
| Contacto | Teléfono, dirección | Consentimiento explícito | Comunicación con reclutadores | Duración de la cuenta |
| Técnicos | IP, device ID, logs | Interés legítimo | Seguridad, análisis, auditoría | 90 días |
| Datos Prohibidos | Salud, religión, biometría, orientación sexual | NO SE RECOLECTAN | - | - |

### Diagrama de Ciclo de Vida de Datos

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CICLO DE VIDA DE DATOS - CAIL                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    ┌──────────────┐                                                         │
│    │ 1. OBTENCIÓN │                                                         │
│    │              │                                                         │
│    │ • Registro   │                                                         │
│    │ • Clickwrap  │                                                         │
│    │ • Mínimo     │                                                         │
│    │   necesario  │                                                         │
│    └──────┬───────┘                                                         │
│           │                                                                 │
│           ▼                                                                 │
│    ┌──────────────┐      ┌──────────────┐      ┌──────────────┐            │
│    │ 2. PROCESA-  │      │ 3. ALMACENA- │      │ 4. TRANSFEREN│            │
│    │    MIENTO    │─────>│    MIENTO    │─────>│    CIA       │            │
│    │              │      │              │      │              │            │
│    │ • Validación │      │ • Firestore  │      │ • Solo a     │            │
│    │ • Clasificación     │ • Cifrado    │      │   empleadores│            │
│    │                     │   AES-256    │      │   tras       │            │
│    │              │      │ • Backups    │      │   postulación│            │
│    └──────────────┘      └──────────────┘      └──────┬───────┘            │
│                                                       │                     │
│           ┌───────────────────────────────────────────┘                     │
│           │                                                                 │
│           ▼                                                                 │
│    ┌──────────────┐      ┌──────────────┐      ┌──────────────┐            │
│    │ 5. USO       │      │ 6. ARCHIVO   │      │ 7. ELIMINACIÓN            │
│    │              │─────>│              │─────>│              │            │
│    │ • Matching   │      │ • Datos      │      │ • Solicitud  │            │
│    │   candidato- │      │   inactivos  │      │   del usuario│            │
│    │   vacante    │      │   (24 meses) │      │ • Inactividad│            │
│    │ • Comunica-  │      │              │      │   prolongada │            │
│    │   ciones     │      │              │      │ • Borrado    │            │
│    │              │      │              │      │   seguro     │            │
│    └──────────────┘      └──────────────┘      └──────────────┘            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Políticas de Retención y Eliminación

| Tipo de Dato | Período de Retención | Trigger de Eliminación | Método de Eliminación |
|--------------|---------------------|------------------------|----------------------|
| Cuenta de usuario | Mientras esté activa | Solicitud del usuario o 24 meses inactivo | Borrado lógico + físico (30 días) |
| CVs y documentos | Mientras la cuenta esté activa | Con la cuenta | Borrado de Storage + Firestore |
| Postulaciones | 12 meses después del cierre | Automático | Anonimización para estadísticas |
| Logs de seguridad | 90 días | Automático (Cloud Logging) | Eliminación automática |
| Logs de auditoría | 1 año | Automático | Archivo frío + eliminación |
| Backups | 30 días | Rotación automática | Sobrescritura segura |

### Derechos ARCO+ y Canales de Ejercicio

| Derecho | Descripción | Canal | Tiempo de Respuesta |
|---------|-------------|-------|---------------------|
| Acceso | Obtener copia de datos personales | App / Email: privacidad@cail.ec | 15 días hábiles |
| Rectificación | Corregir datos inexactos | App (autoservicio) | Inmediato |
| Cancelación/Eliminación | Solicitar borrado de datos | App / Email | 15 días hábiles |
| Oposición | Oponerse a tratamiento específico | Email: privacidad@cail.ec | 15 días hábiles |
| Portabilidad | Exportar datos en formato estructurado | App (descarga JSON) | 15 días hábiles |

---

## 12.6. Análisis de Amenazas

Esta sección presenta un análisis detallado de amenazas basado en los estándares OWASP Top 10 y OWASP Mobile Top 10, con clasificación de riesgos, evaluación de impacto y mitigaciones específicas para el contexto de CAIL.

### Metodología de Evaluación de Riesgos

La evaluación de riesgos sigue la metodología OWASP Risk Rating:

**Riesgo = Probabilidad × Impacto**

| Factor | Bajo (1) | Medio (2) | Alto (3) |
|--------|----------|-----------|----------|
| **Probabilidad** | Requiere conocimiento especializado y acceso interno | Exploitable con herramientas comunes | Fácilmente exploitable, automatizable |
| **Impacto Técnico** | Afecta componente menor | Compromete funcionalidad significativa | Compromiso total del sistema o datos |
| **Impacto de Negocio** | Molestia menor a usuarios | Pérdida de confianza, daño reputacional moderado | Violación legal, multas, pérdida masiva de usuarios |

### Matriz de Análisis de Amenazas Web (OWASP Top 10)

| ID | Amenaza | Probabilidad | Impacto | Riesgo | Vector de Ataque | Mitigación Específica CAIL |
|----|---------|--------------|---------|--------|------------------|---------------------------|
| W01 | Broken Access Control | Media (2) | Alto (3) | **Alto (6)** | Manipulación de parámetros para acceder a ofertas/CVs de otros | Firestore Security Rules con validación de UID en cada documento; RBAC en WSO2 Gateway |
| W02 | Cryptographic Failures | Baja (1) | Alto (3) | **Medio (3)** | Intercepción de tráfico, acceso a backups no cifrados | TLS 1.3 obligatorio; AES-256-GCM en reposo; Argon2id para passwords con salt único |
| W03 | Injection (NoSQL) | Media (2) | Alto (3) | **Alto (6)** | Inyección en campos de búsqueda de vacantes | SDK Firestore con consultas parametrizadas; validación de inputs con allowlist |
| W04 | Insecure Design | Media (2) | Medio (2) | **Medio (4)** | Falta de límites en postulaciones, spam de ofertas | Rate limiting por usuario; límite de 10 postulaciones/día; verificación de empresas |
| W05 | Security Misconfiguration | Media (2) | Medio (2) | **Medio (4)** | Headers faltantes, CORS permisivo, debug habilitado | Checklist de seguridad en deploy; CSP, HSTS, X-Frame-Options configurados; debug deshabilitado en producción |
| W06 | Vulnerable Components | Alta (3) | Medio (2) | **Alto (6)** | Exploits en dependencias npm desactualizadas | npm audit en CI/CD; Dependabot activo; actualización mensual de dependencias |
| W07 | Authentication Failures | Media (2) | Alto (3) | **Alto (6)** | Brute force, credential stuffing, session hijacking | Firebase Auth con rate limiting; MFA opcional; tokens JWT con expiración corta (1h) |
| W08 | Data Integrity Failures | Baja (1) | Medio (2) | **Bajo (2)** | Manipulación de CVs subidos, código malicioso | Validación de tipos de archivo; escaneo de malware en uploads; firma de releases |
| W09 | Logging Failures | Media (2) | Medio (2) | **Medio (4)** | Incapacidad de detectar o investigar brechas | Cloud Logging centralizado; alertas en tiempo real; retención de 90 días |
| W10 | SSRF | Baja (1) | Medio (2) | **Bajo (2)** | Manipulación de URLs para acceso interno | Validación estricta de URLs; allowlist de dominios externos (Registro Civil, Senescyt) |

### Matriz de Análisis de Amenazas Móvil (OWASP Mobile Top 10)

| ID | Amenaza | Probabilidad | Impacto | Riesgo | Vector de Ataque | Mitigación Específica CAIL |
|----|---------|--------------|---------|--------|------------------|---------------------------|
| M01 | Improper Credential Usage | Media (2) | Alto (3) | **Alto (6)** | Extracción de tokens de almacenamiento inseguro | Keychain (iOS) / EncryptedSharedPreferences (Android); tokens nunca en SharedPreferences plano |
| M02 | Inadequate Supply Chain | Media (2) | Medio (2) | **Medio (4)** | Dependencias npm maliciosas en React Native | npm audit; lockfile; solo dependencias verificadas; revisión de nuevas dependencias |
| M03 | Insecure Auth/Authz | Media (2) | Alto (3) | **Alto (6)** | Bypass de autenticación local, tokens persistentes | Verificación de token en cada request; biometría + refresh token; expiración de sesión inactiva (30 min) |
| M04 | Insufficient Input Validation | Alta (3) | Medio (2) | **Alto (6)** | Inyección vía campos del formulario de CV | Validación en cliente Y servidor; sanitización de HTML/scripts; límites de longitud |
| M05 | Insecure Communication | Baja (1) | Alto (3) | **Medio (3)** | Man-in-the-Middle en redes WiFi públicas | Certificate Pinning; TLS 1.3; detección de proxy/interceptación |
| M06 | Inadequate Privacy Controls | Media (2) | Alto (3) | **Alto (6)** | Recolección excesiva de datos, permisos innecesarios | Permisos mínimos (solo cámara para foto, storage para CV); sin acceso a contactos/ubicación |
| M07 | Insufficient Binary Protection | Media (2) | Bajo (1) | **Bajo (2)** | Reversing del APK para extraer lógica/secretos | ProGuard/R8; no secrets en código; detección de tampering |
| M08 | Security Misconfiguration | Media (2) | Medio (2) | **Medio (4)** | Debuggable habilitado, logs verbosos en producción | Build variants separados; logs deshabilitados en release; network_security_config.xml configurado |
| M09 | Insecure Data Storage | Alta (3) | Alto (3) | **Crítico (9)** | Acceso a datos en dispositivo rooteado/jailbroken | Detección de root/jailbreak; restricción de funcionalidad; cifrado local adicional |
| M10 | Insufficient Cryptography | Baja (1) | Alto (3) | **Medio (3)** | Uso de algoritmos débiles, claves predecibles | Solo AES-256-GCM, SHA-256+; claves generadas con SecureRandom; no MD5/SHA1 |

### Mapa de Calor de Riesgos

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MAPA DE CALOR DE RIESGOS                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│         │                    IMPACTO                                        │
│         │     Bajo (1)      Medio (2)      Alto (3)                        │
│   P     │                                                                   │
│   R   ──┼───────────────────────────────────────────                        │
│   O     │                                                                   │
│   B   3 │    ░░░░░░░       ▓▓▓▓▓▓▓▓      ████████                          │
│   A     │    (Medio)       M04, W06       M09                              │
│   B     │                  (Alto)         (Crítico)                         │
│   I     │                                                                   │
│   L   ──┼───────────────────────────────────────────                        │
│   I     │                                                                   │
│   D   2 │    ░░░░░░░       ▓▓▓▓▓▓▓▓      ████████                          │
│   A     │    W08, M07      W04, W05,      W01, W03,                        │
│   D     │    (Bajo)        W09, M02,      W07, M01,                        │
│         │                  M08 (Medio)    M03, M06                          │
│         │                                 (Alto)                            │
│       ──┼───────────────────────────────────────────                        │
│         │                                                                   │
│       1 │    ░░░░░░░       ░░░░░░░        ▓▓▓▓▓▓▓▓                          │
│         │    W10           W08            W02, M05,                         │
│         │    (Bajo)        (Bajo)         M10 (Medio)                       │
│         │                                                                   │
│       ──┴───────────────────────────────────────────                        │
│                                                                             │
│   LEYENDA:  ░░░ Bajo   ▓▓▓ Medio   ███ Alto/Crítico                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Plan de Tratamiento de Riesgos Prioritarios

| Prioridad | Riesgo | Acción | Responsable | Plazo | Estado |
|-----------|--------|--------|-------------|-------|--------|
| 1 | M09 - Insecure Data Storage | Implementar detección root/jailbreak con restricción de funcionalidad | Desarrollo móvil | Sprint 3 | Pendiente |
| 2 | W01/M01 - Access Control / Credentials | Auditoría de Firestore Rules + migración a almacenamiento seguro | Seguridad + Backend | Sprint 2 | En progreso |
| 3 | W03 - NoSQL Injection | Implementar capa de validación centralizada | Backend | Sprint 2 | En progreso |
| 4 | W06 - Vulnerable Components | Configurar Dependabot + política de actualización | DevOps | Sprint 1 | Completado |
| 5 | W07/M03 - Authentication | Implementar MFA opcional + refresh token rotation | Backend + Móvil | Sprint 4 | Pendiente |

---

## 12.7. Métricas de Seguridad y Monitoreo

Esta sección define los KPIs de seguridad, herramientas de monitoreo y procesos de medición continua para garantizar la efectividad de los controles de seguridad en CAIL.

### KPIs de Seguridad

| Categoría | KPI | Meta | Frecuencia de Medición | Herramienta |
|-----------|-----|------|------------------------|-------------|
| **Vulnerabilidades** | Tasa de detección SAST | > 95% de issues críticos/altos detectados antes de producción | Por commit | SonarQube |
| **Vulnerabilidades** | Tiempo medio de remediación (MTTR) | < 7 días para críticas, < 30 días para altas | Semanal | Jira + SonarQube |
| **Vulnerabilidades** | Vulnerabilidades abiertas en producción | 0 críticas, < 3 altas | Diario | Security Command Center |
| **Dependencias** | % de dependencias actualizadas | > 90% en versiones sin CVEs conocidos | Semanal | Dependabot |
| **Autenticación** | Tasa de intentos de login fallidos | < 5% del total (alerta si > 10%) | Diario | Firebase Auth + Cloud Monitoring |
| **Autenticación** | Detección de credential stuffing | 100% de ataques detectados y bloqueados | Tiempo real | WAF + Rate limiting |
| **Incidentes** | Tiempo medio de detección (MTTD) | < 15 minutos para S1, < 1 hora para S2 | Por incidente | Cloud Security Command Center |
| **Incidentes** | Tiempo medio de respuesta (MTTR) | < 1 hora para S1, < 4 horas para S2 | Por incidente | Sistema de tickets |
| **Cumplimiento** | Solicitudes ARCO+ atendidas en plazo | 100% dentro de 15 días hábiles | Mensual | Sistema interno |
| **Auditoría** | Cobertura de logs de seguridad | 100% de eventos críticos registrados | Mensual | Cloud Logging |

### Arquitectura de Monitoreo de Seguridad

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   ARQUITECTURA DE MONITOREO DE SEGURIDAD                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  FUENTES DE DATOS                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                     │    │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐        │    │
│  │  │ Firebase  │  │   WSO2    │  │  Cloud    │  │   App     │        │    │
│  │  │   Auth    │  │  Gateway  │  │ Functions │  │   Logs    │        │    │
│  │  │   Logs    │  │   Logs    │  │   Logs    │  │           │        │    │
│  │  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘        │    │
│  │        │              │              │              │               │    │
│  └────────┼──────────────┼──────────────┼──────────────┼───────────────┘    │
│           │              │              │              │                     │
│           └──────────────┴──────────────┴──────────────┘                     │
│                                    │                                         │
│                                    ▼                                         │
│  AGREGACIÓN Y PROCESAMIENTO                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                     │    │
│  │  ┌───────────────────────────────────────────────────────────────┐  │    │
│  │  │                    CLOUD LOGGING                               │  │    │
│  │  │                                                                │  │    │
│  │  │  • Agregación centralizada de logs                            │  │    │
│  │  │  • Retención configurable (90 días para seguridad)            │  │    │
│  │  │  • Filtros y alertas basados en patrones                      │  │    │
│  │  │                                                                │  │    │
│  │  └───────────────────────────────────────────────────────────────┘  │    │
│  │                              │                                      │    │
│  │                              ▼                                      │    │
│  │  ┌───────────────────────────────────────────────────────────────┐  │    │
│  │  │              SECURITY COMMAND CENTER (GCP)                     │  │    │
│  │  │                                                                │  │    │
│  │  │  • Detección de amenazas en tiempo real                       │  │    │
│  │  │  • Análisis de vulnerabilidades                               │  │    │
│  │  │  • Compliance monitoring                                       │  │    │
│  │  │  • Asset inventory                                             │  │    │
│  │  │                                                                │  │    │
│  │  └───────────────────────────────────────────────────────────────┘  │    │
│  │                                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ALERTAS Y RESPUESTA                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                     │    │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐        │    │
│  │  │   Slack   │  │   Email   │  │  PagerDuty│  │  Jira     │        │    │
│  │  │  (S3-S4)  │  │  (S2-S4)  │  │   (S1)    │  │ (Tickets) │        │    │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘        │    │
│  │                                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Reglas de Alertas de Seguridad

| ID | Evento | Condición | Severidad | Acción Automática | Notificación |
|----|--------|-----------|-----------|-------------------|--------------|
| SEC-001 | Login failures | > 5 intentos fallidos en 5 min desde misma IP | Media | Rate limit IP (15 min) | Slack #security |
| SEC-002 | Credential stuffing | > 20 intentos fallidos en 1 min (diferentes usuarios) | Alta | Bloqueo temporal + CAPTCHA | PagerDuty + Email |
| SEC-003 | Privilege escalation attempt | Request a recurso no autorizado | Alta | Log + bloqueo de sesión | PagerDuty |
| SEC-004 | Anomalía de acceso | Login desde ubicación/dispositivo inusual | Media | Verificación adicional | Email usuario + Slack |
| SEC-005 | Data exfiltration | Descarga masiva de datos (> umbral normal) | Crítica | Suspensión de cuenta | PagerDuty + Gerencia |
| SEC-006 | SQL/NoSQL Injection attempt | Patrón de inyección detectado | Alta | Request bloqueado + log | Slack #security |
| SEC-007 | Certificate pinning failure | Fallo de validación de certificado | Alta | Bloqueo de conexión | Log + investigación |
| SEC-008 | Root/Jailbreak detection | Dispositivo comprometido detectado | Media | Restricción de funcionalidad | Log |

### Dashboard de Seguridad

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DASHBOARD DE SEGURIDAD - CAIL                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │ VULNERABILIDADES│  │   INCIDENTES    │  │   AUTENTICACIÓN │             │
│  │                 │  │                 │  │                 │             │
│  │  Críticas:  0   │  │  S1 (24h):  0   │  │  Logins OK: 98% │             │
│  │  Altas:     2   │  │  S2 (24h):  0   │  │  Fallidos:  2%  │             │
│  │  Medias:   12   │  │  S3 (7d):   3   │  │  MFA activo: 45%│             │
│  │                 │  │                 │  │                 │             │
│  │  [████████░░]   │  │  MTTR: 2.5h     │  │  Bloqueos: 12   │             │
│  │  MTTR: 5 días   │  │                 │  │                 │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ TENDENCIA DE EVENTOS DE SEGURIDAD (ÚLTIMOS 30 DÍAS)                 │   │
│  │                                                                     │   │
│  │  50│                                                                │   │
│  │    │    *                                                           │   │
│  │  40│   * *                                                          │   │
│  │    │  *   *                                                         │   │
│  │  30│ *     *    *                                                   │   │
│  │    │*       *  * *                                                  │   │
│  │  20│         **   *  *                                              │   │
│  │    │              * ** *                                            │   │
│  │  10│                   * * *  *                                     │   │
│  │    │                        ** **  *  *  *                          │   │
│  │   0└────────────────────────────────────────────────────────────    │   │
│  │    Sem1    Sem2    Sem3    Sem4                                     │   │
│  │                                                                     │   │
│  │  ─── Login failures   ─── Injection attempts   ─── Anomalías       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │  DEPENDENCIAS   │  │   COMPLIANCE    │  │  ÚLTIMA AUDIT.  │             │
│  │                 │  │                 │  │                 │             │
│  │  Actualizadas:  │  │  ARCO+ (mes):   │  │  Fecha:         │             │
│  │   92%           │  │   12/12 ✓       │  │  15-Dic-2025    │             │
│  │                 │  │                 │  │                 │             │
│  │  Con CVEs: 3    │  │  Logs: 100%     │  │  Hallazgos: 2   │             │
│  │  (no críticos)  │  │  Backups: OK    │  │  (resueltos)    │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 12.8. Cumplimiento y Auditoría

Esta sección establece el marco de cumplimiento normativo y el programa de auditorías para garantizar la adhesión continua a los estándares de seguridad y privacidad.

### Marco de Cumplimiento

| Normativa/Estándar | Requisitos Aplicables | Estado de Cumplimiento | Próxima Revisión |
|-------------------|----------------------|------------------------|------------------|
| LOPDP (Ecuador) | Tratamiento lícito, derechos ARCO+, notificación de brechas | Cumpliendo | Trimestral |
| ISO 27001:2022 | SGSI, análisis de riesgos, controles de seguridad | En implementación | Certificación Q2 2026 |
| OWASP ASVS L2 | Controles de seguridad de aplicaciones | Cumpliendo parcialmente | Semestral |
| PCI DSS (si aplica) | N/A - No se procesan pagos directamente | No aplicable | - |

### Programa de Auditorías

| Tipo de Auditoría | Alcance | Frecuencia | Ejecutor | Entregable |
|-------------------|---------|------------|----------|------------|
| Auditoría interna de seguridad | Revisión de controles, políticas y procedimientos | Trimestral | Equipo de Seguridad (Erick Gaona) | Informe interno |
| Pruebas de penetración | Aplicación web y móvil, APIs | Semestral | Proveedor externo certificado | Informe de pentest + remediación |
| Revisión de código seguro | Nuevas funcionalidades críticas | Por release mayor | Equipo de desarrollo + Seguridad | Code review report |
| Auditoría de cumplimiento LOPDP | Tratamiento de datos, consentimientos, derechos | Anual | Oficial de Protección de Datos | Informe de cumplimiento |
| Simulacro de respuesta a incidentes | Capacidad de respuesta del CSIRT | Trimestral | Líder técnico | Informe de simulacro |
| Auditoría externa ISO 27001 | SGSI completo | Anual (pre-certificación) | Organismo certificador | Certificación / hallazgos |

### Roadmap de Certificación ISO 27001

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ROADMAP CERTIFICACIÓN ISO 27001                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Q1 2026          Q2 2026          Q3 2026          Q4 2026                │
│     │                │                │                │                    │
│     ▼                ▼                ▼                ▼                    │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │  FASE 1  │───>│  FASE 2  │───>│  FASE 3  │───>│  FASE 4  │              │
│  │          │    │          │    │          │    │          │              │
│  │ Gap      │    │ Implemen-│    │ Auditoría│    │ Certifi- │              │
│  │ Analysis │    │ tación   │    │ Interna  │    │ cación   │              │
│  │          │    │          │    │          │    │          │              │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘              │
│                                                                             │
│  ENTREGABLES:                                                               │
│                                                                             │
│  Fase 1:                                                                    │
│  • Análisis de brechas contra ISO 27001                                    │
│  • Alcance del SGSI definido                                               │
│  • Plan de implementación                                                  │
│                                                                             │
│  Fase 2:                                                                    │
│  • Políticas y procedimientos documentados                                 │
│  • Controles del Anexo A implementados                                     │
│  • Capacitación del personal                                               │
│  • Herramientas de monitoreo configuradas                                  │
│                                                                             │
│  Fase 3:                                                                    │
│  • Auditoría interna completa                                              │
│  • Revisión por la dirección                                               │
│  • Acciones correctivas implementadas                                      │
│                                                                             │
│  Fase 4:                                                                    │
│  • Auditoría de certificación (Etapa 1 y 2)                               │
│  • Certificado ISO 27001:2022                                              │
│  • Plan de mejora continua                                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Checklist de Auditoría de Seguridad

| # | Control | Evidencia Requerida | Frecuencia | Responsable |
|---|---------|---------------------|------------|-------------|
| 1 | Gestión de accesos | Lista de usuarios activos, permisos asignados, revisión de accesos | Mensual | Admin |
| 2 | Gestión de vulnerabilidades | Reportes de SonarQube, estado de CVEs, plan de remediación | Semanal | Seguridad |
| 3 | Respaldos y recuperación | Logs de backup, prueba de restauración exitosa | Mensual | Operaciones |
| 4 | Monitoreo de seguridad | Dashboard de alertas, tiempo de respuesta a incidentes | Continuo | Seguridad |
| 5 | Gestión de incidentes | Registro de incidentes, tiempos de respuesta, lecciones aprendidas | Por incidente | CSIRT |
| 6 | Concienciación | Registros de capacitación, resultados de simulacros de phishing | Trimestral | RRHH + Seguridad |
| 7 | Gestión de terceros | Acuerdos de confidencialidad, evaluación de proveedores | Anual | Legal + Seguridad |
| 8 | Cumplimiento LOPDP | Registro de tratamientos, consentimientos, solicitudes ARCO+ | Mensual | DPO |

---

## 12.9. Glosario de Términos de Seguridad

| Término | Definición |
|---------|------------|
| **AES-256** | Advanced Encryption Standard con clave de 256 bits. Algoritmo de cifrado simétrico utilizado para proteger datos en reposo. |
| **Argon2** | Algoritmo de hashing de contraseñas ganador de la Password Hashing Competition (2015). Resistente a ataques de GPU y ASIC. |
| **ARCO+** | Derechos de Acceso, Rectificación, Cancelación, Oposición y Portabilidad establecidos por la LOPDP de Ecuador. |
| **Certificate Pinning** | Técnica de seguridad que asocia un host con su certificado esperado, previniendo ataques Man-in-the-Middle. |
| **CI/CD** | Continuous Integration / Continuous Deployment. Práctica de desarrollo que automatiza la integración y despliegue de código. |
| **Clickwrap** | Mecanismo de consentimiento donde el usuario acepta términos marcando una casilla o haciendo clic en un botón. |
| **CSP** | Content Security Policy. Header HTTP que previene ataques XSS especificando fuentes válidas de contenido. |
| **CSIRT** | Computer Security Incident Response Team. Equipo responsable de gestionar incidentes de ciberseguridad. |
| **DAST** | Dynamic Application Security Testing. Pruebas de seguridad que analizan la aplicación en ejecución. |
| **DDoS** | Distributed Denial of Service. Ataque que intenta hacer un servicio no disponible mediante sobrecarga de tráfico. |
| **DevSecOps** | Integración de prácticas de seguridad en el ciclo de vida de desarrollo de software (CI/CD). |
| **EncryptedSharedPreferences** | API de Android para almacenamiento seguro de datos sensibles usando el Android Keystore. |
| **Firestore Security Rules** | Reglas de control de acceso basadas en expresiones que protegen datos en Cloud Firestore. |
| **HSTS** | HTTP Strict Transport Security. Header que fuerza conexiones HTTPS, previniendo downgrade attacks. |
| **IRP** | Incident Response Plan. Documento que define procedimientos para gestionar incidentes de seguridad. |
| **Jailbreak** | Proceso de eliminar restricciones de software impuestas por Apple en dispositivos iOS. |
| **JWT** | JSON Web Token. Estándar para transmisión segura de información entre partes como objeto JSON. |
| **Keychain** | API de Apple para almacenamiento seguro de información sensible (contraseñas, tokens, certificados). |
| **LOPDP** | Ley Orgánica de Protección de Datos Personales de Ecuador (2021). |
| **MFA** | Multi-Factor Authentication. Autenticación que requiere dos o más factores de verificación. |
| **MTTD** | Mean Time to Detect. Tiempo promedio para detectar un incidente de seguridad. |
| **MTTR** | Mean Time to Remediate/Respond. Tiempo promedio para remediar vulnerabilidades o responder a incidentes. |
| **NIST** | National Institute of Standards and Technology. Organización que publica estándares de ciberseguridad. |
| **OAuth 2.0** | Protocolo de autorización que permite acceso limitado a recursos de usuario sin exponer credenciales. |
| **OWASP** | Open Web Application Security Project. Comunidad que produce metodologías y herramientas de seguridad. |
| **ProGuard** | Herramienta de ofuscación y optimización de código para aplicaciones Android. |
| **RBAC** | Role-Based Access Control. Modelo de control de acceso basado en roles asignados a usuarios. |
| **Root** | Proceso de obtener acceso privilegiado (superusuario) en dispositivos Android. |
| **SAST** | Static Application Security Testing. Análisis de código fuente para detectar vulnerabilidades. |
| **SGSI** | Sistema de Gestión de Seguridad de la Información (ISO 27001). |
| **SLO** | Service Level Objective. Objetivo medible de rendimiento de un servicio. |
| **SQLi** | SQL Injection. Técnica de ataque que inserta código SQL malicioso en consultas de base de datos. |
| **SSRF** | Server-Side Request Forgery. Ataque que induce al servidor a realizar solicitudes a recursos internos. |
| **TLS 1.3** | Transport Layer Security versión 1.3. Protocolo criptográfico para comunicaciones seguras. |
| **WAF** | Web Application Firewall. Firewall que protege aplicaciones web filtrando tráfico HTTP malicioso. |
| **XSS** | Cross-Site Scripting. Ataque que inyecta scripts maliciosos en páginas web vistas por otros usuarios. |

---

## Referencias

- [REF1] OWASP Top 10 (2021): https://owasp.org/Top10/
- [REF2] OWASP Mobile Top 10 (2024): https://owasp.org/www-project-mobile-top-10/
- [REF3] NIST SP 800-61 Rev. 2 - Computer Security Incident Handling Guide
- [REF4] ISO/IEC 27001:2022 - Information Security Management Systems
- [REF5] Ley Orgánica de Protección de Datos Personales (LOPDP) - Ecuador
- [REF6] Firebase Security Documentation: https://firebase.google.com/docs/security
- [REF7] React Native Security Best Practices: https://reactnative.dev/docs/security

---

**Documento elaborado por:** Erick Gaona - Test and Security  
**Fecha:** Diciembre 2025  
**Versión:** 2.0  
**Estado:** Vigente

