# Checklist de entrega — Red de Cafeterías

**Equipo:** Vivas Martin (50026), Salvia Camila (49373), Marianela Leonardelli (51337)
**Plazo de trabajo:** 3 semanas desde el 6 de noviembre de 2026 (fecha estimada de entrega: 27 de noviembre; confirmar fecha oficial).
**Objetivo:** cumplir los requisitos de regularidad y aprobación directa descritos en `requisitos-backend.md`, además del alcance funcional de la propuesta.

## Estado base verificado

- [x] Backend organizado por capas, expone API REST con Express y persiste mediante MikroORM/MySQL.
- [x] Backend compila con `npm run build`.
- [x] Hay login JWT y roles de usuario/administrador; existen controles de autenticación y propiedad en rutas backend.
- [x] Existen CRUD para Usuario, Categoría, Método de Pago y entidades dependientes.
- [x] Existen listados de productos por categoría y pedidos por usuario.
- [ ] La suite de pruebas backend todavía no está configurada: `backend` solo contiene `debug-db.ts` y el script `test` es un placeholder.
- [ ] Las pruebas frontend no compilan por imports desactualizados en specs de Comentarios, Login y MisPedidos.
- [ ] El build frontend falla por exceder el presupuesto de `app.scss`.
- [ ] El panel admin tiene dos rutas `/admin`; la primera solo exige autenticación y puede dejar pasar a un usuario no administrador.
- [ ] La interfaz de comentarios usa datos locales; faltan detalle de producto, detalle de pedido histórico y filtro de pedidos por estado.

## Requisitos de entrega y criterio de aceptación

### Regularidad

- [ ] **Backend JavaScript:** confirmar con la cátedra que TypeScript compilado a JavaScript satisface el requisito; documentar/entregar el JavaScript ejecutado. Si exigen JavaScript fuente, acordar y realizar la conversión.
- [ ] **Framework, API, persistencia y capas:** Express, API REST, MySQL externo mediante MikroORM y separación por capas; documentar cómo se configura y ejecuta.
- [ ] **Validación y errores:** entradas inválidas y recursos inexistentes producen respuestas/códigos apropiados; respuestas de producción no exponen errores internos.
- [ ] **Dependencias y ambiente:** dependencias de ejecución/desarrollo/prueba registradas en `package.json`; documentar variables `.env` necesarias sin incluir secretos.
- [ ] **CRUD simple:** verificar CRUD funcional de al menos tres clases simples para los tres integrantes (Usuario, Categoría y Método de Pago).
- [ ] **CRUD dependiente:** verificar al menos dos CRUDs con relaciones persistidas; objetivo del proyecto: Producto–Categoría, Pedido–Usuario/Método de Pago, DetallePedido–Pedido/Producto y Comentario–Usuario.
- [ ] **Listados filtrables:** verificar al menos dos listados con filtro. Ya existen productos por categoría y pedidos por usuario; completar además el filtro de pedidos por estado indicado en la propuesta (API y vista según corresponda).
- [ ] **Detalle desde el listado:** desde productos, abrir detalle con descripción y categoría; desde pedidos, abrir detalle con dirección y nombre del cliente. Mantener autorización de propietario/admin en pedidos.
- [ ] **Caso de uso de negocio:** completar el flujo de realizar un pedido.

### Aprobación directa

- [ ] Implementar y ejecutar **un test automatizado backend por integrante**: Usuario, Producto y Comentario.
- [ ] Implementar y ejecutar **un test de integración** que recorra creación de pedido y verifique detalles y total calculado por backend.
- [ ] Demostrar login propio con JWT y al menos dos niveles de acceso.
- [ ] Verificar permisos de todas las rutas sensibles con casos anónimo, usuario y administrador.
- [ ] Definir y documentar el ambiente de ejecución mediante `.env` y configuración del proyecto.
- [ ] Completar tres casos de uso con valor de negocio: realizar pedido, dejar reseña asociada a un pedido y agregar producto al catálogo. Mantener relacionados los casos de pedido y reseña según el alcance funcional.

## Semana 1 — 6 al 12 de noviembre

### Vivas Martin (50026)

- [ ] Configurar Vitest y scripts de test del backend (`backend/package.json`); establecer aislamiento seguro para pruebas (base de test o mocks, nunca la base productiva).
- [ ] Implementar el test automatizado de Usuario: alta válida, consulta, validación de datos y email duplicado.
- [ ] Revisar validación de pedidos: rechazar cantidades decimales, no numéricas, cero y negativas.
- [ ] Preparar el test de integración de Pedido con datos aislados; verificar que el total se calcula con precios de BD y que una entrada inválida no crea el pedido.

### Salvia Camila (49373)

- [ hecho ] Corregir `frontend/src/app/app.routes.ts`: dejar una sola ruta `/admin` protegida por `adminGuard`; confirmar comportamiento para anónimo, usuario y administrador.
- [ hecho ] Implementar el test automatizado backend de Producto: categoría existente, categoría inexistente, precio inválido y filtro por categoría.
- [ ] Añadir cobertura de regresión para la autorización de DetallePedido recientemente revisada: GET de detalle y POST asociado a pedido propio/ajeno, incluyendo administrador. Aprovechar el setup de Vitest de Martin.
- [ ] Corregir los imports/configuración de pruebas frontend de Comentarios, Login y MisPedidos para que la suite compile.

### Marianela Leonardelli (51337)

- [ ] Implementar el test automatizado backend de Comentario: creación válida, puntuación fuera de rango y asociación a usuario.
- [ ] Auditar el login frontend contra el endpoint JWT existente: persistencia del token, interceptor, logout y manejo de credenciales inválidas.
- [ ] Definir los estados de carga, error y vacío que necesita la conexión de Comentarios con el backend.

