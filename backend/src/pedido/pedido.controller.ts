import { Request, Response, NextFunction } from 'express'
import { orm } from '../shared/database/orm.js'
import { Pedido } from '../pedido/pedido.entity.js'

const em = orm.em

function sanitizePedidoInput( 
    req: Request, 
    res: Response, 
    next: NextFunction
) {
    req.body.sanitizedInput = {
        fecha_pedido: req.body.fecha_pedido,
        costo_total: req.body.costo_total,
        direccion_envio: req.body.direccion_envio,
        fecha_pago: req.body.fecha_pago,
        estado_pago: req.body.estado_pago,
        usuario: req.body.usuario,
        metodo_pago: req.body.metodo_pago
    }

    Object.keys(req.body.sanitizedInput).forEach(key => {
        if (req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key]
        }
    })

    next();
}

// obtener todos los pedidos
async function findAll(req: Request, res: Response) {
  try {
    const pedidos = await em.find(Pedido, {})
    res.status(200).json({ message: 'Todos los pedidos encontrados', data: pedidos })
  } catch (error:any) {
    res.status(500).json({ message: 'Error al obtener los pedidos' })
  }
}

// crear nuevo pedido
async function add(req: Request, res: Response) {
  try {
    const pedido = em.create(Pedido, req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({ message: 'Pedido creado', data: pedido })
  } catch (error:any) {
    console.error('Error detallado al crear:', error);
    res.status(500).json({ message: 'Error al crear pedido', detalle: error.message })
  }
}

// obtener pedido por id
 async function findOne(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const pedido = await em.findOneOrFail(Pedido, { id })
    res.status(200).json({ message: 'Pedido encontrado', data: pedido })
  } catch (error:any) {
    res.status(404).json({ message: 'Pedido no encontrado' })
  }
}

async function update(req: Request, res: Response) {
  try {
      const id = req.params.id as string
      const pedido = em.getReference(Pedido,  id)
      em.assign(pedido, req.body.sanitizedInput)
      await em.flush()
      res.status(200).json({ message: 'Pedido actualizado', data: pedido })
  } catch (error:any) {
    res.status(500).json({ message: 'Error al actualizar pedido' })
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const pedido = em.getReference(Pedido, id)
    await em.removeAndFlush(pedido)
    res.status(200).send({ message: 'Pedido eliminado' })
  } catch (error) {
    res.status(500).send({ message: 'Error al eliminar pedido' });
  }
}

export {sanitizePedidoInput, findAll, add, findOne, update, remove}