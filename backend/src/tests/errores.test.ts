import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import express from 'express'
import type { AddressInfo } from 'node:net'
import { NotFoundError } from '@mikro-orm/core'
import { responderError, manejadorErrores } from '../shared/errores.js'

// Verifica que en producción no aparezca el texto del error interno

const SECRETO = "Duplicate entry 'x' for key 'usuario.email_unique' (tabla interna, SQL: select * from usuario)"

function resFalso() {
  const res: any = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

describe('responderError', () => {
  const entornoOriginal = process.env.NODE_ENV

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    process.env.NODE_ENV = entornoOriginal
    vi.restoreAllMocks()
  })

  it('en producción responde 500 con mensaje fijo y no expone el error interno', () => {
    process.env.NODE_ENV = 'production'
    const res = resFalso()

    responderError(res, new Error(SECRETO), { mensaje: 'Error al crear método de pago' })

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ message: 'Error al crear método de pago' })
    expect(JSON.stringify(res.json.mock.calls[0][0])).not.toContain('Duplicate')
  })

  it('fuera de producción agrega `detalle` para depurar', () => {
    process.env.NODE_ENV = 'development'
    const res = resFalso()

    responderError(res, new Error(SECRETO), { mensaje: 'Error al crear método de pago' })

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ message: 'Error al crear método de pago', detalle: SECRETO })
  })

  it('NotFoundError responde 404 solo cuando se indica un mensaje para el recurso', () => {
    process.env.NODE_ENV = 'production'
    const res = resFalso()

    responderError(res, new NotFoundError('Producto not found ({ id: 1 })'), {
      mensaje: 'Error al obtener',
      noEncontrado: 'Producto no encontrado',
    })

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ message: 'Producto no encontrado' })
  })

  it('NotFoundError sin mensaje específico de recurso responde 500', () => {
    process.env.NODE_ENV = 'production'
    const res = resFalso()

    responderError(res, new NotFoundError('Dependency not found (internal relation)'), {
      mensaje: 'Error al crear el producto',
    })

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ message: 'Error al crear el producto' })
  })

  it('un error que no es NotFoundError nunca se convierte en 404', () => {
    const res = resFalso()
    responderError(res, new Error('conexión caída'), { mensaje: 'Error', noEncontrado: 'No existe' })
    expect(res.status).toHaveBeenCalledWith(500)
  })

  it('registra el error completo en el servidor', () => {
    const res = resFalso()
    const error = new Error(SECRETO)
    responderError(res, error, { mensaje: 'Error al crear' })
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Error al crear'), error)
  })

  it('tolera errores que no son instancias de Error (string, null)', () => {
    process.env.NODE_ENV = 'development'
    const res = resFalso()
    expect(() => responderError(res, 'texto', { mensaje: 'Error' })).not.toThrow()
    expect(() => responderError(res, null, { mensaje: 'Error' })).not.toThrow()
  })
})

describe('manejadorErrores (integración con Express)', () => {
  let servidor: ReturnType<ReturnType<typeof express>['listen']>
  let base: string
  const entornoOriginal = process.env.NODE_ENV

  beforeEach(async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const app = express()
    app.use(express.json())
    app.get('/falla', () => {
      throw new Error(SECRETO)
    })
    app.get('/falla-async', async () => {
      throw new Error(SECRETO)
    })
    app.post('/eco', (req, res) => res.json(req.body))
    app.use(manejadorErrores)
    await new Promise<void>((ok) => {
      servidor = app.listen(0, '127.0.0.1', () => ok())
    })
    base = `http://127.0.0.1:${(servidor.address() as AddressInfo).port}`
  })
  afterEach(async () => {
    process.env.NODE_ENV = entornoOriginal
    vi.restoreAllMocks()
    await new Promise((ok) => servidor.close(ok))
  })

  it('JSON mal formado responde 400 en JSON (no HTML con stack)', async () => {
    process.env.NODE_ENV = 'production'
    const r = await fetch(`${base}/eco`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"nombre": ',
    })
    expect(r.status).toBe(400)
    expect(r.headers.get('content-type')).toContain('application/json')
    expect(await r.json()).toEqual({ message: 'El cuerpo de la petición no es un JSON válido.' })
  })

  it('un error no controlado en producción devuelve 500 genérico', async () => {
    process.env.NODE_ENV = 'production'
    const r = await fetch(`${base}/falla`)
    const texto = await r.text()
    expect(r.status).toBe(500)
    expect(JSON.parse(texto)).toEqual({ message: 'Error interno del servidor.' })
    expect(texto).not.toContain('Duplicate')
  })

  it('un error async no controlado también pasa por el middleware (Express 5)', async () => {
    process.env.NODE_ENV = 'production'
    const r = await fetch(`${base}/falla-async`)
    expect(r.status).toBe(500)
    expect(await r.json()).toEqual({ message: 'Error interno del servidor.' })
  })

  it('fuera de producción incluye `detalle`', async () => {
    process.env.NODE_ENV = 'development'
    const r = await fetch(`${base}/falla`)
    expect(await r.json()).toEqual({ message: 'Error interno del servidor.', detalle: SECRETO })
  })
})