# Mapa de Navegacion — MomsAI

**Fecha:** 31 de mayo de 2026  
**Total de pantallas:** 11  
**Total de rutas de navegacion:** 28

---

## Estructura de Navegacion

```
App.js (Stack Navigator)
│
├── InicioSesion          ← Pantalla inicial
├── Registro
│
└── MainTabs              ← Contenedor con Header + Footer persistente
    │
    ├── Menu              ← Tab 1 (Home)
    ├── Calendario        ← Tab 2
    └── Perfil            ← Tab 3
│
├── Configuracion         ← Secundaria (fade)
├── PerfilHijo            ← Secundaria (fade)
├── PerfilMama            ← Secundaria (fade)
├── RegistroBebe          ← Secundaria (fade)
├── Recordatorios         ← Secundaria (fade)
└── DrManuel              ← Secundaria (fade)
```

---

## Flujo Completo por Pantalla

### 1. InicioSesion (inicio)

```
InicioSesion
├── → Registro           (link "Crear cuenta")
└── → MainTabs           (login exitoso, navigation.reset)
```

**Que pasa al conectar BD:**
- `authService.login()` llama a `supabase.auth.signInWithPassword()`
- Si exitoso → carga sesion → navega a MainTabs
- Si falla → muestra error (email no existe, password incorrecta)

---

### 2. Registro

```
Registro
├── → InicioSesion       (link "Ya tienes cuenta")
└── → MainTabs           (registro exitoso, navigation.reset)
```

**Que pasa al conectar BD:**
- `authService.register()` llama a `supabase.auth.signUp()`
- Crea fila en tabla `usuario`
- Crea fila en tabla `perfil_madre` si hay FUR/bebe
- Si exitoso → navega a MainTabs

---

### 3. MainTabs (contenedor)

```
MainTabs
├── Header (persistente)
│   ├── Avatar           → Lee de AuthContext
│   ├── "MomsAI"         → Texto fijo
│   ├── Campanita        → → Calendario
│   └── Ajustes          → → Configuracion
│
├── Tab 1: Menu
├── Tab 2: Calendario
├── Tab 3: Perfil
│
└── Footer (persistente)
    ├── Home             → Menu
    ├── Calendario       → Calendario
    └── Perfil           → Perfil
```

---

### 4. Menu (Tab 1 — Home)

```
Menu
│
├── [Sin datos] Setup flow
│   ├── "Estoy embarazada" → input FUR → updateProfile → pre_parto
│   ├── "Ya tengo un bebe" → input fecha → updateProfile → post_parto
│   └── "Ninguna por ahora" → Configuracion
│
├── [Pre-parto] Card progreso
│   └── (sin navegacion, solo muestra datos)
│
├── [Post-parto] Card progreso
│   └── (sin navegacion, solo muestra datos)
│
├── Calculadora Ovulacion → Modal (no navega)
├── Calculadora Embarazo  → Modal (no navega)
│
├── Card "Mi Bebe"
│   └── → PerfilHijo     (boton "Ver desarrollo" o "Registrar bebe")
│
├── Card "Mi Salud"
│   └── → PerfilMama     (boton "Actualizar metricas")
│
├── EvolutionChart        → (sin navegacion, componente interno)
│
├── Proximos Eventos      → (sin navegacion, solo muestra)
│
└── FAB Dr. Manuel
    └── → DrManuel
```

**Que pasa al conectar BD:**
- `EtapaContext` carga datos de `perfil_madre` + `perfil_bebe` + `biometria_madre`
- Si etapa = sin_datos → muestra invitacion
- Si etapa = pre_parto → muestra semanas, desarrollo fetal
- Si etapa = post_parto → muestra edad bebe, hitos
- `EvolutionChart` carga de `biometria_madre` (ultimos 7 dias)
- Eventos cargan de `registro_tarea`

---

### 5. Calendario (Tab 2)

```
Calendario
├── Evento del dia       → (selecciona, muestra detalle)
├── Boton "+" Evento     → Modal EventForm
│   └── Si type="medical" → programa notificacion automatica
├── Editar evento        → Modal EventForm (modo edicion)
└── Eliminar evento      → Alert.confirm → elimina
```

**Que pasa al conectar BD:**
- Eventos cargan de `registro_tarea` filtrado por `id_usuario`
- CRUD opera directamente sobre `registro_tarea`
- Al crear cita medica → `notificationService.scheduleCalendarReminder()`

