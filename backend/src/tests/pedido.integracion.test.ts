import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import express from 'express';
import jwt from 'jsonwebtoken';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';


const db = vi.hoisted(() => ({
  usuarios: new Map<string, any>(),
  productos: new Map<string, any>(),
  metodosPago: new Map<string, any>(),
  pedidos: [] as any[],      
  detalles: [] as any[],     
  pendientes: [] as any[],   
}));

const em = vi.hoisted(() => {
  const tabla = (entidad: { name: string }) =>
    entidad.name === 'Usuario' ? db.usuarios
    : entidad.name === 'Producto' ? db.productos
    : db.metodosPago;

  return {
    findOne: vi.fn(async (entidad: any, filtro: any) => tabla(entidad).get(filtro.id) ?? null),
    findOneOrFail: vi.fn(async (entidad: any, filtro: any) => {
      const encontrado = entidad.name === 'Pedido'
        ? db.pedidos.find((pedido: any) => pedido.id === filtro.id)
        : tabla(entidad).get(filtro.id);
      if (!encontrado) throw new Error(`${entidad.name} no encontrado`);
      return encontrado;
    }),

        find: vi.fn(async (_entidad: any, where: any) =>
      db.pedidos.filter((p) => {
        if (where.estado_pago && p.estado_pago !== where.estado_pago) return false;
        if (typeof where.usuario === 'string' && p.usuario?.id !== where.usuario) return false;
        if (where.usuario?.esAdmin === false && p.usuario?.esAdmin !== false) return false;
        return true;
      })
    ),

    getReference: vi.fn((_entidad: any, id: string) => ({ id })),
    create: vi.fn((entidad: any, datos: any) => {
      const creada = Object.assign(new entidad(), datos);
      if (entidad.name === 'Pedido') {
        
        const items: any[] = [];
        Object.defineProperty(creada, 'detalles', {
          enumerable: false,
          value: { items, add: (d: any) => items.push(d) },
        });
      }
      db.pendientes.push(creada);
      return creada;
    }),
    flush: vi.fn(async () => {
      for (const entidad of db.pendientes) {
        entidad.id = `id-${db.pedidos.length + db.detalles.length + 1}`;
        if (entidad.constructor.name === 'Pedido') db.pedidos.push(entidad);
        if (entidad.constructor.name === 'DetallePedido') db.detalles.push(entidad);
      }
      db.pendientes.length = 0;
    }),
  };
});

vi.mock('../shared/database/orm.js', () => ({ orm: { em } }));
vi.mock('../usuario/usuario.entity.js', () => ({ Usuario: class Usuario {} }));
vi.mock('../producto/producto.entity.js', () => ({ Producto: class Producto {} }));
vi.mock('../metodo-pago/metodo-pago.entity.js', () => ({ MetodoPago: class MetodoPago {} }));
vi.mock('../pedido/pedido.entity.js', () => ({ Pedido: class Pedido {} }));
vi.mock('../detalle-pedido/detalle-pedido.entity.js', () => ({ DetallePedido: class DetallePedido {} }));

import pedidoRoutes from '../pedido/pedido.routes.js';

const SECRET = 'secreto-de-test';
let server: Server;
let baseUrl: string;

const tokenDe = (id: string, esAdmin = false) =>
  jwt.sign({ id, email: `${id}@test.com`, esAdmin }, SECRET, { expiresIn: '1h' });

