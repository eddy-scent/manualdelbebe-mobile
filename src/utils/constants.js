// ──────────────────────────────────────────────────────────
// Constantes globales de la aplicación
// ──────────────────────────────────────────────────────────

// Colores de la paleta
export const COLORS = {
  primary: '#EB5D8B',
  primaryLight: '#FBD5E3',
  primaryShadow: 'rgba(235,93,139,0.3)',
  primaryBg: 'rgba(235,93,139,0.08)',
  primaryBgStrong: 'rgba(235,93,139,0.1)',

  accent: '#6EC1E4',
  accentLight: '#B4E4F5',
  accentBg: 'rgba(110,193,228,0.15)',

  surface: '#fcf9f3',
  surfaceAlt: '#f0eee8',
  card: '#ffffff',
  cardBorder: 'rgba(128,115,88,0.12)',

  text: '#1c1c18',
  textSecondary: '#574146',
  textTertiary: '#807358',

  danger: '#ff6b6b',
  dangerBg: 'rgba(255,107,107,0.1)',

  inputBorder: 'rgba(128,115,88,0.1)',
  inputBorderFocused: 'rgba(128,115,88,0.2)',
};

// Umbrales para el motor de alertas (RF-09)
// Basados en: ACOG Practice Bulletin No. 202 y AAP Caring for Your Baby.
// Ver detalle clínico completo en: docs/UMBRALES_ALERTAS.md
export const ALERT_THRESHOLDS = {
  // ── Presión Arterial (ACOG) ────────────────────────────────────────
  BLOOD_PRESSURE_SEVERE_SYSTOLIC: 160,   // ≥160 mmHg = Hipertensión severa (EMERGENCIA)
  BLOOD_PRESSURE_SEVERE_DIASTOLIC: 110,  // ≥110 mmHg = Hipertensión severa (EMERGENCIA)
  BLOOD_PRESSURE_HIGH_SYSTOLIC: 140,     // ≥140 mmHg = Hipertensión gestacional (PELIGRO)
  BLOOD_PRESSURE_HIGH_DIASTOLIC: 90,     // ≥90 mmHg  = Hipertensión gestacional (PELIGRO)
  BLOOD_PRESSURE_LOW_SYSTOLIC: 90,       // ≤90 mmHg  = Hipotensión (ADVERTENCIA)
  BLOOD_PRESSURE_LOW_DIASTOLIC: 60,      // ≤60 mmHg  = Hipotensión (ADVERTENCIA)

  // ── Sueño ─────────────────────────────────────────────────────────
  SLEEP_MIN_HOURS: 4,                    // <4h = Privación severa (ADVERTENCIA)

  // ── Peso (rangos generales de referencia) ─────────────────────────
  WEIGHT_MIN_KG: 40,
  WEIGHT_MAX_KG: 200,

  // ── Síntomas Maternos (ACOG Warning Signs) ────────────────────────
  // Claves snake_case = columnas de biometria_madre en Supabase
  // Generan ADVERTENCIA por sí solos. Suben a PELIGRO si hay presión alta.
  SYMPTOM_WARNING_FLAGS: [
    'dolor_cabeza',
    'hinchazon_pies',
  ],

  // ── Síntomas de Salud Mental (EPDS adaptado) ──────────────────────
  // Claves snake_case = columnas de biometria_madre en Supabase
  // Si se marcan 3 o más de estos juntos → alerta ADVERTENCIA.
  SYMPTOM_MENTAL_HEALTH: [
    'tristeza',
    'ansiedad',
    'culpa',
    'irritabilidad',
  ],
  MENTAL_HEALTH_THRESHOLD: 3,

  // ── Síntomas del Bebé (AAP) ───────────────────────────────────────
  // Claves snake_case = columnas de metricas_bebe en Supabase
  BABY_FEVER_SYMPTOM: 'fiebre',
  BABY_COMBINED_DANGER: ['rechazo_alimento', 'llanto_prolongado'],
};

