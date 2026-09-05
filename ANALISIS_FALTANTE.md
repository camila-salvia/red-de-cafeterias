# Análisis de Requisitos - Red de Cafeterías ✓ vs ✗

## 👥 Grupo (3 integrantes)

- Vivas Martin
- Salvia Camila
- Marianela Leonardelli

---

## ✅ LO QUE YA ESTÁ IMPLEMENTADO

### Backend - Infraestructura

- ✅ TypeScript configurado (tsconfig.json)
- ✅ Express como framework web
- ✅ MikroORM como mapper (ORM)
- ✅ MySQL como BD persistente externa
- ✅ dotenv configurado (.env con credenciales)
- ✅ Arquitectura en capas (controller, entity, routes, validator, middleware)
- ✅ Middlewares implementados (CORS, RequestContext)
- ✅ API REST con rutas estándar
- ✅ Autenticación JWT implementada
- ✅ 2 niveles de acceso: usuario y admin (esAdmin boolean)
- ✅ Middleware de autenticación (verificarToken, soloAdmin)
- ⚠️ Validaciones básicas de entrada (parciales; faltan relaciones, duplicados y comentarios)

### Backend - Entidades

- ✅ Usuario (CRUD simple - Integrante 1)
- ✅ Categoría (CRUD simple - Integrante 2)
- ✅ Producto (CRUD dependiente - depende de Categoría)
- ✅ Pedido (CRUD dependiente - depende de Usuario y MetodoPago)
- ✅ DetallePedido (CRUD dependiente - depende de Pedido y Producto)
- ✅ Comentario (CRUD dependiente - depende de Usuario)
- ✅ MetodoPago (entidad de apoyo)
- ✅ Relaciones ORM correctas (OneToMany, ManyToOne)

### Backend - Funcionalidad

- ✅ Listado de productos CON FILTRO por categoría
- ✅ Obtener pedidos por usuario (mis pedidos; falta proteger la consulta por propietario)
- ✅ Login con JWT
- ✅ Compilación TypeScript verificada con `npm run build`

### Frontend - Infraestructura

- ✅ Angular como framework
- ✅ TypeScript configurado
- ✅ Bootstrap para estilos (CSS)
- ✅ SCSS configurado
- ✅ Componentes standalone
- ✅ Rutas protegidas con authGuard
- ✅ Interceptor de autenticación (token en headers)
- ✅ Ambientes configurados (environment.ts y environment.development.ts)

### Frontend - Componentes

- ✅ App con rutas
- ✅ Header
- ✅ Footer
- ✅ Boton
- ✅ TarjetaProducto (Input/Output Properties ✓)
- ✅ FormularioLogin
- ✅ Login (página)
- ✅ Inicio (página con listado de productos)
- ✅ Pedidos (página)
- ✅ AdminDashboard (página - existe pero VACÍA)
- ✅ Comentarios (página)
- ✅ MisPedidos (página)
- ✅ VerPedido (página)

### Frontend - Servicios

- ✅ ApiService (calls al backend)
- ✅ AuthService (manejo de localStorage y signals)
- ✅ CartService (carrito de compras)

### Frontend - Pruebas

- ✅ Estructura de tests con Vitest (angular testing setup)

---

## ❌ LO QUE FALTA HACER

### 🔴 **CRÍTICO - Backend (DEBE COMPLETARSE)**

#### 1. **Tests Automatizados - FALTA COMPLETAMENTE** ⚠️

**Requisito**: 1 test por integrante (3 tests) + 1 test de integración

**Tareas**:

- [ ] Configurar testing framework en backend (vitest, jest o similar) y reemplazar el script `test` placeholder de `backend/package.json`
- [ ] Test 1 - Integrante Vivas Martin: Test unitario de Usuario (crear, obtener, validar)
- [ ] Test 2 - Integrante Salvia Camila: Test unitario de Producto (crear con categoría, filtrar)
- [ ] Test 3 - Integrante Marianela Leonardelli: Test unitario de Comentario (crear, validar relación)
- [ ] Test integración: Flujo completo de Pedido (crear usuario → seleccionar producto → crear pedido)