---

### 6. Perfil (Tab 3)

```
Perfil
│
├── Avatar               → Lee de AuthContext
├── "Editar Perfil"      → Configuracion
│
├── [Sin datos] Card
│   └── → Configuracion  (link "Ir a Configuracion")
│
├── [Pre-parto] Card "Mi Embarazo"
│   └── (sin navegacion, muestra semanas/FPP)
│
├── [Post-parto] Card "Mi Bebe"
│   └── (sin navegacion, muestra nombre/edad)
│
├── "Mis Estadisticas"   → PerfilMama
├── "Mi Bebe"            → PerfilHijo
├── "Mis Citas"          → Calendario
├── "Recordatorios"      → Recordatorios
├── "Configuracion"      → Configuracion
└── "Cerrar Sesion"      → Alert → reset a InicioSesion
```

**Que pasa al conectar BD:**
- `EtapaContext` determina que card mostrar
- Cerrar sesion → `supabase.auth.signOut()` → limpia sesion

---

### 7. Configuracion (secundaria)

```
Configuracion
├── Flecha ←             → goBack()
├── Editar Perfil
│   ├── Avatar (icono + color) → Modal selector
│   ├── Nombre           → TextInput
│   ├── Email            → TextInput
│   ├── Password actual  → TextInput
│   ├── Password nueva   → TextInput
│   └── "Guardar"        → authService.updateProfile()
│
├── Mi Situacion
│   ├── Estoy embarazada → input FUR → updateProfile({ furDate })
│   ├── Ya tengo un bebe → input fecha → updateProfile({ babyDate })
│   ├── Ninguna por ahora → limpia furDate y babyDate
│   └── "Guardar situacion" → EtapaContext.refresh()
│
├── Apariencia
│   ├── Modo Claro       → ThemeContext.setLightTheme()
│   └── Modo Oscuro      → ThemeContext.setDarkTheme()
│
├── Legal
│   └── Exencion de responsabilidad (texto)
│
└── "Cerrar Sesion"      → Alert → reset a InicioSesion
```

**Que pasa al conectar BD:**
- Guardar perfil → `supabase.from('usuario').update()`
- Avatar se guarda en `usuario.avatar_icon` + `usuario.avatar_color`
- Password → `supabase.auth.updateUser({ password })`
- Situacion → `supabase.from('perfil_madre').upsert()` con fecha_fur o fecha_nac_bebe

---

### 8. PerfilMama — Mis Estadisticas (secundaria)

```
PerfilMama
├── Flecha ←             → goBack()
├── Peso (kg)            → TextInput
├── Horas sueno          → TextInput
├── Presion arterial     → TextInput (sistolica/diastolica)
├── Sintomas (8)         → Checkboxes
└── "Guardar"            → biometricService.saveBiometricData()
                          → alertService.analyzeBiometricData()
                          → si hay alertas → Alert
```

**Que pasa al conectar BD:**
- Guarda en `biometria_madre` con `upsert` (id_usuario + fecha_registro)
- Motor de alertas analiza datos y muestra warnings si hay umbrales superados

---

### 9. PerfilHijo — Mi Bebe (secundaria)

```
PerfilHijo
├── Flecha ←             → goBack()
│
├── [Sin datos] Formulario fecha nacimiento
│   └── "Guardar fecha"  → authContext.updateProfile({ babyDate })
│                          → recarga → cambia a post_parto
│
├── [Sin perfil bebe] Aviso
│   └── → RegistroBebe   (boton "Registrar datos del bebe")
│
├── [Con perfil] Card datos bebe
│   └── "Editar datos"   → RegistroBebe
│
├── [Pre-parto] Checkboxes
│   ├── Movimiento fetal activo
│   ├── Disminucion movimiento fetal
│   ├── Cambio de intensidad
│   └── Sin movimiento fetal
│
├── [Post-parto] Metricas
│   ├── Peso (kg)        → TextInput
│   ├── Longitud (cm)    → TextInput
│   ├── Tomas            → TextInput
│   └── Sintomas (5)     → Checkboxes
│
└── "Guardar"            → babyService.saveBabyData()
```

**Que pasa al conectar BD:**
- Perfil bebe carga de `perfil_bebe`
- Datos diarios guardan en `metricas_bebe` con `upsert`
- Etapa se determina de `perfil_madre.fecha_nac_bebe`

---

