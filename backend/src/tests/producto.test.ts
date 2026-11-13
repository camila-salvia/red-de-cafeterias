import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';
import { NotFoundError } from '@mikro-orm/core';

// Mockear el ORM y las entidades antes de importarlas
const em = vi.hoisted(() => ({
  find: vi.fn(),
  findOne: vi.fn(),
  findOneOrFail: vi.fn(),
  getReference: vi.fn(),
  create: vi.fn(),
  assign: vi.fn(),
  flush: vi.fn(),
}));

vi.mock('../shared/database/orm.js', () => ({ orm: { em } }));
vi.mock('../categoria/categoria.entity.js', () => ({ Categoria: class Categoria {} }));
vi.mock('../producto/producto.entity.js', () => ({ Producto: class Producto {} }));

import { validarProductoInput } from '../producto/producto.validator.js';
import { add, findAll, findAllAdmin, findOne, update, remove, cambiarEstadoProducto, sanitizeProductoInput } from '../producto/producto.controller.js';
import { Categoria } from '../categoria/categoria.entity.js';
import { Producto } from '../producto/producto.entity.js';

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
  body: Record<string, unknown>, 
  query: Record<string, unknown> = {},
  params: Record<string, unknown> = {}
) {
  return { body: { ...body }, query, params } as unknown as Request;
}

const productoValido = {
  nombre: 'Café Expresso',
  descripcion: 'Café negro fuerte',
  precio: 3500,
  categoria: 'bebidas',
};

beforeEach(() => {
  vi.resetAllMocks();
  em.getReference.mockImplementation((_entity: unknown, id: string) => ({ id }));
  // Evita ensuciar la salida con los console.error de los catch del controller
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('Producto - Tests unitarios', () => {

  // Validación de input
  describe('Validación del input', () => {

    // Caso 1 - Categoria existente
    it('Acepta un producto válido cuando la categoría existe', async () => {
      const res = crearRes();
      const next = vi.fn();

      em.findOne.mockResolvedValueOnce({ id: 'cat-1', nombre: 'Bebidas' });

      await validarProductoInput(crearReq(productoValido), comoRes(res), next);

      expect(next).toHaveBeenCalledOnce();
      expect(res.status).not.toHaveBeenCalled();
    });

    // Caso 2 - Categoria inexistente. Debe retornar 404.
    it('Rechaza con 404 si la categoría especificada no existe', async () => {
      const res = crearRes();
      const next = vi.fn();

      // la categoría no existe (retorna null)
      em.findOne.mockResolvedValueOnce(null);

      await validarProductoInput(crearReq(productoValido), comoRes(res), next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'La categoría especificada no existe.' })
      );
      expect(next).not.toHaveBeenCalled();
    });

    // Caso 3 - Precio inválido. Debe retornar 400.
    it.each([0, -500, 'abc', undefined, null])('rechaza con 400 un precio inválido (%s)', async (precioInvalido) => {
      const res = crearRes();
      const next = vi.fn();

      await validarProductoInput(crearReq({ ...productoValido, precio: precioInvalido }), comoRes(res), next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Datos de producto inválidos.',
          errores: expect.arrayContaining([expect.stringContaining('precio')]),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

// Sanitización
  describe('Sanitización', () => {

    it('Sanitiza correctamente los campos permitidos del producto', () => {
      const req = {
        method: 'POST',
        body: { ...productoValido, campoMalicioso: 'inyectado' },
      } as unknown as Request;
      const next = vi.fn();

      sanitizeProductoInput(req, comoRes(crearRes()), next);

      expect(req.body.sanitizedInput).toEqual({
        nombre: productoValido.nombre,
        descripcion: productoValido.descripcion,
        precio: productoValido.precio,
        categoria: productoValido.categoria,
      });
      expect(next).toHaveBeenCalledOnce();
    });

    // Caso donde el input tiene campos undefined. Debe eliminarlos.
    it('Elimina las claves undefined del input sanitizado', () => {
      const req = { body: { nombre: 'Solo nombre' } } as unknown as Request;
      const next = vi.fn();

      sanitizeProductoInput(req, comoRes(crearRes()), next);

      expect(req.body.sanitizedInput).toEqual({ nombre: 'Solo nombre' });
      expect(req.body.sanitizedInput).not.toHaveProperty('precio');
      expect(next).toHaveBeenCalledOnce();
    });
  });

// Creación
  describe('Creación de producto', () => {

    // Creación exitosa
    it('El controller persiste el producto y responde 201', async () => {
      const inputSanitized = { ...productoValido };
      const productoCreado = { id: 'prod-1', ...inputSanitized };

      em.create.mockReturnValue(productoCreado);
      em.flush.mockResolvedValue(undefined);

      const req = { body: { sanitizedInput: inputSanitized } } as unknown as Request;
      const res = crearRes();

      await add(req, comoRes(res));

      // La categoría debe convertirse en referencia
      expect(em.getReference).toHaveBeenCalledWith(Categoria, 'bebidas');
      expect(em.create).toHaveBeenCalledWith(Producto, {
        ...inputSanitized,
        categoria: { id: 'bebidas' },
      });
      expect(em.flush).toHaveBeenCalledOnce();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Producto creado exitosamente',
        data: productoCreado,
      });
    });

    // Caso donde la categoría se pasa como objeto { id }. Debe aceptar y convertirlo en referencia.
    it('Acepta la categoría como objeto { id }', async () => {
      const input = { ...productoValido, categoria: { id: 'cat-9' } };
      em.create.mockReturnValue({ id: 'prod-1', ...input });
      em.flush.mockResolvedValue(undefined);

      const req = { body: { sanitizedInput: input } } as unknown as Request;
      const res = crearRes();

      await add(req, comoRes(res));

      expect(em.getReference).toHaveBeenCalledWith(Categoria, 'cat-9');
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  // Caso donde no se envía la categoría 
  it('Responde 400 si no se envía la categoría', async () => {
      const { categoria, ...sinCategoria } = productoValido;
      const req = { body: { sanitizedInput: sinCategoria } } as unknown as Request;
      const res = crearRes();

      await add(req, comoRes(res));

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'La categoría es obligatoria' });
      expect(em.create).not.toHaveBeenCalled();
      expect(em.flush).not.toHaveBeenCalled();
    });

    // Caso donde la categoría se pasa como objeto vacío
    it('Responde 400 si la categoría es un objeto sin id', async () => {
      const input = { ...productoValido, categoria: {} };
      const req = { body: { sanitizedInput: input } } as unknown as Request;
      const res = crearRes();

      await add(req, comoRes(res));

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'El ID de la categoría es inválido o no fue proporcionado',
      });
      expect(em.create).not.toHaveBeenCalled();
    });

    // Caso donde el flush falla (simulando un error de base de datos)
    it('Responde 500 si falla el flush', async () => {
      em.create.mockReturnValue({ id: 'prod-1', ...productoValido });
      em.flush.mockRejectedValueOnce(new Error('fallo de base de datos'));

      const req = { body: { sanitizedInput: { ...productoValido } } } as unknown as Request;
      const res = crearRes();

      await add(req, comoRes(res));

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Error al crear producto',
          detalle: 'fallo de base de datos',
        })
      );
    });
});