**Archivo a crear**: `backend/src/tests/` con archivos .test.ts

#### 2. **Validaciones Completas - INCOMPLETAS**

**Requisito**: Validar entrada de datos, manejar e informar errores apropiadaamente

**Tareas**:

- [x] Usuario: validar email (regex) y password (mínimo 6 caracteres)
- [ ] Usuario: validar teléfono con formato completo y email duplicado antes de persistir
- [ ] Categoría: validar nombre no vacío y no duplicado
- [ ] Producto: validar nombre no vacío y precio > 0 (ya implementado)
- [ ] Producto: confirmar que la categoría exista; actualmente se crea una referencia ORM sin validarla previamente
- [ ] Comentario: **FALTA COMPLETAMENTE** - validar contenido no vacío, puntuación 1-5, usuario válido
- [ ] Pedido: validar items no vacío, usuario válido, productos existentes y método de pago existente
- [ ] Manejo de errores: devolver errores detallados y amigables con códigos HTTP correctos; varios duplicados o relaciones inválidas terminan actualmente en 500

**Archivos a completar/crear**:

- `backend/src/comentario/comentario.validator.ts` (NO EXISTE)
- Mejorar validaciones en otros validators

#### 3. **Protección de Rutas - INCOMPLETA** 🔓

**Requisito**: Proteger rutas según nivel de acceso

**Problemas encontrados**:

- [ ] Categoría: POST/PUT/DELETE **NO protegido** - deben requerir `verificarToken` y `soloAdmin`; los GET pueden ser públicos
- [ ] Comentario: POST/PUT/DELETE **NO protegido** - deben requerir `verificarToken` y validar propietario/admin
- [ ] MetodoPago: POST/PUT/DELETE **NO protegido** - deben requerir `verificarToken` y `soloAdmin`
- [ ] DetallePedido: todas las operaciones **NO protegidas** - debe restringirse a usuarios autenticados/admin según la operación
- [ ] Pedido: listado general **NO protegido** - debe requerir `soloAdmin`
- [ ] Pedido: GET por usuario, detalle, PUT/PATCH y DELETE **NO protegidos** - deben validar autenticación y propietario/admin
- [ ] Usuario: PUT/PATCH/DELETE **NO protegidos** - deben verificar que sea el mismo usuario o admin
- [ ] Producto: sus operaciones de escritura ya requieren `verificarToken` y `soloAdmin`

**Archivos a modificar**:

- `backend/src/categoria/categoria.routes.ts`
- `backend/src/comentario/comentario.routes.ts`
- `backend/src/metodo-pago/metodo-pago.routes.ts`
- `backend/src/usuario/usuario.routes.ts`
- `backend/src/pedido/pedido.routes.ts`
- `backend/src/detalle-pedido/detalle-pedido.routes.ts`

#### 4. **Control de propiedad y seguridad de credenciales - FALTA**

- [ ] Usar el usuario autenticado (`req.usuarioToken.id`) al crear pedidos, sin confiar en el `usuario` enviado por el cliente
- [ ] Impedir que un usuario consulte o modifique pedidos, comentarios o datos de otros usuarios
- [ ] Agregar middleware que permita acceso al propio recurso o a un administrador
- [ ] Hashear siempre las contraseñas nuevas con bcrypt antes de guardarlas
- [ ] Eliminar el fallback que compara contraseñas en texto plano durante el login

---

### 🔴 **CRÍTICO - Frontend (DEBE COMPLETARSE)**

#### 1. **Login Desacoplado - PROBLEMA GRAVE** 🚨

**Requisito**: Login con autenticación propia usando API

**Problema**:

- El frontend está obteniendo TODOS los usuarios y comparando passwords en memoria
- **NUNCA** está usando el endpoint `/api/usuario/login` que ya existe en backend
- NO está usando JWT correctamente

**Tareas**:

