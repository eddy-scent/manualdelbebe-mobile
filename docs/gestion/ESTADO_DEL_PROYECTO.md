# Estado del Proyecto — MomsAI

**Fecha de actualización:** 5 de junio de 2026  
**Version actual:** 1.1.0  
**Stack:** React Native 0.81 + Expo SDK 54 + Supabase  
**Plataformas:** Android + iOS

---

## Resumen Ejecutivo

MomsAI es una app móvil para mujeres embarazadas y madres recientes. Cuenta con autenticación en la nube (Supabase Auth), registro de datos biométricos, calculadoras obstétricas, calendario de eventos, un motor de alertas clínico empático y preciso, edición de perfil, tema claro/oscuro, recordatorios con notificaciones push locales, y un sistema de 3 etapas (sin datos / pre-parto / post-parto). Todo el almacenamiento de datos ha sido migrado a **Supabase** (PostgreSQL) usando una arquitectura robusta apoyada por Edge Functions y Webhooks.

---

## Estado por Requerimiento

### Requerimientos Funcionales

| ID | Requerimiento | Estado | Detalle |
|---|---|---|---|
| RF-01 | Registro de Cuenta | ✅ | Formulario completo con nombre, email, password |
| RF-02 | Autenticación | ✅ | Login real conectado a Supabase Auth |
| RF-03 | Edición de Perfil | ✅ | Editar nombre y password con Supabase Auth |
| RF-04 | Personalización de Interfaz | ⚠️ Parcial | Tema claro/oscuro implementado. Falta selector de idioma |
| RF-05 | Datos Biométricos Maternos | ✅ | Peso, sueño, presión arterial, 8 síntomas. Migrado a Supabase con claves `snake_case`. |
| RF-06 | Métricas Infantiles | ✅ | Pre/post-parto. Alertas combinadas y diccionarios de UI actualizados. Migrado a Supabase. |
| RF-07 | Visualización de Evolución | ⚠️ Parcial | Gráfico de barras (7 días). Límites: peso 120, sueño 12, presión 160 |
| RF-08 | Cálculo Obstétrico | ✅ | FPP (+280 días), semanas, trimestre. Calculadoras de embarazo y ovulación |
| RF-09 | Motor de Alertas | ✅ | Motor empático unificado en el front-end con UI táctil mejorada (chip pill). Edge function en el backend. |
| RF-10 | Creación de Tareas | ✅ | Eventos con título, descripción, fecha, hora, tipo |
| RF-11 | Actualización de Tareas | ✅ | Editar y eliminar eventos desde el calendario |
| RF-12 | Recordatorios Automatizados | ✅ | Notificaciones push locales |
| RF-13 | Interacción con Dr. Manuel | ⚠️ Placeholder | UI informativa. No hay chat real ni integración con IA |
| RF-14 | Visualización en Calendario | ✅ | Calendario mensual con indicadores de eventos |

### Requerimientos No Funcionales

| ID | Requerimiento | Estado | Detalle |
|---|---|---|---|
| RNF-01 | Usabilidad | ✅ | Botones grandes, chips táctiles para alertas, UI fluida |
| RNF-02 | Seguridad y Privacidad | ✅ | Migrado a Supabase. Auth seguro, Edge Functions, PostgreSQL en la nube. |
| RNF-03 | Disponibilidad Offline | ⚠️ Parcial | La app asume conexión para la carga/guardado principal en Supabase |
| RNF-04 | Sincronización de Sesión | ⚠️ Parcial | Sesión persistente con Supabase Auth. Falta WebView si se integra IA |
| RNF-05 | Tolerancia a Fallas | ⚠️ Parcial | Manejo básico de errores de Supabase |
| RNF-06 | Exención de Responsabilidad | ✅ | Texto en Registro, Configuración y DrManuel |
| RNF-07 | Tiempo de Respuesta | ✅ | Navegación nativa con animaciones fluidas |
| RNF-08 | Interfaz Responsiva | ⚠️ Parcial | SafeAreaView + ScrollView. Sin testing exhaustivo multi-dispositivo |
| RNF-09 | Persistencia de Estado | ✅ | Sesión gestionada remotamente por Supabase y localmente por AuthContext |
| RNF-10 | Indicadores de Carga | ✅ | ActivityIndicators presentes en operaciones de red |

---

## Qué Falta (Próximos Pasos)

### Fase 1 — Experiencia de IA y Edge Cases
1. **RF-13 Dr. Manuel**: Integrar chat con IA (WebView o API externa) y conectar el token de sesión.
2. **Offline Mode**: Estrategia de cache para cuando Supabase no esté disponible.

### Fase 2 — UI/UX y Funcionalidad Extendida
3. **RF-04 Idioma**: Selector de idioma y traducción de la app.
4. **RF-07 Charts**: Librería externa (victory-native o react-native-chart-kit) para estadísticas más visuales.
5. **Testing**: Pruebas multi-dispositivo y validación de RLS en base de datos.
6. Agregar columnas para `disminucion_movimiento` y `sin_movimiento` en la BD si se desea rastreo granular de movimientos pre-parto.

---

## Dependencias Principales
* expo ~54.0.33
* react-native 0.81.5
* @supabase/supabase-js (Integración Backend)
* lucide-react-native (Iconografía y chips de alertas)
* expo-notifications
* react-navigation

---
*Documento mantenido y estructurado por el equipo de desarrollo IA.*
