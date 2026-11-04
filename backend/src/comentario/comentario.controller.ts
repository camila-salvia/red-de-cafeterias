import { Request, Response, NextFunction } from 'express'
import { orm } from '../shared/database/orm.js'
import { NotFoundError } from '@mikro-orm/core'
import { Comentario } from './comentario.entity.js'
import { Usuario } from '../usuario/usuario.entity.js'

const em = orm.em

// La sanitización se encarga de limpiar, estructurar y recortar el objeto que manda el cliente para quedarse 
// únicamente con lo que le interesa al servidor, descartando todo lo demás.
function sanitizeComentarioInput( 
    req: Request, 
    res: Response, 
    next: NextFunction
) {
    const esCreacion = req.method === 'POST'
    
    req.body.sanitizedInput = {
        contenido: req.body.contenido,
        fecha_publicacion: esCreacion ? new Date() : req.body.fecha_publicacion,
        puntuacion: req.body.puntuacion ? Number(req.body.puntuacion) : undefined,
        usuario: esCreacion ? req.usuarioToken?.id : req.body.usuario // Inyectamos el usuario desde el token de forma segura al crear
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
    const comentarios = await em.find(Comentario, {}, { populate: ['usuario'] })
    res.status(200).json({ message: 'Todos los comentarios encontrados', data: comentarios })
  } catch (error:any) {
    res.status(500).json({ message: 'Error al obtener comentarios' })
  }
}

// crear nuevo comentario
async function add(req: Request, res: Response) {
  try {
    const input = req.body.sanitizedInput;
    const comentario = em.create(Comentario, {...input, usuario: em.getReference (Usuario, input.usuario)})
    await em.flush()
    res.status(201).json({ message: 'Comentario creado', data: comentario })
  } catch (error:any) {
    console.error('Error detallado al crear:', error);
    res.status(500).json({ message: 'Error al crear comentario', detalle: error.message })
  }
}

// obtener comentario por id
 async function findOne(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const comentario = await em.findOneOrFail(Comentario, { id }, { populate: ['usuario'] })
    res.status(200).json({ message: 'Comentario encontrado', data: comentario })
  } catch (error:any) {
    res.status(404).json({ message: 'Comentario no encontrado' })
  }
}

// actualizar comentario
async function update(req: Request, res: Response) {
  try {
      const id = req.params.id as string
      const comentario = await em.findOneOrFail(Comentario, { id })
      em.assign(comentario, req.body.sanitizedInput)
      await em.flush()
      res.status(200).json({ message: 'Comentario actualizado', data: comentario })
  } catch (error:any) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({ message: 'Comentario no encontrado' })
    }
    console.error('Detalle del error en update:', error);
    res.status(500).json({ message: 'Error al actualizar comentario', detalle: error.message });
  }
}

// eliminar comentario
async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const comentario = await em.findOneOrFail(Comentario, { id })
    await em.removeAndFlush(comentario)
    res.status(200).send({ message: 'Comentario eliminado' })
  } catch (error:any) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({ message: 'Comentario no encontrado' })
    }
    console.error('Detalle del error en remove:', error);
    res.status(500).json({ message: 'Error al eliminar comentario', detalle: error.message });
  }
}

export {sanitizeComentarioInput, findAll, add, findOne, update, remove}