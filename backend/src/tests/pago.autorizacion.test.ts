import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import jwt from 'jsonwebtoken';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';

const em = vi.hoisted(() => ({
  findOneOrFail: vi.fn(),
  flush: vi.fn(),
}));

const mercadoPagoMocks = vi.hoisted(() => ({
  crearPreferencia: vi.fn(),
  obtenerPago: vi.fn(),
  validarFirma: vi.fn(),
}));

vi.mock('../shared/database/orm.js', () => ({ orm: { em } }));
vi.mock('../pedido/pedido.entity.js', () => ({ Pedido: class Pedido {} }));
vi.mock('../detalle-pedido/detalle-pedido.entity.js', () => ({ DetallePedido: class DetallePedido {} }));
vi.mock('mercadopago', () => ({
  MercadoPagoConfig: class MercadoPagoConfig {},
  Preference: class Preference {
    create(options: unknown) {
      return mercadoPagoMocks.crearPreferencia(options);
    }
  },
  Payment: class Payment {
    get(options: unknown) {
      return mercadoPagoMocks.obtenerPago(options);
    }
  },
  WebhookSignatureValidator: {
    validate: (...args: unknown[]) => mercadoPagoMocks.validarFirma(...args),
  },
}));

import pagoRoutes from '../pago/pago.routes.js';

const JWT_SECRET = 'secreto-pago-autorizacion-test';
const jwtSecretOriginal = process.env.JWT_SECRET;
const mpAccessTokenOriginal = process.env.MP_ACCESS_TOKEN;
let server: Server;
let baseUrl: string;

const tokenDe = (id: string, esAdmin = false) =>
  jwt.sign({ id, email: `${id}@test.com`, esAdmin }, JWT_SECRET, { expiresIn: '1h' });

function pedidoDe(usuarioId: string) {
  return {
    id: 'pedido-1',
    usuario: { id: usuarioId },
    estado_pago: 'Pendiente',
    metodo_pago: { nombre: 'Mercado Pago' },
    detalles: {
      getItems: () => [{
        producto: { id: 'producto-1', nombre: 'Café' },
        cantidad: 1,
        precio_unitario: 1000,
      }],
    },
  };
}

async function crearPreferencia(token?: string) {
  const respuesta = await fetch(`${baseUrl}/api/pago/preferencia/pedido-1`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const texto = await respuesta.text();
  return { status: respuesta.status, json: texto ? JSON.parse(texto) : undefined };
}

beforeAll(async () => {
  process.env.JWT_SECRET = JWT_SECRET;
  process.env.MP_ACCESS_TOKEN = 'token-mercado-pago-de-prueba';

  const app = express();
  app.use('/api/pago', pagoRoutes);
  await new Promise<void>((resolve) => {
    server = app.listen(0, '127.0.0.1', () => resolve());
  });
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
  if (jwtSecretOriginal === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = jwtSecretOriginal;
  }
  if (mpAccessTokenOriginal === undefined) {
    delete process.env.MP_ACCESS_TOKEN;
  } else {
    process.env.MP_ACCESS_TOKEN = mpAccessTokenOriginal;
  }
});

beforeEach(() => {
  vi.clearAllMocks();
  em.findOneOrFail.mockResolvedValue(pedidoDe('cliente-1'));
  mercadoPagoMocks.crearPreferencia.mockResolvedValue({
    id: 'preferencia-1',
    init_point: 'https://mercadopago.test/checkout',
  });
});

describe('Autorización HTTP para crear preferencias de pago', () => {
  it('rechaza la solicitud sin token antes de consultar el pedido', async () => {
    const respuesta = await crearPreferencia();

    expect(respuesta.status).toBe(401);
    expect(em.findOneOrFail).not.toHaveBeenCalled();
    expect(mercadoPagoMocks.crearPreferencia).not.toHaveBeenCalled();
  });

  it('permite al propietario crear la preferencia sin llamar a Mercado Pago externamente', async () => {
    const respuesta = await crearPreferencia(tokenDe('cliente-1'));

    expect(respuesta.status).toBe(200);
    expect(respuesta.json.data.init_point).toBe('https://mercadopago.test/checkout');
    expect(mercadoPagoMocks.crearPreferencia).toHaveBeenCalledOnce();
    expect(em.flush).toHaveBeenCalledOnce();
  });

  it.each([
    ['usuario ajeno', 'cliente-2', false],
    ['administrador de otro usuario', 'admin-1', true],
  ])('deniega al %s pagar un pedido ajeno', async (_rol, id, esAdmin) => {
    const respuesta = await crearPreferencia(tokenDe(id, esAdmin));

    expect(respuesta.status).toBe(403);
    expect(mercadoPagoMocks.crearPreferencia).not.toHaveBeenCalled();
    expect(em.flush).not.toHaveBeenCalled();
  });
});
