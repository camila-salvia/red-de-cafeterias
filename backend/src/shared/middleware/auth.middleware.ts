import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

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

  try {
    const secret = process.env.JWT_SECRET || 'clave_cafeteria';
    const payload = jwt.verify(token, secret) as TokenPayload;
    req.usuarioToken = payload;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido o expirado' });
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