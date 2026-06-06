# Arquitectura del Software — MomsAI

**Fecha:** 5 de junio de 2026  
**Version:** 1.1.0  
**Estado actual:** App Integrada con Supabase Backend  
**Estado objetivo:** Añadir capacidades de IA conversacional (Dr. Manuel)

---

## 1. Visión General

MomsAI es una aplicación móvil híbrida (React Native + Expo) que acompaña a mujeres embarazadas y madres recientes. La arquitectura está diseñada en capas y actualmente está **100% integrada con Supabase**, usando PostgreSQL en la nube para persistencia segura de datos, Edge Functions para validaciones de backend, y Supabase Auth para manejo de sesiones.

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
│                     (Lógica de Negocio)                         │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │  auth    │ │biometric │ │ calendar │ │  baby    │          │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │          │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘          │
│       │             │            │             │                │
│  ┌────┴─────┐       │            │             │                │
│  │  alert   │       │            │             │                │
│  │ Service  │       │            │             │                │
│  └──────────┘       │            │             │                │
├─────────────────────┼────────────┼─────────────┼────────────────┤
│                     ▼            ▼             ▼                │
│              CAPA DE INFRAESTRUCTURA                            │
│                                                                 │
│  ┌─────────────────────┐    ┌──────────────────────┐           │
│  │   supabaseClient    │    │  supabase/auth       │           │
│  │   (REST API)        │    │  (Autenticacion)     │           │
│  └──────────┬──────────┘    └──────────┬───────────┘           │
│             │                          │                        │
├─────────────┼──────────────────────────┼────────────────────────┤
│             ▼                          ▼                        │
│                   CAPA DE DATOS (Supabase)                      │
│                                                                 │
│  ┌─────────────────────────────────────────────────────┐       │
│  │                   SUPABASE (PostgreSQL)              │       │
│  │                                                     │       │
│  │  ┌──────────┐ ┌──────────────┐ ┌──────────────┐    │       │
│  │  │ auth.    │ │perfil_madre  │ │biometria_    │    │       │
│  │  │ users    │ │              │ │madre         │    │       │
│  │  └──────────┘ └──────────────┘ └──────────────┘    │       │
│  │                                                     │       │
│  │  ┌──────────┐ ┌──────────────┐ ┌──────────────┐    │       │
│  │  │perfil_   │ │metricas_     │ │registro_     │    │       │
│  │  │bebe      │ │bebe          │ │tarea         │    │       │
│  │  └──────────┘ └──────────────┘ └──────────────┘    │       │
│  │                                                     │       │
│  │  ┌──────────────────────┐                           │       │
│  │  │configuracion_        │                           │       │
│  │  │recordatorios         │                           │       │
│  │  └──────────────────────┘                           │       │
│  │                                                     │       │
│  │  ┌─────────────────────────────────────────────┐    │       │
│  │  │         Row Level Security (RLS)            │    │       │
│  │  │  Cada usuaria solo ve/edita sus propios     │    │       │
│  │  │  datos. Politicas por auth.uid()            │    │       │
│  │  └─────────────────────────────────────────────┘    │       │
│  │                                                     │       │
│  │  ┌─────────────────────────────────────────────┐    │       │
│  │  │         Edge Functions + Webhooks           │    │       │
│  │  │  Validación y notificaciones backend        │    │       │
│  │  └─────────────────────────────────────────────┘    │       │
│  └─────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Conexiones Externas

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
│  Edge Functions  │ │  - Gemini    │ │  Android/iOS │
│  Webhooks        │ │  - Claude    │ │              │
└──────────────────┘ └──────────────┘ └──────────────┘
```

---

## 4. Flujo de Datos — Guardado de Síntomas

```
Usuaria                    App                         Supabase
  │                         │                              │
  │  Ingresa síntomas       │                              │
  │────────────────────────>│                              │
  │                         │  alertService                │
  │                         │  .analyzeBiometricData()     │
  │                         │                              │
  │  Muestra alertas UI     │                              │
  │<────────────────────────│                              │
  │                         │                              │
  │                         │  biometricService            │
  │                         │  .saveBiometricData()        │
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
  │                         │                              │  [Backend Trigger]
  │                         │                              │  Webhook -> Edge Function
```

---

## 5. Decisiones de Arquitectura Actualizadas

| Decisión | Razón |
|---|---|
| **Directa a Supabase Client** | Los servicios ahora importan `supabaseClient.js` y ejecutan consultas directas a PostgreSQL, eliminando la capa mock. |
| **Contexts para estado global** | AuthContext, ThemeContext, EtapaContext centralizan datos compartidos entre pantallas. |
| **Alertas Híbridas (Front/Back)** | `alertService.js` proporciona validación inmediata y empatía en UI. Edge Functions proveen validación backend y futuro push. |
| **Claves snake_case en UI** | Las constantes como `SINTOMAS_MATERNO` ahora usan snake_case para hacer espejo 1:1 con las columnas de Supabase, simplificando el mapeo. |

---

*Documento actualizado por el equipo de desarrollo de MomsAI.*
