// ──────────────────────────────────────────────────────────
// Servicio de datos — Capa de abstracción
// Abstrae el almacenamiento (AsyncStorage hoy, Supabase mañana)
// Todos los servicios pasan por aquí para evitar corrupción
// ──────────────────────────────────────────────────────────
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Configuración del proveedor de datos ─────────────
// Cambiar a 'supabase' cuando se integre la BD real IMPORTANTE
const DATA_PROVIDER = 'asyncstorage';

// ─── Helper: ejecutar según proveedor ─────────────────
const exec = async (asyncStorageFn) => {
  if (DATA_PROVIDER === 'asyncstorage') {
    return asyncStorageFn();
  }
  // TODO: cuando se integre Supabase, agregar lógica aquí
  // if (DATA_PROVIDER === 'supabase') { return supabaseFn(); }
  throw new Error(`Proveedor de datos no soportado: ${DATA_PROVIDER}`);
};

// ─── Operaciones genéricas ────────────────────────────

export const storage = {
  get: async (key) => {
    return exec(async () => {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    });
  },

  set: async (key, value) => {
    return exec(async () => {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    });
  },

  remove: async (key) => {
    return exec(async () => {
      await AsyncStorage.removeItem(key);
    });
  },

  getAll: async (prefix) => {
    return exec(async () => {
      const keys = await AsyncStorage.getAllKeys();
      const filtered = keys.filter(k => k.startsWith(prefix));
      const entries = await AsyncStorage.multiGet(filtered);
      return entries.map(([key, val]) => JSON.parse(val));
    });
  },

  clear: async () => {
    return exec(async () => {
      await AsyncStorage.clear();
    });
  },
};

// ─── Constantes de keys (centralizadas) ──────────────
export const KEYS = {
  USER_SESSION: '@manualdelbebe_session',
  USER_PROFILE: '@manualdelbebe_profile',
  BABY_PROFILE: '@baby_profile',
  BIOMETRIC_PREFIX: '@biometric_data_',
  BABY_DATA_PREFIX: '@baby_data_',
  CALENDAR_EVENTS: '@manualdelbebe_calendar_events',
  THEME: '@manualdelbebe_theme',
  MOCK_INITIALIZED: '@mock_initialized',
};

// ─── Helpers de fecha ─────────────────────────────────
export const formatDateKey = (date) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const getTodayKey = () => formatDateKey(new Date());

// ─── Determinar etapa ─────────────────────────────────
export const determinarEtapa = (user, babyProfile) => {
  if (user?.babyDate || babyProfile?.fechaNac) return 'post_parto';
  if (user?.furDate) return 'pre_parto';
  return 'sin_datos';
};

// ─── Cálculos obstétricos ─────────────────────────────
export const calcularSemanasGestacion = (fur) => {
  if (!fur) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const furDate = new Date(fur);
  furDate.setHours(0, 0, 0, 0);
  const diffMs = hoy.getTime() - furDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 0;
  return Math.floor(diffDays / 7);
};

export const calcularDiasRestantes = (fur) => {
  if (!fur) return null;
  const fpp = new Date(fur);
  fpp.setDate(fpp.getDate() + 280);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((fpp.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)));
};

export const calcularFPP = (fur) => {
  if (!fur) return null;
  const fpp = new Date(fur);
  fpp.setDate(fpp.getDate() + 280);
  return fpp;
};

export const calcularTrimestre = (semanas) => {
  if (semanas === null || semanas === undefined) return null;
  if (semanas <= 12) return 1;
  if (semanas <= 24) return 2;
  return 3;
};

export const calcularEdadBebe = (fechaNac) => {
  if (!fechaNac) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const nac = new Date(fechaNac);
  nac.setHours(0, 0, 0, 0);
  const diffMs = hoy.getTime() - nac.getTime();
  const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (dias < 0) return null;
  const semanas = Math.floor(dias / 7);
  return { dias, semanas };
};

// ─── Datos de desarrollo fetal por semana ─────────────
const DESARROLLO_FETAL = [
  { semana: 4, tamano: 'Amapola', peso: '< 1g', detalle: 'El embrión se implanta en el útero.' },
  { semana: 8, tamano: 'Frambuesa', peso: '1g', detalle: 'Se forman los dedos de manos y pies.' },
  { semana: 12, tamano: 'Limón', peso: '14g', detalle: 'Termina el primer trimestre. Ya tiene reflejos.' },
  { semana: 16, tamano: 'Palta', peso: '100g', detalle: 'Puede moverse y hacer gestos.' },
  { semana: 20, tamano: 'Banana', peso: '300g', detalle: 'Mitad del embarazo. Ya siente sonidos.' },
  { semana: 24, tamano: 'Mazorca', peso: '600g', detalle: 'Segundo trimestre. Responde a la luz.' },
  { semana: 28, tamano: 'Berenjena', peso: '1kg', detalle: 'Tercer trimestre. Abre los ojos.' },
  { semana: 32, tamano: 'Jícama', peso: '1.7kg', detalle: 'Practica respiración. Unghas crecen.' },
  { semana: 36, tamano: 'Lechuga', peso: '2.6kg', detalle: 'Se prepara para nacer. Cabeza baja.' },
  { semana: 40, tamano: 'Sandía pequeña', peso: '3.4kg', detalle: '¡Listo para nacer!' },
];

export const getDesarrolloSemanal = (semanas) => {
  if (!semanas || semanas < 1) return null;
  // Encontrar la info más cercana
  let closest = DESARROLLO_FETAL[0];
  for (const entry of DESARROLLO_FETAL) {
    if (entry.semana <= semanas) closest = entry;
  }
  return closest;
};

// ─── Hitos de desarrollo post-parto por edad ──────────
const HITOS_POSTPARTO = [
  { dias: 0, titulo: 'Nacimiento', detalle: 'Primeros días de adaptación.' },
  { dias: 15, titulo: '2 semanas', detalle: 'Reconoce la voz de la madre.' },
  { dias: 30, titulo: '1 mes', detalle: 'Levanta la cabeza brevemente.' },
  { dias: 60, titulo: '2 meses', detalle: 'Sonríe socialmente. Sigue objetos con la mirada.' },
  { dias: 90, titulo: '3 meses', detalle: 'Sostiene la cabeza. Balbucea.' },
  { dias: 180, titulo: '6 meses', detalle: 'Se sienta con apoyo. Come sólidos.' },
  { dias: 270, titulo: '9 meses', detalle: 'Se arrastra. Dice "mamá" o "papá".' },
  { dias: 365, titulo: '1 año', detalle: 'Da sus primeros pasos. Dice palabras simples.' },
];

export const getHitoDesarrollo = (dias) => {
  if (!dias && dias !== 0) return null;
  let closest = HITOS_POSTPARTO[0];
  for (const entry of HITOS_POSTPARTO) {
    if (entry.dias <= dias) closest = entry;
  }
  return closest;
};
