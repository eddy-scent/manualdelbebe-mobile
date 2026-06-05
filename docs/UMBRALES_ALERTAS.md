# Umbrales Médicos y Reglas de Alertas Proactivas — MomsAI
**RF-09: Alertas Proactivas**  
**Fecha:** 4 de junio de 2026  
**Revisado por:** IA (Dev 2) — basado en literatura médica oficial  

---

## Fuentes Clínicas

| Institución | Guía | Aplica a |
|---|---|---|
| **ACOG** | Practice Bulletin No. 202: *Gestational Hypertension and Preeclampsia* | Presión arterial materna |
| **ACOG** | *Urgent Maternal Warning Signs* | Síntomas maternos de alarma |
| **EPDS** | *Edinburgh Postnatal Depression Scale* (adaptado) | Salud mental materna |
| **AAP** | *Caring for Your Baby and Young Child* (8va edición) | Síntomas del bebé |
| **AAP / HealthyChildren.org** | *When to Call the Pediatrician* | Fiebre neonatal, alimentación |

> [!IMPORTANT]
> Estos umbrales son orientativos y de naturaleza preventiva. La aplicación **NO reemplaza el diagnóstico médico**. Ante cualquier alerta, se recomienda siempre consultar con un profesional de salud.

---

## 1. Alertas de Presión Arterial Materna (ACOG)

### Tabla de Umbrales

| Condición | Sistólica (mmHg) | Diastólica (mmHg) | Severidad | Acción |
|---|---|---|---|---|
| Normal | 90–139 | 60–89 | — | Sin alerta |
| **Hipotensión** | ≤90 | ≤60 | 🟡 Advertencia | Hidratación, consulta si persiste |
| **Hipertensión Gestacional** | ≥140 | ≥90 | 🔴 Peligro | Contactar matrona/obstetra HOY |
| **Hipertensión Severa** | ≥160 | ≥110 | 🚨 Emergencia | Urgencias INMEDIATAMENTE |

### Contexto Clínico
- La **hipertensión gestacional** (≥140/90) puede ser precursora de **preeclampsia**, una de las principales causas de mortalidad materna.
- La **hipertensión severa** (≥160/110) es una emergencia médica que requiere tratamiento antihipertensivo en minutos según ACOG.
- La **hipotensión** (≤90/60) en embarazadas puede causar síncope y reducción de perfusión fetal.

---

## 2. Síntomas Maternos de Alarma (ACOG — Urgent Maternal Warning Signs)

### Síntomas que Generan Alerta Inmediata (Aislados)

| Campo en BD | Síntoma | Severidad | Justificación Clínica |
|---|---|---|---|
| `dolor_cabeza` | Dolor de cabeza intenso | 🔴 Peligro | Puede indicar afección neurológica o preeclampsia severa |
| `hinchazon_pies` | Hinchazón extrema de pies/manos | 🔴 Peligro | Edema súbito es señal de preeclampsia o trombosis venosa profunda (TVP) |

### Síntomas que se Reportan pero No Generan Alerta Aislada

| Campo en BD | Síntoma | Notas |
|---|---|---|
| `fatiga` | Fatiga extrema | Común en embarazo. Se monitorea combinada con otros síntomas |
| `nauseas` | Náuseas/Vómitos | Normal salvo que sea severa e impida hidratación |

---

## 3. Salud Mental Materna (EPDS adaptado)

### Regla de Combinación

Se dispara una **alerta de advertencia** cuando la madre registra **3 o más** de los siguientes síntomas **en el mismo día**:

| Campo en BD | Síntoma |
|---|---|
| `tristeza` | Tristeza persistente / Llanto |
| `ansiedad` | Ansiedad / Nerviosismo |
| `culpa` | Sentimiento de culpa |
| `irritabilidad` | Irritabilidad extrema |

### Severidad y Mensaje
- **Severidad:** 🟡 Advertencia (no emergencia, pero requiere atención)
- **Mensaje:** *"Registraste N síntomas emocionales simultáneos. Esto puede indicar estrés posparto o depresión postparto. Habla con tu médico o matrona. No estás sola."*

