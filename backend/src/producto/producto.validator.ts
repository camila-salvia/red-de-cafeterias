import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/database/orm.js';
import { Categoria } from '../categoria/categoria.entity.js';

const em = orm.em;

export async function validarProductoInput(req: Request, res: Response, next: NextFunction) {
  const input = req.body.sanitizedInput || req.body;
  const errores: string[] = [];

  // Validar nombre
  if (!input.nombre || typeof input.nombre !== 'string' || input.nombre.trim().length === 0) {
    errores.push('El nombre del producto es obligatorio y debe ser texto.');
  }
  // Validar precio
  const precio = Number(input.precio);
  if (isNaN(precio) || precio <= 0) {
    errores.push('El precio debe ser un número mayor a 0.');
  }

  // Validar categoría
  const categoriaId = typeof input.categoria === 'object' ? input.categoria?.id : input.categoria;
  if (!categoriaId || typeof categoriaId !== 'string' || categoriaId.trim().length === 0) {
    errores.push('Debe especificar un ID de categoría válido.');
  }

  if (errores.length > 0) {
    return res.status(400).json({ message: 'Datos de producto inválidos.', errores});
  }

  // Confirmar existencia real de la categoría en DB
  try {
    const categoriaExiste = await em.findOne(Categoria, { id: categoriaId });
    if (!categoriaExiste) {
      return res.status(404).json({ message: 'La categoría especificada no existe.' });
    }
  } catch (error: any) {
    return res.status(500).json({ message: 'Error al verificar categoría', error: error.message });
  }
  
  next();
}