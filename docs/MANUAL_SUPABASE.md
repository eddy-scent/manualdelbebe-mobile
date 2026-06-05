# Manual de Conexion a Supabase — MomsAI

**Fecha:** 31 de mayo de 2026  
**Objetivo:** Guia paso a paso para migrar de AsyncStorage a Supabase

---

## 1. Crear proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) y crear cuenta
2. Crear nuevo proyecto
3. Anotar:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIs...`

---

## 2. Instalar dependencias

```bash
npx expo install @supabase/supabase-js
```

---

## 3. Crear tablas en Supabase (SQL Editor)

Copiar y ejecutar este SQL en el SQL Editor de Supabase:

```sql
-- ============================================
-- NOTA: auth.users es manejada internamente por Supabase
-- ============================================

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

## 4. Configurar Supabase en la app

Crear archivo `src/services/supabaseClient.js`:

```javascript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://TU_PROJECT_URL.supabase.co';
const SUPABASE_ANON_KEY = 'TU_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

---

## 5. Migrar dataService.js

En `src/services/dataService.js`, cambiar el proveedor:

```javascript
// Cambiar de:
const DATA_PROVIDER = 'asyncstorage';

// A:
const DATA_PROVIDER = 'supabase';
```

Y agregar las funciones de Supabase en el switch:

```javascript
import { supabase } from './supabaseClient';

const exec = async (asyncStorageFn, supabaseFn) => {
  if (DATA_PROVIDER === 'asyncstorage') {
    return asyncStorageFn();
  }
  if (DATA_PROVIDER === 'supabase') {
    return supabaseFn();
  }
};
```

---

## 6. Migrar cada servicio

### authService.js — Autenticacion

```javascript
import { supabase } from './supabaseClient';

// Registro
export const register = async ({ fullName, email, password }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nombre_completo: fullName },
    },
  });
  if (error) return { success: false, message: error.message };

  // Ya no se hace insert a la tabla 'usuario' ya que Supabase maneja auth.users internamente.
  // Cualquier actualizacion de perfil debe usar:
  // supabase.auth.updateUser({ data: { nombre_completo: nuevoNombre } })

  return { success: true };
};

// Login
export const login = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return { success: false, message: error.message };
  return { success: true, user: data.user };
};
```

### biometricService.js — Datos biometricos

```javascript
import { supabase } from './supabaseClient';

export const saveBiometricData = async (data) => {
  const { error } = await supabase
    .from('biometria_madre')
    .upsert({
      id_usuario: data.userId,
      fecha_registro: data.date,
      peso: parseFloat(data.peso),
      horas_suenio: parseInt(data.horasSueno),
      presion_sistolica: parseInt(data.presionSistolica),
      presion_diastolica: parseInt(data.presionDiastolica),
      fatiga: data.sintomas?.['Fatiga extrema'] || false,
      dolor_cabeza: data.sintomas?.['Dolor de cabeza'] || false,
      hinchazon_pies: data.sintomas?.['Hinchazon de pies'] || false,
      nauseas: data.sintomas?.['Nauseas/Problemas estomacales'] || false,
      ansiedad: data.sintomas?.['Ansiedad/Nerviosismo'] || false,
      tristeza: data.sintomas?.['Tristeza persistente/Llanto'] || false,
      irritabilidad: data.sintomas?.['Irritabilidad'] || false,
      culpa: data.sintomas?.['Sentimiento de culpa'] || false,
      fecha_actualizacion: new Date().toISOString(),
    }, { onConflict: 'id_usuario,fecha_registro' });

  if (error) return { success: false, message: error.message };
  return { success: true };
};

export const getAllBiometricData = async (userId) => {
  const { data, error } = await supabase
    .from('biometria_madre')
    .select('*')
    .eq('id_usuario', userId)
    .order('fecha_registro', { ascending: false });

  if (error) return [];
  return data.map(row => ({
    date: row.fecha_registro,
    peso: row.peso,
    horasSueno: row.horas_suenio,
    presionSistolica: row.presion_sistolica,
    presionDiastolica: row.presion_diastolica,
    sintomas: {
      'Fatiga extrema': row.fatiga,
      'Dolor de cabeza': row.dolor_cabeza,
      'Hinchazon de pies': row.hinchazon_pies,
      'Nauseas/Problemas estomacales': row.nauseas,
      'Ansiedad/Nerviosismo': row.ansiedad,
      'Tristeza persistente/Llanto': row.tristeza,
      'Irritabilidad': row.irritabilidad,
      'Sentimiento de culpa': row.culpa,
    },
  }));
};
```

### calendarService.js — Eventos

```javascript
import { supabase } from './supabaseClient';

