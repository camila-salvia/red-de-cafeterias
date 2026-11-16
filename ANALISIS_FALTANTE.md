# Análisis del proyecto — estado actual, avances y pendientes

**Revisión:** 16 de noviembre de 2026
**Proyecto:** Red de Cafeterías
**Repositorio:** `camila-salvia/red-de-cafeterias`
**Alcance:** backend (`backend/`), frontend (`frontend/`), documentación de entrega y validaciones reportadas en el repositorio.

## Resumen ejecutivo

El proyecto ya tiene una base funcional sólida y una estructura de monorepo consistente: backend con Express + MikroORM + MySQL y frontend con Angular. El trabajo realizado incluye entidades principales, autenticación JWT, permisos de acceso, CRUDs clave, catálogo de productos, flujo de pedidos e integración de lectura y creación de comentarios con la API. Además, la documentación del repositorio refleja que varias tareas de testing y correcciones ya fueron completadas o parcialmente cerradas.

Sin embargo, aún quedan tareas de cierre y de robustez antes de considerar la entrega final como estable: cerrar detalles de flujo y navegación, revisar algunos ajustes de producción, y verificar que la configuración de build y la suite de tests se mantengan estables en una instalación limpia.

## Qué está hecho

### 1) Backend funcional y estructurado

La base del backend ya está implementada:

- API REST en Express.
- Persistencia con MikroORM y MySQL.
- Separación por capas y entidades principales.
- CRUD de Usuario, Categoría, Producto, Pedido, DetallePedido, Comentario y Método de Pago.
- Validación de entradas y gestión de relaciones entre entidades.
- Control de autenticación por JWT.
- Control de autorización por rol y por propiedad en rutas sensibles.
- Cálculo del total del pedido con precios vigentes.
- Consulta de pedidos por usuario y validación de propietario/admin.

### 2) Frontend funcional para flujo principal

El frontend ya cubre la mayor parte del uso principal de la aplicación:

- Login con token JWT.
- Interceptor que agrega el token a las solicitudes autenticadas.
- Catálogo de productos y filtros por categoría.
- Carrito y checkout.
- CRUD de productos en el panel administrativo.
- Listado de “Mis pedidos” y manejo de sesión.
- Rutas principales para navegación del cliente y administración.

### 3) Autorización y roles

Se documenta que ya hubo trabajo de corrección sobre permisos:

- El panel de administración fue ajustado para tener una única ruta `/admin` protegida por `adminGuard`.
- El backend mantiene controles de acceso por rol y por propiedad en endpoints clave.
- La documentación del proyecto marca la verificación de permisos como tarea de cierre, pero deja claro que la capa backend sigue siendo la autoridad final.

### 4) Testing y validación

La documentación del proyecto indica que se avanzó bastante en esta área:

- Backend con suite de tests configurada y ejecutándose.
- Tests de Producto y Comentario documentados como funcionando.
- Tests frontend compilando y pasando: 15 archivos y 19 pruebas, verificado el 16/11/2026.
- Tests backend compilando y pasando: 2 archivos y 68 pruebas, verificado el 16/11/2026.
- Build backend correcto.

El estado oficial del repositorio refleja que, para esta etapa, al menos parte de la validación ya fue realizada y verificada por la propia documentacion del equipo.

### Alcance de las reseñas

Las reseñas son independientes de los pedidos. Cualquier usuario autenticado puede publicar una, haya comprado o no mediante la aplicación. La página ya consulta y publica reseñas persistidas por API; el backend toma el usuario del token. No se requiere ni debe agregarse una relación Comentario–Pedido.

## Qué todavía falta o está pendiente

### P0 / críticas de entrega

#### 1) Validar y cerrar detalles del flujo de pedidos

Entre los pendientes documentados aparecen:

- Filtro de pedidos por estado.
- Navegación desde el listado a detalle de pedido histórico.
- Detalle de producto desde la vista del catálogo.
- Verificación de acceso de propietario/admin en todas las rutas relevantes.

#### 2) Producción y configuración de entorno

Quedan tareas explícitas para afinar la configuración de producción:

- Evitar `syncSchema()` automático al arrancar en producción.
- Desactivar `debug` de ORM en producción.
- Uniformar respuestas de error para no exponer detalles internos.
- Documentar adecuadamente el uso de `.env` y los datos iniciales necesarios.

### P1 / mejoras de estabilidad

#### 3) Revisión de debugging y validación de negocio

Queda pendiente:

- Verificar uso de contraseñas heredadas en texto plano y decidir una migración segura.
- Revisar validación de cantidades enteras en pedidos.
- Asegurar cumplimiento del criterio de aceptación final con pruebas integradas de pedido, comentario y permisos.

#### 4) Build y rendimiento frontend

La documentación del repo indica que el build frontend no queda completamente limpio por exceder presupuestos de bundle y estilos:

- `app.scss` supera el presupuesto.
- `ver-pedido.scss` requiere revisión.
- No basta con subir el presupuesto; se debe optimizar la organización real de estilos y assets.

#### 5) Cobertura de pruebas y regresiones

Si bien hay avances, la checklist del equipo deja explícito que aún faltan pruebas de integración y validaciones críticas:

- Test de integración de pedido.
- Pruebas de permisos anónimo/usuario/admin.
- Validación de propiedad en detalle de pedido.
- Validación final de permisos de publicación de reseñas autenticadas.

## Estado verificado documentado por el equipo

### Completado según la checklist interna

- Backend organizado por capas y compilando.
- Autenticación JWT y roles implementados.
- CRUD principal del sistema funcional.
- Productos por categoría y pedidos por usuario funcionando.
- Panel admin con una única ruta `/admin` protegida por guard.
- Suite frontend compilando y pasando.
- Suite backend de tests con casos importantes ejecutados.
- Ajuste de `MisPedidos` para manejar la sesión sin fallback fijo de usuario.

### Pendiente por verificar o cerrar

- Filtro de pedidos por estado y detalle de pedido.
- Detalle de producto completo.
- Configuración de producción segura.
- Optimización de estilos + build final limpio.
- Pruebas de integración y de permisos final.

## Archivos clave del proyecto

- `README.md` — descripción general, stack, ejecución local y alcance funcional.
- `CHECKLIST_TAREAS.md` — seguimiento de tareas, avances y pendientes por semana.
- `DIAGRAMA_ESTADO.md` — mapa de módulos, permisos y estado general del proyecto.
- `INDICE.md` — índice de estructura de archivos y módulos.
- `backend/` — API, entidades, validadores, rutas, controladores y pruebas.
- `frontend/` — aplicación Angular, rutas, componentes, servicios y guards.

## Decisiones técnicas relevantes

1. El backend es la capa autorizante definitiva; el guard frontend mejora navegación, pero no reemplaza validación del servidor.
2. El proyecto usa autenticación por JWT y sesiones persistidas en el almacenamiento local del frontend.
3. La documentación reconoce que la corrección de producción es tan importante como la funcionalidad: no basta con que el sistema “funcione” en desarrollo.
4. El alcance del entregable final no es solo “hacer que compile”, sino dejar la app validada con permisos, pruebas y flujo de negocio.

## Plan recomendado para continuar

1. Verificar los flujos independientes de pedido y reseña, incluida la publicación autenticada de reseñas sin exigir una compra web.
2. Completar detalle de pedido y detalle de producto.
3. Revisar filtros y permisos del flujo de pedidos.
4. Resolver la optimización de estilos y build frontend.
5. Dejar producción segura: `syncSchema`, debug y manejo de errores.
6. Ejecutar validación final con pruebas de backend/frontend, integración y permisos reales.
