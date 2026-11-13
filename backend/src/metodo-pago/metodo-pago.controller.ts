import { Request, Response, NextFunction } from 'express'
import { orm } from '../shared/database/orm.js'
import { NotFoundError } from '@mikro-orm/core'
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

// obtener todas los métodos de pago
async function findAll(req: Request, res: Response) {
  try {
    const metodoPago = await em.find(MetodoPago, {})
    return res.status(200).json({ message: 'Todos los métodos de pago encontrados', data: metodoPago })
  } catch (error:any) {
    return res.status(500).json({ message: 'Error al obtener los métodos de pago' })
  }
}

// crear nuevo método de pago
async function add(req: Request, res: Response) {
  try {
    const metodoPago = em.create(MetodoPago, req.body.sanitizedInput)
    await em.flush()
    return res.status(201).json({ message: 'Método de pago creado', data: metodoPago })
  } catch (error:any) {
    console.error('Error detallado al crear:', error);
    return res.status(500).json({ message: 'Error al crear método de pago', detalle: error.message })
  }
}

// obtener método de pago por id
 async function findOne(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const metodoPago = await em.findOneOrFail(MetodoPago, { id })
    return res.status(200).json({ message: 'Método de pago encontrado', data: metodoPago })
  } catch (error:any) {
    return res.status(404).json({ message: 'Método de pago no encontrado' })
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
  } catch (error:any) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({ message: 'Método de pago no encontrado' })
    }
    return res.status(500).json({ message: 'Error al actualizar método de pago' })
  }
}

// eliminar método de pago
async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const metodoPago = await em.findOneOrFail(MetodoPago, { id })
    await em.removeAndFlush(metodoPago)
    return res.status(200).send({ message: 'Método de pago eliminado' })
  } catch (error:any) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({ message: 'Método de pago no encontrado' })
    }
    return res.status(500).json({ message: 'Error al eliminar método de pago', detalle: error.message });
  }
}

export {sanitizeMetodoPagoInput, findAll, add, findOne, update, remove}