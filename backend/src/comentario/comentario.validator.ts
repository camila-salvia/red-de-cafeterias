import { Request, Response, NextFunction } from 'express';

// En los validadores se comprueba si los datos cumplen con las reglas de negocio,
// formatos y tipos esperados. Para crear y actualizar, el usuario ya viene del token
// y no se valida aquí; la validación se centra en el contenido y la puntuación.
export async function validarComentarioInput(req: Request, res: Response, next: NextFunction) {
  const payload = req.body?.sanitizedInput ?? req.body ?? {};
  const { contenido, puntuacion } = payload as Record<string, unknown>;
  const errores: string[] = [];
  const esActualizacion = req.method === 'PUT' || req.method === 'PATCH';

  if (!esActualizacion || contenido !== undefined) {
    if (!contenido || typeof contenido !== 'string' || contenido.trim().length === 0) {
      errores.push('El contenido del comentario no puede estar vacío.');
    }
  }

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