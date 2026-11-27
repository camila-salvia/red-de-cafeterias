import { Request, Response, NextFunction } from 'express'
import { NotFoundError } from '@mikro-orm/core'

// Se evalúa en cada llamada para que los tests puedan cambiar NODE_ENV
function esProduccion(): boolean {
  return process.env.NODE_ENV === 'production'
}

interface OpcionesError {
  // Mensaje que ve el cliente cuando algo falla por un motivo inesperado (500)
  mensaje: string
  // Indica que un NotFoundError representa un recurso solicitado que no existe.
  noEncontrado?: string
}

/*
  Responde un error de forma uniforme:
   - El detalle completo (error.message, stack) se registra SOLO en el servidor.
   - El cliente recibe un mensaje fijo.
   - Fuera de producción se agrega `detalle` para facilitar el desarrollo.
 */
export function responderError(res: Response, error: unknown, opciones: OpcionesError) {
  console.error(`[error] ${opciones.mensaje}:`, error)

  let estado = 500
  let mensaje = opciones.mensaje
  if (error instanceof NotFoundError && opciones.noEncontrado !== undefined) {
    estado = 404
    mensaje = opciones.noEncontrado
  }

  const cuerpo: { message: string; detalle?: string } = { message: mensaje }
  if (!esProduccion() && error instanceof Error) {
    cuerpo.detalle = error.message
  }
  return res.status(estado).json(cuerpo)
}

/*
  Middleware global (se registra al final de app.ts). Es la red de seguridad para
  errores que no se capturaron en un controlador: JSON mal formado, errores de multer, etc.
 */
export function manejadorErrores(error: any, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    return next(error)
  }

  // JSON inválido en el cuerpo de la petición
  if (error?.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'El cuerpo de la petición no es un JSON válido.' })
  }
  // Cuerpo demasiado grande
  if (error?.type === 'entity.too.large') {
    return res.status(413).json({ message: 'El cuerpo de la petición es demasiado grande.' })
  }

  console.error('[error] No controlado:', error)
  const cuerpo: { message: string; detalle?: string } = { message: 'Error interno del servidor.' }
  if (!esProduccion() && error instanceof Error) {
    cuerpo.detalle = error.message
  }
  return res.status(500).json(cuerpo)
}