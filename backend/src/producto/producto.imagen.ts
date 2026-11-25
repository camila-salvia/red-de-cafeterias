import type { Request, Response } from 'express'
import { orm } from '../shared/database/orm.js'
import { ImagenProducto } from './imagen-producto.entity.js'

const em = orm.em


export async function servirImagenProducto(req: Request, res: Response) {
  try {
    const nombre = req.params.nombre as string
    const imagen = await em.findOne(ImagenProducto, { nombre })
    if (!imagen) {
      return res.status(404).json({ message: 'Imagen no encontrada' })
    }
    res.set('Content-Type', imagen.tipo)
    // El nombre es un UUID: si cambia la imagen, cambia el nombre, así que puede cachearse
    res.set('Cache-Control', 'public, max-age=31536000, immutable')
    return res.send(imagen.datos)
  } catch (error) {
    console.error('Error al servir la imagen del producto:', error)
    return res.status(500).json({ message: 'No se pudo obtener la imagen' })
  }
}