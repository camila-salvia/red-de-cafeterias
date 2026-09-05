# CHECKLIST DE TAREAS - Red de Cafeterías

## 🚨 CRÍTICO (Semana 1) - Requisitos obligatorios

### Backend - Tests y Validación
- [ ] **Backend Tests Setup**
  - [ ] Instalar testing framework: `npm install --save-dev vitest @vitest/ui` en backend
  - [ ] Crear archivo `backend/src/tests/setup.ts`
  - [ ] Actualizar `backend/package.json` script: `"test": "vitest"`

- [ ] **Test 1 - Usuario (Vivas Martin)** → `backend/src/tests/usuario.test.ts`
  ```
  - crear usuario con datos válidos
  - obtener usuario por ID
  - fallar si email duplicado
  - fallar si password vacío
  ```

- [ ] **Test 2 - Producto (Salvia Camila)** → `backend/src/tests/producto.test.ts`
  ```
  - crear producto con categoría válida
  - filtrar productos por categoría
  - fallar si precio ≤ 0
  - fallar si categoría no existe
  ```

- [ ] **Test 3 - Comentario (Marianela)** → `backend/src/tests/comentario.test.ts`
  ```
  - crear comentario con puntuación 1-5
  - obtener comentario por ID
  - fallar si puntuación fuera de rango
  - fallar si usuario no existe
  ```

- [ ] **Test Integración - Flujo Pedido** → `backend/src/tests/pedido.integration.test.ts`
  ```
  - crear usuario
  - crear categoría y producto
  - crear pedido con items
  - verificar costo total calculado
  ```

### Backend - Validación Faltante
- [ ] **Crear** `backend/src/comentario/comentario.validator.ts`
  ```typescript
  - contenido: string, !empty
  - puntuacion: number, 1-5
  - usuario: UUID válido
  ```

- [ ] **Mejorar** `backend/src/usuario/usuario.validator.ts`
  ```
  - email: valid format (regex)
  - password: min 6 chars
  - telefono: valid format
  - email único en BD
  ```

- [ ] **Mejorar** `backend/src/categoria/categoria.validator.ts` (crear si no existe)
  ```
  - nombre: !empty, !duplicado
  ```

### Backend - Protección de Rutas
- [ ] Actualizar `backend/src/categoria/categoria.routes.ts`
  ```
  POST, PUT, DELETE → agregar verificarToken + soloAdmin
  ```

- [ ] Actualizar `backend/src/comentario/comentario.routes.ts`
  ```
  POST, PUT, DELETE → agregar verificarToken
  ```

- [ ] Actualizar `backend/src/metodo-pago/metodo-pago.routes.ts`
  ```
  POST, PUT, DELETE → agregar verificarToken + soloAdmin
  ```

- [ ] Actualizar `backend/src/usuario/usuario.routes.ts`
  ```
  PUT, DELETE → agregar verificarToken (+ verificar es mismo usuario o admin)
  ```

- [ ] Actualizar `backend/src/pedido/pedido.routes.ts`
  ```
  GET (listar todos) → agregar soloAdmin
  ```

---

## 🔴 IMPORTANTE (Semana 1-2) - Funcionamiento crítico

### Frontend - LOGIN (🚨 PROBLEMA GRAVE)
- [ ] **Arreglar** `frontend/src/app/pages/login/login.ts`
  - Cambiar: `apiService.obtenerUsuarios()` → `apiService.login(email, password)`
  - Recibir token JWT del backend
  - Guardar token en AuthService
  - Redirigir a inicio

- [ ] **Mejorar** `frontend/src/app/services/auth.ts`
  - Actualizar login() para recibir response con token JWT
  - Guardar: token_cafeteria, usuario_id, nombre_usuario, es_admin (YA HACE)

- [ ] **Verificar** `frontend/src/app/interceptors/auth.interceptor.ts`
  - ✅ YA envía Bearer token en headers

### Frontend - AdminDashboard
- [ ] **Crear** `frontend/src/app/pages/admin-dashboard/admin-dashboard.ts`
  - Componente con:
    - Listado de productos (con edit/delete)
    - Formulario agregar producto
    - Listado de categorías
    - Formulario agregar categoría

- [ ] **Crear** `frontend/src/app/guards/admin-guard.ts`
  - Verificar token + esAdmin = true
  - Redirigir si no es admin

- [ ] **Actualizar** `frontend/src/app/app.routes.ts`
  - Agregar guard admin a ruta `/admin`

### Frontend - Funcionalidad Pedidos
- [ ] **Completar** `frontend/src/app/pages/mis-pedidos/mis-pedidos.ts`
  - Cargar pedidos del usuario actual
  - Mostrar listado filtrable por estado
  - Click → ver detalle (VerPedido)

- [ ] **Verificar/Completar** `frontend/src/app/pages/ver-pedido/ver-pedido.ts`
  - Mostrar detalle: fecha, cliente, costo total, dirección
  - Listar DetallePedidos (productos en el pedido)

### Frontend - Carrito
- [ ] **Verificar** `frontend/src/app/services/cart.ts`
  - Método: agregarProducto() ✓
  - Método: obtenerCarrito()
  - Método: limpiarCarrito()
  - Integración con backend (crear pedido)

