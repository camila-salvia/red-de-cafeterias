# 📊 DIAGRAMA DE ESTADO - Red de Cafeterías

## 🏗️ ARQUITECTURA ACTUAL

```
FRONTEND (Angular)                    BACKEND (Express + MikroORM)
┌─────────────────────────────────┐  ┌────────────────────────────────┐
│ App (Routes)                     │  │ app.ts                         │
│ ├─ inicio (PUBLIC)              │  │ ├─ /api/usuario/login (PUBLIC)│
│ ├─ login (PUBLIC)               │  │ ├─ /api/usuario/* (MIXED)     │
│ ├─ pedidos (PROTECTED)          │  │ ├─ /api/producto/* (MIXED)    │
│ ├─ admin (PROTECTED)            │  │ ├─ /api/categoría/* (MIXED)   │
│ ├─ comentarios (PUBLIC)         │  │ ├─ /api/comentario/* (MIXED)  │
│ ├─ mis-pedidos (PROTECTED)      │  │ ├─ /api/pedido/* (MIXED)      │
│ └─ ver-pedido (PROTECTED)       │  │ └─ /api/metodo-pago/* (MIXED) │
│                                  │  │                                │
│ Services:                        │  │ Middleware:                    │
│ ├─ ApiService ✓                │  │ ├─ verificarToken ✓            │
│ ├─ AuthService ✓               │  │ ├─ soloAdmin ✓                │
│ └─ CartService ✓               │  │ └─ CORS ✓                     │
│                                  │  │                                │
│ Guards:                          │  │ DB:                            │
│ └─ authGuard ✓                 │  │ ├─ Usuario table ✓            │
│                                  │  │ ├─ Categoría table ✓         │
│ Interceptors:                    │  │ ├─ Producto table ✓          │
│ └─ authInterceptor ✓           │  │ ├─ Pedido table ✓            │
│                                  │  │ ├─ DetallePedido table ✓     │
│ Componentes:                     │  │ ├─ Comentario table ✓        │
│ ├─ FormularioLogin              │  │ └─ MetodoPago table ✓        │
│ ├─ TarjetaProducto (@Input/@Output)     │                                │
│ ├─ AdminDashboard (VACÍO) ❌   │  │ MySQL Database                │
│ ├─ MisPedidos (INCOMPLETO)     │  │ localhost:3306                │
│ ├─ VerPedido (?)               │  │                                │
│ └─ Comentarios (INCOMPLETO)    │  │                                │
└─────────────────────────────────┘  └────────────────────────────────┘
         localhost:3000                    localhost:3000/api
```

---

## 🔐 ESTADO DE PROTECCIÓN DE RUTAS

### ✅ CORRECTO (Protegido)
```
producto.routes.ts:
  POST   /api/producto           → verificarToken + soloAdmin
  PUT    /api/producto/:id       → verificarToken + soloAdmin
  DELETE /api/producto/:id       → verificarToken + soloAdmin
```

### ❌ INCORRECTO (SIN PROTECCIÓN o INCOMPLETO)
```
categoria.routes.ts:
  POST   /api/categoria          ❌ SIN PROTECCIÓN
  PUT    /api/categoria/:id      ❌ SIN PROTECCIÓN
  DELETE /api/categoria/:id      ❌ SIN PROTECCIÓN

comentario.routes.ts:
  POST   /api/comentario         ❌ SIN PROTECCIÓN
  PUT    /api/comentario/:id     ❌ SIN PROTECCIÓN
  DELETE /api/comentario/:id     ❌ SIN PROTECCIÓN

metodo-pago.routes.ts:
  POST   /api/metodo-pago        ❌ SIN PROTECCIÓN
  PUT    /api/metodo-pago/:id    ❌ SIN PROTECCIÓN
  DELETE /api/metodo-pago/:id    ❌ SIN PROTECCIÓN

pedido.routes.ts:
  POST   /api/pedido             ✓ verificarToken
  GET    /api/pedido             ❌ SIN PROTECCIÓN (debe ser soloAdmin)
  GET    /api/pedido/usuario/:id ❌ SIN PROTECCIÓN (debe ser verificarToken)

usuario.routes.ts:
  PUT    /api/usuario/:id        ❌ SIN PROTECCIÓN
  DELETE /api/usuario/:id        ❌ SIN PROTECCIÓN
```

