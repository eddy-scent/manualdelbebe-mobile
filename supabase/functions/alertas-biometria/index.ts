// ══════════════════════════════════════════════════════════════════════
// Edge Function: alertas-biometria
// MomsAI — RF-09 (Alertas Proactivas)
//
// Evalúa los datos biométricos maternos y síntomas del bebé que llegan
// vía POST (webhook de Supabase Database) y genera alertas clínicas
// basadas en guías de ACOG (American College of Obstetricians and
// Gynecologists) y AAP (American Academy of Pediatrics).
//
// Fuentes:
//   · ACOG Practice Bulletin No. 202: Gestational Hypertension and
//     Preeclampsia — https://doi.org/10.1097/AOG.0000000000003432
//   · ACOG Maternal Warning Signs — https://www.acog.org/womens-health/
//   · AAP Caring for Your Baby — https://www.healthychildren.org/
// ══════════════════════════════════════════════════════════════════════

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ──────────────────────────────────────────────────────────────────────
// UMBRALES MÉDICOS (basados en ACOG y AAP)
// ──────────────────────────────────────────────────────────────────────
const THRESHOLDS = {
  // PRESIÓN ARTERIAL (ACOG Practice Bulletin No. 202)
  PRESION: {
    ALTA_SISTOLICA: 140,      // ≥140 mmHg = hipertensión gestacional
    ALTA_DIASTOLICA: 90,      // ≥90 mmHg  = hipertensión gestacional
    SEVERA_SISTOLICA: 160,    // ≥160 mmHg = hipertensión severa (emergencia)
    SEVERA_DIASTOLICA: 110,   // ≥110 mmHg = hipertensión severa (emergencia)
    BAJA_SISTOLICA: 90,       // ≤90 mmHg  = hipotensión (mareos, desmayos)
    BAJA_DIASTOLICA: 60,      // ≤60 mmHg  = hipotensión
  },

  // SUEÑO
  SUENIO: {
    MIN_HORAS: 4,             // <4 h = privación severa de sueño
    IDEAL_MIN: 7,             // 7-9 h = rango recomendado en embarazo
  },

  // SÍNTOMAS MATERNOS DE ALARMA (ACOG Urgent Maternal Warning Signs)
  // Los síntomas listados aquí deben disparar una alerta inmediata si
  // se reportan de forma aislada.
  SINTOMAS_CRITICOS_MADRE: [
    'dolor_cabeza',    // Cefalea severa → posible neurológico o preeclampsia
    'hinchazon_pies',  // Edema súbito → posible preeclampsia o TVP
  ],

  // SÍNTOMAS QUE DISPARAN ALARMA MENTAL SI SE COMBINAN
  // (Edinburgh Postnatal Depression Scale - EPDS adaptado)
  SINTOMAS_SALUD_MENTAL: [
    'tristeza',        // Tristeza persistente
    'ansiedad',        // Ansiedad/Nerviosismo
    'culpa',           // Sentimiento de culpa
    'irritabilidad',   // Irritabilidad extrema
  ],
  SALUD_MENTAL_UMBRAL_COMBINADOS: 3, // 3+ síntomas simultáneos = alerta

  // SÍNTOMAS DEL BEBÉ (AAP — Caring for Your Newborn)
  SINTOMAS_CRITICOS_BEBE: {
    EMERGENCIA: ['fiebre'],             // Emergencia absoluta en neonatos
    URGENTES: ['rechazo_alimento', 'llanto_prolongado'], // Urgentes si coexisten
    VIGILANCIA: ['problemas_suenio', 'alteraciones_piel'],
  },
};

// ──────────────────────────────────────────────────────────────────────
// TIPOS DE RESPUESTA
// ──────────────────────────────────────────────────────────────────────
type Severidad = 'info' | 'advertencia' | 'peligro' | 'emergencia';

interface Alerta {
  tipo: string;
  severidad: Severidad;
  titulo: string;
  mensaje: string;
  accion_recomendada: string;
}

