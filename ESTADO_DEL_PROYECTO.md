# Estado del Proyecto — MomsAI

**Fecha de actualización:** 31 de mayo de 2026  
**Version actual:** 1.0.0  
**Stack:** React Native 0.81 + Expo SDK 54  
**Plataformas:** Android + iOS

---

## Resumen Ejecutivo

MomsAI es una app movil para mujeres embarazadas y madres recientes. Cuenta con autenticacion, registro de datos biometricos, calculadoras obstetricas, calendario de eventos, motor de alertas, edicion de perfil con avatar personalizable, tema claro/oscuro, recordatorios con notificaciones push locales, y un sistema de 3 etapas (sin datos / pre-parto / post-parto) que adapta la interfaz segun el estado de la usuaria. El almacenamiento es local (AsyncStorage) con una capa de abstraccion preparada para Supabase.

---

## Arquitectura del Proyecto

```
src/
├── components/
│   ├── Avatar.js              ← Avatar con icono + color del AuthContext
│   ├── CalculadoraEmbarazo.js
│   ├── CalculadoraOvulacion.js
│   ├── DraggableFab.js        ← FAB arrastrable (Dr. Manuel)
│   ├── EventForm.js           ← Formulario de eventos del calendario
│   ├── EvolutionChart.js      ← Grafico de barras (peso/suenio/presion)
│   ├── Footer.js              ← Tab bar persistente
│   ├── Header.js              ← Header persistente (avatar + MomsAI + campanita + ajustes)
│   └── ScreenLayout.js        ← Layout base con tema
├── context/
│   ├── AuthContext.js          ← Sesion de usuaria
│   ├── EtapaContext.js         ← Manejo de etapas (sin_datos/pre_parto/post_parto)
│   └── ThemeContext.js         ← Tema claro/oscuro
├── navigation/
│   └── MainTabs.js             ← Tabs principales + Header + Footer
├── screens/
│   ├── Calendario.js           ← Calendario mensual + eventos
│   ├── Configuracion.js        ← Editar perfil + tema + legal
│   ├── DrManuel.js             ← Placeholder chat IA
│   ├── InicioSesion.js         ← Login
│   ├── Menu.js                 ← Home con cards adaptativas por etapa
│   ├── Perfil.js               ← Perfil con info por etapa
│   ├── PerfilHijo.js           ← Metricas bebe (pre/post-parto)
│   ├── PerfilMama.js           ← Metricas madre (biometricos)
│   ├── Recordatorios.js        ← Configuracion de notificaciones
│   ├── Registro.js             ← Registro de cuenta
│   └── RegistroBebe.js         ← Registro inicial del bebe
├── services/
│   ├── alertService.js         ← Motor de alertas (RF-09)
│   ├── api.js                  ← (reservado para API externa)
│   ├── authService.js          ← Auth mock con AsyncStorage
│   ├── babyService.js          ← CRUD datos del bebe
│   ├── biometricService.js     ← CRUD datos biometricos madre
│   ├── calendarService.js      ← CRUD eventos calendario
│   ├── dataService.js          ← Capa de abstraccion (preparado para Supabase)
│   ├── dateService.js          ← Utilidades de fecha + calculos obstetricos
│   ├── mockService.js          ← Inicializacion de datos de ejemplo
│   └── notificationService.js  ← Notificaciones push locales
└── utils/
    ├── constants.js            ← Colores (claro + oscuro) + constantes
    ├── dateUtils.js            ← Formateo de fechas
    └── validators.js           ← Validaciones de entrada
```

---

## Estado por Requerimiento

### Requerimientos Funcionales

