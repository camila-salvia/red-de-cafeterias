import { Request, Response, NextFunction } from 'express';

export function validarPedidoInput(req: Request, res: Response, next: NextFunction) {
  const { usuario, items, metodo_pago } = req.body;
  const errores: string[] = [];

  // Usuario y método de pago obligatorios
  if (!usuario) errores.push('El usuario es obligatorio.');
  if (!metodo_pago) errores.push('El método de pago es obligatorio.');

  // Validar items
  if (!items || !Array.isArray(items) || items.length === 0) {
    errores.push('El pedido debe incluir al menos un producto.');
  } else {
    items.forEach((item: any, index: number) => {
      if (!item.productoId) {
        errores.push(`El item en la posición ${index} no tiene un productoId válido.`);
      }
      const cantidad = Number(item.cantidad);
      if (isNaN(cantidad) || !Number.isInteger(cantidad) || cantidad <= 0) {
        errores.push(`La cantidad del item en la posición ${index} debe ser un entero mayor a 0.`);
      }
    });
  }

  if (errores.length > 0) {
    return res.status(400).json({
      message: 'Datos del pedido inválidos.',
      errores
    });
  }

  next();
}