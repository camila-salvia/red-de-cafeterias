import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';

// Mocks: estos tests NO tocan MySQL.
// `orm.ts` hace `await MikroORM.init(...)` al importarse, así que se reemplaza
// completo por un `em` falso. Las entidades también se reemplazan para no
// depender de los decoradores de MikroORM.

const em = vi.hoisted(() => ({
  findOne: vi.fn(),
  create: vi.fn(),
  flush: vi.fn(),
  populate: vi.fn(),
}));

vi.mock('../shared/database/orm.js', () => ({ orm: { em } }));
vi.mock('../usuario/usuario.entity.js', () => ({ Usuario: class Usuario {} }));
vi.mock('../comentario/comentario.entity.js', () => ({ Comentario: class Comentario {} }));

import { validarComentarioInput } from '../comentario/comentario.validator.js';
import { add, sanitizeComentarioInput } from '../comentario/comentario.controller.js';
import { Usuario } from '../usuario/usuario.entity.js';
import { Comentario } from '../comentario/comentario.entity.js';


// Helpers
function crearRes() {
  const res = { status: vi.fn(), json: vi.fn(), send: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  res.send.mockReturnValue(res);
  return res;
}

const comoRes = (res: ReturnType<typeof crearRes>) => res as unknown as Response;

// Los datos van en `body` y también en `body.sanitizedInput`, que es lo que
// deja el middleware de sanitize antes de llegar al validator.
function crearReq(body: Record<string, unknown>) {
  return { body: { ...body, sanitizedInput: { ...body } }, params: {} } as unknown as Request;
}

// Comentario válido para pruebas
const comentarioValido = {
  contenido: 'Excelente café y muy buena atención',
  puntuacion: 5,
  usuario: 'user-1',
};

// Mock de la entidad Usuario para pruebas
beforeEach(() => {
  vi.resetAllMocks();
});

// Pruebas
describe('Comentario (backend)', () => {
  describe('creación válida', () => {
    it('el validator acepta un comentario válido y pasa al siguiente middleware', async () => {
      em.findOne.mockResolvedValue({ id: 'user-1' });
      const res = crearRes();
      const next = vi.fn();

      await validarComentarioInput(crearReq(comentarioValido), comoRes(res), next);

      expect(next).toHaveBeenCalledOnce();
      expect(res.status).not.toHaveBeenCalled();
    });

    it.each([1, 5])('acepta los extremos del rango (puntuación %i)', async (puntuacion) => {
      em.findOne.mockResolvedValue({ id: 'user-1' });
      const res = crearRes();
      const next = vi.fn();

      await validarComentarioInput(crearReq({ ...comentarioValido, puntuacion }), comoRes(res), next);

      expect(next).toHaveBeenCalledOnce();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('el controller persiste el comentario y responde 201 con el comentario creado', async () => {
      const input = {
        contenido: comentarioValido.contenido,
        fecha_publicacion: new Date('2026-11-06T12:00:00Z'),
        puntuacion: 4,
        usuario: 'user-1',
      };
      const creado = {
        id: 'comentario-1',
        ...input,
        usuario: { id: 'user-1', nombre: 'Camila' },
      };
      em.create.mockReturnValue(creado);
      em.flush.mockResolvedValue(undefined);
      em.populate.mockResolvedValue(undefined);
      const req = { body: { sanitizedInput: input } } as unknown as Request;
      const res = crearRes();

      await add(req, comoRes(res));

      expect(em.create).toHaveBeenCalledWith(Comentario, input);
      expect(em.flush).toHaveBeenCalledOnce();
      // primero se crea la entidad y después se hace flush a la base
      expect(em.create.mock.invocationCallOrder[0]).toBeLessThan(em.flush.mock.invocationCallOrder[0]);
      expect(em.populate).toHaveBeenCalledWith(creado, ['usuario']);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Comentario creado',
        data: {
          id: 'comentario-1',
          contenido: input.contenido,
          fecha_publicacion: input.fecha_publicacion,
          puntuacion: 4,
          usuario: { id: 'user-1', nombre: 'Camila' },
        },
      });
    });
  });

  
  describe('comentario opcional (reseña solo con estrellas)', () => {
    it.each([
      ['ausente', undefined],
      ['vacío', ''],
      ['solo espacios', '   '],
      ['nulo', null],
    ])('el validator acepta un comentario %s', async (_nombre, contenido) => {
      em.findOne.mockResolvedValue({ id: 'user-1' });
      const res = crearRes();
      const next = vi.fn();

      await validarComentarioInput(crearReq({ ...comentarioValido, contenido }), comoRes(res), next);

      expect(next).toHaveBeenCalledOnce();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('el validator rechaza con 400 un comentario que no es texto', async () => {
      const res = crearRes();
      const next = vi.fn();

      await validarComentarioInput(crearReq({ ...comentarioValido, contenido: 123 }), comoRes(res), next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Datos de comentario inválidos',
        errores: [expect.stringContaining('texto')],
      });
      expect(next).not.toHaveBeenCalled();
    });

    it.each([
      ['no viene', undefined, ''],
      ['viene vacío', '', ''],
      ['viene con espacios sobrantes', '  Muy rico  ', 'Muy rico'],
    ])('al crear, si el comentario %s se normaliza', (_nombre, entrada, esperado) => {
      const req = {
        method: 'POST',
        body: { puntuacion: 5, contenido: entrada },
        usuarioToken: { id: 'user-1', email: 'cliente@mail.com', esAdmin: false },
      } as unknown as Request;

      sanitizeComentarioInput(req, comoRes(crearRes()), vi.fn());

      expect(req.body.sanitizedInput.contenido).toBe(esperado);
    });

    it('al editar (PATCH) sin comentario no se pisa el existente', () => {
      const req = {
        method: 'PATCH',
        body: { puntuacion: 4 },
      } as unknown as Request;

      sanitizeComentarioInput(req, comoRes(crearRes()), vi.fn());

      expect(req.body.sanitizedInput).not.toHaveProperty('contenido');
    });
  });

  
  describe('puntuación fuera de rango', () => {
    it.each([
      ['cero', 0],
      ['seis', 6],
      ['negativa', -1],
      ['muy grande', 100],
      ['decimal', 3.5],
      ['texto', 'abc'],
      ['ausente', undefined],
      ['nula', null],
    ])('rechaza con 400 una puntuación %s (%s)', async (_nombre, puntuacion) => {
      const res = crearRes();
      const next = vi.fn();

      await validarComentarioInput(crearReq({ ...comentarioValido, puntuacion }), comoRes(res), next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Datos de comentario inválidos',
        errores: [expect.stringContaining('entre 1 y 5')],
      });
      expect(next).not.toHaveBeenCalled();
      // un dato inválido se corta antes de consultar la base
      expect(em.findOne).not.toHaveBeenCalled();
    });
  });

  describe('contenido inválido', () => {
    it.each([
      ['número', 123],
      ['objeto', { texto: 'hola' }],
      ['arreglo', ['hola']],
      ['booleano', true],
    ])('rechaza con 400 un contenido inválido (%s)', async (_nombre, contenido) => {
      const res = crearRes();
      const next = vi.fn();

      await validarComentarioInput(crearReq({ ...comentarioValido, contenido }), comoRes(res), next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Datos de comentario inválidos',
        errores: [expect.stringContaining('texto')],
      });
      expect(next).not.toHaveBeenCalled();
      expect(em.findOne).not.toHaveBeenCalled();
    });
  });


  describe('asociación a usuario', () => {
    it('verifica en la base el usuario indicado por id', async () => {
      em.findOne.mockResolvedValue({ id: 'user-1' });
      const next = vi.fn();

      await validarComentarioInput(crearReq(comentarioValido), comoRes(crearRes()), next);

      expect(em.findOne).toHaveBeenCalledWith(Usuario, { id: 'user-1' });
      expect(next).toHaveBeenCalledOnce();
    });

    it('acepta el usuario como objeto { id }', async () => {
      em.findOne.mockResolvedValue({ id: 'user-1' });
      const next = vi.fn();

      await validarComentarioInput(
        crearReq({ ...comentarioValido, usuario: { id: 'user-1' } }),
        comoRes(crearRes()),
        next,
      );

      expect(em.findOne).toHaveBeenCalledWith(Usuario, { id: 'user-1' });
      expect(next).toHaveBeenCalledOnce();
    });

    it('rechaza con 400 un comentario sin usuario', async () => {
      const res = crearRes();
      const next = vi.fn();

      await validarComentarioInput(crearReq({ ...comentarioValido, usuario: undefined }), comoRes(res), next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Datos de comentario inválidos',
        errores: [expect.stringContaining('usuario')],
      });
      expect(next).not.toHaveBeenCalled();
      expect(em.findOne).not.toHaveBeenCalled();
    });

    it('rechaza con 404 si el usuario no existe en la base', async () => {
      em.findOne.mockResolvedValue(null);
      const res = crearRes();
      const next = vi.fn();

      await validarComentarioInput(crearReq({ ...comentarioValido, usuario: 'no-existe' }), comoRes(res), next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'El usuario especificado no existe.' });
      expect(next).not.toHaveBeenCalled();
    });

    it('el controller crea el comentario asociado al usuario recibido', async () => {
      const input = {
        contenido: comentarioValido.contenido,
        fecha_publicacion: new Date(),
        puntuacion: 5,
        usuario: 'user-1',
      };
      em.create.mockReturnValue({ id: 'comentario-1', ...input });
      em.flush.mockResolvedValue(undefined);
      const req = { body: { sanitizedInput: input } } as unknown as Request;

      await add(req, comoRes(crearRes()));

      expect(em.create).toHaveBeenCalledWith(
        Comentario,
        expect.objectContaining({ usuario: 'user-1' }),
      );
    });

    it('al crear, el usuario sale del token y se ignora el que venga en el body', () => {
      const req = {
        method: 'POST',
        body: { ...comentarioValido, usuario: 'otro-usuario' },
        usuarioToken: { id: 'user-1', email: 'cliente@mail.com', esAdmin: false },
      } as unknown as Request;
      const next = vi.fn();

      sanitizeComentarioInput(req, comoRes(crearRes()), next);

      expect(req.body.sanitizedInput.usuario).toBe('user-1');
      expect(req.body.sanitizedInput.fecha_publicacion).toBeInstanceOf(Date);
      expect(next).toHaveBeenCalledOnce();
    });

    it('valida la identidad inyectada por el token sin requerir usuario en el body', async () => {
      const req = {
        method: 'POST',
        body: { puntuacion: 5, contenido: 'Buen café', usuario: 'otro-usuario' },
        usuarioToken: { id: 'user-1', email: 'cliente@mail.com', esAdmin: false },
      } as unknown as Request;
      const res = crearRes();
      const next = vi.fn();
      em.findOne.mockResolvedValue({ id: 'user-1' });

      sanitizeComentarioInput(req, comoRes(res), vi.fn());
      await validarComentarioInput(req, comoRes(res), next);

      expect(em.findOne).toHaveBeenCalledWith(Usuario, { id: 'user-1' });
      expect(next).toHaveBeenCalledOnce();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});