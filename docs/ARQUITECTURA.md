# Arquitectura del Software — MomsAI

**Fecha:** 31 de mayo de 2026  
**Version:** 1.0.0  
**Estado actual:** Frontend completo con almacenamiento local  
**Estado objetivo:** App completa con Supabase + IA

---

## 1. Vision General

MomsAI es una aplicacion movil hibrida (React Native + Expo) que acompana a mujeres embarazadas y madres recientes. La arquitectura esta diseñada en capas para permitir la migracion gradual de almacenamiento local (AsyncStorage) a una base de datos real (Supabase) sin reescribir la logica de negocio.

---

## 2. Diagrama de Capas — Estado Actual

```
┌─────────────────────────────────────────────────────────────────┐
│                        CAPA DE PRESENTACION                     │
│                        (React Native + Expo)                    │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │  Menu    │ │Calendario│ │  Perfil  │ │Configurar│          │
│  │  (Home)  │ │          │ │          │ │  cion    │          │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘          │
│       │             │            │             │                │
│  ┌────┴─────┐ ┌─────┴────┐ ┌────┴─────┐ ┌────┴─────┐          │
│  │ Perfil   │ │ EventForm│ │ Perfil   │ │Recorda-  │          │
│  │  Mama    │ │          │ │  Hijo    │ │  torios  │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                 │
│  ┌──────────────────────────────────────────────┐              │
│  │           Componentes Reutilizables          │              │
│  │  Avatar │ Header │ Footer │ EvolutionChart   │              │
│  │  ScreenLayout │ DraggableFab │ Calculadoras  │              │
│  └──────────────────────────────────────────────┘              │
│                                                                 │
│  ┌──────────────────────────────────────────────┐              │
│  │              Contexts (Estado Global)        │              │
│  │  AuthContext │ ThemeContext │ EtapaContext    │              │
│  └──────────────────────────────────────────────┘              │
├─────────────────────────────────────────────────────────────────┤
│                        CAPA DE SERVICIOS                        │
│                     (Logica de Negocio)                         │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │  auth    │ │biometric │ │ calendar │ │  baby    │          │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │          │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘          │
│       │             │            │             │                │
│  ┌────┴─────┐ ┌─────┴────┐ ┌────┴─────┐ ┌────┴─────┐          │
│  │  alert   │ │  data    │ │ notifica-│ │  mock    │          │
│  │ Service  │ │ Service  │ │  tion    │ │ Service  │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
├─────────────────────────────────────────────────────────────────┤
│                     CAPA DE ABSTRACCION                         │
│                  (dataService.js — Switch)                      │
│                                                                 │
│         ┌─────────────────────────────────────┐                │
│         │  DATA_PROVIDER = 'asyncstorage'     │                │
│         │  DATA_PROVIDER = 'supabase'  (futuro)│               │
│         └──────────────┬──────────────────────┘                │
│                        │                                        │
├────────────────────────┼────────────────────────────────────────┤
│                        ▼                                        │
│                   CAPA DE DATOS                                 │
│               (Almacenamiento Local)                            │
│                                                                 │
│         ┌─────────────────────────────────────┐                │
│         │         AsyncStorage                │                │
│         │                                     │                │
│         │  @manualdelbebe_session             │                │
│         │  @manualdelbebe_profile             │                │
│         │  @manualdelbebe_theme               │                │
│         │  @biometric_data_YYYY-MM-DD         │                │
│         │  @baby_data_YYYY-MM-DD              │                │
│         │  @baby_profile                      │                │
│         │  @calendar_events                   │                │
│         │  @reminders_config                  │                │
│         └─────────────────────────────────────┘                │
│                                                                 │
│  ┌─────────────────────────────────────┐                       │
│  │     expo-notifications (Local)      │                       │
│  │  Notificaciones push en dispositivo │                       │
│  └─────────────────────────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Diagrama de Capas — Estado Objetivo (con Supabase)

```
┌─────────────────────────────────────────────────────────────────┐
│                        CAPA DE PRESENTACION                     │
│                     (Misma que el estado actual)                │
│                                                                 │
│  Screens │ Components │ Contexts │ Navigation                  │
├─────────────────────────────────────────────────────────────────┤
│                        CAPA DE SERVICIOS                        │
│              (Mismos servicios, diferente backend)              │
│                                                                 │
│  auth │ biometric │ calendar │ baby │ notification │ alert     │
├─────────────────────────────────────────────────────────────────┤
│                     CAPA DE ABSTRACCION                         │
│                  (dataService.js — Switch)                      │
│                                                                 │
│         ┌─────────────────────────────────────┐                │
│         │    DATA_PROVIDER = 'supabase'       │                │
│         └──────────────┬──────────────────────┘                │
│                        │                                        │
├────────────────────────┼────────────────────────────────────────┤
│                        ▼                                        │
│              CAPA DE INFRAESTRUCTURA                            │
│                                                                 │
│  ┌─────────────────────┐    ┌──────────────────────┐           │
│  │   supabaseClient    │    │  supabase/auth       │           │
│  │   (REST API)        │    │  (Autenticacion)     │           │
│  └──────────┬──────────┘    └──────────┬───────────┘           │
│             │                          │                        │
├─────────────┼──────────────────────────┼────────────────────────┤
│             ▼                          ▼                        │
│                   CAPA DE DATOS                                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────┐       │
│  │                   SUPABASE (PostgreSQL)              │       │
│  │                                                     │       │
│  │  ┌──────────┐ ┌──────────────┐ ┌──────────────┐    │       │
│  │  │ usuario  │ │perfil_madre  │ │biometria_    │    │       │
│  │  │          │ │              │ │madre         │    │       │
│  │  └──────────┘ └──────────────┘ └──────────────┘    │       │
│  │                                                     │       │
│  │  ┌──────────┐ ┌──────────────┐ ┌──────────────┐    │       │
│  │  │perfil_   │ │metricas_     │ │registro_     │    │       │
│  │  │bebe      │ │bebe          │ │tarea         │    │       │
│  │  └──────────┘ └──────────────┘ └──────────────┘    │       │
│  │                                                     │       │
│  │  ┌──────────────────────┐                           │       │
│  │  │recordatorios_config  │                           │       │
│  │  └──────────────────────┘                           │       │
│  │                                                     │       │
│  │  ┌─────────────────────────────────────────────┐    │       │
│  │  │         Row Level Security (RLS)            │    │       │
│  │  │  Cada usuaria solo ve/edita sus propios     │    │       │
│  │  │  datos. Politicas por auth.uid()            │    │       │
│  │  └─────────────────────────────────────────────┘    │       │
│  └─────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Conexiones Externas