### Trabajo conjunto

- [ ] Acordar cómo se ejecutan tests y builds desde una instalación limpia, y anotar dependencias/variables requeridas.
- [ ] Ejecutar y registrar el resultado de los tres tests backend; resolver fallos antes de iniciar la integración.

## Semana 2 — 13 al 19 de noviembre

### Vivas Martin (50026)

- [ ] Completar el test de integración de Pedido; incluir usuario autenticado, método de pago, producto(s), detalles y total calculado.
- [ ] Verificar controles backend de autenticación, roles y propiedad en rutas de Usuario, Pedido, Comentario y DetallePedido; corregir cualquier brecha encontrada.
- [ ] Implementar el filtro de pedidos por estado en el listado/API y comprobar que conserva los permisos de acceso.
- [ ] Asociar comentarios a pedidos según la propuesta y validar que solo el propietario del pedido pueda dejar una reseña; cubrir la relación con pruebas.
- [ ] Separar el arranque de producción de `syncSchema()` y del debug de ORM; documentar migración/sincronización para desarrollo sin ejecutar cambios de esquema automáticamente en producción.

### Salvia Camila (49373)

- [ ] Completar una página/ruta de detalle de Producto desde el catálogo con descripción, precio, categoría y acción para agregar al carrito.
- [ ] Resolver el presupuesto excedido de `frontend/src/app/app.scss` mediante organización de estilos; no limitarse a elevar el presupuesto. Volver a ejecutar `npm run build`.
- [ ] Comprobar que los guards frontend solo mejoran la navegación: las operaciones administrativas deben seguir rechazándose también en backend.

### Marianela Leonardelli (51337)

- [ ] Conectar la página de Comentarios con la API: listar comentarios persistidos y crear mediante endpoint autenticado. El servidor debe decidir el usuario; quitar dependencia de reseñas de ejemplo como fuente principal.
- [ ] Enviar y mostrar la asociación entre reseña y pedido; manejar estados de carga, error y vacío.
- [ ] Completar MisPedidos: quitar el ID de usuario de respaldo `|| 1`, manejar ausencia de sesión y agregar filtro por estado.
- [ ] Agregar navegación desde el listado a un detalle de pedido histórico con fecha, estado, dirección, cliente, productos y total.
- [ ] Verificar flujo de carrito y pedido con JWT; mostrar errores y limpiar el carrito solo después de una creación exitosa.

### Trabajo conjunto

- [ ] Ejecutar pruebas de API para permisos: token ausente, usuario propietario, usuario ajeno y administrador.
- [ ] Revisar respuestas de validación y errores del backend; evitar exponer `error.message`/detalles internos en producción.
- [ ] Hacer revisión cruzada de los tres tests individuales y el test de integración.

## Semana 3 — 20 al 27 de noviembre

### Vivas Martin (50026)

- [ ] Ejecutar la suite backend desde una instalación limpia y corregir cualquier fallo reproducible.
- [ ] Confirmar que dependencias de runtime, desarrollo y test están declaradas y que las instrucciones de configuración de `.env` son completas, sin valores secretos.
- [ ] Resolver el fallback de login con contraseñas en texto plano mediante una migración segura antes de eliminarlo, o documentar una decisión de transición aprobada.
- [ ] Participar en la prueba final de permisos y flujo pedido → reseña.

### Salvia Camila (49373)

- [ ] Verificar que build y pruebas frontend pasan; comprobar guards de admin y regresiones de propiedad de DetallePedido.
- [ ] Completar/verificar las pruebas de comportamiento de TarjetaProducto y el flujo de detalle de producto → carrito.
- [ ] Revisar estilos responsive en 320 px, 768 px y 1024 px; corregir defectos visibles en las pantallas modificadas.

### Marianela Leonardelli (51337)

- [ ] Verificar comentarios persistidos y restringidos a usuarios autenticados.
- [ ] Verificar filtro, navegación y detalle de pedidos; confirmar que un usuario no puede consultar pedidos ajenos.
- [ ] Revisar login, cierre de sesión y carrito/checkout con manejo de errores.

### Trabajo conjunto — aceptación final

- [ ] Ejecutar `npm run build` en backend y frontend, `npm test` en ambos proyectos y el test de integración; guardar resultados.
- [ ] Demostrar en vivo login JWT con usuario y admin, acceso permitido/denegado a rutas protegidas y CRUD administrativo.
- [ ] Demostrar CRUDs requeridos y relaciones dependientes con persistencia real.
- [ ] Demostrar listados filtrados por categoría y estado, detalle de producto y detalle de pedido.
- [ ] Demostrar tres casos de uso: realizar pedido, dejar reseña asociada a ese pedido y agregar producto al catálogo.
- [ ] Revisar consola, errores HTTP, configuración de ambiente y responsive antes de entregar.

## Fuera del alcance obligatorio (solo si terminan los requisitos)

- [ ] E2E automatizado de frontend (no reemplaza el test de integración backend requerido).
- [ ] Reportes, gráficos, roles adicionales, tema oscuro, notificaciones, Docker y CI/CD.
- [ ] Seed de datos de desarrollo, siempre que no borre ni altere datos de producción.

## Referencias

- Requisitos obligatorios y funcionales: `requisitos-backend.md`.
- Estado de implementación y brechas verificadas: `ANALISIS_FALTANTE.md`.
- Propuesta funcional del grupo: `Propsal DSW.md`.

---

_Checklist reorganizado el 6 de noviembre de 2026. Marcar una tarea como completa solo después de implementar y verificar el criterio indicado._
