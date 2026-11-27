import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import express from 'express';
import jwt from 'jsonwebtoken';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { Request, Response } from 'express';
import { NotFoundError } from '@mikro-orm/core';

// Mockear el ORM, las entidades y bcrypt antes de importar validador y controller
const em = vi.hoisted(() => ({
  find: vi.fn(),
  findOne: vi.fn(),
  findOneOrFail: vi.fn(),
  create: vi.fn(),
  assign: vi.fn(),
  flush: vi.fn(),
  removeAndFlush: vi.fn(),
}));

const bcryptMock = vi.hoisted(() => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

vi.mock('../shared/database/orm.js', () => ({ orm: { em } }));
vi.mock('../usuario/usuario.entity.js', () => ({ Usuario: class Usuario {} }));
vi.mock('bcrypt', () => ({ default: bcryptMock }));

import { validarUsuarioInput } from '../usuario/usuario.validator.js';
import { add, findOne, login, sanitizeUsuarioInput } from '../usuario/usuario.controller.js';
import usuarioRoutes from '../usuario/usuario.routes.js';

// Helpers para simular Express (Response y Request)
function crearRes() {
  const res = { status: vi.fn(), json: vi.fn(), send: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  res.send.mockReturnValue(res);
  return res;
}

const comoRes = (res: ReturnType<typeof crearRes>) => res as unknown as Response;

function crearReq(
  body: Record<string, unknown> = {},
  params: Record<string, unknown> = {},
  method = 'POST'
) {
  return { body: { ...body }, params, query: {}, method } as unknown as Request;
}

const usuarioValido = {
  nombre: 'Juan',
  apellido: 'Pérez',
  email: 'juan@test.com',
  password: 'password123',
  telefono: '3415551234',
  direccion: 'Calle Falsa 123',
};

const nodeEnvOriginal = process.env.NODE_ENV;
const jwtSecretOriginal = process.env.JWT_SECRET;
const JWT_SECRET = 'secreto-de-test';
let server: Server;
let baseUrl: string;

const tokenDe = (id: string, esAdmin = false) =>
  jwt.sign({ id, email: `${id}@test.com`, esAdmin }, JWT_SECRET, { expiresIn: '1h' });

async function consultarUsuario(id: string, token?: string) {
  const respuesta = await fetch(`${baseUrl}/api/usuario/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return { status: respuesta.status, json: await respuesta.json() as any };
}

beforeAll(async () => {
  process.env.JWT_SECRET = JWT_SECRET;
  const app = express();
  app.use('/api/usuario', usuarioRoutes);
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
  vi.resetAllMocks();
  process.env.NODE_ENV = 'production';
  process.env.JWT_SECRET = JWT_SECRET;
  bcryptMock.hash.mockResolvedValue('$2b$10$hashDeTest');
  // Evita ensuciar la salida con los console.error de los catch del controller
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  process.env.NODE_ENV = nodeEnvOriginal;
  vi.restoreAllMocks();
});

describe('Usuario - Tests unitarios', () => {

  describe('Autorización de la ruta GET /:id', () => {
    it('rechaza una solicitud sin token (401)', async () => {
      const { status } = await consultarUsuario('u-1');

      expect(status).toBe(401);
      expect(em.findOneOrFail).not.toHaveBeenCalled();
    });

    it('permite al propietario consultar su usuario', async () => {
      em.findOneOrFail.mockResolvedValueOnce({ id: 'u-1', nombre: 'Juan' });

      const { status } = await consultarUsuario('u-1', tokenDe('u-1'));

      expect(status).toBe(200);
      expect(em.findOneOrFail).toHaveBeenCalledOnce();
    });

    it('rechaza a otro usuario y permite al administrador', async () => {
      const ajeno = await consultarUsuario('u-1', tokenDe('u-2'));
      expect(ajeno.status).toBe(403);
      expect(em.findOneOrFail).not.toHaveBeenCalled();

      em.findOneOrFail.mockResolvedValueOnce({ id: 'u-1', nombre: 'Juan' });
      const admin = await consultarUsuario('u-1', tokenDe('admin', true));

      expect(admin.status).toBe(200);
      expect(em.findOneOrFail).toHaveBeenCalledOnce();
    });
  });

  // Validación de datos
  describe('Validación del input', () => {

    // Caso 1 - Alta válida
    it('Acepta un usuario con datos válidos y email no registrado', async () => {
      const res = crearRes();
      const next = vi.fn();
      em.findOne.mockResolvedValueOnce(null);

      await validarUsuarioInput(crearReq(usuarioValido), comoRes(res), next);

      expect(next).toHaveBeenCalledOnce();
      expect(res.status).not.toHaveBeenCalled();
    });

    // Caso 2 - Validación de datos
    it('Rechaza con 400 un usuario con datos inválidos y no consulta la base', async () => {
      const res = crearRes();
      const next = vi.fn();

      await validarUsuarioInput(
        crearReq({
          nombre: 'J',
          apellido: '',
          email: 'no-es-un-email',
          password: '123',
          telefono: 'abc',
          direccion: 'x',
        }),
        comoRes(res),
        next
      );

      expect(res.status).toHaveBeenCalledWith(400);
      const respuesta = res.json.mock.calls[0][0];
      expect(respuesta.errores).toHaveLength(6);
      expect(next).not.toHaveBeenCalled();
      expect(em.findOne).not.toHaveBeenCalled();
    });

    it('Rechaza con 400 un alta con campos faltantes', async () => {
      const res = crearRes();
      const next = vi.fn();

      await validarUsuarioInput(crearReq({ email: 'juan@test.com' }), comoRes(res), next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it('En una actualización parcial solo valida los campos enviados', async () => {
      const res = crearRes();
      const next = vi.fn();

      await validarUsuarioInput(
        crearReq({ nombre: 'Pedro' }, { id: 'u-1' }, 'PATCH'),
        comoRes(res),
        next
      );

      expect(next).toHaveBeenCalledOnce();
      expect(res.status).not.toHaveBeenCalled();
    });

    // Caso 3 - Email duplicado
    it('Rechaza con 409 si el email ya está registrado', async () => {
      const res = crearRes();
      const next = vi.fn();
      em.findOne.mockResolvedValueOnce({ id: 'u-existente', email: usuarioValido.email });

      await validarUsuarioInput(crearReq(usuarioValido), comoRes(res), next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'El correo electrónico ya se encuentra registrado.' });
      expect(next).not.toHaveBeenCalled();
    });

    it('Al actualizar excluye al propio usuario de la búsqueda de duplicados', async () => {
      const res = crearRes();
      const next = vi.fn();
      em.findOne.mockResolvedValueOnce(null);

      await validarUsuarioInput(
        crearReq({ email: 'juan@test.com' }, { id: 'u-1' }, 'PUT'),
        comoRes(res),
        next
      );

      expect(em.findOne).toHaveBeenCalledWith(expect.anything(), {
        email: 'juan@test.com',
        id: { $ne: 'u-1' },
      });
      expect(next).toHaveBeenCalledOnce();
    });
  });

  // Sanitización
  describe('Sanitización', () => {
    it('Descarta esAdmin y campos desconocidos para evitar escalada de privilegios', () => {
      const req = crearReq({ ...usuarioValido, esAdmin: true, otroCampo: 'x' });
      const next = vi.fn();

      sanitizeUsuarioInput(req, comoRes(crearRes()), next);

      expect(req.body.sanitizedInput).toEqual(usuarioValido);
      expect(req.body.sanitizedInput).not.toHaveProperty('esAdmin');
      expect(next).toHaveBeenCalledOnce();
    });
  });

  // Alta
  describe('Alta de usuario', () => {
    it('Crea el usuario con la contraseña hasheada y responde 201', async () => {
      const res = crearRes();
      const creado = { id: 'u-1', ...usuarioValido, password: '$2b$10$hashDeTest' };
      em.create.mockReturnValueOnce(creado);
      em.flush.mockResolvedValueOnce(undefined);

      await add(crearReq({ sanitizedInput: { ...usuarioValido } }), comoRes(res));

      expect(bcryptMock.hash).toHaveBeenCalledWith('password123', 10);
      expect(em.create).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ email: 'juan@test.com', password: '$2b$10$hashDeTest' })
      );
      expect(em.flush).toHaveBeenCalledOnce();
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  // Consulta
  describe('Consulta de usuario', () => {
    it('Devuelve 200 con el usuario cuando existe', async () => {
      const res = crearRes();
      const usuario = { id: 'u-1', ...usuarioValido };
      em.findOneOrFail.mockResolvedValueOnce(usuario);

      await findOne(crearReq({}, { id: 'u-1' }, 'GET'), comoRes(res));

      expect(em.findOneOrFail).toHaveBeenCalledWith(expect.anything(), { id: 'u-1' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuario encontrado', data: usuario });
    });

    it('Devuelve 404 cuando el usuario no existe', async () => {
      const res = crearRes();
      em.findOneOrFail.mockRejectedValueOnce(new NotFoundError('no encontrado'));

      await findOne(crearReq({}, { id: 'inexistente' }, 'GET'), comoRes(res));

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuario no encontrado' });
    });
  });

  // Login
  describe('Login', () => {
    it('Devuelve 400 si faltan email o contraseña', async () => {
      const res = crearRes();

      await login(crearReq({ email: 'juan@test.com' }), comoRes(res));

      expect(res.status).toHaveBeenCalledWith(400);
      expect(em.findOne).not.toHaveBeenCalled();
    });

    it('Devuelve 401 si el email no existe', async () => {
      const res = crearRes();
      em.findOne.mockResolvedValueOnce(null);

      await login(crearReq({ email: 'nadie@test.com', password: 'password123' }), comoRes(res));

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('Devuelve 401 si la contraseña hasheada no coincide', async () => {
      const res = crearRes();
      em.findOne.mockResolvedValueOnce({ id: 'u-1', email: 'juan@test.com', password: '$2b$10$hash' });
      bcryptMock.compare.mockResolvedValueOnce(false);

      await login(crearReq({ email: 'juan@test.com', password: 'incorrecta' }), comoRes(res));

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('Devuelve 200 con token y sin exponer la contraseña si las credenciales son válidas', async () => {
      const res = crearRes();
      em.findOne.mockResolvedValueOnce({
        id: 'u-1',
        nombre: 'Juan',
        email: 'juan@test.com',
        esAdmin: false,
        password: '$2b$10$hash',
      });
      bcryptMock.compare.mockResolvedValueOnce(true);

      await login(crearReq({ email: 'juan@test.com', password: 'password123' }), comoRes(res));

      expect(res.status).toHaveBeenCalledWith(200);
      const { data } = res.json.mock.calls[0][0];
      expect(data.token).toEqual(expect.any(String));
      expect(data).not.toHaveProperty('password');
    });
  });
});
