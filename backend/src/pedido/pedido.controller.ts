import { Request, Response, NextFunction } from 'express'
import { orm } from '../shared/database/orm.js'
import { NotFoundError } from '@mikro-orm/core'
import { Pedido } from '../pedido/pedido.entity.js'
import { Producto } from '../producto/producto.entity.js'
import { DetallePedido } from '../detalle-pedido/detalle-pedido.entity.js'
import { Usuario } from '../usuario/usuario.entity.js'
import { MetodoPago } from '../metodo-pago/metodo-pago.entity.js'

const em = orm.em

function sanitizePedidoInput( 
    req: Request, 
    res: Response, 
    next: NextFunction
) {
    const esCreacion = req.method === 'POST'

    req.body.sanitizedInput = {
        fecha_pedido: esCreacion ? new Date() : undefined,
        direccion_envio: req.body.direccion_envio,
        fecha_pago: req.body.fecha_pago ? new Date(req.body.fecha_pago) : undefined,
        estado_pago: esCreacion ? 'Pendiente' : req.body.estado_pago,
        metodo_pago: req.body.metodo_pago
    }

    if (esCreacion) {
        req.body.sanitizedInput.usuario = req.usuarioToken?.id;
    }

    Object.keys(req.body.sanitizedInput).forEach(key => {
        if (req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key]
        }
    })

    next();
}

// obtener todos los pedidos (solo admin)
async function findAll(req: Request, res: Response) {
  try {
    const pedidos = await em.find(Pedido, 
      {}, 
      { populate: ['detalles.producto', 'usuario', 'metodo_pago'] })
    res.status(200).json({ message: 'Todos los pedidos encontrados', data: pedidos })
  } catch (error:any) {
    res.status(500).json({ message: 'Error al obtener los pedidos' })
  }
}

// obtener pedidos por usuario
async function findByUsuario(req: Request, res: Response) {
  try {
    const usuarioId = req.params.usuarioId as string
    
    if (usuarioId !== req.usuarioToken?.id && !req.usuarioToken?.esAdmin) {
      return res.status(403).json({ message: 'Acceso denegado' });  // Un usuario común solo debería poder ver sus propios pedidos
    }

    const pedidos = await em.find(
      Pedido, 
      { usuario: usuarioId as any }, 
      { 
        populate: ['detalles.producto', 'metodo_pago'],
        orderBy: { fecha_pedido: 'DESC' }
      }
    )
    res.status(200).json({ message: 'Pedidos del usuario encontrados', data: pedidos })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al obtener los pedidos del usuario', error: error.message })
  }
}

// crear nuevo pedido
async function add(req: Request, res: Response) {
  try {
    const { items } = req.body; // Array de { productoId, cantidad } que viene del carrito

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'El pedido debe contener al menos un producto' });
    }

    const input = req.body.sanitizedInput;

    // Convertir IDs a referencias de MikroORM para las relaciones
    if (input.metodo_pago) {
      const mpId = typeof input.metodo_pago === 'object' ? input.metodo_pago.id : input.metodo_pago;
      input.metodo_pago = em.getReference(MetodoPago, mpId);
    }
    if (input.usuario) {
      const userId = typeof input.usuario === 'object' ? input.usuario.id : input.usuario;
      input.usuario = em.getReference(Usuario, userId);
    }

    const pedido = em.create(Pedido, input)
    let totalCalculado = 0

    for (const item of items) {
      const prodId = item.productoId || item.producto?.id || item.producto;
      const producto = await em.findOneOrFail(Producto, { id: prodId })

      const precioUnitario = Number(producto.precio)
      const cantidad = Number(item.cantidad)
      
      if (isNaN(cantidad) || cantidad <= 0) {
        return res.status(400).json({ message: 'Cantidad inválida en los ítems' });
      }

      totalCalculado += precioUnitario * cantidad

      const detalle = em.create(DetallePedido, {
          cantidad,
          precio_unitario: precioUnitario,
          pedido,
          producto
      })

        pedido.detalles.add(detalle)
      }

      // El total siempre lo calcula el backend con los precios reales de la base
      pedido.costo_total = totalCalculado

    await em.flush()

    res.status(201).json({ message: 'Pedido creado exitosamente', data: pedido })
  } catch (error: any) {
    console.error('Error detallado al crear:', error)
    res.status(500).json({ message: 'Error al crear pedido', detalle: error.message })
  }
}

// obtener pedido por id (solo el propietario o el admin)
 async function findOne(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const pedido = await em.findOneOrFail(
      Pedido, 
      { id: id as any },
      { populate: ['detalles.producto', 'usuario', 'metodo_pago'] }
    )
    const esDuenio = pedido.usuario.id === req.usuarioToken?.id
    if (!esDuenio && !req.usuarioToken?.esAdmin) {
      return res.status(403).json({ message: 'Acceso denegado: este pedido pertenece a otro usuario' })
    }

    res.status(200).json({ message: 'Pedido encontrado', data: pedido })
  } catch (error:any) {
  if (error instanceof NotFoundError) {
      return res.status(404).json({ message: 'Pedido no encontrado' })
    }
    res.status(500).json({ message: 'Error al buscar el pedido' })
  }
}

// actualizar pedido
async function update(req: Request, res: Response) {
  try {
      const id = req.params.id as string
      const pedido = await em.findOneOrFail(Pedido, { id: id as any })
      em.assign(pedido, req.body.sanitizedInput)
      await em.flush()
      res.status(200).json({ message: 'Pedido actualizado', data: pedido })
  } catch (error:any) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({ message: 'Pedido no encontrado' })
    }
    res.status(500).json({ message: 'Error al actualizar pedido' })
  }
}

// eliminar pedido
async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const pedido = await em.findOneOrFail(Pedido, { id: id as any })
    await em.removeAndFlush(pedido)
    res.status(200).send({ message: 'Pedido eliminado' })
  } catch (error:any) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({ message: 'Pedido no encontrado' })
    }
    res.status(500).send({ message: 'Error al eliminar pedido' });
  }
}

export {sanitizePedidoInput, findAll, findByUsuario, add, findOne, update, remove}