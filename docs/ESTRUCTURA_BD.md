# Estructura de la Base de Datos — MomsAI

**Fecha:** 31 de mayo de 2026  
**Motor sugerido:** PostgreSQL (uuid nativo, timestamp con timezone)  
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
│                           │    encrypted_password                   │                          │
│                           │ raw_user_meta_data (json)               │                          │
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
│     │              │  │ presion_sist.│  │ llanto       │          │
│     └──────────────┘  │ presion_diast│  │ rechazo      │          │
│          1:1          └──────────────┘  │ suenio       │          │
│                               1:N       │ fiebre       │          │
│                                         │ alteraciones_piel       │          │
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

Entidad principal interna manejada por Supabase Auth. Todas las demás tablas dependen de ella.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | `uuid` | **PK**, NOT NULL | Identificador único universal |
| `email` | `varchar` | **UNIQUE**, NOT NULL | Correo electrónico (login) |
| `encrypted_password` | `varchar` | NOT NULL | Contraseña hasheada internamente |
| `raw_user_meta_data` | `jsonb` | | Campo JSON donde se guarda el `nombre_completo` |
| `created_at` | `timestamp` | NOT NULL, DEFAULT NOW() | Fecha de registro |

*(No se requiere CREATE TABLE ya que Supabase maneja auth.users internamente)*

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
> - Si ninguna → `desconocida`

```sql
CREATE TABLE perfil_madre (
    id_usuario     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    fecha_nac      DATE,
    fecha_fur      DATE,
    fecha_nac_bebe DATE
);
```

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
| `fatiga` | `boolean` | DEFAULT FALSE | Síntoma: Fatiga extrema |
| `dolor_cabeza` | `boolean` | DEFAULT FALSE | Síntoma: Dolor de cabeza |
| `hinchazon_pies` | `boolean` | DEFAULT FALSE | Síntoma: Hinchazón de pies |
| `nauseas` | `boolean` | DEFAULT FALSE | Síntoma: Náuseas/Problemas estomacales |
| `ansiedad` | `boolean` | DEFAULT FALSE | Síntoma: Ansiedad/Nerviosismo |
| `tristeza` | `boolean` | DEFAULT FALSE | Síntoma: Tristeza persistente/Llanto |
| `irritabilidad` | `boolean` | DEFAULT FALSE | Síntoma: Irritabilidad |
| `culpa` | `boolean` | DEFAULT FALSE | Síntoma: Sentimiento de culpa |
| `fecha_actualizacion` | `timestamp` | NULLABLE | Última modificación |

> **Nota:** Los síntomas son booleanos (checkboxes en la app). Esto permite consultar rápidamente cuántos síntomas tiene un día sin parsear JSON.

```sql
CREATE TABLE biometria_madre (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    fecha_registro       DATE NOT NULL,
    peso                 FLOAT,
    horas_suenio         INT,
    presion_sistolica    INT,
    presion_diastolica   INT,
    fatiga               BOOLEAN DEFAULT FALSE,
    dolor_cabeza         BOOLEAN DEFAULT FALSE,
    hinchazon_pies       BOOLEAN DEFAULT FALSE,
    nauseas              BOOLEAN DEFAULT FALSE,
    ansiedad             BOOLEAN DEFAULT FALSE,
    tristeza             BOOLEAN DEFAULT FALSE,
    irritabilidad        BOOLEAN DEFAULT FALSE,
    culpa                BOOLEAN DEFAULT FALSE,
    fecha_actualizacion  TIMESTAMP,

    UNIQUE (id_usuario, fecha_registro)
);
```

---

### `metricas_bebe`

Registro de síntomas y métricas del bebé (pre-parto y post-parto). Relación **1:N** con `auth.users`.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | `uuid` | **PK** | Identificador del registro |
| `id_usuario` | `uuid` | **FK** → `auth.users(id)`, NOT NULL | Dueña del registro |
| `fecha_registro` | `date` | NOT NULL | Día del registro |
| `movimiento_fetal` | `boolean` | DEFAULT FALSE | Pre-parto: movimiento fetal activo |
| `cambio_intensidad` | `boolean` | DEFAULT FALSE | Pre-parto: cambio de intensidad |
| `llanto_prolongado` | `boolean` | DEFAULT FALSE | Post-parto: llanto prolongado |
| `rechazo_alimento` | `boolean` | DEFAULT FALSE | Post-parto: rechazo de alimento |
| `problemas_suenio` | `boolean` | DEFAULT FALSE | Post-parto: problemas de sueño |
| `fiebre` | `boolean` | DEFAULT FALSE | Post-parto: fiebre/temperatura anómala |
| `alteraciones_piel` | `boolean` | DEFAULT FALSE | Post-parto: alteraciones en la piel |
| `fecha_actualizacion` | `timestamp` | NULLABLE | Última modificación |

> **Nota:** Los campos que aplican dependen de la etapa (`pre_parto` o `post_parto`), determinada por `perfil_madre`.

```sql
CREATE TABLE metricas_bebe (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    fecha_registro       DATE NOT NULL,
    movimiento_fetal     BOOLEAN DEFAULT FALSE,
    cambio_intensidad    BOOLEAN DEFAULT FALSE,
    llanto_prolongado    BOOLEAN DEFAULT FALSE,
    rechazo_alimento     BOOLEAN DEFAULT FALSE,
    problemas_suenio     BOOLEAN DEFAULT FALSE,
    fiebre               BOOLEAN DEFAULT FALSE,
    alteraciones_piel    BOOLEAN DEFAULT FALSE,
    fecha_actualizacion  TIMESTAMP,

    UNIQUE (id_usuario, fecha_registro)
);
```

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
| `id_calendario_ext` | `varchar` | NULLABLE | ID de evento en calendario externo (Google, Apple) |

