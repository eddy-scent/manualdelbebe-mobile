# Estado del Proyecto — MomsAI

**Fecha de actualización:** 8 de junio de 2026  
**Versión actual:** 1.2.1  
**Stack:** React Native 0.81 + Expo SDK 54 + Supabase  
**Plataformas:** Android + iOS  

---

## 1. Resumen de Capacidades Actuales de la Aplicación

MomsAI ha completado su integración con el backend serverless de **Supabase**, eliminando las dependencias de datos locales mockeados. Actualmente la aplicación es capaz de realizar lo siguiente:

- **Autenticación en la Nube:** Creación de cuenta y login real usando Supabase Auth (tokens JWT) con persistencia de sesión segura.
- **Detección de Etapa en Tiempo Real:** Determinación automática de la etapa de la usuaria (`sin_datos`, `pre_parto` o `post_parto`) según la información de gestación y del bebé registrada en Supabase.
- **Registro Fisiológico de la Madre (Supabase):** Guardado diario de peso, horas de sueño, presión arterial sistólica/diastólica y 8 síntomas específicos en la tabla `biometria_madre`.
- **Registro del Bebé (Supabase):** Creación del perfil del bebé (`perfil_bebe`) y registro diario de movimientos fetales (pre-parto) o 5 síntomas pediátricos (post-parto) en la tabla `metricas_bebe`.
- **Motor de Alertas Dinámico:** Evaluación en tiempo real de métricas ingresadas (como presión arterial ≥140/90 o fiebre en el bebé), mostrando advertencias visuales en línea y sugerencias empáticas basadas en guías de ACOG y AAP sin emitir diagnósticos médicos.
- **Visualización de Historial (Gráficos):** Renderizado de un gráfico de barra/línea en el perfil para seguir la evolución de la presión arterial y las horas de sueño maternas a lo largo de las semanas.
- **Recordatorios en la Nube:** Sincronización de la configuración de notificaciones del dispositivo con la tabla `configuracion_recordatorios` de Supabase, activando recordatorios diarios locales a la hora deseada.
- **Asistente Virtual (Dr. Manuel):** Integración nativa de la ventana de chat usando un componente WebView que apunta a la URL oficial `https://chat.mimanualdelbebe.com/not_logged_in`.
- **Apariencia:** Soporte para cambio dinámico entre Modo Claro y Modo Oscuro en todas las pantallas.
- **Seguridad RLS (Row Level Security):** Políticas activas en PostgreSQL que garantizan que una usuaria solo pueda leer y escribir sus propios registros médicos.

### 1.1 Mejoras de Robustez y UX Implementadas (Junio 2026)

- **Manejo Global de Errores:** Componente `ErrorBoundary` envuelve toda la aplicación para capturar errores de renderizado y mostrar una pantalla de recuperación amigable.
- **Indicador de Estado de Red:** Banner visual `NetworkBanner` que detecta desconexiones en tiempo real usando `@react-native-community/netinfo` y advierte a la usuaria cuando no hay conectividad.
- **Persistencia de Borradores:** Los formularios de `PerfilMama` y `PerfilHijo` guardan automáticamente borradores en `AsyncStorage` cuando la app se envía a segundo plano, evitando pérdida de datos por interrupciones.
- **Pull-to-Refresh:** Implementado `RefreshControl` en las pantallas de perfil para permitir a la usuaria recargar datos manualmente desde Supabase.
- **Mejoras de Teclado:** Agregado `KeyboardAvoidingView` y `keyboardShouldPersistTaps="handled"` para evitar que el teclado oculte campos de entrada o cierre el formulario accidentalmente.
- **Accesibilidad:** Añadidas etiquetas `accessibilityLabel` e `accessibilityHint` a todos los inputs de texto, checkboxes y botones principales en `PerfilMama.js` y `PerfilHijo.js`.
- **Manejo de Errores de Red:** Mensajes de error descriptivos y empáticos ante fallos de conexión en los servicios de guardado y carga de datos (ej. "Verifica tu conexión a internet y prueba de nuevo").

---

## 2. Estado por Requerimiento (Matriz MoSCoW)

### Requerimientos Cubiertos (Entregados)

| ID | Requerimiento | Prioridad | Detalle |
|---|---|---|---|
| **RF-01** | Registro de Cuenta | Must Have | Correo, contraseña y nombre obligatorio. Cuenta creada directamente en Supabase Auth. |
| **RF-02** | Autenticación | Must Have | Inicio de sesión real con JWT. |
| **RF-03** | Edición de Perfil | Could Have | Permite cambio de nombre y contraseña en la configuración con persistencia en Supabase. |
| **RF-04** | Personalización | Could Have | Selector estético y funcional de Modo Claro / Modo Oscuro. |
| **RF-05** | Datos Biométricos | Must Have | Ingreso manual de peso, sueño, presión y checkboxes de 8 síntomas de la madre en Supabase. |
| **RF-06** | Métricas del Bebé | Should Have | Registro diario de movimiento fetal (pre-parto) o 5 síntomas pediátricos (post-parto) en la nube. |
| **RF-07** | Gráfico de Evolución | Could Have | Gráficos de presión arterial y horas de sueño de la madre sincronizados con la BD. |
| **RF-08** | Cálculo Obstétrico | Must Have | Cálculo y visualización de FPP y semanas de gestación basado en la FUR. |
| **RF-09** | Motor de Alertas | Must Have | Alertas visuales dinámicas no diagnósticas e indicadores táctiles (chips de alerta). |
| **RF-13** | Chat Dr. Manuel | Must Have | Integración con chat en línea mediante WebView (con límite de 5 consultas). |

---

