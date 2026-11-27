import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';

const em = vi.hoisted(() => ({
  findOne: vi.fn(),
  find: vi.fn(),
}));

vi.mock('../shared/database/orm.js', () => ({ orm: { em } }));
vi.mock('../usuario/usuario.entity.js', () => ({ Usuario: class Usuario {} }));
vi.mock('../producto/producto.entity.js', () => ({ Producto: class Producto {} }));
vi.mock('../metodo-pago/metodo-pago.entity.js', () => ({ MetodoPago: class MetodoPago {} }));

import { validarPedidoInput } from '../pedido/pedido.validator.js';

function crearRes() {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
}

const nodeEnvOriginal = process.env.NODE_ENV;

beforeEach(() => {
  vi.resetAllMocks();
  process.env.NODE_ENV = 'production';
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  process.env.NODE_ENV = nodeEnvOriginal;
  vi.restoreAllMocks();
});

describe('validarPedidoInput', () => {
  it('no expone errores de dependencias en producción', async () => {
    em.findOne.mockRejectedValueOnce(new Error('SQL interno: datos sensibles'));
    const req = {
      method: 'POST',
      body: {
        metodo_pago: 'metodo-1',
        items: [{ productoId: 'producto-1', cantidad: 1 }],
      },
      usuarioToken: { id: 'usuario-1' },
    } as unknown as Request;
    const res = crearRes();
    const next = vi.fn();

    await validarPedidoInput(req, res as unknown as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error validando dependencias del pedido',
    });
    expect(JSON.stringify(res.json.mock.calls[0][0])).not.toContain('datos sensibles');
    expect(next).not.toHaveBeenCalled();
  });
});