describe('Read - findAll', () => {
    it('Devuelve todos los productos activos si no se envía categoría', async () => {
      const productos = [{ id: 'prod-1' }, { id: 'prod-2' }];
      em.find.mockResolvedValueOnce(productos);
      const res = crearRes();

      await findAll(crearReq({}), comoRes(res));

      expect(em.find).toHaveBeenCalledOnce();
      expect(em.find).toHaveBeenCalledWith(
        Producto,
        { activo: true },
        { populate: ['categoria'] }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Todos los productos', data: productos });
    });

    it("Devuelve todos los productos activos si la categoría es 'TODO'", async () => {
      const productos = [{ id: 'prod-1' }];
      em.find.mockResolvedValueOnce(productos);
      const res = crearRes();

      await findAll(crearReq({}, { categoria: 'TODO' }), comoRes(res));

      expect(em.find).toHaveBeenCalledOnce();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Todos los productos', data: productos });
    });

    it('Filtra correctamente los productos cuando se envía una categoría por query params', async () => {
      const req = crearReq({}, { categoria: 'Bebidas' });
      const res = crearRes();

      const categoriasEncontradas = [{ id: 'cat-1', nombre: 'Bebidas calientes' }];
      const productosFiltrados = [
        { id: 'prod-1', nombre: 'Café', categoria: categoriasEncontradas[0] },
      ];

      em.find
        .mockResolvedValueOnce(categoriasEncontradas) // 1ª llamada: busca categorías
        .mockResolvedValueOnce(productosFiltrados); // 2ª llamada: busca productos

      await findAll(req, comoRes(res));

      expect(em.find).toHaveBeenCalledTimes(2);
      // El texto se normaliza a minúsculas para el $like
      expect(em.find).toHaveBeenNthCalledWith(1, Categoria, {
        nombre: { $like: '%bebidas%' },
      });
      expect(em.find).toHaveBeenNthCalledWith(
        2,
        Producto,
        { categoria: { $in: categoriasEncontradas }, activo: true },
        { populate: ['categoria'] }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Productos filtrados', data: productosFiltrados })
      );
    });

    it('Devuelve lista vacía si ninguna categoría coincide', async () => {
      em.find.mockResolvedValueOnce([]);
      const res = crearRes();

      await findAll(crearReq({}, { categoria: 'inexistente' }), comoRes(res));

      expect(em.find).toHaveBeenCalledOnce(); // no llega a buscar productos
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Sin productos para esa categoría',
        data: [],
      });
    });

    it('Responde 500 si falla la base de datos', async () => {
      em.find.mockRejectedValueOnce(new Error('db caída'));
      const res = crearRes();

      await findAll(crearReq({}), comoRes(res));

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error al obtener productos',
        error: 'db caída',
      });
    });
  });

