import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/database/orm.js';
import { Usuario } from '../usuario/usuario.entity.js';

const em = orm.em;

export async function validarComentarioInput(req: Request, res: Response, next: NextFunction) {
  const { contenido, puntuacion, usuario } = req.body;
  const errores: string[] = [];

  // Comentario
  if (!contenido || typeof contenido !== 'string' || contenido.trim().length === 0) {
    errores.push('El contenido del comentario no puede estar vacío.');
  }
  // Puntuación
  const punt = Number(puntuacion);
  if (isNaN(punt) || !Number.isInteger(punt) || punt < 1 || punt > 5) {
    errores.push('La puntuación debe ser un número entero entre 1 y 5.');
  }
  // Usuario
  const usuarioId = typeof usuario === 'object' ? usuario?.id : usuario;
  if (!usuarioId || typeof usuarioId !== 'string') {
    errores.push('Debe especificar un usuario válido.');
  }

  if (errores.length > 0) {
    return res.status(400).json({ message: 'Datos de comentario inválidos', errores });
  }

  // Verificar usuario existente
  try {
    const usuarioExiste = await em.findOne(Usuario, { id: usuarioId });
    if (!usuarioExiste) {
      return res.status(404).json({ message: 'El usuario especificado no existe.' });
    }
  } catch (error: any) {
    return res.status(500).json({ message: 'Error al verificar usuario', error: error.message });
  }

  next();
}