### Contexto Clínico
La **depresión posparto** afecta a entre el 10–15% de las madres. La EPDS utiliza preguntas sobre tristeza, ansiedad y culpa como indicadores clave. Este módulo sirve como pantalla preventiva, no diagnóstica.

---

## 4. Alertas del Bebé (AAP)

### 4.1 Fiebre — Emergencia Neonatal

| Condición | Umbral | Severidad | Justificación |
|---|---|---|---|
| **Fiebre** (`fiebre = true`) | Temperatura ≥38°C | 🚨 Emergencia | La AAP establece que **cualquier fiebre en bebés <3 meses** es emergencia médica. El sistema inmune neonatal no puede controlar infecciones sin tratamiento urgente. |

**Acción recomendada:** *"Lleva a tu bebé a urgencias pediátricas AHORA."*

### 4.2 Rechazo de Alimento + Llanto Prolongado

| Condición | Campos | Severidad | Justificación |
|---|---|---|---|
| **Ambos síntomas juntos** | `rechazo_alimento = true` + `llanto_prolongado = true` | 🔴 Peligro | La AAP indica que esta combinación puede señalar cólico severo, infección o problema gastrointestinal |
| Solo rechazo de alimento | `rechazo_alimento = true` | 🟡 Advertencia | Monitorear 24h, consultar si persiste |
| Solo llanto prolongado | `llanto_prolongado = true` | 🟡 Advertencia | Puede ser cólicos normales; vigilar si es inconsolable |

### 4.3 Síntomas de Vigilancia

| Campo | Síntoma | Severidad | Acción |
|---|---|---|---|
| `alteraciones_piel` | Alteraciones en la piel | 🟡 Advertencia | Revisar en próxima consulta pediátrica o antes si se extiende |
| `problemas_suenio` | Problemas de sueño | 🔵 Info | Vigilar si hay letargo excesivo o dificultad para despertar |

### 4.4 Movimiento Fetal Ausente (Pre-parto)

| Condición | Umbral | Severidad | Justificación |
|---|---|---|---|
| Sin movimiento fetal reportado | `movimiento_fetal = false` en etapa `pre_parto` | 🔴 Peligro | A partir de semana 28, la disminución/ausencia de movimientos fetales requiere evaluación obstétrica (AAP/ACOG) |

---

## 5. Resumen de Niveles de Severidad

| Ícono | Nivel | Descripción | Acción Esperada |
|---|---|---|---|
| 🔵 | **Info** | Situación a vigilar, no urgente | Observar evolución |
| 🟡 | **Advertencia** | Situación que merece atención | Consultar en los próximos días |
| 🔴 | **Peligro** | Señal de alarma clínica | Contactar profesional de salud HOY |
| 🚨 | **Emergencia** | Riesgo vital inminente | Acudir a urgencias INMEDIATAMENTE |

---

## 6. Implementación Técnica

### Dónde Vive la Lógica
| Componente | Archivo | Rol |
|---|---|---|
| **Frontend (app)** | `src/services/alertService.js` | Motor de alertas local — evalúa datos al momento de guardar y muestra alertas en pantalla |
| **Backend (Supabase)** | `supabase/functions/alertas-biometria/index.ts` | Edge Function — evalúa datos vía webhook y puede enviar notificaciones push o guardar alertas en BD |
| **Umbrales compartidos** | `src/utils/constants.js` → `ALERT_THRESHOLDS` | Fuente única de verdad para umbrales en el frontend |

### Flujo de una Alerta
```
Madre guarda biometría
        │
        ▼
[Frontend] alertService.js evalúa localmente
        │
        ├─ Alerta detectada → Muestra modal/banner en la app
        │
        ▼
[Supabase] upsert() en biometria_madre
        │
        ▼
[Supabase Webhook] → Edge Function alertas-biometria
        │
        ├─ Evalúa con los mismos umbrales (backend)
        └─ (Futuro) → Envía push notification si la app está en background
```

---

*Documento generado automáticamente por Dev 2 (IA) como parte del Commit 4.*  
*Para actualizar los umbrales, editar este documento Y la constante `ALERT_THRESHOLDS` en `src/utils/constants.js` Y la constante `THRESHOLDS` en `supabase/functions/alertas-biometria/index.ts`.*
