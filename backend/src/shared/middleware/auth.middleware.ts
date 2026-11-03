import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET no está definido en las variables de entorno');
  }
  return secret;
}

export interface TokenPayload {
  id: string;
  email: string;
  esAdmin: boolean;
}

declare global {
  namespace Express {
    interface Request {
      usuarioToken?: TokenPayload;
    }
  }
}

export function verificarToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado: Token no proporcionado' });
  }

  let secret: string;
  try {
    secret = getJwtSecret();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error de configuración del servidor' });
  }

  try {
    const payload = jwt.verify(token, secret) as TokenPayload;
    req.usuarioToken = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

// Middleware para verificar si es administrador
export function soloAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.usuarioToken) {
    return res.status(401).json({ message: 'Usuario no autenticado' });
  }

  if (!req.usuarioToken.esAdmin) {
    return res.status(403).json({ message: 'Acceso denegado: Se requieren permisos de administrador' });
  }

  next();
}

// Permite el acceso al dueño del recurso (el id de la URL coincide con el del token) o a un admin.
// `param` es el nombre del parámetro de ruta que contiene el id del usuario (por defecto "id").
export function propietarioOAdmin(param: string = 'id') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.usuarioToken) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    const idRecurso = req.params[param] as string;
    if (req.usuarioToken.esAdmin || req.usuarioToken.id === idRecurso) {
      return next();
    }

    return res.status(403).json({ message: 'Acceso denegado: no podés acceder a recursos de otro usuario' });
  };
}
