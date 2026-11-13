import { Request, Response, NextFunction } from 'express'
import { orm } from '../shared/database/orm.js'
import { NotFoundError } from '@mikro-orm/core'
import { Categoria } from './categoria.entity.js'

const em = orm.em

function sanitizeCategoriaInput( 
    req: Request, 
    res: Response, 
    next: NextFunction
) {
    req.body.sanitizedInput = {
        nombre: req.body.nombre,
    }

    Object.keys(req.body.sanitizedInput).forEach(key => {
        if (req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key]
        }
    })

    next();
}

// obtener todas las categorías
async function findAll(req: Request, res: Response) {
  try {
    const categorias = await em.find(Categoria, {})
    return res.status(200).json({ message: 'Todas las categorías encontradas', data: categorias })
  } catch (error:any) {
    return res.status(500).json({ message: 'Error al obtener categorías' })
  }
}

// crear nueva categoría
async function add(req: Request, res: Response) {
  try {
    const categoria = em.create(Categoria, req.body.sanitizedInput)
    await em.flush()
    return res.status(201).json({ message: 'Categoría creada', data: categoria })
  } catch (error:any) {
    return res.status(500).json({ message: 'Error al crear categoría' })
  }
}

// obtener categoría por id
 async function findOne(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const categoria = await em.findOneOrFail(Categoria, { id })
    return res.status(200).json({ message: 'Categoría encontrada', data: categoria })
  } catch (error:any) {
    return res.status(404).json({ message: 'Categoría no encontrada' })
  }
}

// actualizar categoría
async function update(req: Request, res: Response) {
  try {
      const id = req.params.id as string
      const categoria = await em.findOneOrFail(Categoria, { id })
      em.assign(categoria, req.body.sanitizedInput)
      await em.flush()
      return res.status(200).json({ message: 'Categoría actualizada', data: categoria })
  } catch (error:any) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({ message: 'Categoría no encontrada' })
    }
    console.error('Detalle del error en update:', error);
    return res.status(500).json({ message: 'Error al actualizar categoría', detalle: error.message });
  }
}

// eliminar categoría
async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const categoria = await em.findOneOrFail(Categoria, { id })
    await em.removeAndFlush(categoria)
    return res.status(200).send({ message: 'Categoría eliminada' })
  } catch (error:any) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({ message: 'Categoría no encontrada' })
    }
    console.error('Detalle del error en remove:', error);
    return res.status(500).json({ message: 'Error al eliminar categoría', detalle: error.message });
  }
}

export {sanitizeCategoriaInput, findAll, add, findOne, update, remove}