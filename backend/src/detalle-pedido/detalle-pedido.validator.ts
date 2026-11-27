import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/database/orm.js';
import { Producto } from '../producto/producto.entity.js';
import { Pedido } from '../pedido/pedido.entity.js';
import { responderError } from '../shared/errores.js';

const em = orm.em;

export async function validarDetallePedidoInput(req: Request, res: Response, next: NextFunction) {
  // El validador corre ANTES de sanitizar: solo puede confiar en el body real. Leer
  // req.body.sanitizedInput permitiria a un cliente falsificarlo y saltear la comprobacion.
  const input = req.body;
  const errores: string[] = [];
  const esActualizacion = req.method === 'PUT' || req.method === 'PATCH';

  // Validar cantidad
  if (!esActualizacion || input.cantidad !== undefined) {
    const cantidad = Number(input.cantidad);
    if (isNaN(cantidad) || !Number.isInteger(cantidad) || cantidad <= 0) {
      errores.push('La cantidad debe ser un número entero mayor a 0.');
    }
  }

  // Validar producto
  let productoId: string | undefined;
  if (!esActualizacion || input.producto !== undefined) {
    productoId = typeof input.producto === 'object' ? input.producto?.id : input.producto;
    if (!productoId || typeof productoId !== 'string') {
      errores.push('Debe especificar un ID de producto válido.');
    }
  }

  // Validar pedido
  let pedidoId: string | undefined;
  if (!esActualizacion || input.pedido !== undefined) {
    pedidoId = typeof input.pedido === 'object' ? input.pedido?.id : input.pedido;
    if (!pedidoId || typeof pedidoId !== 'string') {
      errores.push('Debe especificar un ID de pedido válido.');
    }
  }

  if (errores.length > 0) {
    return res.status(400).json({ message: 'Datos de detalle de pedido inválidos.', errores });
  }

  // Confirmar existencia real en la base de datos
  try {
    if (productoId) {
      const productoExiste = await em.findOne(Producto, { id: productoId });
      if (!productoExiste) {
        return res.status(404).json({ message: 'El producto especificado no existe.' });
      }
    }

    if (pedidoId) {
      const pedidoExiste = await em.findOne(Pedido, { id: pedidoId }, { populate: ['usuario'] });
      if (!pedidoExiste) {
        return res.status(404).json({ message: 'El pedido especificado no existe.' });
      }
      const esDuenioPedido = pedidoExiste.usuario.id === req.usuarioToken?.id;
      if (!esDuenioPedido && !req.usuarioToken?.esAdmin) {
        return res.status(403).json({ message: 'No puedes asociar un detalle a un pedido que no te pertenece.' });
      }
    }
  } catch (error: unknown) {
    return responderError(res, error, { mensaje: 'Error al validar dependencias del detalle' });
  }

  next();
}