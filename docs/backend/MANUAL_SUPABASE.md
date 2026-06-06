# Guía de Configuración Inicial de Supabase — MomsAI

**Fecha:** 5 de junio de 2026  
**Objetivo:** Guía paso a paso para desplegar la base de datos Supabase para nuevos entornos de desarrollo o producción.

---

## 1. Crear proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) y crear cuenta
2. Crear nuevo proyecto
3. Anotar en tu archivo `.env` o constantes locales:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIs...`

---

## 2. Crear tablas en Supabase (SQL Editor)

Copiar y ejecutar este SQL en el SQL Editor de Supabase. Este script crea las tablas con los nombres de columnas en `snake_case` para sincronizar automáticamente con los servicios del frontend.

```sql
-- ============================================
-- TABLA: perfil_madre
-- ============================================
CREATE TABLE perfil_madre (
    id_usuario     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    fecha_nac      DATE,
    fecha_fur      DATE,
    fecha_nac_bebe DATE
);

-- ============================================
-- TABLA: biometria_madre
-- ============================================
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

-- ============================================
-- TABLA: metricas_bebe
-- ============================================
CREATE TABLE metricas_bebe (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    fecha_registro         DATE NOT NULL,
    movimiento_fetal       BOOLEAN DEFAULT FALSE,
    cambio_intensidad      BOOLEAN DEFAULT FALSE,
    sin_movimiento         BOOLEAN DEFAULT FALSE,
    disminucion_movimiento BOOLEAN DEFAULT FALSE,
    llanto_prolongado      BOOLEAN DEFAULT FALSE,
    rechazo_alimento       BOOLEAN DEFAULT FALSE,
    problemas_suenio       BOOLEAN DEFAULT FALSE,
    fiebre                 BOOLEAN DEFAULT FALSE,
    alteraciones_piel      BOOLEAN DEFAULT FALSE,
    fecha_actualizacion    TIMESTAMP,
    UNIQUE (id_usuario, fecha_registro)
);

-- ============================================
-- TABLA: perfil_bebe
-- ============================================
CREATE TABLE perfil_bebe (
    id_usuario     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre         VARCHAR(255),
    sexo           VARCHAR(20),
    fecha_nac      DATE,
    peso_nac       FLOAT,
    talla_nac      FLOAT,
    fecha_creacion TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABLA: registro_tarea
-- ============================================
CREATE TABLE registro_tarea (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo              VARCHAR(255) NOT NULL,
    descripcion         TEXT,
    fecha_hora          TIMESTAMP NOT NULL,
    finalizada          BOOLEAN DEFAULT FALSE,
    id_calendario_ext   VARCHAR(255)
);

-- ============================================
-- TABLA: configuracion_recordatorios
-- ============================================
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

-- ============================================
-- INDICES
-- ============================================
CREATE INDEX idx_biometria_usuario_fecha ON biometria_madre(id_usuario, fecha_registro);
CREATE INDEX idx_metricas_usuario_fecha ON metricas_bebe(id_usuario, fecha_registro);
CREATE INDEX idx_tareas_usuario_fecha ON registro_tarea(id_usuario, fecha_hora);
```

---

## 3. Seguridad en producción (RLS)

Es **crítico** habilitar Row Level Security (RLS) en todas las tablas para que cada usuaria solo vea sus propios datos.

Ejecutar esto en el SQL Editor:

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE biometria_madre ENABLE ROW LEVEL SECURITY;
ALTER TABLE metricas_bebe ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfil_madre ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfil_bebe ENABLE ROW LEVEL SECURITY;
ALTER TABLE registro_tarea ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_recordatorios ENABLE ROW LEVEL SECURITY;

-- Crear políticas para operaciones SELECT, INSERT, UPDATE, DELETE
CREATE POLICY "Usuaria ve sus propios datos biometria_madre" ON biometria_madre FOR ALL USING (auth.uid() = id_usuario);
CREATE POLICY "Usuaria ve sus propios datos metricas_bebe" ON metricas_bebe FOR ALL USING (auth.uid() = id_usuario);
CREATE POLICY "Usuaria ve sus propios datos perfil_madre" ON perfil_madre FOR ALL USING (auth.uid() = id_usuario);
CREATE POLICY "Usuaria ve sus propios datos perfil_bebe" ON perfil_bebe FOR ALL USING (auth.uid() = id_usuario);
CREATE POLICY "Usuaria ve sus propios datos registro_tarea" ON registro_tarea FOR ALL USING (auth.uid() = id_usuario);
CREATE POLICY "Usuaria ve sus propios datos configuracion_recordatorios" ON configuracion_recordatorios FOR ALL USING (auth.uid() = id_usuario);
```

---

## 4. Conexión Frontend (React Native)

El proyecto ya está preconfigurado. Solo debes asegurar que `src/services/supabaseClient.js` tiene las credenciales correctas.

Las llamadas en `biometricService.js` y `babyService.js` utilizan claves en `snake_case` (definidas en `constants.js`), por lo que envían un objeto JSON que hace "match" 1:1 con las columnas de PostgreSQL en el comando `.upsert()`.

---

*Manual mantenido por el equipo de desarrollo de MomsAI.*
