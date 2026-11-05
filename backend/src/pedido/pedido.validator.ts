import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/database/orm.js';
import { Usuario } from '../usuario/usuario.entity.js';
import { Producto } from '../producto/producto.entity.js';
import { MetodoPago } from '../metodo-pago/metodo-pago.entity.js';

const em = orm.em;

export async function validarPedidoInput(req: Request, res: Response, next: NextFunction) {
  const { metodo_pago, items } = req.body;
  const usuarioId = req.usuarioToken?.id || req.body.usuario;
  const metodoPagoId = typeof metodo_pago === 'object' ? metodo_pago?.id : metodo_pago;
  const errores: string[] = [];
const esActualizacion = req.method === 'PUT' || req.method === 'PATCH';

  // Usuario y método de pago obligatorios al crear un pedido
  if (!esActualizacion || usuarioId !== undefined) {
    if (!usuarioId) errores.push('El usuario es obligatorio.');
  }
  if (!esActualizacion || metodoPagoId !== undefined) {
    if (!metodoPagoId) errores.push('El método de pago es obligatorio.');
  }

  // Validar items al crear un pedido
  if (!esActualizacion) {
    if (!items || !Array.isArray(items) || items.length === 0) {
      errores.push('El pedido debe incluir al menos un producto.');
    }
  }

  if (errores.length > 0) {
    return res.status(400).json({
      message: 'Datos del pedido inválidos.', 
      errores
    });
  }

  try {
    // Validar usuario
    if (usuarioId) {
      const user = await em.findOne(Usuario, { id: usuarioId });
      if (!user) {
        return res.status(404).json({ message: 'El usuario asignado al pedido no existe.' });
      }
    }

    // Validar método de pago
    if (metodoPagoId) {
      const mp = await em.findOne(MetodoPago, { id: metodoPagoId });
      if (!mp) {
        return res.status(404).json({ message: 'El método de pago especificado no existe.' });
      }
    }

    // Validar existencia y stock/datos de cada producto
    if (!esActualizacion && items && Array.isArray(items)) {
      for (const item of items) {
        const prodId = item.productoId || item.producto?.id || item.producto;
        const cant = Number(item.cantidad);

        if (!prodId) {
          return res.status(400).json({ message: 'Cada item debe contener un ID de producto.' });
        }
        if (isNaN(cant) || cant <= 0) {
          return res.status(400).json({ message: 'Las cantidades deben ser enteros mayores a 0.' });
        }

        const prod = await em.findOne(Producto, { id: prodId });
        if (!prod) {
          return res.status(404).json({ message: `El producto con ID ${prodId} no existe.` });
        }
      }
    }
  } catch (error: any) {
      return res.status(500).json({ message: 'Error validando dependencias del pedido', error: error.message });
    }

    next();
}