// Read
  describe('Read - findAllAdmin', () => {
    it('Devuelve todos los productos sin filtrar por activo', async () => {
      const productos = [
        { id: 'prod-1', activo: true },
        { id: 'prod-2', activo: false },
      ];
      em.find.mockResolvedValueOnce(productos);
      const res = crearRes();

      await findAllAdmin(crearReq({}), comoRes(res));

      expect(em.find).toHaveBeenCalledWith(Producto, {}, { populate: ['categoria'] });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Listado completo de productos (admin)',
        data: productos,
      });
    });

    it('Responde 500 si falla la base de datos', async () => {
      em.find.mockRejectedValueOnce(new Error('db caída'));
      const res = crearRes();

      await findAllAdmin(crearReq({}), comoRes(res));

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error al obtener productos',
        error: 'db caída',
      });
    });
  });

  describe('Read - findOne', () => {
    it('Devuelve el producto activo y responde 200', async () => {
      const producto = { id: 'prod-1', nombre: 'Café', activo: true };
      em.findOneOrFail.mockResolvedValueOnce(producto);
      const res = crearRes();

      await findOne(crearReq({}, {}, { id: 'prod-1' }), comoRes(res));

      expect(em.findOneOrFail).toHaveBeenCalledWith(
        Producto,
        { id: 'prod-1', activo: true },
        { populate: ['categoria'] }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Producto encontrado', data: producto });
    });

    it('Responde 404 si el producto no existe o está inactivo', async () => {
      em.findOneOrFail.mockRejectedValueOnce(new NotFoundError('no encontrado'));
      const res = crearRes();

      await findOne(crearReq({}, {}, { id: 'nada' }), comoRes(res));

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Producto no encontrado' });
    });

    it('Responde 500 ante un error inesperado', async () => {
      em.findOneOrFail.mockRejectedValueOnce(new Error('db caída'));
      const res = crearRes();

      await findOne(crearReq({}, {}, { id: 'prod-1' }), comoRes(res));

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error al obtener producto',
        detalle: 'db caída',
      });
    });
  });

