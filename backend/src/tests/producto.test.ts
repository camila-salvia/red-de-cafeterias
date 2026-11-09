import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';

// Mockear el ORM y las entidades antes de importarlas
const em = vi.hoisted(() => ({
  find: vi.fn(),
  findOne: vi.fn(),
  findOneOrFail: vi.fn(),
  getReference: vi.fn(),
  create: vi.fn(),
  flush: vi.fn(),
}));

vi.mock('../shared/database/orm.js', () => ({ orm: { em } }));
vi.mock('../categoria/categoria.entity.js', () => ({ Categoria: class Categoria {} }));
vi.mock('../producto/producto.entity.js', () => ({ Producto: class Producto {} }));

import { validarProductoInput } from '../producto/producto.validator.js';
import { add, findAll, sanitizeProductoInput } from '../producto/producto.controller.js';
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

function crearReq(body: Record<string, unknown>, query: Record<string, unknown> = {}) {
  return { body: { ...body }, query, params: {} } as unknown as Request;
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
});

describe('Producto - Tests unitarios', () => {

  // Validación de input
  describe('Validación del input', () => {
    // Caso 1 - Categoria existente
    it('Acepta un producto válido cuando la categoría existe', async () => {
      const res = crearRes();
      const next = vi.fn();

      // la categoría sí existe en la base de datos
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

// Controlador y filtros
  describe('Controlador y filtros', () => {

    // Sanitización
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

    // Creación exitosa
    it('El controller persiste el producto y responde 201', async () => {
      const inputSanitized = { ...productoValido };
      const productoCreado = { id: 'prod-1', ...inputSanitized };

      em.create.mockReturnValue(productoCreado);
      em.flush.mockResolvedValue(undefined);

      const req = { body: { sanitizedInput: inputSanitized } } as unknown as Request;
      const res = crearRes();

      await add(req, comoRes(res));

      expect(em.create).toHaveBeenCalled();
      expect(em.flush).toHaveBeenCalledOnce();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Producto creado exitosamente', data: productoCreado });
    });

    // Filtro por categoría
    it('Filtra correctamente los productos cuando se envía una categoría por query params', async () => {
      const req = crearReq({}, { categoria: 'Bebidas' });
      const res = crearRes();

      const categoriasEncontradas = [{ id: 'cat-1', nombre: 'Bebidas calientes' }];
      const productosFiltrados = [{ id: 'prod-1', nombre: 'Café', categoria: categoriasEncontradas[0] }];

      // Mock de la búsqueda de categorías coincidentes y luego de los productos
      em.find
        .mockResolvedValueOnce(categoriasEncontradas) // Primera llamada: busca categorías
        .mockResolvedValueOnce(productosFiltrados);   // Segunda llamada: busca productos por categoría

      await findAll(req, comoRes(res));

      expect(em.find).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Productos filtrados', data: productosFiltrados })
      );
    });
  });
});