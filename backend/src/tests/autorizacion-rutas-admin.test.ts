import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import jwt from 'jsonwebtoken';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';

const routeMocks = vi.hoisted(() => ({
  controller: vi.fn((_req: unknown, res: { sendStatus: (status: number) => unknown }) => res.sendStatus(204)),
  pass: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

vi.mock('../usuario/usuario.controller.js', () => ({
  add: routeMocks.controller,
  findAll: routeMocks.controller,
  findOne: routeMocks.controller,
  update: routeMocks.controller,
  remove: routeMocks.controller,
  sanitizeUsuarioInput: routeMocks.pass,
  login: routeMocks.controller,
}));
vi.mock('../pedido/pedido.controller.js', () => ({
  add: routeMocks.controller,
  cancelar: routeMocks.controller,
  confirmar: routeMocks.controller,
  findAll: routeMocks.controller,
  findByUsuario: routeMocks.controller,
  findOne: routeMocks.controller,
  update: routeMocks.controller,
  remove: routeMocks.controller,
  sanitizePedidoInput: routeMocks.pass,
}));
vi.mock('../detalle-pedido/detalle-pedido.controller.js', () => ({
  add: routeMocks.controller,
  findAll: routeMocks.controller,
  findOne: routeMocks.controller,
  update: routeMocks.controller,
  remove: routeMocks.controller,
  sanitizeDetallePedidoInput: routeMocks.pass,
}));
vi.mock('../comentario/comentario.controller.js', () => ({
  add: routeMocks.controller,
  findAll: routeMocks.controller,
  findOne: routeMocks.controller,
  update: routeMocks.controller,
  remove: routeMocks.controller,
  sanitizeComentarioInput: routeMocks.pass,
}));
vi.mock('../comentario/comentario.validator.js', () => ({
  validarComentarioInput: routeMocks.pass,
}));
vi.mock('../comentario/comentario.moderacion.js', () => ({
  moderarComentarioInput: routeMocks.pass,
}));
vi.mock('../categoria/categoria.controller.js', () => ({
  add: routeMocks.controller,
  findAll: routeMocks.controller,
  findOne: routeMocks.controller,
  update: routeMocks.controller,
  remove: routeMocks.controller,
  sanitizeCategoriaInput: routeMocks.pass,
}));
vi.mock('../categoria/categoria.validator.js', () => ({
  validarCategoriaInput: routeMocks.pass,
}));
vi.mock('../producto/producto.controller.js', () => ({
  add: routeMocks.controller,
  findAll: routeMocks.controller,
  findAllAdmin: routeMocks.controller,
  findOne: routeMocks.controller,
  update: routeMocks.controller,
  remove: routeMocks.controller,
  cambiarEstadoProducto: routeMocks.controller,
  sanitizeProductoInput: routeMocks.pass,
}));
vi.mock('../producto/producto.validator.js', () => ({
  validarProductoInput: routeMocks.pass,
}));
vi.mock('../producto/producto.upload.js', () => ({
  procesarImagenProducto: routeMocks.pass,
}));
vi.mock('../metodo-pago/metodo-pago.controller.js', () => ({
  add: routeMocks.controller,
  findAll: routeMocks.controller,
  findAllAdmin: routeMocks.controller,
  findOne: routeMocks.controller,
  update: routeMocks.controller,
  remove: routeMocks.controller,
  sanitizeMetodoPagoInput: routeMocks.pass,
}));
vi.mock('../metodo-pago/metodo-pago.validator.js', () => ({
  validarMetodoPagoInput: routeMocks.pass,
}));

import usuarioRoutes from '../usuario/usuario.routes.js';
import pedidoRoutes from '../pedido/pedido.routes.js';
import detallePedidoRoutes from '../detalle-pedido/detalle-pedido.routes.js';
import comentarioRoutes from '../comentario/comentario.routes.js';
import categoriaRoutes from '../categoria/categoria.routes.js';
import productoRoutes from '../producto/producto.routes.js';
import metodoPagoRoutes from '../metodo-pago/metodo-pago.routes.js';

const JWT_SECRET = 'secreto-rutas-admin-test';
const jwtSecretOriginal = process.env.JWT_SECRET;
let server: Server;
let baseUrl: string;

const tokenDe = (id: string, esAdmin = false) =>
  jwt.sign({ id, email: `${id}@test.com`, esAdmin }, JWT_SECRET, { expiresIn: '1h' });

async function solicitar(method: string, path: string, token?: string) {
  return fetch(`${baseUrl}${path}`, {
    method,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

beforeAll(async () => {
  process.env.JWT_SECRET = JWT_SECRET;
  const app = express();
  app.use('/api/usuario', usuarioRoutes);
  app.use('/api/pedido', pedidoRoutes);
  app.use('/api/detalle-pedido', detallePedidoRoutes);
  app.use('/api/comentario', comentarioRoutes);
  app.use('/api/categoria', categoriaRoutes);
  app.use('/api/producto', productoRoutes);
  app.use('/api/metodo-pago', metodoPagoRoutes);

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
});

beforeEach(() => {
  routeMocks.controller.mockClear();
});

describe('Autorización HTTP de rutas administrativas', () => {
  // Comprueba con los routers y guards reales que las rutas administrativas rechazan solicitudes sin token (401) 
  // y de usuarios comunes (403), y solo dejan continuar al admin; los controllers simulados aíslan la autorización.
  it.each([
    ['GET', '/api/usuario/'],
    ['GET', '/api/pedido/'],
    ['GET', '/api/detalle-pedido/'],
    ['DELETE', '/api/comentario/comentario-1'],
    ['DELETE', '/api/categoria/categoria-1'],
    ['GET', '/api/producto/admin/productos'],
    ['GET', '/api/metodo-pago/admin/metodos'],
  ])('%s %s requiere admin y responde 401/403/204 según el token', async (method, path) => {
    const sinToken = await solicitar(method, path);
    expect(sinToken.status).toBe(401);

    const usuarioComun = await solicitar(method, path, tokenDe('cliente-1'));
    expect(usuarioComun.status).toBe(403);
    expect(routeMocks.controller).not.toHaveBeenCalled();

    const admin = await solicitar(method, path, tokenDe('admin-1', true));
    expect(admin.status).toBe(204);
    expect(routeMocks.controller).toHaveBeenCalledOnce();
  });
});