// Claves de AsyncStorage
export const STORAGE_KEYS = {
  USER_SESSION: '@manualdelbebe_session',
  USER_PROFILE: '@manualdelbebe_profile',
  BIOMETRIC_DATA_PREFIX: '@biometric_data_',
  CALENDAR_EVENTS: '@calendar_events',
  FUR_DATE: '@manualdelbebe_fur',
};

// ─── Síntomas maternos ───────────────────────────────────
// Claves snake_case = columnas de biometria_madre en Supabase.
// El array define el orden de renderizado en UI.
export const SINTOMAS_MATERNO = [
  'fatiga',
  'dolor_cabeza',
  'hinchazon_pies',
  'nauseas',
  'ansiedad',
  'tristeza',
  'irritabilidad',
  'culpa',
];

// Etiquetas legibles en español para cada clave de síntoma materno
export const SINTOMAS_MATERNO_LABELS = {
  fatiga:        'Fatiga extrema',
  dolor_cabeza:  'Dolor de cabeza',
  hinchazon_pies:'Hinchazón de pies',
  nauseas:       'Náuseas / Problemas estomacales',
  ansiedad:      'Ansiedad / Nerviosismo',
  tristeza:      'Tristeza persistente / Llanto',
  irritabilidad: 'Irritabilidad',
  culpa:         'Sentimiento de culpa',
};

// Etapas del embarazo
export const EMBARAZO_ETAPAS = {
  pre_parto: 'pre_parto',
  post_parto: 'post_parto',
  desconocida: 'desconocida',
};

// ─── Síntomas infantiles post-parto ──────────────────────
// Claves snake_case = columnas de metricas_bebe en Supabase.
export const SINTOMAS_INFANTIL_POSTPARTO = [
  'llanto_prolongado',
  'rechazo_alimento',
  'problemas_suenio',
  'fiebre',
  'alteraciones_piel',
];

// Etiquetas legibles en español para cada clave de síntoma infantil
export const SINTOMAS_INFANTIL_LABELS = {
  llanto_prolongado: 'Llanto prolongado',
  rechazo_alimento:  'Rechazo de alimento',
  problemas_suenio:  'Problemas de sueño',
  fiebre:            'Fiebre / Temperatura anómala',
  alteraciones_piel: 'Alteraciones en la piel del bebé',
};

// ─── Movimientos fetales pre-parto ───────────────────────
// Claves snake_case = columnas de metricas_bebe en Supabase.
export const MOVIMIENTOS_FETALES = [
  'movimiento_fetal',
  'cambio_intensidad',
  'disminucion_movimiento',
  'sin_movimiento',
];

// Etiquetas legibles en español para cada clave de movimiento fetal
export const MOVIMIENTOS_FETALES_LABELS = {
  movimiento_fetal:       'Movimiento fetal activo',
  cambio_intensidad:      'Cambio de intensidad',
  disminucion_movimiento: 'Disminución de movimiento fetal',
  sin_movimiento:         'Sin movimiento fetal',
};

// ─── Paleta de colores para tema oscuro ─────────────────
export const DARK_COLORS = {
  primary: '#EB5D8B',
  primaryLight: '#3d2030',
  primaryShadow: 'rgba(235,93,139,0.4)',
  primaryBg: 'rgba(235,93,139,0.15)',
  primaryBgStrong: 'rgba(235,93,139,0.2)',

  accent: '#6EC1E4',
  accentLight: '#1a2e3a',
  accentBg: 'rgba(110,193,228,0.2)',

  surface: '#1a1a2e',
  surfaceAlt: '#22223a',
  card: '#252542',
  cardBorder: 'rgba(255,255,255,0.08)',

  text: '#f0eee8',
  textSecondary: '#b8a9ae',
  textTertiary: '#8a7d82',

  danger: '#ff6b6b',
  dangerBg: 'rgba(255,107,107,0.15)',

  inputBorder: 'rgba(255,255,255,0.08)',
  inputBorderFocused: 'rgba(255,255,255,0.15)',
};