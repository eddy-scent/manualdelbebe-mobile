# Estado del Proyecto — Mi manual del bebé

**Fecha de actualización:** 31 de mayo de 2026  
**Versión actual:** 1.0.0  
**Stack:** React Native 0.81 + Expo SDK 54  
**Commits:** 2 (estructura inicial + prototipo frontend) + cambios pendientes de commit

---

## Resumen Ejecutivo

La aplicación "Mi manual del bebé" es una app móvil dirigida a mujeres embarazadas y madres recientes, desarrollada en React Native con Expo. El proyecto cuenta con un **frontend funcional** que implementa navegación, autenticación local, registro de datos biométricos, calculadoras obstétricas, calendario de eventos, motor de alertas, edición de perfil con avatar personalizable y soporte de tema claro/oscuro en todas las pantallas. La autenticación y el almacenamiento utilizan **AsyncStorage (mock local)** — no hay backend real conectado.

---

## Arquitectura del Proyecto

```
src/
├── components/        # Componentes reutilizables
│   ├── Avatar.js          ← NUEVO: avatar con icono + color sincronizado
│   ├── CalculadoraEmbarazo.js
│   ├── CalculadoraOvulacion.js
│   ├── DraggableFab.js
│   ├── EventForm.js
│   ├── Footer.js          ← Tema aplicado
│   └── ScreenLayout.js    ← Tema aplicado
├── context/           # Estado global (React Context)
│   ├── AuthContext.js
│   └── ThemeContext.js     ← Tema claro/oscuro con persistencia
├── navigation/        # Navegación
│   └── MainTabs.js
├── screens/           # Pantallas principales (todas con tema)
│   ├── Calendario.js      ← Avatar + tema
│   ├── Configuracion.js   ← Edición de perfil + selector de tema
│   ├── DrManuel.js        ← Placeholder con tema
│   ├── InicioSesion.js    ← Tema
│   ├── Menu.js            ← Avatar + tema
│   ├── Perfil.js          ← Avatar + tema
│   ├── PerfilHijo.js      ← Placeholder (sin tema)
│   ├── PerfilMama.js      ← Avatar + tema
│   └── Registro.js        ← Tema
├── services/          # Lógica de negocio
│   ├── alertService.js
│   ├── api.js
│   ├── authService.js     ← Avatar persistido en sesión
│   ├── biometricService.js
│   ├── calendarService.js
│   └── dateService.js
└── utils/             # Utilidades y constantes
    ├── constants.js       ← Paleta clara + oscura (DARK_COLORS)
    ├── dateUtils.js
    └── validators.js
```

---

## Estado por Requerimiento

### Requerimientos Funcionales

| ID | Requerimiento | Estado | Detalle |
|---|---|---|---|
| RF-01 | Registro de Cuenta | ✅ Implementado | Formulario completo con nombre, email, contraseña + campos opcionales (nacimiento, FUR, fecha bebé). Validación incluida. |
| RF-02 | Autenticación | ✅ Implementado | Login con email/contraseña. Mock con AsyncStorage. Persistencia de sesión con datos de avatar. |
| RF-03 | Edición de Perfil | ✅ Implementado | `Configuracion.js` permite editar nombre, correo, contraseña y avatar (5 iconos × 8 colores). Cambios se sincronizan automáticamente en toda la app. |
| RF-04 | Personalización de Interfaz | ⚠️ Parcial | Modo claro/oscuro implementado vía `ThemeContext` con persistencia. Aplicado a todas las pantallas. Falta selector de idioma. |
| RF-05 | Datos Biométricos Maternos | ✅ Implementado | Registro diario de peso, horas de sueño, presión arterial (sistólica/diastólica) y 8 síntomas maternos via checkboxes. Guarda por fecha en AsyncStorage. |
| RF-06 | Métricas Infantiles | ❌ No implementado | Las constantes están definidas en `constants.js` (`SINTOMAS_INFANTIL_POSTPARTO`, `MOVIMIENTOS_FETALES`) pero no hay pantalla ni formulario. `PerfilHijo.js` es placeholder. |
| RF-07 | Visualización de Evolución | ❌ No implementado | No hay gráficos de peso/presión/sueño vs tiempo. Sin librería de charts integrada. |
| RF-08 | Cálculo Obstétrico | ✅ Implementado | `CalculadoraEmbarazo.js` calcula FPP (+280 días), semanas de gestación, días restantes y trimestre. También en `Perfil.js` si tiene FUR. |
| RF-09 | Motor de Alertas | ✅ Implementado | `alertService.js` analiza presión arterial, peso, sueño y síntomas de bandera roja. Genera alertas warning/danger. Se ejecuta al guardar biométricos. |
| RF-10 | Creación de Tareas | ✅ Implementado | `EventForm.js` + `calendarService.js` permiten crear eventos con título, descripción, fecha, hora y tipo (médico/milestone/tarea). |
| RF-11 | Actualización de Tareas | ✅ Implementado | Se puede editar y eliminar eventos desde el calendario. |
| RF-12 | Recordatorios Automatizados | ❌ No implementado | No hay notificaciones push. Sin integración con expo-notifications. |
| RF-13 | Interacción con Dr. Manuel | ⚠️ Placeholder | `DrManuel.js` muestra UI informativa con badge "Próximamente". No hay chat real ni integración con IA. |
| RF-14 | Visualización en Calendario | ✅ Implementado | Calendario mensual interactivo con indicadores de eventos, navegación por meses, vista de eventos del día seleccionado. |

