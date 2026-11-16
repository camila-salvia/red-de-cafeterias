# Estado actual del proyecto — Red de Cafeterías

**Revisión:** 16 de noviembre de 2026
**Base:** revisión del código y ejecución de tests/builds locales. No se verificó un despliegue ni flujos contra una base de datos en vivo.

## Resumen

El proyecto tiene un backend Express + MikroORM + MySQL y un frontend Angular funcional para los flujos principales. Hay autenticación JWT, controles de acceso en las rutas sensibles, catálogo, administración de productos, carrito/checkout, historial de pedidos y reseñas conectadas a la API.

Las reseñas son independientes de los pedidos: cualquier usuario autenticado puede publicar una, haya comprado o no mediante la aplicación. El backend asigna el usuario desde el token.

## Arquitectura

```text
FRONTEND (Angular)                         BACKEND (Express + MikroORM)
├─ Inicio / catálogo                       ├─ /api/usuario
├─ Login JWT                                ├─ /api/categoria
├─ Carrito y checkout                       ├─ /api/producto
├─ Admin: productos y categorías            ├─ /api/pedido
├─ Mis pedidos: listado y filtro por estado ├─ /api/detalle-pedido
├─ Comentarios: listado y publicación       ├─ /api/comentario
└─ Guards + interceptor JWT                 └─ /api/metodo-pago
          │                                            │
          └── HTTP / Authorization: Bearer JWT ────────┘
                                                       │
                                                MySQL / MikroORM
```

### Frontend

- Rutas `/pedidos`, `/ver-pedido` y `/mis-pedidos` requieren sesión; `/admin` usa `adminGuard`.
- `/comentarios` permite lectura pública y publicación desde una sesión autenticada.
- `AuthService` mantiene el token JWT; el interceptor lo agrega a las llamadas a la API.
- El panel Admin gestiona productos y permite crear/eliminar categorías.
- `MisPedidos` carga los pedidos del usuario autenticado y filtra por estado.
- `ver-pedido` cubre carrito, checkout y confirmación; todavía no es el detalle histórico de un pedido.

### Backend y datos

Entidades principales: Usuario, Categoría, Producto, Pedido, DetallePedido, Comentario y Método de Pago.

Relaciones implementadas: Producto–Categoría, Pedido–Usuario/Método de Pago, DetallePedido–Pedido/Producto y Comentario–Usuario. **No existe ni se requiere una relación Comentario–Pedido.**

## Rutas y autorización

| API | Lectura | Escritura |
|---|---|---|
| `/api/usuario` | Listado: admin; consulta por ID: propietario o admin | Registro público; modificación y baja: propietario o admin |
| `/api/categoria` | Pública | Admin |
| `/api/producto` | Listado y detalle públicos; listado administrativo: admin | Admin |
| `/api/pedido` | Listado general: admin; por ID o usuario: propietario o admin | Creación autenticada; actualización y baja: admin |
| `/api/detalle-pedido` | Listado: admin; detalle por ID: propietario del pedido o admin | Creación autenticada y limitada a un pedido propio; modificación y baja: admin |
| `/api/comentario` | Pública | Creación autenticada; moderación/edición y baja: admin |
| `/api/metodo-pago` | Pública | Admin |

El servidor es la autoridad para los permisos. Los guards del frontend solo controlan la navegación. En la creación de pedidos, el usuario se obtiene del token y los precios se calculan con datos del backend. En comentarios, el usuario también se asigna desde el token; no se exige haber realizado un pedido.

## Estado funcional

| Área | Estado |
|---|---|
| Login y sesión JWT | Implementado; token persistido y enviado mediante interceptor |
| Catálogo y filtro por categoría | Implementado |
| Detalle de producto | El endpoint backend existe; falta una vista/ruta frontend |
| Administración | Panel protegido; CRUD de productos y creación/baja de categorías |
| Carrito y checkout | Implementado; el backend crea el pedido y calcula su total |
| Mis pedidos | Listado propio y filtro por estado implementados |
| Filtro de pedidos por estado en API | Pendiente; el filtro disponible es del lado frontend |
| Detalle histórico de pedido | Pendiente; `/ver-pedido` es checkout/confirmación, no detalle histórico |
| Reseñas | Listado persistido público y publicación autenticada implementados; independientes de los pedidos |
| Casos de uso reseña/pedido | Son independientes; no se exige relación entre reseña y compra web |

## Validadores

Los validadores existen para Usuario, Categoría, Producto, Pedido, DetallePedido, Comentario y Método de Pago. La cobertura de reglas y permisos todavía debe completarse con pruebas de usuario, pedido e integración.

## Pruebas y builds verificados

| Comando | Resultado |
|---|---|
| `cd frontend; npm test -- --watch=false` | Correcto: 15 archivos, 19 pruebas |
| `cd backend; npm test -- --run` | Correcto: 2 archivos, 68 pruebas |
| `cd backend; npm run build` | Correcto |
| `cd frontend; npm run build` | Correcto con advertencias de presupuesto: bundle inicial 572.14 kB frente a 500 kB; `ver-pedido.scss` 4.10 kB frente a 4 kB |

No hay pruebas de usuario ni de integración de creación de pedidos; tampoco se encontró una suite e2e.

## Pendientes prioritarios

1. Añadir tests backend de Usuario y de integración de Pedido, incluyendo total calculado y entradas inválidas.
2. Completar pruebas de autorización para rutas sensibles con casos anónimo, propietario, usuario ajeno y admin.
3. Implementar la vista/ruta de detalle de producto y el detalle histórico del pedido.
4. Evaluar si el filtro por estado debe ofrecerse también desde la API.
5. Reducir los presupuestos excedidos del bundle inicial y de `ver-pedido.scss`; el build pasa, pero mantiene advertencias.
6. Preparar producción: evitar `syncSchema()` automático al iniciar, desactivar `debug` de MikroORM y evitar respuestas que expongan detalles internos.
7. Completar la prueba manual del flujo de reseñas: lectura pública y publicación autenticada sin requisito de pedido.

## Configuración y ejecución

- Frontend: `cd frontend; npm start` (Angular en el puerto 4200).
- Backend: `cd backend; npm run start:dev` (API en el puerto 3000, prefijo `/api`).
- Backend requiere variables de entorno para MySQL y JWT. Consultar `README.md`.
- La aplicación llama a `syncSchema()` al iniciar; no usar ese mecanismo en producción.

---

_Estado actualizado el 16 de noviembre de 2026. Volver a verificar los pendientes antes de marcarlos como completados._
