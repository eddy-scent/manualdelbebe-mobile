# Configuración de Supabase — Edge Functions y Webhooks
**RF-09: Alertas Proactivas**  
**Fecha de actualización:** 5 de junio de 2026  

---

## Contexto

Como parte de la migración backend y refinamiento del motor de alertas clínicas, se ha desplegado la Edge Function `alertas-biometria` en la nube de Supabase. Además, se configuraron Webhooks para su ejecución automática cada vez que la madre guarda datos biométricos o síntomas del bebé.

El código fuente de esta función se encuentra en:
```
supabase/functions/alertas-biometria/index.ts
```

Para entender los umbrales médicos (empatizados) que evalúa esta función, consultar:
```
docs/clinico/UMBRALES_ALERTAS.md
```

---

## 1. Deploy de la Edge Function

### Prerequisitos
- Supabase CLI instalado globalmente vía `npm install -g supabase`
- Sesión iniciada con `supabase login`
- Proyecto vinculado con `supabase link --project-ref <project-ref>`

### Comando
```bash
supabase functions deploy alertas-biometria
```

### Resultado
- ✅ Función desplegada exitosamente (Deno runtime)
- **Importante:** Esta URL no se debe llamar manualmente desde la app. Es invocada exclusivamente por los Webhooks configurados en la Base de Datos.

---

## 2. Webhooks Configurados

Los Webhooks se configuran desde el Dashboard de Supabase:
`Dashboard → Database → Webhooks → Create a new hook`

> Tipo: **Supabase Edge Functions** (no "HTTP Request" directo) para que Supabase gestione la autenticación del hook automáticamente.

### Webhook 1: Biometría de la Madre

| Campo | Valor |
|---|---|
| **Nombre** | `hook-alertas-biometria-madre` |
| **Tabla** | `biometria_madre` |
| **Esquema** | `public` |
| **Eventos** | `INSERT`, `UPDATE` |
| **Tipo** | Supabase Edge Functions |
| **Función destino** | `alertas-biometria` |
| **Method** | `POST` |

**¿Cuándo se activa?** Cada vez que la madre guarda datos en "Mis Estadísticas" (presión, sueño, `dolor_cabeza`, `tristeza`, etc.).

---

### Webhook 2: Métricas del Bebé

| Campo | Valor |
|---|---|
| **Nombre** | `hook-alertas-metricas-bebe` |
| **Tabla** | `metricas_bebe` |
| **Esquema** | `public` |
| **Eventos** | `INSERT`, `UPDATE` |
| **Tipo** | Supabase Edge Functions |
| **Función destino** | `alertas-biometria` |
| **Method** | `POST` |

**¿Cuándo se activa?** Cada vez que se guardan métricas del bebé (como `llanto_prolongado`, `rechazo_alimento`, `sin_movimiento`, etc.).

---

## 3. Verificación de Funcionamiento

1. Ir a `Dashboard → Database → Webhooks`. Ambos hooks deben estar activos.
2. Tras guardar datos de alerta (ej: fiebre = true) en la app, ir a `Dashboard → Edge Functions → alertas-biometria → Logs`.
3. El log de ejecución registrará el análisis:
   ```json
   {
     "procesado": true,
     "tabla": "metricas_bebe",
     "total_alertas": 1,
     "alertas": [
       {
         "type": "fiebre_bebe",
         "severity": "danger",
         "title": "Temperatura Anómala",
         "message": "Nos indicas que tu bebé tiene temperatura anómala...",
         "action": "Contacta a tu pediatra"
       }
     ]
   }
   ```

---

## 4. Notas Arquitectónicas

> [!NOTE]
> **Push Notifications Backend (Pendiente):** Actualmente la Edge Function evalúa y registra las alertas. El envío de push notifications reales mediante FCM/APNs se implementará en una fase posterior. Hoy en día, la app reacciona localmente gracias a `alertService.js`.

> [!WARNING]
> La función `alertas-biometria` fue rediseñada para coincidir con las **claves snake_case** enviadas directamente desde el frontend, facilitando la escalabilidad del sistema sin necesidad de mapeos intermedios.

---

## 5. Arquitectura Resultante

```
[App React Native]
       │
       │ upsert()
       ▼
[Supabase DB — biometria_madre / metricas_bebe]
       │
       │ INSERT / UPDATE detectado
       ▼
[Database Webhook]
  hook-alertas-biometria-madre  ──┐
  hook-alertas-metricas-bebe   ──┤
                                  ▼
              [Edge Function: alertas-biometria]
                                  │
                    Evalúa contra umbrales unificados
                                  │
                  ┌───────────────┴───────────────┐
                  ▼                               ▼
          Sin alertas                      Con alertas
          → responde "ok"            → Registra severidad en logs
                                     → (Futuro) Push Notification
```

---
*Documento mantenido por el equipo de desarrollo IA.*
