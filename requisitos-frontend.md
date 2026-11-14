# Frontend:

## Condiciones de regularidad:

- Desarrollarse utilizando un framework de Frontend.
- Utilizar HTML5
- Utilizar CSS según las directrices de alguna biblioteca de componentes, guía de estilo o framework de CSS y la metodología propuesta por el framework de frontend elegido. Se sugiere el uso de biblioteca de componentes; preprocesadores: sass, scss, less, stylus, etc o frameworks de css: Pico.css, Bulma, Material, Tailwind, Bootstrap, etc.
- Guía de estilos sugerida Airbnb Javascript https://github.com/airbnb/javascript
- Aplicar la estrategia mobile-first para la escritura del código css de la aplicación
- La app debe visualizarse correctamente en al menos 3 diferentes breakpoints: SM, MD, LG
- Seguir buenas prácticas de UX/UI (Que no requiera manual de usuario o explicaciones específicas para utilizar la interfaz)
- Las app debe mostrar las siguientes características entre sus componentes:
  - Manejo de eventos del usuario: click, input, etc
  - Ante una posibilidad de fallo, manejar el/los errores adecuadamente y de manera amigable al usuario
  - Reactividad ante un estado
  - Input property
  - Output property
- Implementar al menos un servicio.
- Para el manejo de la información, por ej una respuesta de un endpoint o los datos a enviar en una request, representar en el código los modelos de objetos con clases, interfaces y tipos de datos custom.
- De ser posible, implementar algún patrón de diseño orientado a objetos.
- Las dependencias para ejecución, desarrollo y test deben estar correctamente registradas para ser instaladas automáticamente (e.j. package.json).

## Aprobación Directa o en Examen:

- Cumplir con las condiciones de regularidad.
- Realizar al menos 1 test unitario de un componente.
- Realizar al menos 1 test de end-to-end.
- Implementar el login y proteger el acceso a las distintas partes del frontend en base a los niveles de usuarios del backend.
- Definir ambientes, ya sea mediante environment del framework o .env.

En la entrega se debe enviar:

- Video explicando el funcionamiento del sistema
- Documentación de la API de backend (según la tecnología y standard utilizados).
- Evidencia del resultado de la ejecución de los tests automáticos.
- Entregar la proposal actualizada con links al pull request de back y/o front.
- Incluir en el README.md (o con un link) las instrucciones para instalar y ejecutar el proyecto sin conocimientos de cómo está desarrollado. El proyecto debe poder ejecutarse con scripts y las herramientas según las convenciones del lenguaje y/o framework utilizado (scripts en package.json, o tools específicas del framework).
- Links de Deploy
- Credenciales para utilizar la aplicación deployada
- Contacto para coordinar la defensa

## Checklist de tareas pendientes

Las casillas quedan sin marcar hasta completar y verificar cada tarea. La distribución toma los nombres del README; pueden reasignarse si el equipo lo necesita.

### Integrante 1 — Martin Vivas: interfaz y experiencia de usuario

- [ ] Revisar las pantallas y componentes con enfoque mobile-first y corregir los estilos necesarios.
- [ ] Verificar visualmente los breakpoints SM, MD y LG en las páginas principales y flujos de usuario.
- [ ] Revisar que la interfaz use HTML5 semántico y mantenga criterios consistentes de Bootstrap/SCSS.
- [ ] Completar los estados de carga, vacío, éxito y error con mensajes claros y amigables.
- [ ] Revisar validaciones de formularios, navegación y feedback de las acciones para que el uso sea intuitivo.
- [ ] Comprobar que los componentes reutilizables comuniquen correctamente sus datos y eventos mediante inputs/outputs.

### Integrante 2 — Camila Salvia: integración, autenticación y tipos

- [ ] Revisar los flujos de API del frontend y verificar que funcionen contra el backend actualizado.
- [ ] Reemplazar los tipos `any` de requests/responses por interfaces o tipos de dominio, y mantenerlos sincronizados con la API.
- [ ] Verificar login, persistencia/cierre de sesión y protección de rutas según el rol devuelto por el backend.
- [ ] Revisar el manejo técnico de errores de red, API y sesión vencida; coordinar con Integrante 1 su presentación en pantalla.
- [ ] Configurar y comprobar las URLs de API para desarrollo y producción.
- [ ] Confirmar que dependencias y scripts de instalación, desarrollo, build y test estén registrados y funcionen.
- [ ] Ejecutar el build de producción y resolver los errores o advertencias bloqueantes.

### Integrante 3 — Marianela Leonardelli: pruebas, documentación y entrega

- [ ] Ejecutar los tests unitarios existentes y asegurar que al menos uno verifique el comportamiento de un componente.
- [ ] Incorporar y ejecutar al menos un test end-to-end de un flujo principal, incluyendo autenticación y acceso protegido.
- [ ] Guardar evidencia de la ejecución exitosa de los tests automáticos.
- [ ] Completar en el README las instrucciones sencillas para instalar y ejecutar el frontend, con puertos y configuración de API correctos.
- [ ] Verificar que la documentación de la API esté disponible y enlazada desde la entrega.
- [ ] Coordinar y preparar el video de funcionamiento del sistema.
- [ ] Completar los links de deploy, las credenciales de prueba y el contacto para la defensa.
- [ ] Actualizar la propuesta con los links a los pull requests de frontend y backend.

### Cierre del equipo

- [ ] Revisar en conjunto que cada requisito de frontend tenga implementación y evidencia verificable.
- [ ] Probar la aplicación desplegada y confirmar que las credenciales y los links compartidos funcionan.
