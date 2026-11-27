import { Request, Response, NextFunction } from 'express'
import { orm } from '../shared/database/orm.js'
import { responderError } from '../shared/errores.js'
import { MetodoPago } from './metodo-pago.entity.js'

const em = orm.em

function sanitizeMetodoPagoInput( 
    req: Request, 
    res: Response, 
    next: NextFunction
) {
    const esCreacion = req.method === 'POST';

    req.body.sanitizedInput = {
        nombre: req.body.nombre,
        activo: req.body.activo !== undefined ? Boolean(req.body.activo) : (esCreacion ? true : undefined)
    }

    Object.keys(req.body.sanitizedInput).forEach(key => {
        if (req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key]
        }
    })

    next();
}

// obtener todas los métodos de pago disponibles (vista cliente)
async function findAll(req: Request, res: Response) {
  try {
    const metodoPago = await em.find(MetodoPago, { activo: true })
    return res.status(200).json({ message: 'Todos los métodos de pago encontrados', data: metodoPago })
  } catch (error:unknown) {
    return responderError(res, error, { mensaje: 'Error al obtener los métodos de pago' })
  }
}

// obtener todos los métodos de pago para administradores (activos e inactivos)
async function findAllAdmin(req: Request, res: Response) {
  try {
    const metodoPago = await em.find(MetodoPago, {})
    return res.status(200).json({ message: 'Listado completo de métodos de pago (admin)', data: metodoPago })
  } catch (error:unknown) {
    return responderError(res, error, { mensaje: 'Error al obtener los métodos de pago' })
  }
}

// crear nuevo método de pago
async function add(req: Request, res: Response) {
  try {
    const metodoPago = em.create(MetodoPago, req.body.sanitizedInput)
    await em.flush()
    return res.status(201).json({ message: 'Método de pago creado', data: metodoPago })
  } catch (error:unknown) {
    return responderError(res, error, { mensaje: 'Error al crear método de pago' })
  }
}

// obtener método de pago por id
 async function findOne(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const metodoPago = await em.findOneOrFail(MetodoPago, { id })
    return res.status(200).json({ message: 'Método de pago encontrado', data: metodoPago })
  } catch (error:unknown) {
    return responderError(res, error, { mensaje: 'Error al obtener método de pago', noEncontrado: 'Método de pago no encontrado' })
  }
}

// actualizar método de pago
async function update(req: Request, res: Response) {
  try {
      const id = req.params.id as string
      const metodoPago = await em.findOneOrFail(MetodoPago, { id })
      em.assign(metodoPago, req.body.sanitizedInput)
      await em.flush()
      return res.status(200).json({ message: 'Método de pago actualizado', data: metodoPago })
  } catch (error:unknown) {
    return responderError(res, error, { mensaje: 'Error al actualizar método de pago', noEncontrado: 'Método de pago no encontrado' })
  }
}

// eliminar método de pago
async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const metodoPago = await em.findOneOrFail(MetodoPago, { id })
    await em.removeAndFlush(metodoPago)
    return res.status(200).send({ message: 'Método de pago eliminado' })
  } catch (error:unknown) {
    return responderError(res, error, { mensaje: 'Error al eliminar método de pago', noEncontrado: 'Método de pago no encontrado' })
  }
}

export {sanitizeMetodoPagoInput, findAll, findAllAdmin, add, findOne, update, remove}