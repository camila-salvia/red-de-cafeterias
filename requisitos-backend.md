# Backend:

## Condiciones de regularidad:

- Desarrollarse en JavaScript.
- Utilizar un framework web que permita integrarse a las demás
  herramientas a través de middlewares, pluggins o modulos.
- Exponer una API web (rest, tRPC o gRPC) para interactuar con el frontend.
- Utilizar una base de datos persistente que acceda a través de un servicio externo (es decir que no sea una base de datos embebida).
  La persistencia a la base de datos debe realizarse mediante un mapper (ORM/ODM/OXM). En caso que la base de datos utilizada no tenga un mapper disponible para JavaScript se deberá implementar la persistencai utilizando un patron Repository.
- Realizarse mediante capas.
- Validar entrada de datos, manejar e informar apropiadamente los errores a través de la API.
- Las dependencias para ejecución, desarrollo y test deben estar correctamente registradas para ser instaladas automáticamente (e.j. package.json).

## Aprobación Directa o en Examen:

- Implementar 1 test automatizado por integrante.
- Implementar 1 test de integración.
- Implementar un login con autenticación propia o de third-party y al menos 2 niveles de acceso diferentes.
- Proteger las diferentes rutas en base al nivel de acceso requerido.
- Definir ambientes, ya sea mediante environment del framework o .env

# Requisitos funcionales:

## Regularidad:

- 1 CRUD Simple por integrante
- 1 CRUD Dependiente cada 2 integrantes o fracción.
- 1 Listado con filtro (al menos un atributo) cada 2 integrantes o fracción.
- Para cada listado, al seleccionar un elemento, se debe mostrar un detalle.
- Debe implementar un caso de uso de usuario o epic, con valor para el negocio, cada 2 integrantes o fracción.

## Aprobación Directa:

- CRUDs de todas las clases de negocio necesarias para el funcionamiento de la app.
- Implementar 1 caso de uso usuario o epic, con valor para el negocio, por cada integrante. Se deben implementar un mínimo de 2 relacionados entre sí. Es decir que la data registrada por uno CU o epic sirva de input para otro.
