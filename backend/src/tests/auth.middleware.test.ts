import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import express from 'express';
import jwt from 'jsonwebtoken';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { propietarioOAdmin, soloAdmin, verificarToken } from '../shared/middleware/auth.middleware.js';

const SECRET = 'secreto-de-autorizacion-test';
const jwtSecretOriginal = process.env.JWT_SECRET;
let server: Server;
let baseUrl: string;

const tokenDe = (id: string, esAdmin = false) =>
  jwt.sign({ id, email: `${id}@test.com`, esAdmin }, SECRET, { expiresIn: '1h' });

async function consultar(ruta: string, token?: string) {
  const respuesta = await fetch(`${baseUrl}${ruta}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return { status: respuesta.status, texto: await respuesta.text() };
}

beforeAll(async () => {
  process.env.JWT_SECRET = SECRET;
  const app = express();
  app.get('/usuarios/:id', verificarToken, propietarioOAdmin(), (req, res) => {
    return res.status(200).json({ usuario: req.usuarioToken?.id });
  });
  app.get('/pedidos/usuario/:usuarioId', verificarToken, propietarioOAdmin('usuarioId'), (req, res) => {
    return res.status(200).json({ usuario: req.usuarioToken?.id });
  });
  app.get('/admin', verificarToken, soloAdmin, (_req, res) => res.sendStatus(204));

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

describe('middlewares de autorización', () => {
  it('verificarToken rechaza solicitudes sin token o con token inválido', async () => {
    expect((await consultar('/usuarios/cliente-a')).status).toBe(401);
    expect((await consultar('/usuarios/cliente-a', 'token-invalido')).status).toBe(401);
  });

  it('propietarioOAdmin permite al propietario y al administrador, pero no a otro usuario', async () => {
    expect((await consultar('/usuarios/cliente-a', tokenDe('cliente-a'))).status).toBe(200);
    expect((await consultar('/usuarios/cliente-a', tokenDe('cliente-b'))).status).toBe(403);
    expect((await consultar('/usuarios/cliente-a', tokenDe('admin', true))).status).toBe(200);
  });

  it('propietarioOAdmin respeta el parámetro usuarioId usado por la ruta de pedidos', async () => {
    expect((await consultar('/pedidos/usuario/cliente-a', tokenDe('cliente-a'))).status).toBe(200);
    expect((await consultar('/pedidos/usuario/cliente-a', tokenDe('cliente-b'))).status).toBe(403);
    expect((await consultar('/pedidos/usuario/cliente-a', tokenDe('admin', true))).status).toBe(200);
  });

  it('soloAdmin rechaza a clientes y permite al administrador', async () => {
    expect((await consultar('/admin')).status).toBe(401);
    expect((await consultar('/admin', tokenDe('cliente-a'))).status).toBe(403);
    expect((await consultar('/admin', tokenDe('admin', true))).status).toBe(204);
  });
});