- [ ] Modificar login.ts para usar `apiService.login(email, password)` (ya existe en api.service)
- [ ] Actualizar AuthService.login() para recibir token JWT del backend
- [ ] Validar que token JWT se guarda y se envía en requests (interceptor YA existe ✓)
- [ ] Implementar logout con limpieza de localStorage

**Archivo**: `frontend/src/app/pages/login/login.ts`

#### 2. **Tests - INCOMPLETOS**

**Requisito**: 1 test unitario de componente + 1 test e2e

**Tareas**:

- [ ] Escribir test real de TarjetaProductoComponent (no solo "should create")
  - Probar que recibe @Input producto
  - Probar que emite @Output al hacer click en "Agregar"
  - Mock del servicio de carrito
- [ ] Escribir test real de FormularioLoginComponent
- [ ] Crear test e2e: flujo login → ver productos → agregar carrito → crear pedido
- [ ] Configurar e2e testing (cypress o protractor)

**Archivos**:

- `frontend/src/app/components/tarjeta-producto/tarjeta-producto.spec.ts` (mejorar)
- `frontend/src/app/components/formulario-login/formulario-login.spec.ts` (mejorar)
- `frontend/e2e/` (CREAR)

#### 3. **AdminDashboard - VACÍO** ❌

**Requisito**: Admin debe poder gestionar productos (CRUD de productos)

**Tareas**:

- [ ] Implementar AdminDashboard para mostrar:
  - Listado de productos con opciones de editar/eliminar
  - Formulario para agregar nuevo producto
  - Listado de categorías
  - Opcionalmente: Listado de pedidos y sus estados
- [ ] Proteger AdminDashboard para solo admins
- [ ] Añadir guard de admin en rutas (actualmente solo verificar token)

**Archivo**:

- `frontend/src/app/pages/admin-dashboard/admin-dashboard.ts`
- `frontend/src/app/guards/admin-guard.ts` (CREAR)

---

### 🟡 **IMPORTANTE - Frontend (FUNCIONALIDAD)**

#### 1. **Detalle de Producto - FALTA**

**Requisito**: Al seleccionar un producto en listado, mostrar detalle

**Tareas**:

- [ ] Crear ruta `/producto/:id` o modal con detalle
- [ ] Mostrar: nombre, descripción, precio, categoría
- [ ] Botón para agregar al carrito

#### 2. **Detalle de Pedido - INCOMPLETO**

**Requisito**: Al seleccionar un pedido, mostrar detalle

**Archivo existente**: `ver-pedido.ts` (necesita verificar que está funcional)

- [ ] Mostrar fecha, estado, costo total, cliente, dirección envío
- [ ] Listar productos dentro del pedido (detalles)

#### 3. **Mis Pedidos - IMPLEMENTAR**

**Requisito**: Usuario autenticado puede ver su historial de pedidos

**Archivo existente**: `mis-pedidos.ts`

- [ ] Cargar pedidos del usuario usando `apiService.obtenerMisPedidos(usuarioId)`
- [ ] Mostrar listado filtrable por estado
- [ ] Click en pedido → ver detalle (ver-pedido)

#### 4. **Carrito de Compras - FALTA CONECTAR**

**Requisito**: Agregar productos al carrito y crear pedido

**Tareas**:

- [ ] Mostrar carrito en UI (header o página dedicada)
- [ ] Endpoint POST `/api/pedido` ya existe, completar integración
- [ ] Validar que usuario esté autenticado antes de crear pedido
- [ ] Limpiar carrito después de crear pedido exitosamente

#### 5. **Comentarios - PÁGINA VACÍA**

**Requisito**: Usuarios pueden dejar comentarios en pedidos

**Archivo existente**: `comentarios.ts`

- [ ] Listar comentarios existentes
- [ ] Formulario para crear nuevo comentario (asociado a pedido/usuario)
- [ ] Protección: solo usuarios autenticados pueden comentar

---

### 🟡 **IMPORTANTE - Backend (FUNCIONALIDAD)**

#### 1. **Validador de Comentario - CREAR** ❌