---

## 🔄 FLUJO DE LOGIN (ACTUAL vs CORRECTO)

### ❌ FLUJO ACTUAL (INCORRECTO)
```
Usuario ingresa email/password en login.html
            ↓
login.ts llamaa apiService.obtenerUsuarios()
            ↓
Backend retorna TODOS los usuarios (sin filtrar, sin hashear)
            ↓
Frontend compara en JavaScript: email + password
            ↓
Si match → almacena en localStorage (pero SIN token JWT)
            ↓
⚠️ PROBLEMA: Password visible en red + sin Token real + inseguro
```

### ✅ FLUJO CORRECTO (DEBE SER)
```
Usuario ingresa email/password en login.html
            ↓
login.ts llama apiService.login(email, password)  ← YA EXISTE en api.service
            ↓
Backend verifica: email existe + bcrypt password ✓
            ↓
Backend retorna: { token: "jwt...", id, nombre, esAdmin }
            ↓
Frontend: authService.login(respuesta.data)
            ↓
localStorage: token_cafeteria, usuario_id, nombre_usuario, es_admin
            ↓
authInterceptor añade: Authorization: Bearer <token> a TODAS las requests
            ↓
✅ SEGURO: Password hasheado en server + JWT en cliente
```

---

## 📝 ESTADO DE VALIDADORES

| Entidad | Validator | Estado | Falta |
|---------|-----------|--------|-------|
| Usuario | usuario.validator.ts | ✓ Existe | Email regex, Password min, Teléfono regex |
| Categoría | categoria.validator.ts | ❌ NO EXISTE | Crear: nombre !empty, !duplicate |
| Producto | producto.validator.ts | ✓ Existe | Descripción (opcional) |
| Pedido | pedido.validator.ts | ✓ Existe | ✓ |
| DetallePedido | N/A | N/A | Creado desde controller |
| Comentario | comentario.validator.ts | ❌ NO EXISTE | Contenido !empty, Puntuación 1-5, Usuario válido |

---

## 🧪 ESTADO DE TESTS

| Test | Tipo | Estado | Archivo |
|------|------|--------|---------|
| Usuario | Unitario | ❌ FALTA | `backend/src/tests/usuario.test.ts` |
| Producto | Unitario | ❌ FALTA | `backend/src/tests/producto.test.ts` |
| Comentario | Unitario | ❌ FALTA | `backend/src/tests/comentario.test.ts` |
| Pedido Integration | Integración | ❌ FALTA | `backend/src/tests/pedido.integration.test.ts` |
| TarjetaProducto | Unitario | ⚠️ Básico | `frontend/src/app/components/tarjeta-producto/tarjeta-producto.spec.ts` |
| E2E Flow | E2E | ❌ FALTA | `frontend/e2e/` |

**Setup requerido**: `npm install --save-dev vitest` en backend

---

## 📱 COMPONENTES FRONTEND

```
App
├─ header (✓ existe)
├─ router-outlet
│  ├─ inicio (✓ lista productos, ✓ filtro categoría)
│  │  └─ TarjetaProducto (✓ @Input/@Output)
│  ├─ login (❌ PROBLEMA: sin JWT)
│  ├─ pedidos (? sin detalles)
│  ├─ admin (❌ VACÍO - debe mostrar CRUD productos)
│  ├─ comentarios (❌ INCOMPLETO - sin listar/crear)
│  ├─ mis-pedidos (❌ INCOMPLETO - sin cargar)
│  │  └─ ver-pedido (? detalles)
│  └─ 404 redirect
└─ footer (✓ existe)
```

---

## 🎯 REQUISITOS FUNCIONALES - CHECK

