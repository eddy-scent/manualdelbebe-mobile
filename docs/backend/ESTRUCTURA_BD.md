# Estructura de la Base de Datos — MomsAI

**Fecha:** 5 de junio de 2026  
**Motor sugerido:** PostgreSQL (Supabase)  
**Notación:** Modelo Entidad-Relación (MER) → Modelo Relacional (MR)

---

## Diagrama de Entidades y Relaciones

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                           ┌──────────────┐                          │
│                           │  auth.users  │                          │
│                           │──────────────│                          │
│                           │ PK id        │                          │
│                           │    email     │                          │
│                           │ raw_user_meta_data (json)               │
│                           │    created_at│                          │
│                           └──────┬───────┘                          │
│                                  │                                  │
│                ┌─────────────────┼─────────────────┐                │
│                │                 │                 │                │
│                ▼                 ▼                 ▼                │
│     ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│     │ PERFIL_MADRE │  │BIOMETRIA_MADRE│ │METRICAS_BEBE │          │
│     │──────────────│  │──────────────│  │──────────────│          │
│     │ FK id_usuario│  │ FK id_usuario│  │ FK id_usuario│          │
│     │    fecha_nac │  │ fecha_registro│ │fecha_registro│          │
│     │    fecha_fur │  │    peso      │  │ mov_fetal    │          │
│     │ fecha_nac_bebe│ │ horas_suenio │  │ intensidad   │          │
│     │              │  │ presion_sist.│  │ sin_movimient│          │
│     └──────────────┘  │ presion_diast│  │ dism_movimien│          │
│          1:1          └──────────────┘  │ llanto       │          │
│                               1:N       │ rechazo      │          │
│                                         │ suenio       │          │
│                                         │ fiebre       │          │
│                                         │ alteraciones_piel       │
│                                         └──────────────┘          │
│                              │                 1:N                 │
│                              │                                     │
│                              ▼                                     │
│                     ┌──────────────┐                               │
│                     │REGISTRO_TAREA│                               │
│                     │──────────────│                               │
│                     │ FK id_usuario│                               │
│                     │    titulo    │                               │
│                     │    descripcion|                               │
│                     │    fecha_hora│                               │
│                     │  finalizada  │                               │
│                     │ id_calendario_ext|                           │
│                     └──────────────┘                               │
│                              1:N                                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Entidad Fuerte

### `auth.users`

Entidad principal interna manejada por Supabase Auth. Todas las demás tablas dependen de ella mediante RLS.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | `uuid` | **PK**, NOT NULL | Identificador único universal |
| `email` | `varchar` | **UNIQUE**, NOT NULL | Correo electrónico (login) |
| `raw_user_meta_data` | `jsonb` | | Campo JSON donde se guarda el `nombre_completo` |

---

## Entidades Débiles (dependientes de `auth.users`)

### `perfil_madre`

