import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/database/orm.js';
import { MetodoPago } from './metodo-pago.entity.js';

const em = orm.em;

export async function validarMetodoPagoInput(req: Request, res: Response, next: NextFunction) {
  const { nombre, activo } = req.body;
  const errores: string[] = [];
  const esActualizacion = req.method === 'PUT' || req.method === 'PATCH';

  // Validar nombre
  // Debe ser texto y no estar vacío
  if (!esActualizacion || nombre !== undefined) {
    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      errores.push('El nombre del método de pago es obligatorio.');
    }
  }

  // Validar activo
  // Si viene definido, debe ser booleano 
  if (activo !== undefined && typeof activo !== 'boolean') {
    errores.push('El campo "activo" debe ser un valor booleano.');
  }

  if (errores.length > 0) {
    return res.status(400).json({ message: 'Datos de método de pago inválidos.', errores });
  }

  // Verificar nombre duplicado en la base de datos
  try {
    if (nombre) {
      const filtro: any = { nombre: { $like: nombre.trim() } };

      if (esActualizacion && req.params.id) {
        filtro.id = { $ne: req.params.id };
      }

      const metodoExistente = await em.findOne(MetodoPago, filtro);
      if (metodoExistente) {
        return res.status(409).json({ message: 'Ya existe un método de pago con ese nombre.' });
      }
    }
  } catch (error: any) {
    return res.status(500).json({ message: 'Error al verificar el método de pago', error: error.message });
  }

  next();
}