```
PARA 3 INTEGRANTES:

CRUDs SIMPLES (1 por integrante):
  ✅ Usuario (Vivas Martin)
  ✅ Categoría (Salvia Camila)
  ✅ MetodoPago (Marianela Leonardelli)

CRUDs DEPENDIENTES (1 cada 2 integrantes):
  ✅ Producto (depende Categoría)
  ✅ Pedido (depende Usuario + MetodoPago)
  ✅ DetallePedido (depende Pedido + Producto)
  ✅ Comentario (depende Usuario)

LISTADOS + FILTRO (1 cada 2 integrantes):
  ✅ Productos por categoría
  ✅ Pedidos por usuario (mis-pedidos)
  ⚠️ Pedidos por estado (FALTA: implementar filtro estado)

DETALLES (para cada listado):
  ✅ Detalle Producto (GET by ID)
  ⚠️ Detalle Pedido (ver-pedido existe pero incompleto)

CASOS DE USO / EPICS (1 por integrante, min 2 relacionados):
  ✅ Realizar un Pedido (Usuario → Producto → Carrito → Pedido ← Comentario)
  ✅ Dejar una Reseña (Comentario asociado a Pedido)
  ✅ Agregar Producto al Catálogo (Admin CRUD)
  
  Relacionados: (1) y (2) - datos de Pedido sirven para comentar

VALIDACIONES:
  ✓ Básicas implementadas
  ❌ Validadores de Comentario: FALTA

TESTING:
  ❌ Tests backend: NO IMPLEMENTADOS (0/4)
  ⚠️ Tests frontend: BÁSICOS (creación solo)
  ❌ Tests e2e: NO IMPLEMENTADOS
```

---

## 🔍 CHECKLIST RÁPIDO POR ESTADO

### Listo para producción ✅
- Estructura backend (Express + MikroORM)
- Estructura frontend (Angular + Bootstrap)
- Modelos de datos (entidades + relaciones)
- Autenticación JWT en backend
- Interceptor de token en frontend

### Funciona parcialmente ⚠️
- Login (funciona pero sin JWT desde frontend)
- Producto CRUD (funciona pero GET listar sin filtro en admin)
- Pedido (funciona crear, falta listar con filtros)
- Admin Dashboard (página existe, SIN componentes)

### Falta completamente ❌
- Tests (0 tests implementados)
- Comentario validator (NO EXISTE)
- Protecciones de rutas (muchas faltan)
- Admin UI (gestión de productos)
- Mis Pedidos (cargar y mostrar)
- Carrito de compras (UI)

---

## ⏰ TIEMPO ESTIMADO

| Tarea | Tiempo | Prioridad |
|-------|--------|-----------|
| Arreglar login (JWT) | 2h | 🔴 CRÍTICO |
| Tests backend (4 tests) | 6-8h | 🔴 CRÍTICO |
| Validadores faltantes | 2h | 🔴 CRÍTICO |
| Proteger rutas | 2h | 🔴 CRÍTICO |
| AdminDashboard básico | 4-5h | 🟡 IMPORTANTE |
| MisPedidos + Comentarios | 4-5h | 🟡 IMPORTANTE |
| Tests e2e | 3-4h | 🟡 IMPORTANTE |
| Pulir UI/CSS responsive | 4-5h | 🟢 NORMAL |
| Bonus (reportes, etc) | 5h+ | 🟢 VOLUNTARIO |

**Total**: ~32-40 horas de trabajo para 3 personas (semana de 40h = viable)

---

## 📞 RESPONSABILIDADES

```
VIVAS MARTIN (50026)
├─ Test Usuario unitario (backend)
├─ Validación Usuario mejorada
├─ Protección rutas Usuario
└─ CSS Header responsive

SALVIA CAMILA (49373)
├─ Test Producto unitario (backend)
├─ Crear Comentario validator
├─ Admin Dashboard CRUD productos
└─ Test TarjetaProducto mejorado

MARIANELA LEONARDELLI (51337)
├─ Test Comentario unitario (backend)
├─ Arreglar Login JWT (CRÍTICO)
├─ MisPedidos + Comentarios (frontend)
└─ Carrito de compras

TODOS (Colaborativo)
├─ Test integración Pedido (backend)
├─ Tests e2e (frontend)
├─ Code review protecciones
└─ CSS mobile-first 3 breakpoints
```

---

*Diagrama actualizado: 2026-09-04*
*Estado actual: 65% implementado, 35% falta crítico*