### Requerimientos No Funcionales

| ID | Requerimiento | Estado | Detalle |
|---|---|---|---|
| RNF-01 | Usabilidad | ✅ Cumplido | Botones grandes, tipografía legible, navegación en ≤3 interacciones. UI limpia y accesible. |
| RNF-02 | Seguridad y Privacidad | ❌ No implementado | AsyncStorage sin encriptación. Contraseñas en texto plano. Sin TLS (no hay backend). No cumple AES-256 ni Ley 19.628. |
| RNF-03 | Disponibilidad Offline | ⚠️ Parcial | La app funciona offline porque todo es local (AsyncStorage), pero no hay caché de contenido estático ni guías. |
| RNF-04 | Sincronización de Sesión | ❌ No implementado | No hay WebView ni sincronización de token entre componentes. |
| RNF-05 | Tolerancia a Fallas | ❌ No implementado | Sin manejo de errores de red ni fallback a mensaje estático. No hay backend al que conectarse. |
| RNF-06 | Exención de Responsabilidad | ✅ Implementado | Texto informativo visible en `Configuracion.js` (sección Legal) y en `DrManuel.js`. |
| RNF-07 | Tiempo de Respuesta | ✅ Cumplido | Navegación nativa con animaciones fluidas. Sin dependencias pesadas. |
| RNF-08 | Interfaz Responsiva | ⚠️ Parcial | `SafeAreaView` + `ScrollView`. Tema claro/oscuro adaptativo en todas las pantallas. Sin testing en múltiples tamaños. |
| RNF-09 | Persistencia de Estado | ✅ Implementado | AsyncStorage guarda sesión, perfil (con avatar), datos biométricos, eventos y preferencia de tema. |
| RNF-10 | Indicadores de Carga | ✅ Implementado | `ActivityIndicator` en botones de login, registro y guardado de perfil. |

---

## Priorización MoSCoW (según documento Dr. Manuel)

### Must Have (Prioridad Muy Alta)
| Requerimiento | Estado |
|---|---|
| RF-01 Registro de Cuenta | ✅ |
| RF-02 Autenticación | ✅ |
| RF-05 Datos Biométricos | ✅ |
| RF-08 Cálculo Obstétrico | ✅ |
| RF-09 Motor de Alertas | ✅ |
| RF-13 Dr. Manuel | ⚠️ Placeholder |

### Should Have (Prioridad Alta)
| Requerimiento | Estado |
|---|---|
| RF-06 Métricas Infantiles | ❌ |

### Could Have (Prioridad Media)
| Requerimiento | Estado |
|---|---|
| RF-03 Edición de Perfil | ✅ |
| RF-10/11/12/14 Calendario + Tareas + Recordatorios | ✅ / ✅ / ❌ / ✅ |

### Won't Have (Prioridad Baja)
| Requerimiento | Estado |
|---|---|
| RF-04 Personalización de Interfaz | ⚠️ Parcial (tema claro/oscuro) |
| RF-07 Visualización de Evolución | ❌ |

---

## Resumen de Cobertura

```
Requerimientos Funcionales:     8/14 implementados  (57%)
                                2/14 parciales       (14%)
                                4/14 no implementados (29%)

Requerimientos No Funcionales:  5/10 implementados  (50%)
                                2/10 parciales       (20%)
                                3/10 no implementados (30%)
```

---

