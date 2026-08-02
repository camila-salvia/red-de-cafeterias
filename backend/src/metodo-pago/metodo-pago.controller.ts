import { Request, Response, NextFunction } from 'express'
import { orm } from '../shared/database/orm.js'
import { MetodoPago } from './metodo-pago.entity.js'

const em = orm.em

function sanitizeMetodoPagoInput( 
    req: Request, 
    res: Response, 
    next: NextFunction
) {
    req.body.sanitizedInput = {
        id: req.body.id,
        nombre: req.body.nombre,
        activo: req.body.activo,
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
    res.status(200).json({ message: 'Todos los métodos de pago encontrados', data: metodoPago })
  } catch (error:any) {
    res.status(500).json({ message: 'Error al obtener los métodos de pago' })
  }
}

// crear nuevo método de pago
async function add(req: Request, res: Response) {
  try {
    const metodoPago = em.create(MetodoPago, req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({ message: 'Método de pago creado', data: metodoPago })
  } catch (error:any) {
    console.error('Error detallado al crear:', error);
    res.status(500).json({ message: 'Error al crear método de pago', detalle: error.message })
  }
}

// obtener método de pago por id
 async function findOne(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const metodoPago = await em.findOneOrFail(MetodoPago, { id })
    res.status(200).json({ message: 'Método de pago encontrado', data: metodoPago })
  } catch (error:any) {
    res.status(404).json({ message: 'Método de pago no encontrado' })
  }
}

async function update(req: Request, res: Response) {
  try {
      const id = req.params.id as string
      const metodoPago = em.getReference(MetodoPago,  id)
      em.assign(metodoPago, req.body.sanitizedInput)
      await em.flush()
      res.status(200).json({ message: 'Método de pago actualizado', data: metodoPago })
  } catch (error:any) {
    res.status(500).json({ message: 'Error al actualizar método de pago' })
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const metodoPago = em.getReference(MetodoPago, id)
    await em.removeAndFlush(metodoPago)
    res.status(200).send({ message: 'Método de pago eliminado' })
  } catch (error) {
    res.status(500).send({ message: 'Error al eliminar método de pago' });
  }
}

export {sanitizeMetodoPagoInput, findAll, add, findOne, update, remove}