export const addEvent = async (event, userId) => {
  const { data, error } = await supabase
    .from('registro_tarea')
    .insert({
      id_usuario: userId,
      titulo: event.title,
      descripcion: event.description,
      fecha_hora: `${event.date}T${event.time || '00:00'}:00`,
      finalizada: false
    })
    .select()
    .single();

  if (error) return null;
  return { id: data.id, ...event };
};

export const getEvents = async (userId) => {
  const { data, error } = await supabase
    .from('registro_tarea')
    .select('*')
    .eq('id_usuario', userId)
    .order('fecha_hora', { ascending: true });

  if (error) return [];
  return data.map(row => ({
    id: row.id,
    title: row.titulo,
    description: row.descripcion,
    date: row.fecha_hora.split('T')[0],
    time: row.fecha_hora.split('T')[1]?.substring(0, 5),
    finalizada: row.finalizada,
  }));
};
```

---

## 7. Mapa de columnas AsyncStorage → Supabase

| AsyncStorage Key | Tabla Supabase | Columnas |
|---|---|---|
| `@manualdelbebe_profile` | `auth.users` | id, email, encrypted_password, raw_user_meta_data |
| `@manualdelbebe_session` | `supabase.auth` | (manejado por Supabase Auth) |
| `@manualdelbebe_profile` (campos extra) | `perfil_madre` | id_usuario, fecha_nac, fecha_fur, fecha_nac_bebe |
| `@biometric_data_YYYY-MM-DD` | `biometria_madre` | id_usuario, fecha_registro, peso, horas_suenio, presion_*, sintomas_* |
| `@baby_data_YYYY-MM-DD` | `metricas_bebe` | id_usuario, fecha_registro, movimiento_fetal, cambio_intensidad, alteraciones_piel, sintomas_* |
| `@baby_profile` | `perfil_bebe` | id_usuario, nombre, sexo, fecha_nac, peso_nac, talla_nac |
| `@calendar_events` | `registro_tarea` | id_usuario, titulo, descripcion, fecha_hora, finalizada |
| `@reminders_config` | `configuracion_recordatorios` | id_usuario, notificaciones_activadas, recordatorio_biometria, hora_biometria, recordatorio_bebe, hora_bebe, recordatorio_calendario, horas_anticipacion_calendario |
| `@manualdelbebe_theme` | `usuario` (o local) | Preferencia local (no necesita BD) |

---

## 8. Pasos de migracion

1. **Crear proyecto Supabase** y ejecutar el SQL
2. **Instalar** `@supabase/supabase-js`
3. **Crear** `supabaseClient.js` con URL y ANON KEY
4. **Cambiar** `DATA_PROVIDER = 'supabase'` en `dataService.js`
5. **Migrar authService.js** → usar `supabase.auth.signUp/signIn`
6. **Migrar biometricService.js** → usar `supabase.from('biometria_madre')`
7. **Migrar babyService.js** → usar `supabase.from('metricas_bebe')` + `perfil_bebe`
8. **Migrar calendarService.js** → usar `supabase.from('registro_tarea')`
9. **Migrar notificationService.js** → config en `recordatorios_config`
10. **Desactivar mockService.js** (no llamar mas `initializeMockData()`)
11. **Testing** completo en Android e iOS

---

## 9. Seguridad en produccion

- **Passwords**: Supabase Auth maneja hashing (bcrypt) automaticamente
- **RLS (Row Level Security)**: Habilitar en todas las tablas para que cada usuaria solo vea sus datos
- **TLS**: Supabase usa HTTPS por defecto
- **Encriptacion en reposo**: Supabase encripta datos automaticamente

### Ejemplo de politica RLS

```sql
-- Habilitar RLS
ALTER TABLE biometria_madre ENABLE ROW LEVEL SECURITY;

-- Politica: cada usuaria solo ve sus propios datos
CREATE POLICY "Usuaria ve sus biometricos" ON biometria_madre
    FOR ALL USING (auth.uid() = id_usuario);
```

---

*Manual generado para el equipo de desarrollo de MomsAI.*
