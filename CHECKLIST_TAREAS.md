# Checklist unificado de tareas pendientes — Red de Cafeterías

**Equipo:** Vivas Martin (50026), Salvia Camila (49373), Marianela Leonardelli (51337)  
**Fecha de revisión:** 24 de noviembre de 2026  
**Objetivo:** cierre verificable de los requisitos del backend, frontend y entrega académica.

Esta lista reúne el contenido pendiente de `ANALISIS_FALTANTE.md`, los requisitos backend/frontend y el estado actual del código. Las tareas marcadas como completadas han sido verificadas en el proyecto.

## Estado verificado el 24/11/2026

- [x] Backend: `npm run build` finaliza correctamente.
- [x] Backend: `npm test -- --run` finaliza con 5 archivos aprobados y 145 pruebas aprobadas (1 prueba marcada como to-do).
- [x] Backend: existen tests individuales de Usuario, Producto y Comentario.
- [x] Backend: existe el test de integración de Pedido y forma parte de la suite aprobada.
- [x] Frontend: `npm run build` finaliza correctamente.
- [ ] Frontend: `npm test -- --watch=false` no finaliza correctamente: 17 archivos pasan, 2 archivos fallan y 4 pruebas fallan por `localStorage` inexistente o no disponible.
- [ ] Frontend: el build conserva advertencias de presupuesto: bundle inicial 600.46 kB sobre el máximo de 500 kB y `ver-pedido.scss` 4.25 kB sobre el máximo de 4 kB.
- [ ] Faltan evidencias verificadas de la prueba final desplegada, el video y la documentación pública de entrega.

## Backend — requisitos y cierre funcional

- [ ] Resolver o documentar formalmente el fallback de contraseñas en texto plano de login. Como alternativa segura: migrar las contraseñas existentes y eliminar el comparador temporal.
- [ ] Uniformar las respuestas de error del backend para evitar que producción exponga `error.message`, `detalle` o información interna de validaciones, MikroORM o dependencias.
- [ ] Revisar y cubrir con pruebas adicionales las rutas sensibles con token ausente, usuario propietario, usuario ajeno y administrador.
- [ ] Confirmar y conservar una prueba de regresión para DetallePedido: GET y POST de usuario propietario, usuario ajeno y administrador.
- [ ] Registrar el resultado final de las pruebas de permisos sobre Usuario, Pedido, Comentario y DetallePedido.
- [ ] Documentar el procedimiento completo para instalar y levantar el backend desde una instalación limpia.
- [ ] Confirmar que `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET` y `NODE_ENV` estén documentados sin secretos reales.
- [ ] Confirmar que las dependencias de ejecución, desarrollo y test estén declaradas y sean reproducibles con una instalación limpia.
- [ ] Completar la documentación de seed: indicar cómo cargar categorías, métodos de pago y usuarios iniciales sin afectar datos productivos.
- [ ] Preparar y guardar evidencias de `npm run build` y `npm test -- --run` para la defensa.

### CRUD, filtros y casos de uso

- [x] Backend: CRUD de Usuario, Categoría, Método de Pago, Producto, Pedido, DetallePedido y Comentario.
- [x] Backend: cálculo del total de Pedido con precios vigentes de la base de datos.
- [x] Backend: filtro de pedidos por estado con permisos conservados.
- [x] Backend: reseñas independientes de pedidos; el usuario se obtiene del JWT.
- [ ] Verificar con persistencia real el CRUD administrativo de Categoría, Producto y Método de Pago.
- [ ] Verificar con persistencia real las relaciones Producto–Categoría, Pedido–Usuario/Método de Pago, DetallePedido–Pedido/Producto y Comentario–Usuario.
- [ ] Demostrar desde el listado el detalle de producto y desde el listado el detalle de pedido con sus datos requeridos.
- [ ] Ejecutar una revisión cruzada de los tests individuales y el test de integración antes de la entrega.

## Frontend — integración y navegación

