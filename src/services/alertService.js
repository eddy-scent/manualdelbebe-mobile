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
 *
 * Parámetros esperados: { horasSueno, presionSistolica, presionDiastolica, sintomas }
 *   sintomas: objeto con claves snake_case que mapean 1:1 con columnas de biometria_madre
 *   Ej: { dolor_cabeza: true, hinchazon_pies: false, ansiedad: true, ... }
 *
 * Cada alerta retornada: { fieldId, symptomName?, type, severity, title, message, action }
 *   fieldId:  'pressure' | 'sleep' | 'symptom' | 'mental_health'
 *   severity: 'warning' | 'danger'
 */
export function analyzeBiometricData({ horasSueno, presionSistolica, presionDiastolica, sintomas }) {
  const alerts = [];
  const sys = parseInt(presionSistolica, 10);
  const dia = parseInt(presionDiastolica, 10);
  const horasNum = parseFloat(horasSueno);

  // ─── Presión Arterial (ACOG) ──────────────────────────────────────
  if (!Number.isNaN(sys) && !Number.isNaN(dia) && sys > 0 && dia > 0) {
    if (sys >= ALERT_THRESHOLDS.BLOOD_PRESSURE_SEVERE_SYSTOLIC || dia >= ALERT_THRESHOLDS.BLOOD_PRESSURE_SEVERE_DIASTOLIC) {
      // ≥160/110 mmHg — Hipertensión severa
      alerts.push({
        fieldId: 'pressure',
        type: 'pressure',
        severity: 'danger',
        title: 'Atención a tu presión arterial',
        message: `Tu presión (${sys}/${dia} mmHg) está más alta de lo esperado. Te sugerimos que lo comentes con tu equipo médico a la brevedad.`,
        action: 'Puedes llamar a tu matrona u obstetra para que te oriente.',
      });
    } else if (sys >= ALERT_THRESHOLDS.BLOOD_PRESSURE_HIGH_SYSTOLIC || dia >= ALERT_THRESHOLDS.BLOOD_PRESSURE_HIGH_DIASTOLIC) {
      // ≥140/90 mmHg — Hipertensión leve
      alerts.push({
        fieldId: 'pressure',
        type: 'pressure',
        severity: 'warning',
        title: 'Presión un poco elevada',
        message: `Tu presión (${sys}/${dia} mmHg) está levemente por encima de lo habitual. Puede ser algo puntual, pero vale la pena comentárselo a tu médico.`,
        action: 'Menciónalo en tu próxima consulta o si tienes dudas, llama hoy.',
      });
    } else if (sys <= ALERT_THRESHOLDS.BLOOD_PRESSURE_LOW_SYSTOLIC || dia <= ALERT_THRESHOLDS.BLOOD_PRESSURE_LOW_DIASTOLIC) {
      // ≤90/60 mmHg — Hipotensión
      alerts.push({
        fieldId: 'pressure',
        type: 'pressure',
        severity: 'warning',
        title: 'Presión arterial baja',
        message: `Tu presión (${sys}/${dia} mmHg) está un poco baja. Puede hacerte sentir mareada o con poca energía.`,
        action: 'Hidratación y descanso ayudan. Si persiste, coméntalo con tu médico.',
      });
    }
  }

  // ─── Sueño ────────────────────────────────────────────────────────
  // Solo se alerta si hay privación severa (<4h), para no generar ruido con valores
  // moderados que son muy comunes en el embarazo y post-parto.
  if (!Number.isNaN(horasNum) && horasNum > 0 && horasNum < ALERT_THRESHOLDS.SLEEP_MIN_HOURS) {
    alerts.push({
      fieldId: 'sleep',
      type: 'sleep',
      severity: 'warning',
      title: 'Descanso importante',
      message: `Registraste solo ${horasNum} horas de sueño. Sabemos que es muy difícil, pero tu cuerpo necesita recuperar energía.`,
      action: 'Cuando puedas, busca un momento para descansar. No dudes en pedir ayuda.',
    });
  }

  // ─── Síntomas Maternos (dolor_cabeza / hinchazon_pies) ───────────
  // Claves mapeadas 1:1 con columnas de biometria_madre en Supabase.
  // DISEÑO DELIBERADO: solos NO generan alerta (son síntomas demasiado comunes
  // en el embarazo y generarían ruido / ansiedad innecesaria).
  // Solo escalan si coinciden con presión alta ≥140/90 (cuadro de posible preeclampsia).
  if (sintomas && typeof sintomas === 'object') {
    const isHighBP = !Number.isNaN(sys) && !Number.isNaN(dia) && (sys >= 140 || dia >= 90);

    for (const symptomKey of ALERT_THRESHOLDS.SYMPTOM_WARNING_FLAGS) {
      if (sintomas[symptomKey] && isHighBP) {
        alerts.push({
          fieldId: 'symptom',
          symptomName: symptomKey,
          type: 'symptom',
          severity: 'danger',
          title: 'Síntomas a observar juntos',
          message: 'Marcaste este síntoma y tu presión arterial está elevada. Esta combinación es importante que la evalúe tu profesional de salud.',
          action: 'Te sugerimos comunicarte con tu centro de salud hoy.',
        });
      }
    }

    // ─── Salud Mental (EPDS adaptado) ─────────────────────────────
    // Claves: tristeza, ansiedad, culpa, irritabilidad — columnas de biometria_madre.
    // Se activa solo si 3 o más coinciden simultáneamente para evitar falsos positivos.
    const sintomasMentalesActivos = ALERT_THRESHOLDS.SYMPTOM_MENTAL_HEALTH.filter((s) => sintomas[s]);
    if (sintomasMentalesActivos.length >= ALERT_THRESHOLDS.MENTAL_HEALTH_THRESHOLD) {
      alerts.push({
        fieldId: 'mental_health',
        type: 'mental_health',
        severity: 'warning',
        title: 'Cuidando tus emociones',
        message: 'Hemos notado que marcaste varios síntomas emocionales. Es completamente normal sentirse así, pero no tienes que atravesarlo sola.',
        action: 'Considera hablar con alguien de confianza, tu médico o matrona puede orientarte.',
      });
    }
  }

  return alerts;
}