```sql
CREATE TABLE registro_tarea (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo              VARCHAR(255) NOT NULL,
    descripcion         TEXT,
    fecha_hora          TIMESTAMP NOT NULL,
    finalizada          BOOLEAN DEFAULT FALSE,
    id_calendario_ext   VARCHAR(255)
);
```

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
| `fecha_creacion` | `timestamp` | DEFAULT NOW() | Fecha de registro |

```sql
CREATE TABLE perfil_bebe (
    id_usuario      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre          VARCHAR(255),
    sexo            VARCHAR(20),
    fecha_nac       DATE,
    peso_nac        FLOAT,
    talla_nac       FLOAT,
    fecha_creacion  TIMESTAMP DEFAULT NOW()
);
```

---

### `configuracion_recordatorios`

Configuración de recordatorios/notificaciones. Relación **1:1** con `auth.users`.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id_usuario` | `uuid` | **PK**, **FK** → `auth.users(id)` | Vincula al usuario |
| `notificaciones_activadas` | `boolean` | DEFAULT TRUE | Master toggle de notificaciones |
| `recordatorio_biometria` | `boolean` | DEFAULT TRUE | Recordatorio biométricos diarios |
| `hora_biometria` | `time` | DEFAULT '20:00' | Hora del recordatorio biométricos |
| `recordatorio_bebe` | `boolean` | DEFAULT TRUE | Recordatorio datos del bebé |
| `hora_bebe` | `time` | DEFAULT '21:00' | Hora del recordatorio bebé |
| `recordatorio_calendario` | `boolean` | DEFAULT TRUE | Aviso antes de citas médicas |
| `horas_anticipacion_calendario` | `int` | DEFAULT 2 | Horas de anticipación |

```sql
CREATE TABLE configuracion_recordatorios (
    id_usuario                      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    notificaciones_activadas        BOOLEAN DEFAULT TRUE,
    recordatorio_biometria          BOOLEAN DEFAULT TRUE,
    hora_biometria                  TIME DEFAULT '20:00',
    recordatorio_bebe               BOOLEAN DEFAULT TRUE,
    hora_bebe                       TIME DEFAULT '21:00',
    recordatorio_calendario         BOOLEAN DEFAULT TRUE,
    horas_anticipacion_calendario   INT DEFAULT 2
);
```

---

## Resumen de Relaciones

```
auth.users ───1:1────── perfil_madre
    │
    ├─────────1:1────── perfil_bebe
    │
    ├─────────1:1────── configuracion_recordatorios
    │
    ├─────────1:N────── biometria_madre
    │
    ├─────────1:N────── metricas_bebe
    │
    └─────────1:N────── registro_tarea
```

| Relación | Tipo | Descripción |
|---|---|---|
| `auth.users` → `perfil_madre` | 1:1 | Una madre tiene un solo perfil obstétrico |
| `auth.users` → `perfil_bebe` | 1:1 | Una madre tiene un solo perfil de bebé |
| `auth.users` → `configuracion_recordatorios` | 1:1 | Una madre tiene una configuración de recordatorios |
| `auth.users` → `biometria_madre` | 1:N | Una madre registra biométricos muchos días |
| `auth.users` → `metricas_bebe` | 1:N | Una madre registra métricas del bebé muchos días |
| `auth.users` → `registro_tarea` | 1:N | Una madre tiene muchas tareas/citas |

---

## Índices Recomendados

```sql
-- Búsqueda rápida de biométricos por usuario y fecha
CREATE INDEX idx_biometria_usuario_fecha ON biometria_madre(id_usuario, fecha_registro);

-- Búsqueda rápida de métricas por usuario y fecha
CREATE INDEX idx_metricas_usuario_fecha ON metricas_bebe(id_usuario, fecha_registro);

-- Tareas por usuario y fecha (para el calendario)
CREATE INDEX idx_tareas_usuario_fecha ON registro_tarea(id_usuario, fecha_hora);

-- Login por email
CREATE INDEX idx_usuario_email ON usuario(email);
```

---

## Mapeo con la App Actual

| Tabla BD | Servicio Actual | Almacenamiento Actual |
|---|---|---|
| `auth.users` | `authService.js` | AsyncStorage (`@manualdelbebe_profile`) |
| `perfil_madre` | `authService.js` (campos en perfil) | AsyncStorage (dentro del perfil) |
| `perfil_bebe` | `babyService.js` | AsyncStorage (`@baby_profile`) |
| `configuracion_recordatorios` | `notificationService.js` | AsyncStorage (`@reminders_config`) |
| `biometria_madre` | `biometricService.js` | AsyncStorage (`@biometric_data_YYYY-MM-DD`) |
| `metricas_bebe` | `babyService.js` | AsyncStorage (`@baby_data_YYYY-MM-DD`) |
| `registro_tarea` | `calendarService.js` | AsyncStorage (`@calendar_events`) |

> **Nota:** La app actual guarda todo en AsyncStorage como JSON plano. Esta estructura BD es el modelo objetivo para migrar a un backend real (PostgreSQL, Supabase, Firebase, etc.).

---

## Consideraciones de Seguridad

- `password_hash`: Nunca guardar texto plano. Usar **bcrypt** o **argon2**.
- Datos biométricos: En producción deben encriptarse con **AES-256** en reposo (RNF-02).
- `email`: Índice UNIQUE previene registros duplicados.
- `ON DELETE CASCADE`: Al eliminar un usuario, se eliminan todos sus datos asociados.

---

*Estructura derivada del MER y MR proporcionados por el equipo del proyecto.*
