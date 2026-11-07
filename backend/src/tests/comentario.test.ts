import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';

const em = vi.hoisted(() => ({
  findOne: vi.fn(),
  getReference: vi.fn(),
  create: vi.fn(),
  flush: vi.fn(),
}));

vi.mock('../shared/database/orm.js', () => ({ orm: { em } }));
vi.mock('../usuario/usuario.entity.js', () => ({ Usuario: class Usuario {} }));
vi.mock('../comentario/comentario.entity.js', () => ({ Comentario: class Comentario {} }));

import { validarComentarioInput } from '../comentario/comentario.validator.js';
import { add, sanitizeComentarioInput } from '../comentario/comentario.controller.js';
import { Usuario } from '../usuario/usuario.entity.js';
import { Comentario } from '../comentario/comentario.entity.js';

function crearRes() {
  const res = { status: vi.fn(), json: vi.fn(), send: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  res.send.mockReturnValue(res);
  return res;
}

const comoRes = (res: ReturnType<typeof crearRes>) => res as unknown as Response;

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
  em.getReference.mockImplementation((_entity: unknown, id: string) => ({ id }));
});

// Pruebas
describe('Comentario (backend)', () => {
  describe('validación del input', () => {
    it('acepta un comentario válido y pasa al siguiente middleware', async () => {
      const res = crearRes();
      const next = vi.fn();

      await validarComentarioInput(crearReq(comentarioValido), comoRes(res), next);

      expect(next).toHaveBeenCalledOnce();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('usa el payload saneado cuando viene en req.body.sanitizedInput', async () => {
      const res = crearRes();
      const next = vi.fn();

      await validarComentarioInput(
        { body: { sanitizedInput: { contenido: 'Muy rico', puntuacion: 3 } } } as unknown as Request,
        comoRes(res),
        next,
      );

      expect(next).toHaveBeenCalledOnce();
      expect(res.status).not.toHaveBeenCalled();
    });

    it.each([1, 5])('acepta los extremos del rango (puntuación %i)', async (puntuacion) => {
      const res = crearRes();
      const next = vi.fn();

      await validarComentarioInput(crearReq({ ...comentarioValido, puntuacion }), comoRes(res), next);

      expect(next).toHaveBeenCalledOnce();
      expect(res.status).not.toHaveBeenCalled();
    });

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
    });

    it('rechaza con 400 si el contenido está vacío', async () => {
      const res = crearRes();
      const next = vi.fn();

      await validarComentarioInput(crearReq({ ...comentarioValido, contenido: '' }), comoRes(res), next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Datos de comentario inválidos',
        errores: [expect.stringContaining('contenido')],
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('sanitización y creación', () => {
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

    it('el controller persiste el comentario y responde 201 con el comentario creado', async () => {
      const input = {
        contenido: comentarioValido.contenido,
        fecha_publicacion: new Date('2026-11-06T12:00:00Z'),
        puntuacion: 4,
        usuario: 'user-1',
      };
      const usuarioRef = { id: 'user-1' };
      const creado = { id: 'comentario-1', ...input };

      em.getReference.mockReturnValue(usuarioRef);
      em.create.mockReturnValue(creado);
      em.flush.mockResolvedValue(undefined);

      const req = { body: { sanitizedInput: input } } as unknown as Request;
      const res = crearRes();

      await add(req, comoRes(res));

      expect(em.getReference).toHaveBeenCalledWith(Usuario, 'user-1');
      expect(em.create).toHaveBeenCalledWith(
        Comentario,
        expect.objectContaining({
          contenido: input.contenido,
          puntuacion: input.puntuacion,
          usuario: usuarioRef,
        }),
      );
      expect(em.flush).toHaveBeenCalledOnce();
      expect(em.create.mock.invocationCallOrder[0]).toBeLessThan(em.flush.mock.invocationCallOrder[0]);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Comentario creado', data: creado });
    });
  });
});