/**
 * Analiza los síntomas del BEBÉ y retorna un array de alertas.
 *
 * Parámetros esperados: { sintomas, movimientos, etapa }
 *   sintomas:    objeto con claves snake_case → columnas de metricas_bebe en Supabase
 *                Ej: { fiebre: true, rechazo_alimento: true, llanto_prolongado: false, ... }
 *   movimientos: objeto con claves snake_case de movimientos fetales (solo pre_parto)
 *                Ej: { movimiento_fetal: false, sin_movimiento: true, ... }
 *   etapa:       'pre_parto' | 'post_parto'
 *
 * Cada alerta retornada: { fieldId, symptomName, symptomNames?, type, severity, title, message, action }
 *
 * NOTA DE DISEÑO — Alerta combinada:
 *   Si rechazo_alimento + llanto_prolongado están activos simultáneamente,
 *   se genera UN SOLO objeto de alerta con 'symptomNames' como array para
 *   que la UI pueda resaltar ambos checkboxes sin duplicar tarjetas.
 */
export function analyzeBabyData({ sintomas, movimientos, etapa }) {
  const alerts = [];

  if (!sintomas || typeof sintomas !== 'object') return alerts;

  // ─── Fiebre (columna: fiebre) ─────────────────────────────────────
  // Referencia: AAP — cualquier fiebre en lactantes menores requiere evaluación.
  if (sintomas[ALERT_THRESHOLDS.BABY_FEVER_SYMPTOM]) {
    alerts.push({
      fieldId: 'symptom',
      symptomName: ALERT_THRESHOLDS.BABY_FEVER_SYMPTOM,
      type: 'baby_fever',
      severity: 'danger',
      title: 'Atención a la temperatura',
      message: 'Nos indicas que tu bebé tiene temperatura anómala. Para su bienestar, es recomendable que un profesional lo evalúe.',
      action: 'Contacta a tu pediatra para que te oriente sobre los pasos a seguir.',
    });
  }

  // ─── Rechazo + Llanto (columnas: rechazo_alimento, llanto_prolongado) ───
  // REGLA DE UNIFICACIÓN: si ambos síntomas están activos → un solo objeto de alerta.
  // Esto evita renderizar tarjetas duplicadas en la UI.
  // El campo 'symptomNames' permite que la UI resalte ambos checkboxes simultáneamente.
  const [keyRechazo, keyLlanto] = ALERT_THRESHOLDS.BABY_COMBINED_DANGER;
  const tieneRechazo = !!sintomas[keyRechazo];
  const tieneLlanto  = !!sintomas[keyLlanto];

  if (tieneRechazo && tieneLlanto) {
    alerts.push({
      fieldId: 'symptom',
      symptomName: keyRechazo,               // síntoma principal (lleva el ícono)
      symptomNames: [keyRechazo, keyLlanto], // ambas claves para resaltar en UI
      type: 'baby_feeding_crying',
      severity: 'danger',
      title: 'Combinación de síntomas',
      message: 'El rechazo de alimento junto con el llanto prolongado puede indicar que algo le incomoda al bebé (cólicos, molestias gástricas u otros).',
      action: 'Te sugerimos comentárselo a tu pediatra el día de hoy.',
    });
  } else if (tieneRechazo) {
    alerts.push({
      fieldId: 'symptom',
      symptomName: keyRechazo,
      type: 'baby_feeding',
      severity: 'warning',
      title: 'Alimentación del bebé',
      message: 'El rechazo de alimento puede ser algo temporal. A veces los bebés necesitan más tiempo o tienen días difíciles.',
      action: 'Observa cómo evoluciona. Si persiste más de un día, consúltalo con tu pediatra.',
    });
  } else if (tieneLlanto) {
    alerts.push({
      fieldId: 'symptom',
      symptomName: keyLlanto,
      type: 'baby_crying',
      severity: 'warning',
      title: 'Llanto prolongado',
      message: 'El llanto es la principal forma de comunicación del bebé. Sabemos que puede ser agotador escucharlo.',
      action: 'Si el llanto te parece inusual o no responde a nada, consúltalo con el médico.',
    });
  }

  // ─── Alteraciones en la piel (columna: alteraciones_piel) ────────
  if (sintomas.alteraciones_piel) {
    alerts.push({
      fieldId: 'symptom',
      symptomName: 'alteraciones_piel',
      type: 'baby_skin',
      severity: 'info',
      title: 'Piel del bebé',
      message: 'Las alteraciones leves en la piel son muy frecuentes en los bebés.',
      action: 'Menciónalo en tu próximo control. Si se extiende o empeora, consúltalo antes.',
    });
  }

  // ─── Problemas de sueño (columna: problemas_suenio) ──────────────
  // Se mantiene a nivel 'info' — es el síntoma de menor gravedad y el más común.
  // No se eleva para no saturar la UI con avisos de escaso valor clínico.
  if (sintomas.problemas_suenio) {
    alerts.push({
      fieldId: 'symptom',
      symptomName: 'problemas_suenio',
      type: 'baby_sleep',
      severity: 'info',
      title: 'Sueño del bebé',
      message: 'Los cambios en el patrón de sueño son muy comunes en los primeros meses.',
      action: 'Si el bebé está difícil de despertar o muy inusual, coméntalo con tu pediatra.',
    });
  }

  // ─── Ausencia / disminución de movimiento fetal (pre-parto) ──────
  // Columnas: movimiento_fetal, cambio_intensidad, sin_movimiento, disminucion_movimiento
  // Solo genera alerta si hay ausencia/disminución explícita Y no hay movimiento positivo.
  if (etapa === 'pre_parto' && movimientos && typeof movimientos === 'object') {
    const hayMovimiento = movimientos.movimiento_fetal || movimientos.cambio_intensidad;
    const hayAusencia   = movimientos.sin_movimiento || movimientos.disminucion_movimiento;

    if (!hayMovimiento && hayAusencia) {
      const symptomKey = movimientos.sin_movimiento ? 'sin_movimiento' : 'disminucion_movimiento';
      alerts.push({
        fieldId: 'symptom',
        symptomName: symptomKey,
        type: 'fetal_movement',
        severity: 'danger',
        title: 'Movimientos de tu bebé',
        message: 'Registraste una disminución o ausencia de movimientos fetales. Es importante asegurarse de que todo vaya bien.',
        action: 'Comunícate con tu matrona u obstetra para un chequeo que te dé tranquilidad.',
      });
    }
  }

  return alerts;
}

/**
 * Retorna el estado de salud global basado en las alertas generadas.
 * 'ok' | 'info' | 'warning' | 'danger'
 */
export function getHealthStatus(alerts) {
  if (!alerts || alerts.length === 0) return 'ok';
  if (alerts.some((a) => a.severity === 'danger'))  return 'danger';
  if (alerts.some((a) => a.severity === 'warning')) return 'warning';
  return 'info';
}
