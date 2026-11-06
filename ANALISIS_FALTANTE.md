# Análisis del estado actual y plan de acción

**Revisión:** 6 de noviembre de 2026
**Alcance:** código fuente de `backend/` y `frontend/`, configuración y pruebas existentes. No se verificaron flujos contra una base de datos o un servidor en ejecución.

## Resumen ejecutivo

El documento anterior describía como pendientes varias funciones que ya están implementadas. El backend cuenta con CRUDs, validadores y controles de autenticación y propiedad para las rutas principales; el frontend permite gestionar productos, operar un carrito y consultar un listado básico de pedidos. Sin embargo, quedan defectos de autorización en la navegación del panel, integración incompleta de comentarios, vistas de detalle/filtros que faltan, cobertura automatizada insuficiente y dos fallos reproducibles de validación local (pruebas y build frontend).

## Estado comprobado

### Implementado

- **Backend:** módulos de usuarios, categorías, productos, pedidos, detalles, comentarios y métodos de pago; validación de entradas y relaciones.
- **Autorización backend:** las escrituras del catálogo y los métodos de pago requieren administrador; las operaciones de pedidos y usuarios restringen acceso según rol/propiedad. El detalle de pedido verifica propiedad también en GET y al asociarlo a un pedido en POST.
- **Pedidos:** el usuario se toma del token al crear el pedido; el servidor obtiene precios vigentes y calcula el total. La consulta por usuario y por ID comprueba propietario/admin.
- **Usuarios:** altas y cambios de contraseña usan bcrypt; el campo `password` está marcado como oculto en la entidad.
- **Frontend:** autenticación JWT, catálogo, carrito/checkout, CRUD de productos en el panel y listado básico de “Mis pedidos”.
- **Build backend:** `cd backend; npm run build` finaliza correctamente.

### Pendientes confirmados (priorizados)

#### P0 — Corregir acceso al panel de administración

`frontend/src/app/app.routes.ts` declara dos rutas `admin`. La primera usa solamente `authGuard` y aparece antes de la ruta con `adminGuard`; por tanto, un usuario autenticado no administrador puede entrar a la vista del panel. Los endpoints de escritura siguen protegidos por el backend, pero la interfaz administrativa no queda restringida correctamente.

**Acción:** dejar una única ruta `/admin` con el guard de administrador (y conservar la redirección/experiencia adecuada para usuarios no autorizados). Probar usuario anónimo, usuario normal y administrador. El control frontend no sustituye al backend.

#### P0 — Restablecer una suite de pruebas ejecutable

- `backend/package.json` conserva un script `test` que siempre falla con “no test specified”; en `backend/src/tests/` solo existe `debug-db.ts`, no una suite automatizada.
- Hay especificaciones frontend, pero `cd frontend; npm test -- --watch=false` falla al compilar: `comentarios.spec.ts`, `login.spec.ts` y `mis-pedidos.spec.ts` importan `Comentarios`, `Login` y `MisPedidos`, símbolos que no exportan sus módulos actuales.
- Los specs existentes se limitan mayormente a comprobar que el componente se crea; no cubren comportamiento sustancial. No se encontró una suite e2e.

**Acción:** corregir imports/configuración de pruebas frontend y añadir pruebas de comportamiento; configurar pruebas backend para validadores, autorización y cálculos de pedidos; agregar un flujo de integración pedido y e2e si forma parte de los requisitos de entrega.

#### P1 — Conectar comentarios con la API

`frontend/src/app/pages/comentarios/comentarios.ts` usa reseñas locales de ejemplo, agrega comentarios solo en memoria y simula moderación en el cliente. No carga ni persiste los comentarios con la API. El backend sí expone lectura y creación autenticada, y asigna el usuario desde el token.

**Acción:** cargar comentarios reales, integrar creación mediante el servicio API y presentar errores/estados de carga. Mantener la asignación del usuario exclusivamente en el servidor.

#### P1 — Completar navegación y vistas de detalle

