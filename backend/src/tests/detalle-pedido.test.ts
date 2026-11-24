import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';
import { NotFoundError } from '@mikro-orm/core';

// Mockear el ORM, las entidades y el middleware de auth antes de importar nada
const em = vi.hoisted(() => ({
  find: vi.fn(),
  findOne: vi.fn(),
  findOneOrFail: vi.fn(),
  create: vi.fn(),
  assign: vi.fn(),
  flush: vi.fn(),
  removeAndFlush: vi.fn(),
}));

vi.mock('../shared/database/orm.js', () => ({ orm: { em } }));
vi.mock('../detalle-pedido/detalle-pedido.entity.js', () => ({ DetallePedido: class DetallePedido {} }));
vi.mock('../pedido/pedido.entity.js', () => ({ Pedido: class Pedido {} }));
vi.mock('../producto/producto.entity.js', () => ({ Producto: class Producto {} }));
// Funciones "centinela": sirven para comprobar QUÉ middlewares tiene cada ruta.
// El comportamiento real (401/403) de verificarToken y soloAdmin se prueba de punta a punta
// con el archivo .http.
vi.mock('../shared/middleware/auth.middleware.js', () => ({
  verificarToken: vi.fn(),
  soloAdmin: vi.fn(),
}));

import router from '../detalle-pedido/detalle-pedido.routes.js';
import { verificarToken, soloAdmin } from '../shared/middleware/auth.middleware.js';
import { validarDetallePedidoInput } from '../detalle-pedido/detalle-pedido.validator.js';
import {
  add,
  findOne,
  findAll,
  update,
  remove,
  sanitizeDetallePedidoInput,
} from '../detalle-pedido/detalle-pedido.controller.js';
import { DetallePedido } from '../detalle-pedido/detalle-pedido.entity.js';
import { Pedido } from '../pedido/pedido.entity.js';
import { Producto } from '../producto/producto.entity.js';

// ─────────────────────────── Helpers ───────────────────────────
type UsuarioToken = { id: string; esAdmin: boolean };

const clienteA: UsuarioToken = { id: 'user-A', esAdmin: false };
const clienteB: UsuarioToken = { id: 'user-B', esAdmin: false };
const admin: UsuarioToken = { id: 'user-admin', esAdmin: true };

