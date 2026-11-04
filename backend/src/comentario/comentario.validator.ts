import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/database/orm.js';
import { Usuario } from '../usuario/usuario.entity.js';

const em = orm.em;

  // En los validadores se comprueba si los datos cumplen con las reglas de negocio, formatos y tipos esperados
export async function validarComentarioInput(req: Request, res: Response, next: NextFunction) {
  // usa el body ya saneado donde el usuario viene del token al crear
  const {contenido, puntuacion} = req.body;
  const errores: string[] = [];
  const esActualizacion = req.method === 'PUT' || req.method === 'PATCH';

  // Como el usuario ya viene seguro por el token, el validador solo debe encargarse de 
  // revisar que el contenido y la puntuación sean correctos

  // Comentario
  // Debe ser texto y no estar vacío
  if (!esActualizacion || contenido !== undefined) {
    if (!contenido || typeof contenido !== 'string' || contenido.trim().length === 0) {
      errores.push('El contenido del comentario no puede estar vacío.');
    }
  }

  // Puntuación
  // Debe ser un número entero entre 1 y 5
  if (!esActualizacion || puntuacion !== undefined) {
    const punt = Number(puntuacion);
    if (isNaN(punt) || !Number.isInteger(punt) || punt < 1 || punt > 5) {
      errores.push('La puntuación debe ser un número entero entre 1 y 5.');
    }
  }

  if (errores.length > 0) {
    return res.status(400).json({ message: 'Datos de comentario inválidos', errores });
  }

  next();
}