- El listado de `MisPedidos` muestra fecha, estado, productos y total, pero no ofrece filtro por estado ni navegación a un detalle individual.
- `ver-pedido` es la vista de carrito/checkout y confirmación; no es una página de detalle de un pedido histórico identificado por ID.
- Existe GET de producto por ID en el backend, pero no se encontró ruta/página frontend de detalle de producto.

**Acción:** agregar filtro de pedidos y una ruta de detalle con carga por ID (protegida por la validación de propietario/admin existente); crear vista/ruta de producto si sigue siendo requisito funcional.

#### P1 — Validar cantidades como enteros en pedidos

`pedido.validator.ts` y `pedido.controller.ts` rechazan cantidades no numéricas o menores/iguales a cero, pero no aplican `Number.isInteger`. Así, cantidades decimales pueden superar la validación pese a que el mensaje exige enteros.

**Acción:** validar que cada cantidad sea un entero positivo y cubrir límites y valores inválidos con pruebas.

#### P1 — Retirar compatibilidad con contraseñas en texto plano

El login de `usuario.controller.ts` todavía compara contraseñas en texto plano para cuentas antiguas y las convierte a bcrypt tras un acceso exitoso. Las altas y cambios nuevos sí hashean las contraseñas.

**Acción:** definir y ejecutar una migración controlada de cuentas antiguas; luego eliminar la comparación en texto plano y probar el flujo de login y migración.

#### P1 — Corregir la carga de “Mis pedidos” sin ID de usuario

`mis-pedidos.ts` usa `localStorage.getItem('usuario_id') || 1`. El valor de respaldo puede provocar una consulta para un usuario incorrecto y un `403`; no representa la sesión real.

**Acción:** obtener el ID del usuario autenticado y manejar explícitamente su ausencia, sin un ID por defecto.

#### P2 — Hacer que el build frontend vuelva a pasar

`cd frontend; npm run build` falla porque el presupuesto de `frontend/src/app/app.scss` es 8 kB y el archivo alcanza aproximadamente 227 kB. También se reportan advertencias por el bundle inicial (637 kB frente a 500 kB) y por `ver-pedido.scss`.

**Acción:** revisar estilos globales, separar estilos/componentes cuando corresponda y ajustar el tamaño real sin elevar presupuestos como sustituto de optimización. Repetir build y verificar los presupuestos.

#### P2 — Preparar configuración de backend para producción

`backend/src/app.ts` ejecuta `syncSchema()` al iniciar, aunque el propio código advierte que no debe hacerse en producción; `orm.ts` también habilita `debug: true`. Además, varios errores 500 responden con `error.message`/`detalle`, mientras otros devuelven mensajes genéricos.

**Acción:** desactivar sincronización automática del esquema y debug en producción, usar migraciones controladas y uniformar respuestas de error para no exponer detalles internos.

## Plan de acción sugerido

1. **Cerrar el acceso al panel** y verificar los tres perfiles (anónimo, usuario, administrador).
2. **Recuperar pruebas ejecutables:** corregir los tres imports frontend; agregar cobertura de autorización, cantidades, precios/totales y propietario en backend.
3. **Completar los flujos funcionales:** integrar comentarios con API; añadir filtro y detalle de pedidos; añadir detalle de producto si está en el alcance.
4. **Resolver los defectos restantes:** eliminar el ID de respaldo de pedidos y planificar la migración de contraseñas heredadas.
5. **Asegurar la entrega:** conseguir build frontend limpio y separar sincronización del esquema/configuración debug del arranque de producción.
6. **Validación final:** ejecutar builds de backend y frontend, suite frontend/backend y pruebas de integración; comprobar manualmente los permisos y flujos completos.

## Verificaciones ejecutadas en esta revisión

| Comando | Resultado |
|---|---|
| `cd backend; npm run build` | Correcto |
| `cd frontend; npm run build` | Falla por presupuesto excedido en `app.scss` |
| `cd frontend; npm test -- --watch=false` | Falla al compilar por imports inexistentes en tres specs |
| Revisión de `backend/src/tests/` | Solo `debug-db.ts`; no hay suite automatizada |
