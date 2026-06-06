# Mapa de Navegación — MomsAI

**Fecha:** 5 de junio de 2026  
**Total de pantallas:** 11  
**Total de rutas de navegación:** 28

---

## Estructura de Navegación

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
**Conexión a Supabase:** `authService.login()` llama a `supabase.auth.signInWithPassword()`. Si es exitoso, carga sesión y navega a MainTabs.

### 2. Registro
```
Registro
├── → InicioSesion       (link "Ya tienes cuenta")
└── → MainTabs           (registro exitoso, navigation.reset)
```
**Conexión a Supabase:** `authService.register()` llama a `supabase.auth.signUp()`. Crea fila en tabla `perfil_madre`.

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
├── [Post-parto] Card progreso
├── Calculadora Ovulacion → Modal
├── Calculadora Embarazo  → Modal
├── Card "Mi Bebe"        → PerfilHijo
├── Card "Mi Salud"       → PerfilMama
├── EvolutionChart        → (interno)
├── Proximos Eventos      → (interno)
└── FAB Dr. Manuel        → DrManuel
```

### 5. Calendario (Tab 2)
```
Calendario
├── Evento del dia       → (selecciona, muestra detalle)
├── Boton "+" Evento     → Modal EventForm
├── Editar evento        → Modal EventForm (modo edicion)
└── Eliminar evento      → Alert.confirm → elimina
```
**Conexión a Supabase:** CRUD opera directamente sobre la tabla `registro_tarea`.

### 6. Perfil (Tab 3)
```
Perfil
│
├── Avatar               → Lee de AuthContext
├── "Editar Perfil"      → Configuracion
├── "Mis Estadisticas"   → PerfilMama
├── "Mi Bebe"            → PerfilHijo
├── "Mis Citas"          → Calendario
├── "Recordatorios"      → Recordatorios
├── "Configuracion"      → Configuracion
└── "Cerrar Sesion"      → Alert → supabase.auth.signOut() → InicioSesion
```

### 7. Configuracion (secundaria)
```
Configuracion
├── Editar Perfil        → updateProfile() (Supabase Auth)
├── Mi Situacion         → upsert en 'perfil_madre' con fecha_fur o fecha_nac_bebe
├── Apariencia           → ThemeContext (local)
├── Legal                → Exencion de responsabilidad
└── "Cerrar Sesion"      → supabase.auth.signOut()
```

### 8. PerfilMama — Mis Estadísticas (secundaria)
```
PerfilMama
├── Peso, Horas sueño, Presión arterial
├── Síntomas (8)         → Checkboxes con soporte para Chip Pill de alertas
└── "Guardar"            → biometricService.saveBiometricData() (Supabase 'biometria_madre')
                          → alertService.analyzeBiometricData()
                          → muestra Alerts modales y/o actualiza Chips UI
```

### 9. PerfilHijo — Mi Bebe (secundaria)
```
PerfilHijo
├── [Sin perfil bebe]    → RegistroBebe
├── [Pre-parto]          → Checkboxes Movimiento fetal (con Chip Pill de alertas)
├── [Post-parto]         → Peso, Longitud, Tomas, Síntomas (con Chip Pill de alertas)
└── "Guardar"            → babyService.saveBabyData() (Supabase 'metricas_bebe')
```

### 10. RegistroBebe (secundaria)
```
RegistroBebe
├── Nombre, Sexo, Fecha nacimiento, Peso, Talla
└── "Registrar bebe"     → Crea fila en 'perfil_bebe' y actualiza 'perfil_madre'
```

### 11. Recordatorios (secundaria)
```
Recordatorios
├── Toggle general y específicos por módulos
└── "Guardar"            → notificationService (expo-notifications local) + config Supabase
```

### 12. DrManuel (secundaria)
```
DrManuel
├── Hero card            → Info del asistente
└── "Proximamente"       → (Futuro chat IA)
```

---

## Resumen de Navegación

| Desde | Destinos posibles | Total |
|---|---|---|
| InicioSesion | Registro, MainTabs | 2 |
| Registro | InicioSesion, MainTabs | 2 |
| MainTabs/Menu | Configuracion, PerfilHijo, PerfilMama, DrManuel | 4 |
| MainTabs/Perfil | Configuracion, PerfilHijo, PerfilMama, Calendario, Recordatorios, InicioSesion | 6 |
| Header | Calendario, Configuracion | 2 |
| Footer | Menu, Calendario, Perfil | 3 |

**Total de rutas únicas:** 28  
**Pantallas con reset a login:** InicioSesion, Registro, Configuracion, Perfil

---

*Mapa de navegación mantenido por el equipo de desarrollo IA.*
