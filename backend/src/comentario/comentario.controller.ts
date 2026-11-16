import { Request, Response, NextFunction } from 'express'
import { orm } from '../shared/database/orm.js'
import { Comentario } from './comentario.entity.js'

const em = orm.em

// La sanitización se encarga de limpiar, estructurar y recortar el objeto que manda el cliente para quedarse 
// únicamente con lo que le interesa al servidor, descartando todo lo demás
function sanitizeComentarioInput( 
    req: Request, 
    res: Response, 
    next: NextFunction
) {
    const esCreacion = req.method === 'POST'
    // texto opcional: al crear, si no viene (o viene vacío) se guarda como '' (la columna no admite null)
    const contenido = typeof req.body.contenido === 'string' ? req.body.contenido.trim() : req.body.contenido
    
    req.body.sanitizedInput = {
        contenido: esCreacion ? (contenido ?? '') : contenido,
        fecha_publicacion: esCreacion ? new Date() : req.body.fecha_publicacion,
        puntuacion: req.body.puntuacion,
        // al crear, el usuario lo decide el servidor (token). se ignora lo que mande el cliente
        usuario: esCreacion ? req.usuarioToken?.id : req.body.usuario // Inyectamos el usuario desde el token de forma segura al crear
    }

    Object.keys(req.body.sanitizedInput).forEach(key => {
        if (req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key]
        }
    })

    next();
}

// comentarios públicos: del usuario se muestran id y nombre (no mail, direccion, telefono, etc)
function aVistaPublica(c: Comentario) {
  return {
    id: c.id,
    contenido: c.contenido,
    fecha_publicacion: c.fecha_publicacion,
    puntuacion: c.puntuacion,
    usuario: { id: c.usuario.id, nombre: c.usuario.nombre }
  }
}

// obtener todos los comentarios
async function findAll(req: Request, res: Response) {
  try {
    const comentarios = await em.find(
      Comentario,
      {},
      { populate: ['usuario'], orderBy: { fecha_publicacion: 'DESC' } }
    )
    return res.status(200).json({ message: 'Todos los comentarios encontrados', data: comentarios.map(aVistaPublica) })
  } catch (error:any) {
    res.status(500).json({ message: 'Error al obtener comentarios' })
  }
}

// crear nuevo comentario
async function add(req: Request, res: Response) {
  try {
    const comentario = em.create(Comentario, req.body.sanitizedInput)
    await em.flush()
    // cargar usuario para devolver misma vista pública que el listado
    await em.populate(comentario, ['usuario'])
    res.status(201).json({ message: 'Comentario creado', data: aVistaPublica(comentario) })
  } catch (error:any) {
    console.error('Error detallado al crear: ', error);
    res.status(500).json({ message: 'Error al crear comentario', detalle: error.message })
  }
}

// obtener comentario por id
 async function findOne(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const comentario = await em.findOneOrFail(Comentario, { id }, { populate: ['usuario'] })
    res.status(200).json({ message: 'Comentario encontrado', data: aVistaPublica(comentario) })
  } catch (error:any) {
    res.status(404).json({ message: 'Comentario no encontrado' })
  }
}

// actualizar comentario
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

// eliminar comentario
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