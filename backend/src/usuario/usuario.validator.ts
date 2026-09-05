import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/database/orm.js';
import { Usuario } from './usuario.entity.js';

const em = orm.em;

export async function validarUsuarioInput(req: Request, res: Response, next: NextFunction) {
  const { nombre, apellido, email, password, telefono, direccion } = req.body;
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
  const telRegex = /^[0-9]{7,15}$/;
  if (!telefono || !telRegex.test(String(telefono).trim())) {
    errores.push('El teléfono debe ser un valor numérico entre 7 y 15 dígitos.');
  }

  // Dirección
  if (!direccion || typeof direccion !== 'string' || direccion.trim().length < 5) {
    errores.push('La dirección es obligatoria y debe tener al menos 5 caracteres.');
  }

  if (errores.length > 0) {
    return res.status(400).json({ message: 'Datos de usuario inválidos.', errores});
  }

  // Comprobar email duplicado antes de persistir 
  try {
    const usuarioExistente = await em.findOne(Usuario, { email });
    if (usuarioExistente) {
      return res.status(409).json({ message: 'El correo electrónico ya se encuentra registrado.' });
    }
  } catch (error: any) {
    return res.status(500).json({ message: 'Error al verificar email duplicado', error: error.message });
  }

  next();
}