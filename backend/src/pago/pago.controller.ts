import { Request, Response } from 'express'
import { MercadoPagoConfig, Preference, Payment, WebhookSignatureValidator } from 'mercadopago'
import { orm } from '../shared/database/orm.js'
import { Pedido } from '../pedido/pedido.entity.js'
import { DetallePedido } from '../detalle-pedido/detalle-pedido.entity.js'
import { responderError } from '../shared/errores.js'

const em = orm.em

// El cliente se crea al usarlo (no al importar el archivo) para asegurar
// que dotenv ya cargó el .env cuando se lee el token.
function getMpClient() {
  const accessToken = process.env.MP_ACCESS_TOKEN
  if (!accessToken) throw new Error('Falta MP_ACCESS_TOKEN en el .env')
  return new MercadoPagoConfig({ accessToken })
}

// Un pedido se paga con Mercado Pago si el método elegido se llama "Mercado Pago"
const esMercadoPago = (nombre?: string) => !!nombre && nombre.toLowerCase().includes('mercado')

// POST /api/pago/preferencia/:id  (requiere token)
// Crea la preferencia de pago de un pedido propio y devuelve la URL de Mercado Pago.
async function crearPreferencia(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const pedido = await em.findOneOrFail(
      Pedido,
      { id },
      { populate: ['detalles.producto', 'usuario', 'metodo_pago'] }
    )

    if (pedido.usuario.id !== req.usuarioToken?.id) {
      return res.status(403).json({ message: 'Solo puedes pagar tus propios pedidos.' })
    }
    if (pedido.estado_pago !== 'Pendiente') {
      return res.status(409).json({ message: 'Solo se pueden pagar pedidos pendientes.' })
    }
    if (!esMercadoPago(pedido.metodo_pago.nombre)) {
      return res.status(400).json({ message: 'El pedido no usa Mercado Pago como método de pago.' })
    }

    // Los precios salen de la base de datos (precio_unitario guardado en el detalle)
    const items = pedido.detalles.getItems().map((d: DetallePedido) => ({
      id: d.producto.id,
      title: d.producto.nombre,
      quantity: Number(d.cantidad),
      unit_price: Number(d.precio_unitario),
      currency_id: 'ARS',
    }))

    const frontendUrl = process.env.FRONTEND_URL ?? ''
    const backendUrl = process.env.BACKEND_URL ?? ''

    const body: any = {
      items,
      external_reference: pedido.id,
      back_urls: {
        success: `${frontendUrl}/pago/resultado`,
        failure: `${frontendUrl}/pago/resultado`,
        pending: `${frontendUrl}/pago/resultado`,
      },
    }
    // auto_return exige back_urls válidas (públicas, con https). En local sin túnel se omite.
    if (frontendUrl.startsWith('https://')) body.auto_return = 'approved'
    // El webhook exige una URL HTTPS pública.
    if (backendUrl.startsWith('https://')) body.notification_url = `${backendUrl}/api/pago/webhook`

    const pref = await new Preference(getMpClient()).create({ body })

    pedido.mp_preference_id = pref.id
    await em.flush()

    return res.status(200).json({
      message: 'Preferencia de pago creada',
      data: { init_point: pref.init_point },
    })
  } catch (error: unknown) {
    return responderError(res, error, {
      mensaje: 'Error al crear la preferencia de pago',
      noEncontrado: 'Pedido no encontrado',
    })
  }
}

// POST /api/pago/webhook  (PÚBLICA: la llama Mercado Pago, no lleva token)
// Es la fuente de verdad del estado del pago.
async function webhook(req: Request, res: Response) {
  const dataId = String(req.query['data.id'] ?? '')

  // 1) Verificar que la notificación realmente viene de Mercado Pago
  try {
    WebhookSignatureValidator.validate({
      xSignature: req.headers['x-signature'] as string,
      xRequestId: req.headers['x-request-id'] as string,
      dataId,
      secret: process.env.MP_WEBHOOK_SECRET!,
    })
  } catch (error: any) {
    console.warn('Webhook de Mercado Pago rechazado (firma inválida):', error?.message)
    return res.sendStatus(401)
  }

  try {
    // 2) Solo nos interesan las notificaciones de pagos
    const tipo = req.body?.type ?? req.query.type
    if (tipo !== 'payment' || !dataId) return res.sendStatus(200)

    // 3) Consultamos el pago a Mercado Pago en vez de confiar en lo que llegó en el body
    let pago
    try {
      pago = await new Payment(getMpClient()).get({ id: dataId })
    } catch (error: any) {
      if (error?.status === 404) return res.sendStatus(200) // p. ej. la simulación del panel
      throw error
    }

    const pedidoId = pago.external_reference
    if (!pedidoId) return res.sendStatus(200)

    const pedido = await em.findOne(Pedido, { id: pedidoId })
    if (!pedido) {
      console.warn(`Webhook MP: no existe el pedido ${pedidoId}`)
      return res.sendStatus(200)
    }

    if (pago.status === 'approved') {
      if (pedido.estado_pago === 'Confirmado') return res.sendStatus(200) // idempotencia

      if (pedido.estado_pago === 'Cancelado') {
        console.warn(`Pago aprobado (${pago.id}) para el pedido cancelado ${pedido.id}: requiere reembolso manual`)
        return res.sendStatus(200)
      }

      if (Number(pago.transaction_amount) < Number(pedido.costo_total)) {
        console.warn(`Monto pagado menor al total del pedido ${pedido.id}`)
        return res.sendStatus(200)
      }

      pedido.estado_pago = 'Confirmado'
      pedido.fecha_pago = new Date()
      pedido.mp_payment_id = String(pago.id)
      await em.flush()
    }
    // Otros estados (pending, rejected, in_process...) dejan el pedido como está.

    return res.sendStatus(200)
  } catch (error: unknown) {
    return responderError(res, error, { mensaje: 'Error interno al procesar el webhook' }) // Mercado Pago reintenta
  }
}

export { crearPreferencia, webhook }