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
export const ALERT_THRESHOLDS = {
  BLOOD_PRESSURE_HIGH_SYSTOLIC: 140,    // mmHg
  BLOOD_PRESSURE_LOW_SYSTOLIC: 90,       // mmHg
  BLOOD_PRESSURE_HIGH_DIASTOLIC: 90,     // mmHg
  BLOOD_PRESSURE_LOW_DIASTOLIC: 60,      // mmHg
  WEIGHT_MIN_KG: 40,
  WEIGHT_MAX_KG: 200,
  SLEEP_MIN_HOURS: 4,
  SLEEP_MAX_HOURS: 16,
  SYMPTOM_RED_FLAGS: [
    'Tristeza persistente/Llanto',
    'Hinchazón de pies',
  ],
};

// Claves de AsyncStorage
export const STORAGE_KEYS = {
  USER_SESSION: '@manualdelbebe_session',
  USER_PROFILE: '@manualdelbebe_profile',
  BIOMETRIC_DATA_PREFIX: '@biometric_data_',
  CALENDAR_EVENTS: '@calendar_events',
  FUR_DATE: '@manualdelbebe_fur',
};

// Síntomas maternos (RF-05)
export const SINTOMAS_MATERNO = [
  'Fatiga extrema',
  'Dolor de cabeza',
  'Hinchazón de pies',
  'Náuseas/Problemas estomacales',
  'Ansiedad/Nerviosismo',
  'Tristeza persistente/Llanto',
  'Irritabilidad',
  'Sentimiento de culpa',
];

// Etapas del embarazo
export const EMBARAZO_ETAPAS = {
  pre_parto: 'pre_parto',
  post_parto: 'post_parto',
  desconocida: 'desconocida',
};

// Síntomas infantiles post-parto (RF-06)
export const SINTOMAS_INFANTIL_POSTPARTO = [
  'Llanto prolongado',
  'Rechazo de alimento',
  'Problemas de sueño',
  'Fiebre/Temperatura anómala',
  'Alteraciones en la piel del bebé',
];

// Movimientos fetales pre-parto (RF-06)
export const MOVIMIENTOS_FETALES = [
  'Movimiento fetal activo',
  'Disminución de movimiento fetal',
  'Cambio de intensidad',
  'Sin movimiento fetal',
];