// ──────────────────────────────────────────────────────────────────────
// EVALUADOR DE BIOMETRÍA MATERNA
// ──────────────────────────────────────────────────────────────────────
function evaluarBiometriaMadre(registro: Record<string, unknown>): Alerta[] {
  const alertas: Alerta[] = [];

  const sys = Number(registro.presion_sistolica);
  const dia = Number(registro.presion_diastolica);
  const horas = Number(registro.horas_suenio);

  // ── Presión Arterial ──────────────────────────────────────────────
  if (!isNaN(sys) && !isNaN(dia) && sys > 0 && dia > 0) {
    // Hipertensión Severa (EMERGENCIA — ACOG)
    if (sys >= THRESHOLDS.PRESION.SEVERA_SISTOLICA || dia >= THRESHOLDS.PRESION.SEVERA_DIASTOLICA) {
      alertas.push({
        tipo: 'presion_arterial',
        severidad: 'emergencia',
        titulo: '⚠️ Presión arterial en rango severo',
        mensaje: `Tu presión registrada es ${sys}/${dia} mmHg. Una presión ≥160/110 mmHg es una emergencia médica según ACOG.`,
        accion_recomendada: 'Acude a urgencias o llama a emergencias INMEDIATAMENTE.',
      });
    }
    // Hipertensión Gestacional (PELIGRO — ACOG)
    else if (sys >= THRESHOLDS.PRESION.ALTA_SISTOLICA || dia >= THRESHOLDS.PRESION.ALTA_DIASTOLICA) {
      alertas.push({
        tipo: 'presion_arterial',
        severidad: 'peligro',
        titulo: '🔴 Presión arterial elevada',
        mensaje: `Tu presión (${sys}/${dia} mmHg) supera el umbral normal para el embarazo (140/90 mmHg). Esto puede indicar hipertensión gestacional o preeclampsia.`,
        accion_recomendada: 'Contacta a tu matrona u obstetra lo antes posible.',
      });
    }
    // Hipotensión (ADVERTENCIA)
    else if (sys <= THRESHOLDS.PRESION.BAJA_SISTOLICA || dia <= THRESHOLDS.PRESION.BAJA_DIASTOLICA) {
      alertas.push({
        tipo: 'presion_arterial',
        severidad: 'advertencia',
        titulo: '🟡 Presión arterial baja',
        mensaje: `Tu presión (${sys}/${dia} mmHg) está por debajo del rango normal. Puede causar mareos o desmayos.`,
        accion_recomendada: 'Hidratación, descanso y consultar con tu médico si persiste.',
      });
    }
  }

  // ── Sueño ─────────────────────────────────────────────────────────
  if (!isNaN(horas) && horas > 0 && horas < THRESHOLDS.SUENIO.MIN_HORAS) {
    alertas.push({
      tipo: 'suenio',
      severidad: 'advertencia',
      titulo: '🟡 Privación severa de sueño',
      mensaje: `Registraste solo ${horas} horas de sueño. Menos de 4 horas es una privación severa que afecta la salud materna y fetal.`,
      accion_recomendada: 'Intenta descansar más. Si es persistente, coméntalo con tu médico.',
    });
  }

  // ── Síntomas Críticos Maternos (ACOG) ────────────────────────────
  for (const sintoma of THRESHOLDS.SINTOMAS_CRITICOS_MADRE) {
    if (registro[sintoma] === true) {
      alertas.push({
        tipo: 'sintoma_critico',
        severidad: 'peligro',
        titulo: `🔴 Síntoma de alarma: ${sintoma.replace(/_/g, ' ')}`,
        mensaje: `Reportaste "${sintoma.replace(/_/g, ' ')}", que es una señal de advertencia urgente según ACOG, especialmente si va acompañada de presión alta o cambios visuales.`,
        accion_recomendada: 'Contacta a tu profesional de salud hoy.',
      });
    }
  }

  // ── Salud Mental (Depresión Posparto — EPDS adaptado) ────────────
  const sintomasMentalesActivos = THRESHOLDS.SINTOMAS_SALUD_MENTAL.filter(
    (s) => registro[s] === true
  );
  if (sintomasMentalesActivos.length >= THRESHOLDS.SALUD_MENTAL_UMBRAL_COMBINADOS) {
    alertas.push({
      tipo: 'salud_mental',
      severidad: 'advertencia',
      titulo: '💛 Posibles señales de estrés emocional',
      mensaje: `Registraste ${sintomasMentalesActivos.length} síntomas emocionales simultáneos (${sintomasMentalesActivos.join(', ')}). Esto puede indicar estrés posparto o depresión postparto.`,
      accion_recomendada: 'Habla con tu médico o matrona. No estás sola.',
    });
  }

  return alertas;
}

