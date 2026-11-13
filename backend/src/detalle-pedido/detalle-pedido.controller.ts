import { Request, Response, NextFunction } from 'express'
import { orm } from '../shared/database/orm.js'
import { NotFoundError } from '@mikro-orm/core'
import { DetallePedido } from './detalle-pedido.entity.js'
import { Pedido } from '../pedido/pedido.entity.js'
import { Producto } from '../producto/producto.entity.js'

const em = orm.em

function sanitizeDetallePedidoInput( 
    req: Request, 
    res: Response, 
    next: NextFunction
) {
    req.body.sanitizedInput = {
        cantidad: req.body.cantidad ? Number(req.body.cantidad) : undefined,
        pedido: req.body.pedido,
        producto: req.body.producto
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
    const detallePedido = await em.find(DetallePedido, {}, { populate: ['producto', 'pedido.usuario'] })
    return res.status(200).json({ message: 'Todos los detalles de pedido encontrados', data: detallePedido })
  } catch (error:any) {
    return res.status(500).json({ message: 'Error al obtener los detalles de pedido' })
  }
}

// crear nuevo detalle de pedido
async function add(req: Request, res: Response) {
  try {
    const input = req.body.sanitizedInput

    // Buscamos el producto real para extraer su precio inalterable
    const productoId = typeof input.producto === 'object' ? input.producto.id : input.producto
    const producto = await em.findOneOrFail(Producto, { id: productoId })

    const pedidoId = typeof input.pedido === 'object' ? input.pedido.id : input.pedido
    const pedido = await em.findOneOrFail(Pedido, { id: pedidoId })

    const detallePedido = em.create(DetallePedido, {
      cantidad: input.cantidad,
      precio_unitario: Number(producto.precio), // El precio sale de la base de datos
      producto,
      pedido
    })

    await em.flush()
    return res.status(201).json({ message: 'Detalle de pedido creado', data: detallePedido })
  } catch (error: any) {
    console.error('Error detallado al crear:', error);
    return res.status(500).json({ message: 'Error al crear detalle de pedido', detalle: error.message })
  }
}

// obtener detalle de pedido por id, verificando propiedad en cascada
 async function findOne(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const detallePedido = await em.findOneOrFail(DetallePedido, { id }, { populate: ['producto', 'pedido.usuario'] })
    
    // Validar si el usuario logueado es el dueño del pedido al que pertenece este detalle o es admin
    const esDuenio = detallePedido.pedido.usuario.id === req.usuarioToken?.id
    if (!esDuenio && !req.usuarioToken?.esAdmin) {
      return res.status(403).json({ message: 'Acceso denegado: este detalle de pedido no te pertenece.' })
    }
    
    return res.status(200).json({ message: 'Detalle de pedido encontrado', data: detallePedido })
  } catch (error:any) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({ message: 'Detalle de pedido no encontrado' })
    }
    return res.status(500).json({ message: 'Error al buscar el detalle de pedido' })
  }
}

// actualizar detalle de pedido
async function update(req: Request, res: Response) {
  try {
      const id = req.params.id as string
      const detallePedido = await em.findOneOrFail(DetallePedido, { id }, { populate: ['pedido.usuario'] })
      const input = req.body.sanitizedInput
      
      // Si cambian el producto, actualizamos también el precio unitario automáticamente por seguridad
      if (input.producto) {
        const productoId = typeof input.producto === 'object' ? input.producto.id : input.producto
        const producto = await em.findOneOrFail(Producto, { id: productoId })
        input.producto = producto
        input.precio_unitario = Number(producto.precio)
      }
      
      em.assign(detallePedido, input)
      await em.flush()
      return res.status(200).json({ message: 'Detalle de pedido actualizado', data: detallePedido })
  } catch (error:any) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({ message: 'Detalle de pedido no encontrado' })
    }
    return res.status(500).json({ message: 'Error al actualizar detalle de pedido' })
  }
}

// eliminar detalle de pedido
async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const detallePedido = await em.findOneOrFail(DetallePedido, { id })
    await em.removeAndFlush(detallePedido)
    return res.status(200).send({ message: 'Detalle de pedido eliminado' })
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({ message: 'Detalle de pedido no encontrado' })
    }
    return res.status(500).send({ message: 'Error al eliminar detalle de pedido' });
  }
}

export {sanitizeDetallePedidoInput, findAll, add, findOne, update, remove}