### Requerimientos Pendientes de Integración

| ID | Requerimiento | Prioridad | Responsable / Estado |
|---|---|---|---|
| **RF-10** | Creación de Tareas | Could Have | *Asignado a Compañeros de Equipo*. Se realiza actualmente en local (AsyncStorage); debe migrarse a la tabla `registro_tarea` de Supabase. |
| **RF-11** | Actualización de Tareas | Could Have | *Asignado a Compañeros de Equipo*. CRUD de edición y borrado de eventos; pendiente migración a Supabase. |
| **RF-14** | Calendario de Citas | Could Have | *Asignado a Compañeros de Equipo*. Vista de calendario mensual interactiva sincronizada con las tareas. |
| **RF-12** | Recordatorios Locales | Could Have | Integración completa de recordatorios de citas de calendario (*depende del desarrollo del Calendario del equipo*). |
| **RF-05** | Sincronización Smartwatch | Must Have | *Pendiente de discusión / diseño*. Métodos para prellenar datos desde APIs externas de salud. |

---

## 3. Pasos y Pruebas Adicionales Recomendadas (QA)

Como Asegurador de Calidad, se sugieren las siguientes pruebas e implementaciones adicionales para garantizar la robustez técnica antes de la entrega del 22 de junio:

### 3.1 Pruebas Unitarias (Lógica del Negocio)
- **Framework propuesto:** Jest + React Native Testing Library.
- **Foco de prueba:**
  - Validar los cálculos de fecha probable de parto y semanas de gestación (`dateService.js`) usando análisis de valores límite (ej. año bisiesto, FUR en fecha actual, FUR futura).
  - Validar los helpers de mapeo de recordatorios y alertas clínicas (`alertService.js`) ante entradas nulas, vacías o con valores médicos extremos (ej. presión diastólica 0 mmHg).

### 3.2 Pruebas de Integración y Seguridad (Supabase RLS)
- **Objetivo:** Garantizar que la separación de datos entre usuarias es hermética.
- **Acción sugerida:** 
  - Crear un script autónomo en Node.js que simule dos sesiones JWT distintas.
  - Intentar leer y modificar registros de la usuaria A usando el token de la usuaria B en las tablas `biometria_madre` y `metricas_bebe`.
  - Asegurar que todas las peticiones cruzadas devuelvan error de autorización (comprobación de funcionamiento de RLS).

### 3.3 Pruebas de Estrés y Offline
- **Objetivo:** Asegurar el cumplimiento del requerimiento RNF-05 (tolerancia a fallas).
- **Acción sugerida:**
  - Probar la app en modo avión / sin conexión.
  - Verificar que el WebView de Dr. Manuel muestre de manera limpia el mensaje `"Servicio de chat no disponible"` sin bloquear la navegación ni provocar el cierre de la aplicación.
  - Confirmar que los datos cargados previamente desde la base de datos se mantengan visibles en el Home.
  - **Nuevo:** Verificar que los borradores de `PerfilMama` y `PerfilHijo` se recuperen correctamente después de cerrar y reabrir la app en segundo plano.
  - **Nuevo:** Probar el pull-to-refresh en `PerfilMama` y `PerfilHijo` con conexión lenta (3G simulado) para validar estados de carga.

### 3.4 Pruebas de Interfaz Responsiva (Multi-dispositivo)
- **Foco de prueba:** Cumplimiento de RNF-08.
- **Acción sugerida:** Validar el comportamiento de los checkboxes de síntomas y el gráfico en pantallas de alta densidad (ej. iPhone 15 Pro) y de pantallas grandes (ej. iPad Mini o tabletas Android de 10"), asegurando que no existan cortes de texto ni desbordes.

### 3.5 Pruebas de Accesibilidad
- **Foco de prueba:** Cumplimiento de RNF-09.
- **Acción sugerida:**
  - Activar TalkBack (Android) o VoiceOver (iOS) y navegar los formularios de `PerfilMama` y `PerfilHijo`.
  - Verificar que todos los campos de entrada y botones sean correctamente anunciados por el lector de pantalla.

---

## 4. Historial de Cambios Recientes

### v1.2.1 — 8 de junio de 2026
**Mejoras de Robustez, Accesibilidad y Normalización de Español**

- **Frontend:**
  - Agrega `ErrorBoundary` global para captura de errores de renderizado.
  - Agrega `NetworkBanner` con detección de conectividad vía `@react-native-community/netinfo`.
  - Implementa persistencia de borradores en `AsyncStorage` para `PerfilMama` y `PerfilHijo` (RNF-09).
  - Agrega `RefreshControl` (pull-to-refresh) en pantallas de perfil.
  - Agrega `KeyboardAvoidingView` y mejora manejo del teclado en formularios.
  - Mejora estados de carga y mensajes de error ante fallos de red.
  - Añade etiquetas de accesibilidad (`accessibilityLabel`, `accessibilityHint`, `accessibilityRole`) a inputs y botones.
  - Normaliza español neutro: corrige acentos rioplatenses (`verificá`→`verifica`, `probá`→`prueba`, `tenés`→`tienes`, `podés`→`puedes`, etc.) en `Calendario.js`, `Recordatorios.js`, `PerfilMama.js` y `PerfilHijo.js`.

- **Dependencias:**
  - Instala `@react-native-community/netinfo` (^latest).

**Archivos modificados:** `App.js`, `src/screens/PerfilMama.js`, `src/screens/PerfilHijo.js`, `src/screens/Calendario.js`, `src/screens/Recordatorios.js`, `package.json`, `package-lock.json`.  
**Archivos nuevos:** `src/components/ErrorBoundary.js`, `src/components/NetworkBanner.js`.