**Archivo faltante**: `backend/src/comentario/comentario.validator.ts`

```typescript
// Debe validar:
- contenido: string no vacío
- puntuacion: número entre 1-5
- usuario: UUID válido
- Return 400 si hay errores
```

#### 2. **Mejorar Manejador de Errores**

- Devolver error details en desarrollo
- Errores genéricos en producción
- Códigos HTTP correctos (400, 401, 403, 404, 500)

#### 3. **Seed de Datos - COMENTADO** (opcional pero útil)

**Archivo**: `backend/src/app.ts` - tiene seed comentado

- [ ] Descomenta para datos de prueba
- Útil para development

---

### 🟢 **BONUS - Requisitos Opcionales**

#### 1. **Notificaciones** (VOLUNTARIO)

- Toast/alert cuando se crea un pedido
- Confirmación de login exitoso

#### 2. **Más niveles de acceso** (VOLUNTARIO)

- Actualmente: usuario, admin
- Podría haber: gerente (ver reportes), delivery (asignar pedidos)

#### 3. **Reportes de Admin** (VOLUNTARIO)

- Total de pedidos por día
- Productos más vendidos
- Ingresos totales

#### 4. **Búsqueda avanzada** (VOLUNTARIO)

- Buscar productos por nombre
- Filtrar pedidos por rango de fechas

---

## 📋 RESUMEN DE TAREAS CRÍTICAS POR INTEGRANTE

### **Vivas Martin**

- [ ] Implementar 1 test unitario de Usuario (backend)
- [ ] Mejorar validación de Usuario
- [ ] Proteger rutas de Usuario que faltan

### **Salvia Camila**

- [ ] Implementar 1 test unitario de Producto (backend)
- [ ] Crear y validar Comentario validator
- [ ] Implementar AdminDashboard (frontend)

### **Marianela Leonardelli**

- [ ] Implementar 1 test unitario de Comentario (backend)
- [ ] Arreglar login del frontend (usar JWT correctamente)
- [ ] Implementar MisPedidos y Comentarios (frontend)

### **Todos**

- [ ] Implementar 1 test de integración (flujo completo: pedido)
- [ ] Configurar testing en frontend (e2e)
- [ ] Code review de protecciones de rutas
- [ ] Validar mobile-first CSS en 3 breakpoints (SM, MD, LG)

---

## 🎯 FUNCIONAL - VERIFICACIÓN FINAL

### Funcionales requeridos (3 integrantes):

- ✅ 3 CRUDs simples: Usuario, Categoría, + 1 más
- ✅ CRUDs dependientes: Producto(Categoría), Pedido(Usuario/MetodoPago), DetallePedido(Pedido/Producto), Comentario(Usuario)
- ❌ Listados con filtro: existe Productos por categoría y Pedidos por usuario; falta filtro de Pedidos por estado
- ❌ Detalle para cada listado: FALTA completar
- ✅ Casos de uso (mínimo 3, al menos 2 relacionados):
  1. "Realizar un pedido" (Usuario → Producto → Pedido → DetallePedido)
  2. "Dejar una reseña" (Usuario → Comentario)
  3. "Agregar producto al catálogo" (Admin → Producto)

  Relacionados: (1) y (2) - datos de Pedido sirven para comentar

---

## 📝 PRÓXIMOS PASOS RECOMENDADOS

1. **Urgente**: Arreglar login frontend (semana 1)
2. **Urgente**: Implementar tests (semana 1-2)
3. **Importante**: Proteger rutas faltantes (semana 1)
4. **Importante**: Completar validaciones (semana 1-2)
5. **Normal**: Implementar detalles y completar UI (semana 2-3)
6. **Nice to have**: Tests e2e y bonus (semana 3+)

---

## 📚 REFERENCIAS

- Requisitos: `requisitos-backend.md` (en proyecto)
- Propuesta: `Propsal DSW.md` (en proyecto)
- Backend: `/backend/src/`
- Frontend: `/frontend/src/`
