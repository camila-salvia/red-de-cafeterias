import { Request, Response, NextFunction } from 'express';

export function validarUsuarioInput(req: Request, res: Response, next: NextFunction) {
  const { nombre, apellido, email, password, telefono } = req.body;
  const errores: string[] = [];

  // Nombre y Apellido
  if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
    errores.push('El nombre es obligatorio y debe tener al menos 2 caracteres.');
  }
  if (!apellido || typeof apellido !== 'string' || apellido.trim().length < 2) {
    errores.push('El apellido es obligatorio y debe tener al menos 2 caracteres.');
  }

  // Email con expresión regular estándar
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errores.push('El correo electrónico tiene un formato inválido.');
  }

  // Password con longitud mínima
  if (!password || typeof password !== 'string' || password.length < 6) {
    errores.push('La contraseña debe tener al menos 6 caracteres.');
  }

  // Teléfono numérico
  if (telefono && isNaN(Number(telefono))) {
    errores.push('El teléfono debe ser un valor numérico.');
  }

  if (errores.length > 0) {
    return res.status(400).json({
      message: 'Datos de usuario inválidos.',
      errores
    });
  }

  next();
}