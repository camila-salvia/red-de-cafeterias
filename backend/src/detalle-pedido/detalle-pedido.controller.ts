import { Request, Response, NextFunction } from 'express'
import { orm } from '../shared/database/orm.js'
import { DetallePedido } from './detalle-pedido.entity.js'

const em = orm.em

function sanitizeDetallePedidoInput( 
    req: Request, 
    res: Response, 
    next: NextFunction
) {
    req.body.sanitizedInput = {
        id: req.body.id,
        cantidad: req.body.cantidad,
        precio_unitario: req.body.precio_unitario,
    }

    Object.keys(req.body.sanitizedInput).forEach(key => {
        if (req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key]
        }
    })

    next();
}

// obtener todos los detalles de pedido
async function findAll(req: Request, res: Response) {
  try {
    const detallePedido = await em.find(DetallePedido, {})
    res.status(200).json({ message: 'Todos los detalles de pedido encontrados', data: detallePedido })
  } catch (error:any) {
    res.status(500).json({ message: 'Error al obtener los detalles de pedido' })
  }
}

// crear nuevo detalle de pedido
async function add(req: Request, res: Response) {
  try {
    const detallePedido = em.create(DetallePedido, req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({ message: 'Detalle de pedido creado', data: detallePedido })
  } catch (error:any) {
    console.error('Error detallado al crear:', error);
    res.status(500).json({ message: 'Error al crear detalle de pedido', detalle: error.message })
  }
}

// obtener detalle de pedido por id
 async function findOne(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const detallePedido = await em.findOneOrFail(DetallePedido, { id })
    res.status(200).json({ message: 'Detalle de pedido encontrado', data: detallePedido })
  } catch (error:any) {
    res.status(404).json({ message: 'Detalle de pedido no encontrado' })
  }
}

async function update(req: Request, res: Response) {
  try {
      const id = req.params.id as string
      const detallePedido = em.getReference(DetallePedido,  id)
      em.assign(detallePedido, req.body.sanitizedInput)
      await em.flush()
      res.status(200).json({ message: 'Detalle de pedido actualizado', data: detallePedido })
  } catch (error:any) {
    res.status(500).json({ message: 'Error al actualizar detalle de pedido' })
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const detallePedido = em.getReference(DetallePedido, id)
    await em.removeAndFlush(detallePedido)
    res.status(200).send({ message: 'Detalle de pedido eliminado' })
  } catch (error) {
    res.status(500).send({ message: 'Error al eliminar detalle de pedido' });
  }
}

export {sanitizeDetallePedidoInput, findAll, add, findOne, update, remove}