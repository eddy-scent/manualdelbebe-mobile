# Configuración de Supabase — Edge Functions y Webhooks
**RF-09: Alertas Proactivas**  
**Fecha de configuración:** 4 de junio de 2026  
**Realizado por:** Rodolfo (Dev 2)  
**Rama:** `core-services-integration`

---

## Contexto

Como parte del Commit 4 de integración backend, se desplegó la Edge Function `alertas-biometria` en la nube de Supabase y se configuraron los Webhooks para que se ejecute automáticamente cada vez que la madre guarda datos biométricos o síntomas del bebé.

El código fuente de esta función se encuentra en:
```
supabase/functions/alertas-biometria/index.ts
```

Para entender los umbrales médicos que evalúa esta función, consultar:
```
docs/UMBRALES_ALERTAS.md
```

---

## 1. Deploy de la Edge Function

### Prerequisitos utilizados
- Supabase CLI instalado globalmente vía `npm install -g supabase`
- Sesión iniciada con `supabase login`
- Proyecto vinculado con `supabase link --project-ref <project-ref>`

### Comando ejecutado
```bash
supabase functions deploy alertas-biometria
```

### Resultado
- ✅ Función desplegada exitosamente en la red global de Supabase (Deno runtime)
- La función queda disponible en la URL:
  ```
  https://<project-ref>.supabase.co/functions/v1/alertas-biometria
  ```
- **No** se debe llamar esta URL manualmente desde la app. Es invocada exclusivamente por los Webhooks configurados a continuación.

---

## 2. Webhooks Configurados

Los Webhooks se configuraron desde el Dashboard de Supabase en:
`Dashboard → Database → Webhooks → Create a new hook`

Se seleccionó el tipo **"Supabase Edge Functions"** (no "HTTP Request") para que Supabase gestione automáticamente la autenticación entre el webhook y la función.

---

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
| **Timeout** | `5000 ms` |
| **Headers automáticos** | `Content-Type: application/json` + `Authorization: Bearer <service_role_key>` |

**¿Cuándo se activa?**
Cada vez que la madre guarda o actualiza sus datos en "Mis Estadísticas" (peso, presión, horas de sueño, síntomas).

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
| **Timeout** | `5000 ms` |
| **Headers automáticos** | `Content-Type: application/json` + `Authorization: Bearer <service_role_key>` |

**¿Cuándo se activa?**
Cada vez que la madre guarda o actualiza síntomas del bebé en "Mi Bebé" (fiebre, llanto prolongado, rechazo de alimento, etc.).

---

## 3. Cómo verificar que está funcionando

### Desde el Dashboard de Supabase
1. Ir a `Dashboard → Database → Webhooks`
2. Ambos hooks deben aparecer listados con estado **activo**
3. Después de guardar datos desde la app, ir a `Dashboard → Edge Functions → alertas-biometria → Logs` para ver los registros de ejecución

### Desde la app
Al guardar biometría con presión ≥140/90 mmHg, en los logs de la función deberías ver:
```json
{
  "procesado": true,
  "tabla": "biometria_madre",
  "total_alertas": 1,
  "alertas": [
    {
      "tipo": "presion_arterial",
      "severidad": "peligro",
      "titulo": "🔴 Presión arterial elevada",
      ...
    }
  ]
}
```

---

## 4. Notas para el equipo

> [!IMPORTANT]
> La Edge Function actualmente **evalúa y registra alertas en sus logs**, pero aún **no envía push notifications** desde el backend. Las alertas visuales en pantalla son generadas por `src/services/alertService.js` en el frontend (lado cliente). La función backend está preparada para integrarse con push notifications en una iteración futura.

> [!NOTE]
> Si en el futuro se necesita **redesplegar** la función (por cambios en el código de `index.ts`), cualquier miembro del equipo con acceso al proyecto de Supabase puede ejecutar:
> ```bash
> supabase functions deploy alertas-biometria
> ```
> Los Webhooks **no necesitan reconfigurarse** al redesplegar, siguen apuntando a la misma función automáticamente.

> [!WARNING]
> El token `Authorization: Bearer ...` que aparece en la configuración del Webhook es la **`service_role_key`** de Supabase. Nunca debe exponerse en el código del frontend ni en el repositorio. Supabase lo gestiona internamente en los webhooks.

---

## 5. Arquitectura resultante

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
                   supabase/functions/alertas-biometria/index.ts
                                  │
                    Evalúa contra umbrales ACOG/AAP
                                  │
                  ┌───────────────┴───────────────┐
                  ▼                               ▼
          Sin alertas                      Con alertas
          → responde "ok"            → registra en logs
                                     → (futuro) push notification
```

---

*Documento generado como parte del Commit 4 — Alertas Proactivas en Supabase.*
