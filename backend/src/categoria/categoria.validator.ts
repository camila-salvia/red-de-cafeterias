import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/database/orm.js';
import { Categoria } from './categoria.entity.js';

const em = orm.em;

export async function validarCategoriaInput(req: Request, res: Response, next: NextFunction) {
  const { nombre } = req.body;

  if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
    return res.status(400).json({ message: 'El nombre de la categoría es obligatorio.' });
  }

  try {
    const categoriaExistente = await em.findOne(Categoria, { 
      nombre: { $like: nombre.trim() } 
    });

    if (categoriaExistente) {
      return res.status(409).json({ message: 'Ya existe una categoría con ese nombre.' });
    }
  } catch (error: any) {
    return res.status(500).json({ message: 'Error al verificar categoría', error: error.message });
  }

  next();
}