```
┌─────────────────────────────────────────────────────────────────┐
│                         MomsAI App                              │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Supabase   │  │  Dr. Manuel  │  │  expo-notif  │          │
│  │   (Backend)  │  │    (IA)      │  │  (Push)      │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼─────────────────┼─────────────────┼──────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
│    SUPABASE      │ │  API de IA   │ │  Sistema de  │
│                  │ │  (externa)   │ │  Notifica-   │
│  PostgreSQL      │ │              │ │  ciones del  │
│  Auth            │ │  Opciones:   │ │  SO          │
│  Storage         │ │  - OpenAI    │ │              │
│  Edge Functions  │ │  - Gemini    │ │  Android:    │
│  Realtime        │ │  - Claude    │ │  FCM         │
│                  │ │  - Custom    │ │              │
│                  │ │              │ │  iOS:        │
│                  │ │              │ │  APNs        │
└──────────────────┘ └──────────────┘ └──────────────┘
```

### 4.1 Supabase (Backend as a Service)

| Servicio | Uso en MomsAI |
|---|---|
| **PostgreSQL** | Base de datos relacional (7 tablas) |
| **Auth** | Registro, login, JWT, refresh tokens |
| **Row Level Security** | Cada usuaria solo accede a sus datos |
| **Storage** | (Futuro) Imagenes, documentos |
| **Edge Functions** | (Futuro) Logica server-side (webhooks, cron) |
| **Realtime** | (Futuro) Sincronizacion en tiempo real |

### 4.2 Dr. Manuel (IA Externa)

| Aspecto | Detalle |
|---|---|
| **Tipo** | API REST o WebView con chat |
| **Input** | Pregunta de la usuaria + contexto (etapa, biometricos) |
| **Output** | Respuesta de orientacion medica (sin diagnostico) |
| **Restriccion** | RNF-06: no sustituye consulta medica |
| **Opciones de integracion** | OpenAI API, Google Gemini, Claude API, o modelo propio |

### 4.3 Notificaciones Push

| Plataforma | Servicio | Tipo |
|---|---|---|
| Android | FCM (Firebase Cloud Messaging) | Push remota |
| iOS | APNs (Apple Push Notification Service) | Push remota |
| Ambas | expo-notifications | Push local (actual) |

**Nota:** La version actual usa notificaciones locales (expo-notifications). Para push remotas (desde servidor), se necesita Firebase FCM + Supabase Edge Functions.

---

## 5. Flujo de Datos — Ejemplo Completo

### 5.1 Usuaria registra datos biometricos

```
Usuaria                    App                         Supabase
  │                         │                              │
  │  Ingresa peso/presion   │                              │
  │────────────────────────>│                              │
  │                         │                              │
  │                         │  biometricService            │
  │                         │  .saveBiometricData()        │
  │                         │                              │
  │                         │  dataService.exec()          │
  │                         │  ┌─────────────────┐         │
  │                         │  │ supabase.from() │         │
  │                         │  │ .upsert()       │         │
  │                         │  └────────┬────────┘         │
  │                         │           │                  │
  │                         │           │  POST /rest/v1/  │
  │                         │           │  biometria_madre │
  │                         │           │─────────────────>│
  │                         │           │                  │
  │                         │           │  200 OK          │
  │                         │           │<─────────────────│
  │                         │                              │
  │                         │  alertService                │
  │                         │  .analyzeBiometricData()     │
  │                         │                              │
  │  "Presion alta" alert   │                              │
  │<────────────────────────│                              │
```

