import { Request, Response, NextFunction } from 'express'
import { orm } from '../shared/database/orm.js'
import { Comentario } from './comentario.entity.js'

const em = orm.em

function sanitizeComentarioInput( 
    req: Request, 
    res: Response, 
    next: NextFunction
) {
    req.body.sanitizedInput = {
        id: req.body.id,
        contenido: req.body.contenido,
        fecha_publicacion: req.body.fecha_publicacion,
        puntuacion: req.body.puntuacion
    }

    Object.keys(req.body.sanitizedInput).forEach(key => {
        if (req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key]
        }
    })

    next();
}

// obtener todas los comentarios
async function findAll(req: Request, res: Response) {
  try {
    const comentarios = await em.find(Comentario, {})
    res.status(200).json({ message: 'Todos los comentarios encontrados', data: comentarios })
  } catch (error:any) {
    res.status(500).json({ message: 'Error al obtener comentarios' })
  }
}

// crear nuevo comentario
async function add(req: Request, res: Response) {
  try {
    const comentario = em.create(Comentario, req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({ message: 'Comentario creado', data: comentario })
  } catch (error:any) {
    res.status(500).json({ message: 'Error al crear comentario' })
  }
}

// obtener comentario por id
 async function findOne(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const comentario = await em.findOneOrFail(Comentario, { id })
    res.status(200).json({ message: 'Comentario encontrado', data: comentario })
  } catch (error:any) {
    res.status(404).json({ message: 'Comentario no encontrado' })
  }
}

async function update(req: Request, res: Response) {
  try {
      const id = req.params.id as string
      const comentario = em.getReference(Comentario,  id)
      em.assign(comentario, req.body.sanitizedInput)
      await em.flush()
      res.status(200).json({ message: 'Comentario actualizado', data: comentario })
  } catch (error:any) {
    res.status(500).json({ message: 'Error al actualizar comentario' })
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const comentario = em.getReference(Comentario, id)
    await em.removeAndFlush(comentario)
    res.status(200).send({ message: 'Comentario eliminado' })
  } catch (error) {
    res.status(500).send({ message: 'Error al eliminar comentario' });
  }
}

export {sanitizeComentarioInput, findAll, add, findOne, update, remove}