| ID | Requerimiento | Estado | Detalle |
|---|---|---|---|
| RF-01 | Registro de Cuenta | ✅ | Formulario completo con nombre, email, password + campos opcionales |
| RF-02 | Autenticacion | ✅ | Login con email/password y Supabase Auth |
| RF-03 | Edicion de Perfil | ✅ | Editar nombre y password con Supabase Auth |
| RF-04 | Personalizacion de Interfaz | ⚠️ Parcial | Tema claro/oscuro implementado. Falta selector de idioma |
| RF-05 | Datos Biometricos Maternos | ✅ | Peso, sueno, presion arterial, 8 sintomas via checkboxes |
| RF-06 | Metricas Infantiles | ✅ | Pre-parto: movimiento fetal. Post-parto: peso, longitud, tomas, 5 sintomas |
| RF-07 | Visualizacion de Evolucion | ⚠️ Parcial | Grafico de barras (7 dias). Limites: peso 120, sueno 12, presion 160 |
| RF-08 | Calculo Obstetrico | ✅ | FPP (+280 dias), semanas, trimestre. Calculadoras de embarazo y ovulacion |
| RF-09 | Motor de Alertas | ✅ | Analiza presion, peso, sueno, sintomas de bandera roja |
| RF-10 | Creacion de Tareas | ✅ | Eventos con titulo, descripcion, fecha, hora, tipo |
| RF-11 | Actualizacion de Tareas | ✅ | Editar y eliminar eventos desde el calendario |
| RF-12 | Recordatorios Automatizados | ✅ | Notificaciones push locales: biometricos diarios, bebe diario, citas medicas |
| RF-13 | Interaccion con Dr. Manuel | ⚠️ Placeholder | UI informativa. No hay chat real ni integracion con IA |
| RF-14 | Visualizacion en Calendario | ✅ | Calendario mensual con indicadores de eventos |

### Requerimientos No Funcionales

| ID | Requerimiento | Estado | Detalle |
|---|---|---|---|
| RNF-01 | Usabilidad | ✅ | Botones grandes, tipografia legible, navegacion en <=3 interacciones |
| RNF-02 | Seguridad y Privacidad | ❌ | AsyncStorage sin encriptacion. Passwords en texto plano |
| RNF-03 | Disponibilidad Offline | ✅ | App funciona offline (todo local) |
| RNF-04 | Sincronizacion de Sesion | ❌ | No hay WebView ni sincronizacion de token |
| RNF-05 | Tolerancia a Fallas | ❌ | Sin manejo de errores de red ni fallback |
| RNF-06 | Exencion de Responsabilidad | ✅ | Texto en Registro, Configuracion (Legal) y DrManuel |
| RNF-07 | Tiempo de Respuesta | ✅ | Navegacion nativa con animaciones fluidas |
| RNF-08 | Interfaz Responsiva | ⚠️ Parcial | SafeAreaView + ScrollView. Sin testing multi-dispositivo |
| RNF-09 | Persistencia de Estado | ✅ | Sesion, perfil, biometricos, eventos, tema, recordatorios |
| RNF-10 | Indicadores de Carga | ✅ | ActivityIndicator en botones async |

---

## Resumen de Cobertura

```
Requerimientos Funcionales:     10/14 implementados  (71%)
                                2/14 parciales        (14%)
                                2/14 no implementados (14%)

Requerimientos No Funcionales:  5/10 implementados   (50%)
                                2/10 parciales        (20%)
                                3/10 no implementados (30%)
```

---

## Sistema de Etapas

La app adapta su contenido segun 3 etapas:

| Etapa | Condicion | Menu | Perfil |
|---|---|---|---|
| **sin_datos** | Sin FUR, sin bebe | Invitacion a configurar | "Completa tu perfil" |
| **pre_parto** | Tiene FUR | Semana X, trimestre, desarrollo fetal | Mi Embarazo (semanas, FPP) |
| **post_parto** | Tiene bebe registrado | Edad del bebe, hitos | Mi Bebe (nombre, edad) |

Manejado por `EtapaContext.js` — se calcula automaticamente del perfil de la usuaria.

---

## Que Falta

### Fase 1 — Must Have
1. **RF-13 Dr. Manuel**: Integrar chat con IA (WebView o API externa)

### Fase 2 — RNFs
2. **RNF-02 Seguridad**: Migrar a Supabase con encriptacion AES-256 y TLS 1.2+
3. **RNF-05 Tolerancia a Fallas**: Manejo de errores de red + fallback offline
4. **RNF-04 Sincronizacion**: Token de sesion compartido con WebView

### Fase 3 — Mejoras
5. **RF-04 Idioma**: Selector de idioma
6. **RF-07 Charts**: Libreria externa (victory-native o react-native-chart-kit)
7. Testing en multiples dispositivos

---

## Dependencias Principales

| Paquete | Uso |
|---|---|
| expo ~54.0.33 | Framework base |
| react 19.1.0 | UI |
| react-native 0.81.5 | Runtime nativo |
| @react-navigation/* | Navegacion (stack + material-top-tabs) |
| @react-native-async-storage/async-storage | Almacenamiento local |
| lucide-react-native | Iconografia |
| expo-notifications | Notificaciones push locales |
| expo-device | Info del dispositivo |
| react-native-pager-view | Navegacion por tabs |
| react-native-gesture-handler | Gestos (DraggableFab) |

---

*Documento actualizado automaticamente.*