// UPDATE 
  describe('Update - update', () => {
    it('Actualiza el producto y responde 200', async () => {
      const producto = { id: 'prod-1', nombre: 'Viejo' };
      em.findOneOrFail.mockResolvedValueOnce(producto);
      em.flush.mockResolvedValue(undefined);

      const req = crearReq({ sanitizedInput: { nombre: 'Nuevo' } }, {}, { id: 'prod-1' });
      const res = crearRes();

      await update(req, comoRes(res));

      expect(em.findOneOrFail).toHaveBeenCalledWith(Producto, { id: 'prod-1' });
      expect(em.assign).toHaveBeenCalledWith(producto, { nombre: 'Nuevo' });
      expect(em.flush).toHaveBeenCalledOnce();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Producto actualizado', data: producto });
    });

    it('Convierte la categoría (string) en referencia', async () => {
      const producto = { id: 'prod-1' };
      em.findOneOrFail.mockResolvedValueOnce(producto);
      em.flush.mockResolvedValue(undefined);

      const req = crearReq({ sanitizedInput: { categoria: 'cat-2' } }, {}, { id: 'prod-1' });

      await update(req, comoRes(crearRes()));

      expect(em.getReference).toHaveBeenCalledWith(Categoria, 'cat-2');
      expect(em.assign).toHaveBeenCalledWith(producto, { categoria: { id: 'cat-2' } });
    });

    it('Convierte la categoría (objeto { id }) en referencia', async () => {
      const producto = { id: 'prod-1' };
      em.findOneOrFail.mockResolvedValueOnce(producto);
      em.flush.mockResolvedValue(undefined);

      const req = crearReq(
        { sanitizedInput: { categoria: { id: 'cat-3' } } },
        {},
        { id: 'prod-1' }
      );

      await update(req, comoRes(crearRes()));

      expect(em.getReference).toHaveBeenCalledWith(Categoria, 'cat-3');
      expect(em.assign).toHaveBeenCalledWith(producto, { categoria: { id: 'cat-3' } });
    });

    it('Responde 404 si el producto no existe', async () => {
      em.findOneOrFail.mockRejectedValueOnce(new NotFoundError('no encontrado'));
      const res = crearRes();

      await update(crearReq({}, {}, { id: 'nada' }), comoRes(res));

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Producto no encontrado' });
      expect(em.flush).not.toHaveBeenCalled();
    });

    it('Responde 500 ante un error inesperado', async () => {
      em.findOneOrFail.mockResolvedValueOnce({ id: 'prod-1' });
      em.flush.mockRejectedValueOnce(new Error('fallo de base de datos'));
      const res = crearRes();

      await update(
        crearReq({ sanitizedInput: { nombre: 'X' } }, {}, { id: 'prod-1' }),
        comoRes(res)
      );

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error al actualizar producto',
        detalle: 'fallo de base de datos',
      });
    });
  });

  // DELETE 
  describe('Delete - remove', () => {
    it('Hace baja lógica (activo = false) y responde 200', async () => {
      const producto = { id: 'prod-1', activo: true };
      em.findOneOrFail.mockResolvedValueOnce(producto);
      em.flush.mockResolvedValue(undefined);
      const res = crearRes();

      await remove(crearReq({}, {}, { id: 'prod-1' }), comoRes(res));

      expect(producto.activo).toBe(false);
      expect(em.flush).toHaveBeenCalledOnce();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ message: 'Producto eliminado' });
    });

    it('Responde 404 si el producto no existe', async () => {
      em.findOneOrFail.mockRejectedValueOnce(new NotFoundError('no encontrado'));
      const res = crearRes();

      await remove(crearReq({}, {}, { id: 'nada' }), comoRes(res));

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Producto no encontrado' });
      expect(em.flush).not.toHaveBeenCalled();
    });

    it('Responde 500 ante un error inesperado', async () => {
      em.findOneOrFail.mockResolvedValueOnce({ id: 'prod-1', activo: true });
      em.flush.mockRejectedValueOnce(new Error('fallo de base de datos'));
      const res = crearRes();

      await remove(crearReq({}, {}, { id: 'prod-1' }), comoRes(res));

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error al eliminar producto',
        detalle: 'fallo de base de datos',
      });
    });
  });

  describe('Delete - cambiarEstadoProducto', () => {
    it('Desactiva un producto activo', async () => {
      const producto = { id: 'prod-1', activo: true };
      em.findOneOrFail.mockResolvedValueOnce(producto);
      em.flush.mockResolvedValue(undefined);
      const res = crearRes();

      await cambiarEstadoProducto(crearReq({}, {}, { id: 'prod-1' }), comoRes(res));

      expect(producto.activo).toBe(false);
      expect(em.flush).toHaveBeenCalledOnce();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Producto desactivado correctamente',
        data: producto,
      });
    });

    it('Activa un producto inactivo', async () => {
      const producto = { id: 'prod-1', activo: false };
      em.findOneOrFail.mockResolvedValueOnce(producto);
      em.flush.mockResolvedValue(undefined);
      const res = crearRes();

      await cambiarEstadoProducto(crearReq({}, {}, { id: 'prod-1' }), comoRes(res));

      expect(producto.activo).toBe(true);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Producto activado correctamente',
        data: producto,
      });
    });

    it('Responde 404 si el producto no existe', async () => {
      em.findOneOrFail.mockRejectedValueOnce(new NotFoundError('no encontrado'));
      const res = crearRes();

      await cambiarEstadoProducto(crearReq({}, {}, { id: 'nada' }), comoRes(res));

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Producto no encontrado' })
      );
      expect(em.flush).not.toHaveBeenCalled();
    });

    it('Responde 500 ante un error inesperado', async () => {
      em.findOneOrFail.mockResolvedValueOnce({ id: 'prod-1', activo: true });
      em.flush.mockRejectedValueOnce(new Error('db caída'));
      const res = crearRes();

      await cambiarEstadoProducto(crearReq({}, {}, { id: 'prod-1' }), comoRes(res));

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error al cambiar el estado del producto',
        detalle: 'db caída',
      });
    });
  }); 