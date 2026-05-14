// ──────────────────────────────────────────────────────────
// Motor de Alertas Proactivas — RF-09
// Analiza datos biométricos y genera alertas si superan umbrales
// ──────────────────────────────────────────────────────────
import { ALERT_THRESHOLDS, SINTOMAS_MATERNO } from '../utils/constants';

/**
 * Analiza los datos biométricos ingresados y retorna un array de alertas.
 * Cada alerta tiene: { type, severity, title, message }
 * type: 'pressure' | 'weight' | 'sleep' | 'symptom'
 * severity: 'warning' | 'danger'
 */
export function analyzeBiometricData({ peso, horasSueno, presionSistolica, presionDiastolica, sintomas }) {
  const alerts = [];
  const sys = parseInt(presionSistolica, 10);
  const dia = parseInt(presionDiastolica, 10);
  const pesoNum = parseFloat(peso);
  const horasNum = parseFloat(horasSueno);

  // ─── Presión arterial ────────────────────────────
  if (!Number.isNaN(sys) && !Number.isNaN(dia)) {
    if (sys >= ALERT_THRESHOLDS.BLOOD_PRESSURE_HIGH_SYSTOLIC || dia >= ALERT_THRESHOLDS.BLOOD_PRESSURE_HIGH_DIASTOLIC) {
      alerts.push({
        type: 'pressure',
        severity: 'danger',
        title: 'Presión arterial elevada',
        message: `Tu presión (${sys}/${dia} mmHg) supera los valores normales. Te recomendamos contactar a tu profesional de salud.`,
      });
    } else if (sys <= ALERT_THRESHOLDS.BLOOD_PRESSURE_LOW_SYSTOLIC || dia <= ALERT_THRESHOLDS.BLOOD_PRESSURE_LOW_DIASTOLIC) {
      alerts.push({
        type: 'pressure',
        severity: 'warning',
        title: 'Presión arterial baja',
        message: `Tu presión (${sys}/${dia} mmHg) está por debajo de los valores normales. Si presentas mareos o desmayos, consultá a tu médico.`,
      });
    }
  }

  // ─── Peso ────────────────────────────────────────
  if (!Number.isNaN(pesoNum)) {
    if (pesoNum < ALERT_THRESHOLDS.WEIGHT_MIN_KG) {
      alerts.push({
        type: 'weight',
        severity: 'warning',
        title: 'Peso por debajo del rango',
        message: `El peso registrado (${pesoNum} kg) parece bajo. Consultá con tu médico si esto es preocupante.`,
      });
    } else if (pesoNum > ALERT_THRESHOLDS.WEIGHT_MAX_KG) {
      alerts.push({
        type: 'weight',
        severity: 'warning',
        title: 'Peso por encima del rango',
        message: `El peso registrado (${pesoNum} kg) supera el rango esperado. Comentálo con tu profesional de salud.`,
      });
    }
  }

  // ─── Horas de sueño ──────────────────────────────
  if (!Number.isNaN(horasNum)) {
    if (horasNum < ALERT_THRESHOLDS.SLEEP_MIN_HOURS) {
      alerts.push({
        type: 'sleep',
        severity: 'warning',
        title: 'Pocas horas de sueño',
        message: `Registraste ${horasNum} horas de sueño, lo cual es insuficiente. El descanso es importante para tu salud y la del bebé.`,
      });
    }
  }

  // ─── Síntomas de bandera roja ────────────────────
  if (sintomas && typeof sintomas === 'object') {
    const activeSymptoms = Object.entries(sintomas)
      .filter(([_, checked]) => checked)
      .map(([name]) => name);

    for (const symptom of activeSymptoms) {
      if (ALERT_THRESHOLDS.SYMPTOM_RED_FLAGS.includes(symptom)) {
        alerts.push({
          type: 'symptom',
          severity: 'danger',
          title: `Síntoma importante: ${symptom}`,
          message: `"${symptom}" puede requerir atención médica. No es un diagnóstico, pero te sugerimos consultárselo a tu profesional de salud.`,
        });
      }
    }

    // Si hay 3 o más síntomas activos, alertar
    if (activeSymptoms.length >= 3) {
      alerts.push({
        type: 'symptom',
        severity: 'warning',
        title: 'Múltiples síntomas registrados',
        message: `Registraste ${activeSymptoms.length} síntomas hoy. Si estos persisten o se intensifican, consultá con tu médico.`,
      });
    }
  }

  return alerts;
}

/**
 * Retorna un resumen rápido del estado de salud basado en alertas.
 * 'ok' | 'warning' | 'danger'
 */
export function getHealthStatus(alerts) {
  if (!alerts || alerts.length === 0) return 'ok';
  if (alerts.some(a => a.severity === 'danger')) return 'danger';
  return 'warning';
}