function crearRes() {
  const res = { status: vi.fn(), json: vi.fn(), send: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  res.send.mockReturnValue(res);
  return res;
}

const comoRes = (res: ReturnType<typeof crearRes>) => res as unknown as Response;

function crearReq(opts: {
  method?: string;
  body?: Record<string, unknown>;
  params?: Record<string, string>;
  usuario?: UsuarioToken;
}) {
  return {
    method: opts.method ?? 'GET',
    body: { ...(opts.body ?? {}) },
    params: opts.params ?? {},
    query: {},
    usuarioToken: opts.usuario,
  } as unknown as Request;
}

// Simula la base: devuelve productos y pedidos por id
function simularBD(opts: {
  productos?: Record<string, unknown>;
  pedidos?: Record<string, unknown>;
}) {
  const buscar = (entidad: unknown, id: string) =>
    entidad === Producto
      ? opts.productos?.[id]
      : entidad === Pedido
        ? opts.pedidos?.[id]
        : undefined;

  em.findOne.mockImplementation(async (entidad: unknown, filtro: { id: string }) => {
    return buscar(entidad, filtro.id) ?? null;
  });
  em.findOneOrFail.mockImplementation(async (entidad: unknown, filtro: { id: string }) => {
    const encontrado = buscar(entidad, filtro.id);
    if (!encontrado) throw new NotFoundError('no encontrado');
    return encontrado;
  });
}

// Ejecuta la misma cadena que la ruta POST: validar -> sanitizar -> add
async function ejecutarCadenaPost(req: Request, res: Response) {
  let avanza = false;
  const siguiente = () => {
    avanza = true;
  };

  await validarDetallePedidoInput(req, res, siguiente);
  if (!avanza) return;

  avanza = false;
  sanitizeDetallePedidoInput(req, res, siguiente);
  if (!avanza) return;

  await add(req, res);
}

// Handlers (middlewares + controller) de una ruta del router, en orden
function handlersDe(metodo: string, path: string): unknown[] {
  const capas = (router as any).stack as any[];
  const capa = capas.find((c) => c.route?.path === path && c.route.methods?.[metodo]);
  if (!capa) throw new Error(`No existe la ruta ${metodo.toUpperCase()} ${path}`);
  return capa.route.stack.map((c: any) => c.handle);
}

const pedidoDe = (id: string, duenioId: string, estado_pago = 'Pendiente') => ({
  id,
  estado_pago,
  usuario: { id: duenioId },
});
const productoCafe = { id: 'prod-1', nombre: 'Café', precio: 3500 };

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

// ═══════════════════════ 1. GUARDS EN LAS RUTAS ═══════════════════════
describe('DetallePedido - guards de las rutas', () => {
  it('ninguna ruta es pública: todas exigen verificarToken', () => {
    const rutas = ((router as any).stack as any[]).filter((c) => c.route);
    expect(rutas.length).toBeGreaterThan(0);

    for (const capa of rutas) {
      const handlers = capa.route.stack.map((c: any) => c.handle);
      const etiqueta = `${Object.keys(capa.route.methods).join(',').toUpperCase()} ${capa.route.path}`;
      expect(handlers, etiqueta).toContain(verificarToken);
    }
  });

  it.each([
    ['get', '/'],
    // Los detalles solo se crean dentro de POST /pedido (con el total calculado en el backend).
    // Una vez confirmado el pedido, el cliente no puede agregarle nada.
    ['post', '/'],
    ['patch', '/:id'],
    ['put', '/:id'],
    ['delete', '/:id'],
  ])('%s %s es solo para admin (verificarToken antes que soloAdmin)', (metodo, path) => {
    const handlers = handlersDe(metodo, path);

    expect(handlers).toContain(soloAdmin);
    expect(handlers.indexOf(verificarToken)).toBeLessThan(handlers.indexOf(soloAdmin));
  });

  it('GET /:id no es solo para admin: el dueño debe poder ver su detalle (la propiedad se valida en el controller)', () => {
    const handlers = handlersDe('get', '/:id');

    expect(handlers).not.toContain(soloAdmin);
    expect(handlers).toContain(findOne);
  });

  it('POST / ejecuta el validador (que comprueba la propiedad del pedido) antes de sanitizar y de crear', () => {
    const handlers = handlersDe('post', '/');

    expect(handlers).toContain(soloAdmin);
    expect(handlers).toContain(validarDetallePedidoInput);
    expect(handlers.indexOf(soloAdmin)).toBeLessThan(handlers.indexOf(validarDetallePedidoInput));
    expect(handlers.indexOf(validarDetallePedidoInput)).toBeLessThan(
      handlers.indexOf(sanitizeDetallePedidoInput)
    );
    expect(handlers.indexOf(sanitizeDetallePedidoInput)).toBeLessThan(handlers.indexOf(add));
  });

  it('las rutas de admin apuntan a los controllers esperados', () => {
    expect(handlersDe('get', '/')).toContain(findAll);
    expect(handlersDe('patch', '/:id')).toContain(update);
    expect(handlersDe('put', '/:id')).toContain(update);
    expect(handlersDe('delete', '/:id')).toContain(remove);
  });
});

// ═══════════════════════ 2. PROPIEDAD EN LECTURA ═══════════════════════
describe('DetallePedido - findOne (propiedad en cascada)', () => {
  const detalleDe = (duenioId: string) => ({
    id: 'det-1',
    cantidad: 2,
    precio_unitario: 3500,
    producto: { id: 'prod-1', nombre: 'Café' },
    pedido: { id: 'ped-1', usuario: { id: duenioId } },
  });

  it('el dueño del pedido ve su detalle (200) y se carga pedido.usuario para poder comparar', async () => {
    const detalle = detalleDe(clienteA.id);
    em.findOneOrFail.mockResolvedValueOnce(detalle);
    const res = crearRes();

    await findOne(crearReq({ params: { id: 'det-1' }, usuario: clienteA }), comoRes(res));

    expect(em.findOneOrFail).toHaveBeenCalledWith(
      DetallePedido,
      { id: 'det-1' },
      { populate: ['producto', 'pedido.usuario'] }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Detalle de pedido encontrado', data: detalle });
  });

  it('un admin ve el detalle de cualquier cliente (200)', async () => {
    em.findOneOrFail.mockResolvedValueOnce(detalleDe(clienteB.id));
    const res = crearRes();

    await findOne(crearReq({ params: { id: 'det-1' }, usuario: admin }), comoRes(res));

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('un cliente NO puede ver el detalle de otro cliente (403) y no se filtran datos', async () => {
    em.findOneOrFail.mockResolvedValueOnce(detalleDe(clienteB.id));
    const res = crearRes();

    await findOne(crearReq({ params: { id: 'det-1' }, usuario: clienteA }), comoRes(res));

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Acceso denegado: este detalle de pedido no te pertenece.',
    });
    expect(res.json).not.toHaveBeenCalledWith(expect.objectContaining({ data: expect.anything() }));
  });

  it('sin usuario en el token se deniega (403): la propiedad no se asume', async () => {
    em.findOneOrFail.mockResolvedValueOnce(detalleDe(clienteA.id));
    const res = crearRes();

    await findOne(crearReq({ params: { id: 'det-1' }, usuario: undefined }), comoRes(res));

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('responde 404 si el detalle no existe', async () => {
    em.findOneOrFail.mockRejectedValueOnce(new NotFoundError('no encontrado'));
    const res = crearRes();

    await findOne(crearReq({ params: { id: 'nada' }, usuario: clienteA }), comoRes(res));

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Detalle de pedido no encontrado' });
  });

  it('responde 500 ante un error inesperado', async () => {
    em.findOneOrFail.mockRejectedValueOnce(new Error('db caída'));
    const res = crearRes();

    await findOne(crearReq({ params: { id: 'det-1' }, usuario: clienteA }), comoRes(res));

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ═══════════════════════ 3. PROPIEDAD EN ESCRITURA (validador) ═══════════════════════
describe('DetallePedido - validarDetallePedidoInput (propiedad del pedido)', () => {
  const bodyValido = { pedido: 'ped-A', producto: 'prod-1', cantidad: 2 };

  beforeEach(() => {
    simularBD({
      productos: { 'prod-1': productoCafe },
      pedidos: { 'ped-A': pedidoDe('ped-A', clienteA.id), 'ped-B': pedidoDe('ped-B', clienteB.id) },
    });
  });

  it('el dueño del pedido puede asociarle un detalle', async () => {
    const res = crearRes();
    const next = vi.fn();

    await validarDetallePedidoInput(
      crearReq({ method: 'POST', body: bodyValido, usuario: clienteA }),
      comoRes(res),
      next
    );

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('un cliente NO puede asociar un detalle al pedido de otro cliente (403)', async () => {
    const res = crearRes();
    const next = vi.fn();

    await validarDetallePedidoInput(
      crearReq({ method: 'POST', body: { ...bodyValido, pedido: 'ped-B' }, usuario: clienteA }),
      comoRes(res),
      next
    );

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'No puedes asociar un detalle a un pedido que no te pertenece.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('enviar el pedido como objeto { id } no evita la comprobación (403)', async () => {
    const res = crearRes();
    const next = vi.fn();

    await validarDetallePedidoInput(
      crearReq({ method: 'POST', body: { ...bodyValido, pedido: { id: 'ped-B' } }, usuario: clienteA }),
      comoRes(res),
      next
    );

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('sin usuario en el token se deniega (403)', async () => {
    const res = crearRes();
    const next = vi.fn();

    await validarDetallePedidoInput(
      crearReq({ method: 'POST', body: bodyValido, usuario: undefined }),
      comoRes(res),
      next
    );

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('un admin sí puede asociar un detalle al pedido de cualquier cliente', async () => {
    const res = crearRes();
    const next = vi.fn();

    await validarDetallePedidoInput(
      crearReq({ method: 'POST', body: { ...bodyValido, pedido: 'ped-B' }, usuario: admin }),
      comoRes(res),
      next
    );

    expect(next).toHaveBeenCalledOnce();
  });

  it('responde 404 si el pedido no existe', async () => {
    const res = crearRes();
    const next = vi.fn();

    await validarDetallePedidoInput(
      crearReq({ method: 'POST', body: { ...bodyValido, pedido: 'inexistente' }, usuario: clienteA }),
      comoRes(res),
      next
    );

    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).not.toHaveBeenCalled();
  });

  it('responde 404 si el producto no existe', async () => {
    const res = crearRes();
    const next = vi.fn();

    await validarDetallePedidoInput(
      crearReq({ method: 'POST', body: { ...bodyValido, producto: 'inexistente' }, usuario: clienteA }),
      comoRes(res),
      next
    );

    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).not.toHaveBeenCalled();
  });

  it.each([0, -1, 1.5, 'abc', undefined])(
    'rechaza con 400 una cantidad inválida (%s) sin consultar la base',
    async (cantidad) => {
      const res = crearRes();
      const next = vi.fn();

      await validarDetallePedidoInput(
        crearReq({ method: 'POST', body: { ...bodyValido, cantidad }, usuario: clienteA }),
        comoRes(res),
        next
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ errores: expect.arrayContaining([expect.stringContaining('cantidad')]) })
      );
      expect(em.findOne).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    }
  );

  it('rechaza con 400 si falta el pedido o el producto', async () => {
    for (const faltante of ['pedido', 'producto']) {
      const body: Record<string, unknown> = { ...bodyValido };
      delete body[faltante];
      const res = crearRes();
      const next = vi.fn();

      await validarDetallePedidoInput(
        crearReq({ method: 'POST', body, usuario: clienteA }),
        comoRes(res),
        next
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    }
  });

  it('una actualización parcial (PATCH solo con cantidad) es válida', async () => {
    const res = crearRes();
    const next = vi.fn();

    await validarDetallePedidoInput(
      crearReq({ method: 'PATCH', body: { cantidad: 3 }, usuario: admin }),
      comoRes(res),
      next
    );

    expect(next).toHaveBeenCalledOnce();
  });
});

// ═══════════════════════ 4. CADENA COMPLETA DEL POST ═══════════════════════
// Defensa en profundidad: la ruta ya exige admin, pero el validador y el controller
// no deben depender de eso para proteger la propiedad y el estado del pedido.
describe('DetallePedido - cadena POST (validar -> sanitizar -> crear)', () => {
  beforeEach(() => {
    simularBD({
      productos: { 'prod-1': productoCafe },
      pedidos: { 'ped-A': pedidoDe('ped-A', clienteA.id), 'ped-B': pedidoDe('ped-B', clienteB.id) },
    });
    em.create.mockImplementation((_entidad: unknown, datos: object) => ({ id: 'det-nuevo', ...datos }));
    em.flush.mockResolvedValue(undefined);
  });

  it('el cliente crea un detalle en su pedido (201) y el precio sale de la base, no del body', async () => {
    const res = crearRes();
    const req = crearReq({
      method: 'POST',
      body: { pedido: 'ped-A', producto: 'prod-1', cantidad: 2, precio_unitario: 1 }, // precio forjado
      usuario: clienteA,
    });

    await ejecutarCadenaPost(req, comoRes(res));

    expect(em.create).toHaveBeenCalledWith(DetallePedido, {
      cantidad: 2,
      precio_unitario: 3500,
      producto: productoCafe,
      pedido: pedidoDe('ped-A', clienteA.id),
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('un cliente NO crea un detalle en el pedido de otro (403) y no se persiste nada', async () => {
    const res = crearRes();
    const req = crearReq({
      method: 'POST',
      body: { pedido: 'ped-B', producto: 'prod-1', cantidad: 1 },
      usuario: clienteA,
    });

    await ejecutarCadenaPost(req, comoRes(res));

    expect(res.status).toHaveBeenCalledWith(403);
    expect(em.create).not.toHaveBeenCalled();
    expect(em.flush).not.toHaveBeenCalled();
  });

  it('un sanitizedInput falsificado en el body no sirve para saltear la comprobación de propiedad', async () => {
    // El validador corre ANTES de sanitizar. Si lee req.body.sanitizedInput (que el cliente puede
    // enviar), valida un pedido propio, y luego el sanitizador lo pisa con el pedido ajeno.
    const res = crearRes();
    const req = crearReq({
      method: 'POST',
      body: {
        pedido: 'ped-B', // pedido ajeno: el que realmente se usaría al crear
        producto: 'prod-1',
        cantidad: 1,
        sanitizedInput: { pedido: 'ped-A', producto: 'prod-1', cantidad: 1 }, // pedido propio: el que se validaría
      },
      usuario: clienteA,
    });

    await ejecutarCadenaPost(req, comoRes(res));

    expect(res.status).toHaveBeenCalledWith(403);
    expect(em.create).not.toHaveBeenCalled();
    expect(em.flush).not.toHaveBeenCalled();
  });

  it.each(['Confirmado', 'Cancelado'])(
    'no se pueden agregar detalles a un pedido %s (409), ni siquiera su dueño',
    async (estado) => {
      simularBD({
        productos: { 'prod-1': productoCafe },
        pedidos: { 'ped-A': pedidoDe('ped-A', clienteA.id, estado) },
      });
      const res = crearRes();
      const req = crearReq({
        method: 'POST',
        body: { pedido: 'ped-A', producto: 'prod-1', cantidad: 1 },
        usuario: clienteA,
      });

      await ejecutarCadenaPost(req, comoRes(res));

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Solo se pueden agregar detalles a pedidos pendientes.',
      });
      expect(em.create).not.toHaveBeenCalled();
      expect(em.flush).not.toHaveBeenCalled();
    }
  );

  it('tampoco un admin puede agregar detalles a un pedido ya confirmado (409)', async () => {
    simularBD({
      productos: { 'prod-1': productoCafe },
      pedidos: { 'ped-A': pedidoDe('ped-A', clienteA.id, 'Confirmado') },
    });
    const res = crearRes();
    const req = crearReq({
      method: 'POST',
      body: { pedido: 'ped-A', producto: 'prod-1', cantidad: 1 },
      usuario: admin,
    });

    await ejecutarCadenaPost(req, comoRes(res));

    expect(res.status).toHaveBeenCalledWith(409);
    expect(em.create).not.toHaveBeenCalled();
  });

  // Hueco pendiente: hoy el sistema no lo cubre.
  it.todo('mantiene costo_total del pedido consistente al agregar un detalle');
});