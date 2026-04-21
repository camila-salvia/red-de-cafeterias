import { Request, Response, NextFunction } from 'express'
import { orm } from '../shared/database/orm.js'
import { Categoria } from './categoria.entity.js'

const em = orm.em

function sanitizeCategoriaInput( 
    req: Request, 
    res: Response, 
    next: NextFunction
) {
    req.body.sanitizedInput = {
        id: req.body.id,
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
    res.status(200).json({ message: 'Todas las categorías encontradas', data: categorias })
  } catch (error:any) {
    res.status(500).json({ message: 'Error al obtener categorías' })
  }
}

// crear nueva categoría
async function add(req: Request, res: Response) {
  try {
    const categoria = em.create(Categoria, req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({ message: 'Categoría creada', data: categoria })
  } catch (error:any) {
    res.status(500).json({ message: 'Error al crear categoría' })
  }
}


// obtener categoría por id
 async function findOne(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const categoria = await em.findOneOrFail(Categoria, { id })
    res.status(200).json({ message: 'Categoría encontrada', data: categoria })
  } catch (error:any) {
    res.status(404).json({ message: 'Categoría no encontrada' })
  }
}

async function update(req: Request, res: Response) {
  try {
      const id = req.params.id as string
      const categoria = em.getReference(Categoria,  id)
      em.assign(categoria, req.body.sanitizedInput)
      await em.flush()
      res.status(200).json({ message: 'Categoría actualizada', data: categoria })
  } catch (error:any) {
    res.status(500).json({ message: 'Error al actualizar categoría' })
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const categoria = em.getReference(Categoria, id)
    await em.removeAndFlush(categoria)
    res.status(200).send({ message: 'Categoría eliminada' })
  } catch (error) {
    res.status(500).send({ message: 'Error al eliminar categoría' });
  }
}

export {sanitizeCategoriaInput, findAll, add, findOne, update, remove}