## Componentes Clave

### Avatar (`src/components/Avatar.js`)
- Componente reutilizable que lee `avatarIcon` y `avatarColor` del `AuthContext`
- 5 iconos disponibles: corazón, bebé, flor, usuaria, protección
- 8 colores de fondo seleccionables
- Tamaño configurable (32px en top bars, 80px en perfil)
- Sincronización automática: al cambiar en Configuración, se refleja en Menu, Calendario, Perfil, PerfilMama

### ThemeContext (`src/context/ThemeContext.js`)
- Provee `colors`, `isDark`, `toggleTheme()`, `setLightTheme()`, `setDarkTheme()`
- Persiste preferencia en AsyncStorage (`@manualdelbebe_theme`)
- Paleta clara: `COLORS` en `constants.js`
- Paleta oscura: `DARK_COLORS` en `constants.js`
- Aplicado a: todas las pantallas + ScreenLayout + Footer

### Configuracion (`src/screens/Configuracion.js`)
- Sección "Editar Perfil": avatar (icono + color), nombre, email, cambio de contraseña
- Sección "Apariencia": toggle modo claro/oscuro
- Sección "Legal": exención de responsabilidad
- Sección "Cerrar Sesión"

---

## Qué Falta (Roadmap Sugerido)

### Fase 1 — Completar Must Have
1. **RF-13 Dr. Manuel**: Integrar chat con IA (WebView o API externa). Conectar con los datos biométricos de la usuaria.
2. **RF-06 Métricas Infantiles**: Crear formulario de registro infantil (pre-parto: movimiento fetal; post-parto: peso, longitud, alimentación, síntomas).

### Fase 2 — Completar Could Have
3. ~~**RF-03 Edición de Perfil**~~ ✅ Implementado
4. **RF-12 Recordatorios**: Integrar `expo-notifications` para push notifications de citas y tareas.

### Fase 3 — Completar Won't Have + RNFs
5. **RF-07 Visualización**: Integrar librería de charts (victory-native o react-native-chart-kit) para gráficos de evolución.
6. **RF-04 Personalización**: Selector de idioma (el tema claro/oscuro ya está).
7. **RNF-02 Seguridad**: Migrar a backend real con encriptación AES-256 y TLS 1.2+.
8. **RNF-06 Exención**: Ya implementada en Configuración. Considerar aceptación obligatoria al registro.

### Fase 4 — Backend y Producción
9. Implementar API REST o GraphQL (Firebase, Supabase, o custom).
10. Migrar autenticación a JWT con refresh tokens.
11. Encriptar datos biométricos en reposo.
12. Testing en múltiples dispositivos (RNF-08).
13. Manejo de errores de red y tolerancia a fallas (RNF-05).

---

## Dependencias Principales

| Paquete | Uso |
|---|---|
| expo ~54.0.33 | Framework base |
| react 19.1.0 | UI |
| react-native 0.81.5 | Runtime nativo |
| @react-navigation/* | Navegación (stack + material-top-tabs) |
| @react-native-async-storage/async-storage | Almacenamiento local (mock) |
| lucide-react-native | Iconografía (incluye iconos de avatar) |
| react-native-pager-view | Navegación por tabs |

---

## Notas Técnicas

- **Sin backend**: Toda la data vive en AsyncStorage del dispositivo. No hay sincronización entre dispositivos.
- **Contraseñas en texto plano**: El `authService.js` almacena passwords sin hashing (comentado en código: "En producción esto iría hasheado").
- **Avatar sincronizado**: El componente `Avatar` lee del `AuthContext`, que a su vez se actualiza al guardar en Configuración. El `authService` persiste `avatarIcon` y `avatarColor` en la sesión.
- **Tema global**: `ThemeContext` envuelve toda la app en `App.js`. Todas las pantallas usan `useTheme()` para obtener colores. Los modales (EventForm, Calculadoras) mantienen su diseño propio.
- **Sin imagen de perfil**: El sistema anterior (`ICONO_MAMA` con `require()`) fue reemplazado completamente por el componente `Avatar` basado en iconos.
- **Calculadora de Ovulación**: Existe `CalculadoraOvulacion.js` como componente pero no está conectada a ningún requerimiento formal.
- **FAB flotante**: `DraggableFab.js` permite navegar al chat de Dr. Manuel desde cualquier pantalla principal.

---

*Documento actualizado automáticamente a partir del análisis del código fuente y los documentos de requerimientos.*
