// ──────────────────────────────────────────────────────────────────────
// Motor de Alertas Proactivas — RF-09
// Evalúa datos biométricos maternos y síntomas del bebé localmente
// (en el front-end, justo antes/después de guardar en Supabase).
//
// Umbrales basados en:
//   · ACOG Practice Bulletin No. 202 (Preeclampsia / Hipertensión)
//   · ACOG Urgent Maternal Warning Signs
//   · Edinburgh Postnatal Depression Scale (EPDS) adaptado
//   · AAP — Caring for Your Baby and Young Child (8va ed.)
//
// Ver: docs/UMBRALES_ALERTAS.md
// ──────────────────────────────────────────────────────────────────────
import { ALERT_THRESHOLDS } from '../utils/constants';

/**
 * Analiza los datos biométricos MATERNOS y retorna un array de alertas.
 * Cada alerta: { type, severity, title, message, action }
 *   type:     'pressure' | 'sleep' | 'weight' | 'symptom' | 'mental_health'
 *   severity: 'info' | 'warning' | 'danger' | 'emergency'
 */
export function analyzeBiometricData({ peso, horasSueno, presionSistolica, presionDiastolica, sintomas }) {
  const alerts = [];
  const sys = parseInt(presionSistolica, 10);
  const dia = parseInt(presionDiastolica, 10);
  const pesoNum = parseFloat(peso);
  const horasNum = parseFloat(horasSueno);

  // ─── Presión Arterial (ACOG) ──────────────────────────────────────
  if (!Number.isNaN(sys) && !Number.isNaN(dia) && sys > 0 && dia > 0) {
    // Hipertensión Severa → EMERGENCIA (≥160/110)
    if (sys >= ALERT_THRESHOLDS.BLOOD_PRESSURE_SEVERE_SYSTOLIC || dia >= ALERT_THRESHOLDS.BLOOD_PRESSURE_SEVERE_DIASTOLIC) {
      alerts.push({
        type: 'pressure',
        severity: 'emergency',
        title: '🚨 Presión arterial en rango severo',
        message: `Tu presión (${sys}/${dia} mmHg) es una emergencia médica. Una presión ≥160/110 requiere atención inmediata según ACOG.`,
        action: 'Acude a urgencias o llama a emergencias AHORA.',
      });
    }
    // Hipertensión Gestacional → PELIGRO (≥140/90)
    else if (sys >= ALERT_THRESHOLDS.BLOOD_PRESSURE_HIGH_SYSTOLIC || dia >= ALERT_THRESHOLDS.BLOOD_PRESSURE_HIGH_DIASTOLIC) {
      alerts.push({
        type: 'pressure',
        severity: 'danger',
        title: '🔴 Presión arterial elevada',
        message: `Tu presión (${sys}/${dia} mmHg) supera el umbral normal para el embarazo (140/90 mmHg). Puede indicar hipertensión gestacional o preeclampsia.`,
        action: 'Contacta a tu matrona u obstetra lo antes posible.',
      });
    }
    // Hipotensión → ADVERTENCIA (≤90/60)
    else if (sys <= ALERT_THRESHOLDS.BLOOD_PRESSURE_LOW_SYSTOLIC || dia <= ALERT_THRESHOLDS.BLOOD_PRESSURE_LOW_DIASTOLIC) {
      alerts.push({
        type: 'pressure',
        severity: 'warning',
        title: '🟡 Presión arterial baja',
        message: `Tu presión (${sys}/${dia} mmHg) está por debajo del rango normal. Puede causar mareos o desmayos.`,
        action: 'Hidratación, descanso y consulta con tu médico si persiste.',
      });
    }
  }

  // ─── Peso ─────────────────────────────────────────────────────────
  if (!Number.isNaN(pesoNum) && pesoNum > 0) {
    if (pesoNum < ALERT_THRESHOLDS.WEIGHT_MIN_KG) {
      alerts.push({
        type: 'weight',
        severity: 'warning',
        title: '🟡 Peso por debajo del rango',
        message: `El peso registrado (${pesoNum} kg) parece bajo. Consulta con tu médico si esto te preocupa.`,
        action: 'Comenta el dato con tu profesional de salud.',
      });
    } else if (pesoNum > ALERT_THRESHOLDS.WEIGHT_MAX_KG) {
      alerts.push({
        type: 'weight',
        severity: 'warning',
        title: '🟡 Peso por encima del rango',
        message: `El peso registrado (${pesoNum} kg) supera el rango esperado.`,
        action: 'Comenta el dato con tu profesional de salud.',
      });
    }
  }

  // ─── Sueño ────────────────────────────────────────────────────────
  if (!Number.isNaN(horasNum) && horasNum > 0 && horasNum < ALERT_THRESHOLDS.SLEEP_MIN_HOURS) {
    alerts.push({
      type: 'sleep',
      severity: 'warning',
      title: '🟡 Privación severa de sueño',
      message: `Registraste solo ${horasNum} horas de sueño. Menos de 4 horas es privación severa que afecta tu salud y la del bebé.`,
      action: 'Intenta descansar más. Si es persistente, coméntalo con tu médico.',
    });
  }

  // ─── Síntomas Críticos Maternos (ACOG) ───────────────────────────
  if (sintomas && typeof sintomas === 'object') {
    for (const sintomaRojo of ALERT_THRESHOLDS.SYMPTOM_RED_FLAGS) {
      if (sintomas[sintomaRojo]) {
        alerts.push({
          type: 'symptom',
          severity: 'danger',
          title: `🔴 Síntoma de alarma: ${sintomaRojo}`,
          message: `"${sintomaRojo}" es una señal de advertencia urgente según ACOG, especialmente si va acompañada de presión alta o cambios visuales.`,
          action: 'Contacta a tu profesional de salud hoy.',
        });
      }
    }

    // ─── Salud Mental (EPDS adaptado) ─────────────────────────────
    const sintomasMentalesActivos = ALERT_THRESHOLDS.SYMPTOM_MENTAL_HEALTH.filter(
      (s) => sintomas[s]
    );
    if (sintomasMentalesActivos.length >= ALERT_THRESHOLDS.MENTAL_HEALTH_THRESHOLD) {
      alerts.push({
        type: 'mental_health',
        severity: 'warning',
        title: '💛 Posibles señales de estrés emocional',
        message: `Registraste ${sintomasMentalesActivos.length} síntomas emocionales simultáneos. Esto puede indicar estrés posparto o depresión postparto.`,
        action: 'Habla con tu médico o matrona. No estás sola.',
      });
    }
  }

  return alerts;
}

