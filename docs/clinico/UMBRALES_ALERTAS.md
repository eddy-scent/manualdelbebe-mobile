# Umbrales Médicos y Reglas de Alertas Proactivas — MomsAI
**RF-09: Alertas Proactivas**  
**Fecha:** 5 de junio de 2026  
**Revisado por:** Equipo de Desarrollo — basado en literatura médica oficial  

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

## 1. Alertas Maternas (ACOG & EPDS)

### 1.1 Presión Arterial

| Condición | Sistólica (mmHg) | Diastólica (mmHg) | Severidad | Acción / Mensaje |
|---|---|---|---|---|
| Normal | 90–139 | 60–89 | — | Sin alerta |
| **Hipotensión** | ≤90 | ≤60 | 🟡 Advertencia | "Tu presión está un poco baja. Puede hacerte sentir mareada. Hidratación y descanso ayudan. Si persiste, coméntalo con tu médico." |
| **Hipertensión Gestacional** | ≥140 | ≥90 | 🟡 Advertencia | "Tu presión está levemente por encima de lo habitual. Menciónalo en tu próxima consulta o si tienes dudas, llama hoy." |
| **Hipertensión Severa** | ≥160 | ≥110 | 🔴 Peligro | "Tu presión está más alta de lo esperado. Puedes llamar a tu matrona u obstetra para que te oriente a la brevedad." |

### 1.2 Sueño Materno
- **Condición:** Menos de 4 horas de sueño (`horas_suenio < 4`).
- **Severidad:** 🟡 Advertencia
- **Mensaje:** "Registraste solo X horas de sueño. Sabemos que es muy difícil, pero tu cuerpo necesita recuperar energía. Busca un momento para descansar y pide ayuda."

### 1.3 Síntomas que Escalan con Presión Alta
Los síntomas `dolor_cabeza` e `hinchazon_pies` son muy comunes en el embarazo, por lo que **no generan alerta por sí solos** para evitar ansiedad.
- **Condición:** Síntoma presente **Y** Presión Arterial ≥ 140/90.
- **Severidad:** 🔴 Peligro
- **Mensaje:** "Marcaste este síntoma y tu presión arterial está elevada. Te sugerimos comunicarte con tu centro de salud hoy."

### 1.4 Salud Mental (EPDS adaptado)
Se monitorean los síntomas: `tristeza`, `ansiedad`, `culpa`, `irritabilidad`.
- **Condición:** 3 o más de estos síntomas presentes en el mismo día.
- **Severidad:** 🟡 Advertencia
- **Mensaje:** "Hemos notado que marcaste varios síntomas emocionales. Es normal sentirse así, pero no tienes que atravesarlo sola. Considera hablar con alguien de confianza o tu médico."

---

## 2. Alertas del Bebé (AAP)

### 2.1 Fiebre y Temperatura
- **Condición:** `fiebre = true`
- **Severidad:** 🔴 Peligro
- **Mensaje:** "Nos indicas que tu bebé tiene temperatura anómala. Para su bienestar, es recomendable que un profesional lo evalúe. Contacta a tu pediatra."

### 2.2 Alimentación y Llanto (Alerta Combinada)

| Condición | Severidad | Mensaje Empático |
|---|---|---|
| **Ambos:** `rechazo_alimento` + `llanto_prolongado` | 🔴 Peligro | "El rechazo de alimento junto con el llanto prolongado puede indicar incomodidad (cólicos, molestias). Te sugerimos comentárselo a tu pediatra." |
| Solo `rechazo_alimento` | 🟡 Advertencia | "El rechazo puede ser temporal. Observa cómo evoluciona, si persiste consúltalo con tu pediatra." |
| Solo `llanto_prolongado` | 🟡 Advertencia | "El llanto es su forma de comunicación. Si te parece inusual o inconsolable, consúltalo con el médico." |

### 2.3 Síntomas de Vigilancia

| Campo | Síntoma | Severidad | Acción / Mensaje |
|---|---|---|---|
| `alteraciones_piel` | Alteraciones en la piel | 🔵 Info | "Frecuentes en los bebés. Menciónalo en tu control. Si empeora, consulta antes." |
| `problemas_suenio` | Problemas de sueño | 🔵 Info | "Cambios muy comunes en primeros meses. Si está difícil de despertar, coméntalo." |

### 2.4 Movimiento Fetal (Pre-parto)
- **Condición:** Se registra `sin_movimiento` o `disminucion_movimiento` **SIN** que haya registro de movimiento positivo (`movimiento_fetal` o `cambio_intensidad`).
- **Severidad:** 🔴 Peligro
- **Mensaje:** "Registraste disminución o ausencia de movimientos. Comunícate con tu matrona u obstetra para un chequeo que te dé tranquilidad."

---

## 3. Resumen de Niveles de Severidad

| Ícono | Nivel | Descripción |
|---|---|---|
| 🔵 | **Info** | Situación a vigilar, consejos generales. |
| 🟡 | **Advertencia** | Situación que merece atención o monitoreo. |
| 🔴 | **Peligro** | Señal de alarma clínica que sugiere contacto profesional. |

*(Nota: El nivel "Emergencia" fue descartado en favor de "Peligro" para mantener un tono menos agresivo/asustadizo con la madre).*

---

## 4. Implementación Técnica

### Dónde Vive la Lógica
| Componente | Archivo | Rol |
|---|---|---|
| **Frontend (app)** | `src/services/alertService.js` | Motor de alertas local — evalúa datos al guardar y retorna objetos de alerta. |
| **Backend (Supabase)** | `supabase/functions/alertas-biometria/index.ts` | Edge Function — evalúa datos vía webhook en la BD. |
| **Umbrales compartidos** | `src/utils/constants.js` | Fuente de constantes `ALERT_THRESHOLDS` para el front. |