### 10. RegistroBebe (secundaria)

```
RegistroBebe
├── Flecha ←             → goBack()
├── Nombre               → TextInput (obligatorio)
├── Sexo                 → Botones Masculino/Femenino (obligatorio)
├── Fecha nacimiento     → TextInput DD/MM/AAAA
├── Peso al nacer        → TextInput
├── Talla al nacer       → TextInput
└── "Registrar bebe"     → babyService.saveBabyProfile()
                          → authContext.updateProfile({ babyDate })
                          → goBack()
```

**Que pasa al conectar BD:**
- Crea fila en `perfil_bebe`
- Actualiza `perfil_madre.fecha_nac_bebe`
- Al volver a PerfilHijo → detecta post_parto → muestra metricas

---

### 11. Recordatorios (secundaria)

```
Recordatorios
├── Flecha ←             → goBack()
├── Toggle general       → on/off todas las notificaciones
├── Biometricos
│   ├── Toggle           → on/off
│   └── Hora             → TextInput (default 20:00)
├── Bebe
│   ├── Toggle           → on/off
│   └── Hora             → TextInput (default 21:00)
├── Citas medicas
│   ├── Toggle           → on/off
│   └── Horas antes      → TextInput (default 2)
└── "Guardar"            → notificationService.saveRemindersConfig()
                          → reprograma todas las notificaciones
```

**Que pasa al conectar BD:**
- Config guarda en `recordatorios_config`
- Notificaciones se programan localmente (expo-notifications)
- Al crear cita medica en Calendario → auto-programa notificacion

---

### 12. DrManuel (secundaria)

```
DrManuel
├── Flecha ←             → goBack()
├── Hero card            → Info del asistente
├── "Proximamente"       → Badge informativo
└── Info cards           → 3 cards informativas
```

**Que pasa al conectar BD:**
- Pendiente: integrar chat con IA
- Podria usar WebView con token de sesion (RNF-04)
- O API externa que reciba datos biometricos de la usuaria

---

## Resumen de Navegacion

| Desde | Destinos posibles | Total |
|---|---|---|
| InicioSesion | Registro, MainTabs | 2 |
| Registro | InicioSesion, MainTabs | 2 |
| MainTabs/Menu | Configuracion, PerfilHijo, PerfilMama, DrManuel | 4 |
| MainTabs/Calendario | (solo modales internos) | 0 |
| MainTabs/Perfil | Configuracion, PerfilHijo, PerfilMama, Calendario, Recordatorios, InicioSesion | 6 |
| Header | Calendario, Configuracion | 2 |
| Footer | Menu, Calendario, Perfil | 3 |
| Configuracion | goBack, InicioSesion | 2 |
| PerfilMama | goBack | 1 |
| PerfilHijo | goBack, RegistroBebe, Configuracion | 3 |
| RegistroBebe | goBack | 1 |
| Recordatorios | goBack | 1 |
| DrManuel | goBack | 1 |

**Total de rutas unicas:** 28  
**Pantallas sin navegacion propia:** 0 (todas pueden volver atras)  
**Pantallas con reset a login:** InicioSesion, Registro, Configuracion (cerrar sesion)

---

## Verificacion para Conexion a BD

### Datos que fluyen entre pantallas

```
AuthContext (sesion)
  ↓
EtapaContext (etapa + datos derivados)
  ↓
Menu.js (cards adaptativas)
Perfil.js (cards adaptativas)
Header.js (avatar)

PerfilMama.js ←→ biometricService ←→ biometria_madre
PerfilHijo.js ←→ babyService ←→ metricas_bebe + perfil_bebe
Calendario.js ←→ calendarService ←→ registro_tarea
Recordatorios.js ←→ notificationService ←→ recordatorios_config
Configuracion.js ←→ authService ←→ usuario
```

### Puntos criticos al migrar a Supabase

1. **AuthContext.login/register** → debe guardar `user.id` (UUID de Supabase) para usar como FK
2. **EtapaContext** → debe recibir `user.id` para cargar datos de tablas relacionadas
3. **biometricService** → todos los queries necesitan `WHERE id_usuario = ?`
4. **calendarService** → todos los queries necesitan `WHERE id_usuario = ?`
5. **babyService** → perfil_bebe y metricas_bebe necesitan `id_usuario`
6. **notificationService** → config se guarda por usuario en `recordatorios_config`

---

*Mapa de navegacion generado automaticamente.*