/**
 * Analiza los síntomas del BEBÉ y retorna un array de alertas.
 * Cada alerta: { type, severity, title, message, action }
 */
export function analyzeBabyData({ sintomas, movimientos, etapa }) {
  const alerts = [];

  if (!sintomas || typeof sintomas !== 'object') return alerts;

  // ─── Fiebre → EMERGENCIA (AAP) ────────────────────────────────────
  const tieneFiebre = ALERT_THRESHOLDS.BABY_EMERGENCY_SYMPTOMS.some((s) => sintomas[s]);
  if (tieneFiebre) {
    alerts.push({
      type: 'baby_fever',
      severity: 'emergency',
      title: '🚨 Fiebre en el bebé — Emergencia',
      message: 'Reportaste fiebre en tu bebé. Según la AAP, cualquier fiebre (≥38°C) en bebés pequeños es una emergencia médica que requiere evaluación INMEDIATA.',
      action: 'Lleva a tu bebé a urgencias pediátricas AHORA.',
    });
  }

  // ─── Rechazo de alimento + Llanto → PELIGRO (AAP) ────────────────
  const [sintomaA, sintomaB] = ALERT_THRESHOLDS.BABY_COMBINED_DANGER;
  const tieneRechazo = !!sintomas[sintomaA];
  const tieneLlanto = !!sintomas[sintomaB];

  if (tieneRechazo && tieneLlanto) {
    alerts.push({
      type: 'baby_feeding_crying',
      severity: 'danger',
      title: '🔴 Rechazo de alimento con llanto inconsolable',
      message: 'La combinación de rechazo de alimento y llanto prolongado puede indicar cólico severo, infección o problema gastrointestinal (AAP).',
      action: 'Contacta a tu pediatra el mismo día.',
    });
  } else if (tieneRechazo) {
    alerts.push({
      type: 'baby_feeding',
      severity: 'warning',
      title: '🟡 Rechazo de alimento',
      message: 'Tu bebé rechazó el alimento. Si es persistente, requiere atención pediátrica.',
      action: 'Observa 24h. Si persiste, consulta con tu pediatra.',
    });
  } else if (tieneLlanto) {
    alerts.push({
      type: 'baby_crying',
      severity: 'warning',
      title: '🟡 Llanto prolongado',
      message: 'Tu bebé presentó llanto prolongado. Puede ser cólicos, pero si es inconsolable o inusual, merece atención.',
      action: 'Observa su comportamiento. Consulta si no mejora.',
    });
  }

  // ─── Síntomas de vigilancia ───────────────────────────────────────
  if (sintomas['Alteraciones en la piel del bebé']) {
    alerts.push({
      type: 'baby_skin',
      severity: 'warning',
      title: '🟡 Alteraciones en la piel del bebé',
      message: 'Las alteraciones en la piel pueden ser eccema, reacciones alérgicas u otras condiciones que requieren revisión.',
      action: 'Muéstrale la piel al pediatra en la próxima consulta o antes si se extiende.',
    });
  }

  if (sintomas['Problemas de sueño']) {
    alerts.push({
      type: 'baby_sleep',
      severity: 'info',
      title: '🔵 Problemas de sueño del bebé',
      message: 'Los problemas de sueño son comunes, pero si el bebé está inusualmente dormido o difícil de despertar, puede ser señal de alerta.',
      action: 'Si el bebé está letárgico o difícil de despertar, contacta al pediatra.',
    });
  }

  // ─── Ausencia de movimiento fetal (pre-parto) ─────────────────────
  if (etapa === 'pre_parto' && movimientos) {
    const sinMovimiento =
      !movimientos['Movimiento fetal activo'] &&
      !movimientos['Cambio de intensidad'];

    if (sinMovimiento) {
      alerts.push({
        type: 'fetal_movement',
        severity: 'danger',
        title: '🔴 Sin movimiento fetal reportado',
        message: 'No reportaste movimiento fetal. A partir de la semana 28, la disminución o ausencia de movimientos fetales requiere evaluación obstétrica.',
        action: 'Contacta a tu matrona u obstetra hoy.',
      });
    }
  }

  return alerts;
}

/**
 * Retorna el estado de salud global basado en las alertas generadas.
 * 'ok' | 'info' | 'warning' | 'danger' | 'emergency'
 */
export function getHealthStatus(alerts) {
  if (!alerts || alerts.length === 0) return 'ok';
  if (alerts.some((a) => a.severity === 'emergency')) return 'emergency';
  if (alerts.some((a) => a.severity === 'danger')) return 'danger';
  if (alerts.some((a) => a.severity === 'warning')) return 'warning';
  return 'info';
}