import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/database/orm.js';
import { Usuario } from '../usuario/usuario.entity.js';

const em = orm.em;

// En los validadores se comprueba si los datos cumplen con las reglas de negocio,
// formatos y tipos esperados. Para crear y actualizar, el usuario ya viene del token
// y no se valida aquí; la validación se centra en el contenido y la puntuación.
export async function validarComentarioInput(req: Request, res: Response, next: NextFunction) {
  // usa el body ya saneado (donde el usuario viene del token al crear)
  const input = req.body.sanitizedInput || req.body;
  const { contenido, puntuacion, usuario } = input;
  const errores: string[] = [];

  // Comentario: es opcional (se puede reseñar solo con estrellas). Si viene, tiene que ser texto.
  if (contenido !== undefined && contenido !== null && typeof contenido !== 'string') {
    errores.push('El comentario debe ser texto.');
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