### 5.2 Usuaria inicia sesion

```
Usuaria                    App                    Supabase Auth
  │                         │                         │
  │  Email + Password       │                         │
  │────────────────────────>│                         │
  │                         │  authService            │
  │                         │  .login()               │
  │                         │                         │
  │                         │  supabase.auth          │
  │                         │  .signInWithPassword()  │
  │                         │────────────────────────>│
  │                         │                         │
  │                         │  JWT + User data        │
  │                         │<────────────────────────│
  │                         │                         │
  │                         │  AuthContext.setUser()   │
  │                         │  EtapaContext.refresh()  │
  │                         │                         │
  │  Menu adaptativo        │                         │
  │<────────────────────────│                         │
```

### 5.3 Cambio de etapa (sin_datos → pre_parto)

```
Usuaria                    Menu.js              EtapaContext         Supabase
  │                         │                        │                   │
  │  "Estoy embarazada"     │                        │                   │
  │────────────────────────>│                        │                   │
  │                         │                        │                   │
  │  Ingresa FUR            │                        │                   │
  │────────────────────────>│                        │                   │
  │                         │                        │                   │
  │                         │  updateProfile()       │                   │
  │                         │  { furDate: "10/11/25"}│                   │
  │                         │───────────────────────>│                   │
  │                         │                        │  UPDATE usuario   │
  │                         │                        │──────────────────>│
  │                         │                        │  UPDATE perfil_   │
  │                         │                        │  madre            │
  │                         │                        │──────────────────>│
  │                         │                        │                   │
  │                         │  refresh()             │                   │
  │                         │───────────────────────>│                   │
  │                         │                        │  SELECT perfil_   │
  │                         │                        │  madre            │
  │                         │                        │──────────────────>│
  │                         │                        │                   │
  │                         │                        │  etapa='pre_parto'│
  │                         │                        │  semanas=24       │
  │                         │                        │<──────────────────│
  │                         │                        │                   │
  │  "Semana 24"            │                        │                   │
  │<────────────────────────│<───────────────────────│                   │
```

---

## 6. Seguridad por Capas

```
┌─────────────────────────────────────────────────────────────────┐
│ CAPA                    │ MECANISMO                             │
├─────────────────────────┼───────────────────────────────────────┤
│ Presentacion            │ SafeAreaView, validacion de inputs    │
│                         │                                       │
│ Servicios               │ Validacion de datos antes de guardar  │
│                         │                                       │
│ Abstraccion             │ Switch de proveedor (control central) │
│                         │                                       │
│ Infraestructura         │ JWT (Supabase Auth)                   │
│                         │ TLS 1.2+ (HTTPS)                      │
│                         │                                       │
│ Base de Datos           │ RLS (Row Level Security)              │
│                         │ Passwords hasheados (bcrypt)          │
│                         │ Encriptacion en reposo (AES-256)      │
│                         │                                       │
│ Red                     │ HTTPS obligatorio                     │
│                         │ CORS configurado                      │
│                         │ Rate limiting (Supabase)              │
└─────────────────────────┴───────────────────────────────────────┘
```

---

## 7. Decisiones de Arquitectura

| Decision | Razon |
|---|---|
| **Capa de abstraccion (dataService)** | Permitir migrar de AsyncStorage a Supabase sin tocar pantallas |
| **Contexts para estado global** | AuthContext, ThemeContext, EtapaContext centralizan datos compartidos |
| **Header/Footer persistente** | UX consistente entre tabs principales |
| **Etapa como contexto** | Toda la app reacciona al cambio de etapa automaticamente |
| **Notificaciones locales primero** | Funcionan sin backend. Push remotas se agregan despues |
| **Mock service separado** | Facilita desarrollo sin BD. Se desactiva al conectar Supabase |
| **Switch de proveedor** | Un cambio en dataService.js migra TODA la app |

---

## 8. Tecnologias

| Capa | Tecnologia | Version |
|---|---|---|
| Framework | Expo | SDK 54 |
| UI | React Native | 0.81 |
| Navegacion | React Navigation | 6.x |
| Iconos | Lucide React Native | 1.14 |
| Almacenamiento local | AsyncStorage | 2.2 |
| Notificaciones | expo-notifications | (SDK 54) |
| Backend (objetivo) | Supabase | Latest |
| Base de datos (objetivo) | PostgreSQL | 15+ |
| Auth (objetivo) | Supabase Auth | Latest |
| IA (futuro) | API externa | TBD |

---

*Documento de arquitectura generado para el equipo de desarrollo de MomsAI.*
