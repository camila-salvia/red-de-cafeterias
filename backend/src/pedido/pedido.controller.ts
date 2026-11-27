import { Request, Response, NextFunction } from 'express'
import { orm } from '../shared/database/orm.js'
import { Pedido } from '../pedido/pedido.entity.js'
import { Producto } from '../producto/producto.entity.js'
import { DetallePedido } from '../detalle-pedido/detalle-pedido.entity.js'
import { Usuario } from '../usuario/usuario.entity.js'
import { MetodoPago } from '../metodo-pago/metodo-pago.entity.js'
import { responderError } from '../shared/errores.js'

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

const ESTADOS_PEDIDO = ['Pendiente', 'Confirmado', 'Cancelado']

// Lee y valida el filtro ?estado=. Devuelve undefined si no se envió y null si es inválido.
function leerFiltroEstado(req: Request): string | undefined | null {
  const crudo = req.query.estado
  if (crudo === undefined || crudo === '') return undefined
  if (typeof crudo !== 'string') return null
  return ESTADOS_PEDIDO.find(e => e.toLowerCase() === crudo.trim().toLowerCase()) ?? null
}

// obtener todos los pedidos (solo admin)
async function findAll(req: Request, res: Response) {
    try {
    const estado = leerFiltroEstado(req)
    if (estado === null) {
      return res.status(400).json({ message: `Estado inválido. Valores permitidos: ${ESTADOS_PEDIDO.join(', ')}.` })
    }
    const pedidos = await em.find(Pedido, 
      { usuario: { esAdmin: false }, ...(estado ? { estado_pago: estado } : {}) },
      {
        populate: ['detalles.producto', 'usuario', 'metodo_pago'],
        orderBy: { fecha_pedido: 'DESC' },
      })
    return res.status(200).json({ message: 'Todos los pedidos encontrados', data: pedidos })
  } catch (error: unknown) {
    return responderError(res, error, { mensaje: 'Error al obtener los pedidos' })
  }
}

// obtener pedidos por usuario
async function findByUsuario(req: Request, res: Response) {
  try {
    const usuarioId = req.params.usuarioId as string
    
    if (usuarioId !== req.usuarioToken?.id && !req.usuarioToken?.esAdmin) {
      return res.status(403).json({ message: 'Acceso denegado' });  // Un usuario común solo debería poder ver sus propios pedidos
    }

        const estado = leerFiltroEstado(req)
    if (estado === null) {
      return res.status(400).json({ message: `Estado inválido. Valores permitidos: ${ESTADOS_PEDIDO.join(', ')}.` })
    }

    const pedidos = await em.find(
      Pedido, 
            { usuario: usuarioId as any, ...(estado ? { estado_pago: estado } : {}) }, 
      { 
        populate: ['detalles.producto', 'metodo_pago'],
        orderBy: { fecha_pedido: 'DESC' }
      }
    )
    return res.status(200).json({ message: 'Pedidos del usuario encontrados', data: pedidos })
  } catch (error: unknown) {
    return responderError(res, error, { mensaje: 'Error al obtener los pedidos del usuario' })
  }
}

// crear nuevo pedido
async function add(req: Request, res: Response) {
  if (req.usuarioToken?.esAdmin) {
    return res.status(403).json({ message: 'Los administradores no pueden crear pedidos.' })
  }

  try {
    const { items } = req.body; // Array de { productoId, cantidad } que viene del carrito

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'El pedido debe contener al menos un producto' });
    }

  for (const item of items) {
      if (typeof item.cantidad !== 'number' || !Number.isInteger(item.cantidad) || item.cantidad <= 0) {
        return res.status(400).json({ message: 'Las cantidades deben ser enteros mayores a 0.' });
      }
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
      const cantidad = item.cantidad as number

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

    return res.status(201).json({ message: 'Pedido creado exitosamente', data: pedido })
  } catch (error: unknown) {
    return responderError(res, error, { mensaje: 'Error al crear pedido' })
  }
}

// Confirmar un pedido pendiente (solo admins por ruta)
async function confirmar(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const pedido = await em.findOneOrFail(Pedido, { id })

    if (pedido.estado_pago !== 'Pendiente') {
      return res.status(409).json({ message: 'Solo se pueden confirmar pedidos pendientes.' })
    }

    pedido.estado_pago = 'Confirmado'
    await em.flush()
    return res.status(200).json({ message: 'Pedido confirmado', data: pedido })
  } catch (error: unknown) {
    return responderError(res, error, {
      mensaje: 'Error al confirmar el pedido',
      noEncontrado: 'Pedido no encontrado',
    })
  }
}

// Cancelar un pedido propio que siga pendiente
async function cancelar(req: Request, res: Response) {
  if (req.usuarioToken?.esAdmin) {
    return res.status(403).json({ message: 'Los administradores no pueden cancelar pedidos de clientes.' })
  }

  try {
    const id = req.params.id as string
    const pedido = await em.findOneOrFail(Pedido, { id })

    if (pedido.usuario.id !== req.usuarioToken?.id) {
      return res.status(403).json({ message: 'Solo puedes cancelar tus propios pedidos.' })
    }

    if (pedido.estado_pago !== 'Pendiente') {
      return res.status(409).json({ message: 'Solo se pueden cancelar pedidos pendientes.' })
    }

    pedido.estado_pago = 'Cancelado'
    await em.flush()
    return res.status(200).json({ message: 'Pedido cancelado', data: pedido })
  } catch (error: unknown) {
    return responderError(res, error, {
      mensaje: 'Error al cancelar el pedido',
      noEncontrado: 'Pedido no encontrado',
    })
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

    return res.status(200).json({ message: 'Pedido encontrado', data: pedido })
  } catch (error: unknown) {
    return responderError(res, error, {
      mensaje: 'Error al buscar el pedido',
      noEncontrado: 'Pedido no encontrado',
    })
  }
}

// actualizar pedido
async function update(req: Request, res: Response) {
  try {
      const id = req.params.id as string
      const pedido = await em.findOneOrFail(Pedido, { id: id as any })
      const input = req.body.sanitizedInput
      if (input.estado_pago !== undefined) {
        return res.status(400).json({ message: 'Use la acción de confirmar para cambiar el estado del pedido.' })
      }
      em.assign(pedido, input)
      await em.flush()
      return res.status(200).json({ message: 'Pedido actualizado', data: pedido })
  } catch (error: unknown) {
    return responderError(res, error, {
      mensaje: 'Error al actualizar pedido',
      noEncontrado: 'Pedido no encontrado',
    })
  }
}

// eliminar pedido
async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const pedido = await em.findOneOrFail(Pedido, { id: id as any })
    await em.removeAndFlush(pedido)
    return res.status(200).send({ message: 'Pedido eliminado' })
  } catch (error: unknown) {
    return responderError(res, error, {
      mensaje: 'Error al eliminar pedido',
      noEncontrado: 'Pedido no encontrado',
    })
  }
}

export {sanitizePedidoInput, findAll, findByUsuario, add, confirmar, cancelar, findOne, update, remove}