async function crearPedido(body: unknown, token?: string) {
  const respuesta = await fetch(`${baseUrl}/api/pedido`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return { status: respuesta.status, json: (await respuesta.json()) as any };
}

async function listar(ruta: string, token?: string) {
  const respuesta = await fetch(`${baseUrl}${ruta}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return { status: respuesta.status, json: (await respuesta.json()) as any };
}

async function cancelarPedido(id: string, token?: string) {
  const respuesta = await fetch(`${baseUrl}/api/pedido/${id}/cancelar`, {
    method: 'PATCH',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return { status: respuesta.status, json: (await respuesta.json()) as any };
}

const idsDe = (json: any) => json.data.map((p: any) => p.id).sort();

const sembrarPedidos = () => {
  db.pedidos.push(
    { id: 'ped-1', usuario: { id: 'u-1', esAdmin: false }, estado_pago: 'Pendiente' },
    { id: 'ped-2', usuario: { id: 'u-1', esAdmin: false }, estado_pago: 'Confirmado' },
    { id: 'ped-3', usuario: { id: 'u-2', esAdmin: false }, estado_pago: 'Pendiente' }
  );
};

const pedidoValido = {
  direccion_envio: 'Calle Falsa 123',
  metodo_pago: 'mp-1',
  items: [
    { productoId: 'p-cafe', cantidad: 2 },
    { productoId: 'p-medialuna', cantidad: 3 },
  ],
};


const nadaFuePersistido = () => {
  expect(db.pedidos).toHaveLength(0);
  expect(db.detalles).toHaveLength(0);
  expect(db.pendientes).toHaveLength(0);
};

beforeAll(async () => {
  process.env.JWT_SECRET = SECRET;
  const app = express();
  app.use(express.json());
  app.use('/api/pedido', pedidoRoutes);
    await new Promise<void>((resolver) => {
    server = app.listen(0, () => resolver());
  });
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise<void>((resolver) => server.close(() => resolver()));
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});

  // Datos aislados: se recrean antes de cada test
  db.usuarios.clear();
  db.productos.clear();
  db.metodosPago.clear();
  db.pedidos.length = 0;
  db.detalles.length = 0;
  db.pendientes.length = 0;

  db.usuarios.set('u-1', { id: 'u-1', email: 'u-1@test.com', esAdmin: false });
  db.usuarios.set('u-admin', { id: 'u-admin', email: 'u-admin@test.com', esAdmin: true });
  db.productos.set('p-cafe', { id: 'p-cafe', nombre: 'Café', precio: 3500 });
  db.productos.set('p-medialuna', { id: 'p-medialuna', nombre: 'Medialuna', precio: 1200 });
  db.metodosPago.set('mp-1', { id: 'mp-1', nombre: 'Efectivo' });
});

describe('Pedido - Test de integración (POST /api/pedido)', () => {

  describe('Flujo exitoso', () => {
    it('Crea el pedido con sus detalles y calcula el total con los precios de la BD', async () => {
      const { status, json } = await crearPedido(pedidoValido, tokenDe('u-1'));

      expect(status).toBe(201);

      // Total = 2 x 3500 + 3 x 1200 = 10600
      expect(db.pedidos).toHaveLength(1);
      expect(db.pedidos[0].costo_total).toBe(10600);
      expect(json.data.costo_total).toBe(10600);

      // Un detalle por producto, con el precio unitario tomado de la BD
      expect(db.detalles).toHaveLength(2);
            // Cada detalle apunta al pedido creado y a su producto
      for (const detalle of db.detalles) {
        expect(detalle.pedido).toBe(db.pedidos[0]);
      }
      expect(db.detalles.map((d) => d.producto.id).sort()).toEqual(['p-cafe', 'p-medialuna']);
      expect(db.detalles).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ cantidad: 2, precio_unitario: 3500 }),
          expect.objectContaining({ cantidad: 3, precio_unitario: 1200 }),
        ])
      );

      // Estado inicial, usuario y método de pago del pedido
      expect(db.pedidos[0].estado_pago).toBe('Pendiente');
      expect(db.pedidos[0].usuario).toEqual({ id: 'u-1' });
      expect(db.pedidos[0].metodo_pago).toEqual({ id: 'mp-1' });
    });

    it('Ignora el total, los precios y el usuario que manda el cliente', async () => {
      const { status } = await crearPedido(
        {
          ...pedidoValido,
          costo_total: 1,
          usuario: 'u-admin',
          items: [
            { productoId: 'p-cafe', cantidad: 2, precio: 1, precio_unitario: 1 },
            { productoId: 'p-medialuna', cantidad: 3, precio: 1, precio_unitario: 1 },
          ],
        },
        tokenDe('u-1')
      );

      expect(status).toBe(201);
      expect(db.pedidos[0].costo_total).toBe(10600);
      expect(db.pedidos[0].usuario).toEqual({ id: 'u-1' });
      expect(db.detalles.map((d) => d.precio_unitario).sort()).toEqual([1200, 3500]);
    });

    it('Si cambia el precio en la BD, el total del nuevo pedido refleja el precio actual', async () => {
      db.productos.set('p-cafe', { id: 'p-cafe', nombre: 'Café', precio: 4000 });

      const { status } = await crearPedido(pedidoValido, tokenDe('u-1'));

      expect(status).toBe(201);
      // 2 x 4000 + 3 x 1200 = 11600
      expect(db.pedidos[0].costo_total).toBe(11600);
    });
  });

  describe('Entradas inválidas: no se crea el pedido', () => {
    it.each([
      ['decimal', 1.5],
      ['cero', 0],
      ['negativa', -2],
      ['texto no numérico', 'abc'],
    ])('Rechaza con 400 una cantidad %s', async (_nombre, cantidad) => {
      const { status } = await crearPedido(
        { ...pedidoValido, items: [{ productoId: 'p-cafe', cantidad }] },
        tokenDe('u-1')
      );

      expect(status).toBe(400);
      nadaFuePersistido();
      expect(em.flush).not.toHaveBeenCalled();
    });

    it('Rechaza con 400 si un solo ítem es inválido, aunque los demás estén bien', async () => {
      const { status } = await crearPedido(
        {
          ...pedidoValido,
          items: [
            { productoId: 'p-cafe', cantidad: 2 },
            { productoId: 'p-medialuna', cantidad: 0 },
          ],
        },
        tokenDe('u-1')
      );

      expect(status).toBe(400);
      nadaFuePersistido();
    });

    it('Rechaza con 400 un pedido sin ítems', async () => {
      const { status } = await crearPedido({ ...pedidoValido, items: [] }, tokenDe('u-1'));

      expect(status).toBe(400);
      nadaFuePersistido();
    });

    it('Rechaza con 400 un pedido sin método de pago', async () => {
      const { status } = await crearPedido({ ...pedidoValido, metodo_pago: undefined }, tokenDe('u-1'));

      expect(status).toBe(400);
      nadaFuePersistido();
    });

    it('Rechaza con 404 un producto inexistente', async () => {
      const { status } = await crearPedido(
        { ...pedidoValido, items: [{ productoId: 'no-existe', cantidad: 1 }] },
        tokenDe('u-1')
      );

      expect(status).toBe(404);
      nadaFuePersistido();
    });

    it('Rechaza con 404 un método de pago inexistente', async () => {
      const { status } = await crearPedido({ ...pedidoValido, metodo_pago: 'no-existe' }, tokenDe('u-1'));

      expect(status).toBe(404);
      nadaFuePersistido();
    });
  });

  describe('Autenticación y permisos', () => {
    it('Rechaza con 401 sin token', async () => {
      const { status } = await crearPedido(pedidoValido);

      expect(status).toBe(401);
      nadaFuePersistido();
    });

    it('Rechaza con 401 con un token inválido', async () => {
      const { status } = await crearPedido(pedidoValido, 'token-falso');

      expect(status).toBe(401);
      nadaFuePersistido();
    });

    it('Rechaza con 403 si quien crea el pedido es administrador', async () => {
      const { status } = await crearPedido(pedidoValido, tokenDe('u-admin', true));

      expect(status).toBe(403);
      nadaFuePersistido();
    });
  });

    describe('Filtro de pedidos por estado (GET)', () => {
    beforeEach(sembrarPedidos);

    it('El cliente filtra sus pedidos por estado', async () => {
      const { status, json } = await listar('/api/pedido/usuario/u-1?estado=Pendiente', tokenDe('u-1'));

      expect(status).toBe(200);
      expect(idsDe(json)).toEqual(['ped-1']);
    });

    it('Sin filtro devuelve todos los pedidos del cliente, y solo los suyos', async () => {
      const { status, json } = await listar('/api/pedido/usuario/u-1', tokenDe('u-1'));

      expect(status).toBe(200);
      expect(idsDe(json)).toEqual(['ped-1', 'ped-2']);
    });

    it('El estado no distingue mayúsculas de minúsculas', async () => {
      const { status, json } = await listar('/api/pedido/usuario/u-1?estado=confirmado', tokenDe('u-1'));

      expect(status).toBe(200);
      expect(idsDe(json)).toEqual(['ped-2']);
    });

    it('Rechaza con 400 un estado inexistente', async () => {
      const { status } = await listar('/api/pedido/usuario/u-1?estado=Inexistente', tokenDe('u-1'));

      expect(status).toBe(400);
    });

    it('Rechaza con 400 si el estado se envía repetido', async () => {
      const { status } = await listar('/api/pedido/usuario/u-1?estado=Pendiente&estado=Cancelado', tokenDe('u-1'));

      expect(status).toBe(400);
    });

    it('Un usuario no puede ver los pedidos de otro aunque use el filtro (403)', async () => {
      const { status, json } = await listar('/api/pedido/usuario/u-1?estado=Pendiente', tokenDe('u-2'));

      expect(status).toBe(403);
      expect(json.data).toBeUndefined();
    });

    it('El permiso se evalúa antes que el filtro: pedidos ajenos con estado inválido dan 403', async () => {
      const { status } = await listar('/api/pedido/usuario/u-1?estado=Inexistente', tokenDe('u-2'));

      expect(status).toBe(403);
    });

    it('Rechaza con 401 sin token', async () => {
      const { status } = await listar('/api/pedido/usuario/u-1?estado=Pendiente');

      expect(status).toBe(401);
    });

    it('El admin filtra los pedidos de cualquier usuario', async () => {
      const { status, json } = await listar('/api/pedido/usuario/u-1?estado=Confirmado', tokenDe('u-admin', true));

      expect(status).toBe(200);
      expect(idsDe(json)).toEqual(['ped-2']);
    });

    it('El admin filtra el listado general por estado', async () => {
      const { status, json } = await listar('/api/pedido?estado=Pendiente', tokenDe('u-admin', true));

      expect(status).toBe(200);
      expect(idsDe(json)).toEqual(['ped-1', 'ped-3']);
    });

    it('Un cliente no puede acceder al listado general, con o sin filtro (403)', async () => {
      const { status } = await listar('/api/pedido?estado=Pendiente', tokenDe('u-1'));

      expect(status).toBe(403);
    });
  });

  describe('Acceso a un pedido individual', () => {
    beforeEach(sembrarPedidos);

    it('permite al propietario consultar su pedido', async () => {
      const { status, json } = await listar('/api/pedido/ped-1', tokenDe('u-1'));

      expect(status).toBe(200);
      expect(json.data.id).toBe('ped-1');
    });

    it('rechaza al usuario ajeno sin devolver el pedido', async () => {
      const { status, json } = await listar('/api/pedido/ped-1', tokenDe('u-2'));

      expect(status).toBe(403);
      expect(json.data).toBeUndefined();
    });

    it('permite al administrador consultar el pedido de cualquier usuario', async () => {
      const { status, json } = await listar('/api/pedido/ped-1', tokenDe('u-admin', true));

      expect(status).toBe(200);
      expect(json.data.id).toBe('ped-1');
    });

    it('rechaza sin token', async () => {
      const { status } = await listar('/api/pedido/ped-1');

      expect(status).toBe(401);
    });
  });

  describe('Cancelación de pedidos', () => {
    beforeEach(sembrarPedidos);

    it('rechaza la solicitud sin token antes de consultar el pedido', async () => {
      const { status } = await cancelarPedido('ped-1');

      expect(status).toBe(401);
      expect(em.findOneOrFail).not.toHaveBeenCalled();
      expect(em.flush).not.toHaveBeenCalled();
    });

    it('permite al propietario cancelar su pedido pendiente', async () => {
      const { status, json } = await cancelarPedido('ped-1', tokenDe('u-1'));

      expect(status).toBe(200);
      expect(json.data.estado_pago).toBe('Cancelado');
      expect(db.pedidos[0].estado_pago).toBe('Cancelado');
      expect(em.flush).toHaveBeenCalledOnce();
    });

    it('deniega al usuario ajeno y conserva el pedido sin cambios', async () => {
      const { status } = await cancelarPedido('ped-1', tokenDe('u-2'));

      expect(status).toBe(403);
      expect(db.pedidos[0].estado_pago).toBe('Pendiente');
      expect(em.flush).not.toHaveBeenCalled();
    });

    it('deniega al administrador cancelar el pedido de un cliente', async () => {
      const { status } = await cancelarPedido('ped-1', tokenDe('u-admin', true));

      expect(status).toBe(403);
      expect(em.findOneOrFail).not.toHaveBeenCalled();
      expect(db.pedidos[0].estado_pago).toBe('Pendiente');
      expect(em.flush).not.toHaveBeenCalled();
    });

    it('no permite cancelar un pedido que ya no está pendiente', async () => {
      const { status } = await cancelarPedido('ped-2', tokenDe('u-1'));

      expect(status).toBe(409);
      expect(db.pedidos[1].estado_pago).toBe('Confirmado');
      expect(em.flush).not.toHaveBeenCalled();
    });
  });
});