- [ ] Implementar una ruta y página de detalle de Producto desde el catálogo, con nombre, descripción, precio, categoría e acción para agregar al carrito.
- [ ] Conectar completamente la tarjeta/listado de productos con ese detalle y preservar el filtrado por categoría.
- [ ] Verificar visualmente el comportamiento mobile-first en 320 px, 768 px y 1024 px.
- [ ] Revisar el uso de HTML5 semántico y mantener una estructura Bootstrap/SCSS coherente en las páginas modificadas.
- [ ] Completar estados claros de carga, vacío, éxito y error en los flujos de catálogo, comentarios, pedidos, login y checkout.
- [ ] Revisar validaciones de formularios, navegación y feedback accesible de las acciones del usuario.
- [ ] Comprobar que los componentes reutilizables usan inputs/outputs correctamente y reemplazar errores o comportamientos inconsistentes.
- [ ] Implementar en pruebas los casos de TarjetaProducto y el flujo completo detalle de producto → carrito.
- [ ] Reemplazar los tipos `any` innecesarios de servicios y páginas por interfaces/modelos sincronizados con las respuestas reales de la API.
- [ ] Configurar explícitamente el puerto y la URL de API para desarrollo y producción. Actualmente el entorno de desarrollo usa `http://localhost:3000/api` y el de producción una URL externa que no corresponde a un deploy real.
- [ ] Revisar el manejo de sesión vencida, errores de red, errores HTTP y respuestas inválidas del backend, coordinando los mensajes visibles.
- [ ] Verificar los guards frontend como mejora de navegación, sin depender de ellos para la seguridad administrativa o de propiedad.
- [ ] Confirmar el comportamiento de `/admin` para anónimo, usuario autenticado y administrador.
- [ ] Confirmar la autorización de DetallePedido para propietario, usuario ajeno y administrador.
- [ ] Verificar comentarios persistidos, publicación solo con sesión y mensaje amigable ante fallos.
- [ ] Verificar filtro y navegación de pedidos y impedir desde el frontend la consulta visual de pedidos ajenos.
- [ ] Revisar login, cierre de sesión, carrito y checkout con token, errores de sesión y limpieza del carrito solo ante pedido exitoso.

## Pruebas frontend

- [ ] Corregir la disponibilidad de `localStorage` en el entorno Vitest/Angular. Los tests de AuthService y Inicio fallan actualmente en `src/app/services/auth.spec.ts` y `src/app/pages/inicio/inicio.spec.ts`.
- [ ] Ejecutar nuevamente `npm test -- --watch=false` hasta obtener 0 pruebas fallidas.
- [ ] Guardar evidencia de la suite frontend aprobada.
- [ ] Añadir al menos un test end-to-end de un flujo principal que incluya autenticación y acceso protegido.
- [ ] Incluir en el E2E al menos un recorrido completo de catálogo, login, carrito y creación de pedido.
- [ ] Ejecutar el E2E sobre la aplicación desplegada o, como mínimo, sobre una aplicación levantada con backend y datos aislados.
- [ ] Guardar evidencia del test E2E y documentar cómo reproducirlo.

## Build y optimización

- [ ] Reducir el bundle inicial por debajo del máximo warning de 500 kB, sin elevar simplemente el presupuesto.
- [ ] Reducir `ver-pedido.scss` por debajo del máximo warning de 4 kB.
- [ ] Revisar si los estilos globales pueden separarse o cargarse de forma diferida y eliminar CSS duplicado o sin uso.
- [ ] Ejecutar nuevamente `npm run build` y exigir build limpio o con advertencias aceptadas y documentadas.
- [ ] Revisar el tamaño de imágenes y recursos de `public/` y `assets/`.

## API, documentación y entrega

- [ ] Crear o completar la documentación de la API backend y enlazarla desde el README o desde un documento de referencia accesible.
- [ ] Completar las URLs públicas de frontend, backend/API y base de datos en el README.
- [ ] Completar las instrucciones de seeds, puertos y configuración de API de desarrollo local.
- [ ] Completar las credenciales reales y seguras de prueba para el demo/deploy.
- [ ] Actualizar la propuesta con links a los pull requests de frontend y backend.
- [ ] Preparar y enlazar el video explicativo del sistema.
- [ ] Completar los datos de contacto para coordinar la defensa.
- [ ] Probar la aplicación desplegada con credenciales reales y confirmar que frontend y backend se comunican.
- [ ] Registrar la URL final de despliegue y el estado del servicio antes de la entrega.

## Cierre funcional y demostración final

- [ ] Ejecutar en conjunto `npm run build` y `npm test` en backend y frontend.
- [ ] Ejecutar el test de integración de Pedido y guardar el resultado.
- [ ] Demostrar login JWT con usuario y administrador y acceso permitido/denegado a rutas protegidas.
- [ ] Demostrar CRUDs administrativos y persistencia real de las relaciones dependientes.
- [ ] Demostrar filtros por categoría y estado y navegación a detalle de producto y detalle de pedido.
- [ ] Demostrar realizar pedido, dejar una reseña sin haber comprado mediante la aplicación y agregar un producto al catálogo.
- [ ] Revisar consola, respuestas HTTP, `.env`, instalación limpia, responsive y estilos antes de entregar.

## Trabajo opcional, solo después del cierre obligatorio

- [ ] Reportes o gráficos.
- [ ] Roles adicionales.
- [ ] Tema oscuro.
- [ ] Notificaciones.
- [ ] Docker y CI/CD.
- [ ] Seed adicional que nunca altere ni borre datos de producción.