// ──────────────────────────────────────────────────────────────────────
// EVALUADOR DE MÉTRICAS DEL BEBÉ
// ──────────────────────────────────────────────────────────────────────
function evaluarMetricasBebe(registro: Record<string, unknown>): Alerta[] {
  const alertas: Alerta[] = [];

  // ── Fiebre (EMERGENCIA ABSOLUTA — AAP) ───────────────────────────
  // Cualquier fiebre en neonato (<3 meses) es emergencia médica.
  if (registro['fiebre'] === true) {
    alertas.push({
      tipo: 'fiebre_bebe',
      severidad: 'emergencia',
      titulo: '🚨 Fiebre en el bebé — Emergencia',
      mensaje: 'Reportaste fiebre en tu bebé. Según la AAP, cualquier fiebre (≥38°C) en un bebé menor de 3 meses es una emergencia médica que requiere evaluación INMEDIATA.',
      accion_recomendada: 'Lleva a tu bebé a urgencias pediátricas AHORA.',
    });
  }

  // ── Rechazo de alimento + Llanto prolongado (URGENTE — AAP) ──────
  const tieneRechazo = registro['rechazo_alimento'] === true;
  const tieneLlanto = registro['llanto_prolongado'] === true;
  if (tieneRechazo && tieneLlanto) {
    alertas.push({
      tipo: 'alimentacion_llanto',
      severidad: 'peligro',
      titulo: '🔴 Rechazo de alimento con llanto inconsolable',
      mensaje: 'La combinación de rechazo de alimento y llanto prolongado puede indicar cólico severo, infección o problema gastrointestinal. La AAP recomienda evaluación pediátrica.',
      accion_recomendada: 'Contacta a tu pediatra el mismo día.',
    });
  } else if (tieneRechazo) {
    alertas.push({
      tipo: 'alimentacion',
      severidad: 'advertencia',
      titulo: '🟡 Rechazo de alimento',
      mensaje: 'Tu bebé rechazó el alimento. Si es persistente o va acompañado de otros síntomas, requiere atención.',
      accion_recomendada: 'Observa 24h. Si persiste, consulta con tu pediatra.',
    });
  } else if (tieneLlanto) {
    alertas.push({
      tipo: 'llanto',
      severidad: 'advertencia',
      titulo: '🟡 Llanto prolongado',
      mensaje: 'Tu bebé presentó llanto prolongado. Puede ser normal (cólicos), pero si es inconsolable o inusual, merece atención.',
      accion_recomendada: 'Observa su comportamiento. Consulta si no mejora.',
    });
  }

  // ── Síntomas de vigilancia ────────────────────────────────────────
  if (registro['alteraciones_piel'] === true) {
    alertas.push({
      tipo: 'piel_bebe',
      severidad: 'advertencia',
      titulo: '🟡 Alteraciones en la piel del bebé',
      mensaje: 'Las alteraciones en la piel pueden ser desde eccema hasta reacciones alérgicas. Requieren revisión.',
      accion_recomendada: 'Muéstrale la piel al pediatra en la próxima consulta o antes si se extiende.',
    });
  }

  if (registro['problemas_suenio'] === true) {
    alertas.push({
      tipo: 'suenio_bebe',
      severidad: 'info',
      titulo: '🔵 Problemas de sueño del bebé',
      mensaje: 'Los problemas de sueño son comunes, pero si el bebé es difícil de despertar o está letárgico, puede ser señal de alerta.',
      accion_recomendada: 'Si el bebé está inusualmente dormido o difícil de despertar, contacta al pediatra.',
    });
  }

  // ── Ausencia de movimiento fetal (pre-parto) ──────────────────────
  const sinMovimiento = registro['movimiento_fetal'] === false && registro['cambio_intensidad'] === false;
  // Nota: Solo es relevante en pre-parto. La app debe enviar un campo 'etapa'
  // para distinguirlo. Por ahora se registra como advertencia informativa.
  if (sinMovimiento && registro['etapa'] === 'pre_parto') {
    alertas.push({
      tipo: 'movimiento_fetal',
      severidad: 'peligro',
      titulo: '🔴 Sin movimiento fetal reportado',
      mensaje: 'No reportaste movimiento fetal. A partir de la semana 28, la disminución de movimientos fetales requiere evaluación.',
      accion_recomendada: 'Contacta a tu matrona u obstetra hoy.',
    });
  }

  return alertas;
}

// ──────────────────────────────────────────────────────────────────────
// HANDLER PRINCIPAL DE LA EDGE FUNCTION
// ──────────────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  // Sólo aceptar POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const payload = await req.json();

    // El webhook de Supabase envía: { type, table, schema, record, old_record }
    const { table, record } = payload;

    if (!record) {
      return new Response(JSON.stringify({ error: 'Payload sin registro.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let alertas: Alerta[] = [];

    if (table === 'biometria_madre') {
      alertas = evaluarBiometriaMadre(record);
    } else if (table === 'metricas_bebe') {
      alertas = evaluarMetricasBebe(record);
    } else {
      return new Response(
        JSON.stringify({ message: 'Tabla no manejada por esta función.', alertas: [] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ── Persistir alertas en Supabase (tabla futura: alertas_generadas) ──
    // Por ahora retornamos las alertas en la respuesta.
    // En versión futura, se puede insertar en una tabla `alertas_generadas`
    // y disparar una push notification con Expo desde aquí.
    //
    // Ejemplo de cómo conectar con Supabase Admin:
    // const supabaseAdmin = createClient(
    //   Deno.env.get('SUPABASE_URL')!,
    //   Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    // );
    // await supabaseAdmin.from('alertas_generadas').insert(
    //   alertas.map(a => ({ ...a, id_usuario: record.id_usuario }))
    // );

    console.log(`[alertas-biometria] Tabla: ${table} | Alertas generadas: ${alertas.length}`);
    if (alertas.length > 0) {
      console.log('[alertas-biometria] Detalle:', JSON.stringify(alertas, null, 2));
    }

    return new Response(
      JSON.stringify({
        procesado: true,
        tabla: table,
        total_alertas: alertas.length,
        alertas,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('[alertas-biometria] Error:', err);
    return new Response(
      JSON.stringify({ error: 'Error interno al procesar la solicitud.', detalle: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