Perfil obstétrico de la usuaria. Relación **1:1** con `auth.users`.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id_usuario` | `uuid` | **PK**, **FK** → `auth.users(id)` | Vincula al usuario |
| `fecha_nac` | `date` | NULLABLE | Fecha de nacimiento de la madre |
| `fecha_fur` | `date` | NULLABLE | Fecha de Última Regla (base para cálculos) |
| `fecha_nac_bebe` | `date` | NULLABLE | Fecha de nacimiento del bebé |

> **Atributo derivado:** `etapa_actual` se calcula en la app:
> - Si `fecha_nac_bebe` tiene valor → `post_parto`
> - Si `fecha_fur` tiene valor → `pre_parto`

---

### `biometria_madre`

Registro diario de datos biométricos y síntomas maternos. Relación **1:N** con `auth.users` (un registro por día).

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | `uuid` | **PK** | Identificador del registro |
| `id_usuario` | `uuid` | **FK** → `auth.users(id)`, NOT NULL | Dueña del registro |
| `fecha_registro` | `date` | NOT NULL | Día del registro |
| `peso` | `float` | NULLABLE | Peso en kg |
| `horas_suenio` | `int` | NULLABLE | Horas de sueño |
| `presion_sistolica` | `int` | NULLABLE | Presión sistólica (mmHg) |
| `presion_diastolica` | `int` | NULLABLE | Presión diastólica (mmHg) |
| `fatiga` | `boolean` | DEFAULT FALSE | Síntoma materno |
| `dolor_cabeza` | `boolean` | DEFAULT FALSE | Síntoma materno |
| `hinchazon_pies` | `boolean` | DEFAULT FALSE | Síntoma materno |
| `nauseas` | `boolean` | DEFAULT FALSE | Síntoma materno |
| `ansiedad` | `boolean` | DEFAULT FALSE | Síntoma materno |
| `tristeza` | `boolean` | DEFAULT FALSE | Síntoma materno |
| `irritabilidad` | `boolean` | DEFAULT FALSE | Síntoma materno |
| `culpa` | `boolean` | DEFAULT FALSE | Síntoma materno |
| `fecha_actualizacion` | `timestamp` | NULLABLE | Última modificación |

*Los campos utilizan snake_case para sincronización 1:1 con el frontend.*

---

### `metricas_bebe`

Registro de síntomas y métricas del bebé (pre-parto y post-parto). Relación **1:N** con `auth.users`.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | `uuid` | **PK** | Identificador del registro |
| `id_usuario` | `uuid` | **FK** → `auth.users(id)`, NOT NULL | Dueña del registro |
| `fecha_registro` | `date` | NOT NULL | Día del registro |
| `movimiento_fetal` | `boolean` | DEFAULT FALSE | Pre-parto: movimiento activo |
| `cambio_intensidad` | `boolean` | DEFAULT FALSE | Pre-parto: cambio de intensidad |
| `sin_movimiento` | `boolean` | DEFAULT FALSE | Pre-parto: ausencia de movimientos |
| `disminucion_movimiento`| `boolean` | DEFAULT FALSE | Pre-parto: disminución de movimiento |
| `llanto_prolongado` | `boolean` | DEFAULT FALSE | Post-parto: llanto prolongado |
| `rechazo_alimento` | `boolean` | DEFAULT FALSE | Post-parto: rechazo de alimento |
| `problemas_suenio` | `boolean` | DEFAULT FALSE | Post-parto: problemas de sueño |
| `fiebre` | `boolean` | DEFAULT FALSE | Post-parto: fiebre |
| `alteraciones_piel` | `boolean` | DEFAULT FALSE | Post-parto: piel |
| `fecha_actualizacion` | `timestamp` | NULLABLE | Última modificación |

---

### `registro_tarea`

Tareas, citas médicas e hitos del calendario. Relación **1:N** con `auth.users`.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | `uuid` | **PK** | Identificador de la tarea |
| `id_usuario` | `uuid` | **FK** → `auth.users(id)`, NOT NULL | Dueña de la tarea |
| `titulo` | `varchar` | NOT NULL | Título de la tarea/cita |
| `descripcion` | `text` | NULLABLE | Detalle opcional |
| `fecha_hora` | `timestamp` | NOT NULL | Fecha y hora del evento |
| `finalizada` | `boolean` | DEFAULT FALSE | Estado: completada o pendiente |

---

### `perfil_bebe`

Perfil del bebé (registro inicial). Relación **1:1** con `auth.users`.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id_usuario` | `uuid` | **PK**, **FK** → `auth.users(id)` | Vincula al usuario |
| `nombre` | `varchar` | NULLABLE | Nombre del bebé |
| `sexo` | `varchar` | NULLABLE | 'masculino' o 'femenino' |
| `fecha_nac` | `date` | NULLABLE | Fecha de nacimiento |
| `peso_nac` | `float` | NULLABLE | Peso al nacer (kg) |
| `talla_nac` | `float` | NULLABLE | Talla al nacer (cm) |

---

### `configuracion_recordatorios`

Configuración de recordatorios/notificaciones. Relación **1:1** con `auth.users`.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id_usuario` | `uuid` | **PK**, **FK** → `auth.users(id)` | Vincula al usuario |
| `notificaciones_activadas` | `boolean` | DEFAULT TRUE | Master toggle |
| `recordatorio_biometria` | `boolean` | DEFAULT TRUE | Recordatorio materno |
| `hora_biometria` | `time` | DEFAULT '20:00' | Hora del recordatorio |
| `recordatorio_bebe` | `boolean` | DEFAULT TRUE | Recordatorio bebé |
| `hora_bebe` | `time` | DEFAULT '21:00' | Hora del recordatorio |

---

## Mapeo Directo con la App Actual (Supabase)

A diferencia del MVP anterior que usaba `AsyncStorage`, **la aplicación ahora está integrada 100% con Supabase**. Todos los servicios apuntan a las tablas descritas arriba.

| Tabla BD | Servicio Actual | 
|---|---|
| `auth.users` | `authService.js` (Supabase Auth) |
| `perfil_madre` | `authService.js` |
| `perfil_bebe` | `babyService.js` |
| `configuracion_recordatorios` | `notificationService.js` |
| `biometria_madre` | `biometricService.js` |
| `metricas_bebe` | `babyService.js` |
| `registro_tarea` | `calendarService.js` |

*Las políticas RLS (Row Level Security) aseguran que el frontend solo pueda consultar (SELECT) y modificar (UPSERT) los registros donde `id_usuario = auth.uid()`.*