- [ ] **Crear página/modal de Carrito** (o en Header)
  - Mostrar productos agregados
  - Cantidad y precio
  - Botón "Confirmar Pedido" → POST `/api/pedido`

### Frontend - Comentarios
- [ ] **Completar** `frontend/src/app/pages/comentarios/comentarios.ts`
  - Listar comentarios existentes
  - Formulario para crear comentario (solo autenticados)
  - Asociar a usuario actual

---

## 🟡 NORMAL (Semana 2-3) - Mejoras y completitud

### Frontend - Detalle de Producto
- [ ] Crear ruta `/producto/:id`
- [ ] Mostrar: nombre, descripción, precio, categoría
- [ ] Botón "Agregar al carrito"

### Frontend - Pruebas Reales
- [ ] **TarjetaProductoComponent test** → `frontend/src/app/components/tarjeta-producto/tarjeta-producto.spec.ts`
  ```
  - Recibe @Input producto
  - Emite @Output productoAgregado al click
  - Mostrar imagen correcta según nombre
  ```

- [ ] **FormularioLoginComponent test** → mejora básico test
  ```
  - Campos email y password
  - Botón login funciona
  - Validación campos requeridos
  ```

- [ ] **E2E Test** (crear `frontend/e2e/` si no existe)
  ```
  - Navigate a /login
  - Login con usuario válido
  - Redirigir a /inicio
  - Agregar producto al carrito
  - Crear pedido
  - Ver pedido en mis-pedidos
  ```

### Frontend - CSS Mobile-First
- [ ] Verificar breakpoints (SM, MD, LG) en:
  - Header (responsive nav)
  - TarjetaProducto (grid adapta)
  - Formularios (ancho completo en SM)
  - Verificar en navegador: 320px (SM), 768px (MD), 1024px (LG)

---

## 🟢 BONUS (Semana 3+) - Alcance voluntario

### Backend
- [ ] Seed de datos (descomentar en app.ts)
- [ ] Endpoint de reportes (productos más vendidos, ingresos)
- [ ] Más niveles de acceso (gerente, delivery)
- [ ] Logs de acciones importantes

### Frontend
- [ ] Notificaciones toast (login, pedido creado)
- [ ] Búsqueda avanzada de productos
- [ ] Filtro pedidos por fecha
- [ ] Gráficos de ventas (admin)
- [ ] Tema oscuro

### DevOps
- [ ] Dockerfile para backend y frontend
- [ ] Docker Compose para desarrollo
- [ ] GitHub Actions para CI/CD

---

## ✅ VERIFICACIÓN FINAL

### Antes de entregar:
- [ ] Todos los tests pasan: `npm test` (backend)
- [ ] Todos los tests pasan: `npm test` (frontend)
- [ ] Login funciona con JWT
- [ ] Admin puede gestionar productos
- [ ] Usuario puede crear pedido
- [ ] Usuario puede ver sus pedidos
- [ ] Usuario puede comentar
- [ ] Rutas protegidas funcionan
- [ ] CSS responsive en 3 breakpoints
- [ ] Sin errores en consola
- [ ] Variables de .env configuradas

### Funcionales requeridos (verificación):
- ✅ 3 CRUDs simples: Usuario, Categoría, (Método Pago?)
- ✅ CRUDs dependientes: Producto(Categoría), Pedido(Usuario,MetodoPago), DetallePedido(Pedido,Producto), Comentario(Usuario)
- ✅ Listados con filtro: Productos(categoría), Pedidos(usuario), Pedidos(estado)
- ✅ Detalles: Producto, Pedido
- ✅ Casos de uso:
  1. Realizar pedido (Usuario → Producto → Carrito → Pedido)
  2. Dejar comentario (Usuario → Comentario en Pedido)
  3. Agregar producto (Admin → Producto)

---

## 📞 ASIGNACIÓN POR INTEGRANTE

### Vivas Martin (50026)
- Test Usuario (backend) 
- Validación Usuario mejorada
- Protección rutas Usuario
- CSS header responsive

### Salvia Camila (49373)
- Test Producto (backend)
- Comentario validator (backend)
- AdminDashboard completo
- Tests TarjetaProducto (frontend)

### Marianela Leonardelli (51337)
- Test Comentario (backend)
- Arreglar Login frontend
- MisPedidos y VerPedido
- Comentarios página
- Carrito de compras

### Todos
- Test integración (colaborativo)
- Tests e2e (colaborativo)
- Code review de protecciones (colaborativo)
- Validación CSS responsive (colaborativo)

---

## 📌 NOTAS IMPORTANTES

1. **JWT debe venir del backend** - No comparar passwords en frontend
2. **Todas las rutas sensibles** requieren `verificarToken` como mínimo
3. **Rutas de admin** requieren `soloAdmin`
4. **Tests son obligatorios** - 3 unitarios + 1 integración + 1 e2e
5. **Validar ENTRADA siempre** - Nunca confiar en datos del cliente
6. **Errores amigables** - Mensajes claros al usuario
7. **Mobile-first** - Diseñar para SM primero, luego MD y LG
8. **Componentes reutilizables** - Input/Output properties en componentes

---

*Actualizado: 2026-09-04*
*Estado: En desarrollo*
