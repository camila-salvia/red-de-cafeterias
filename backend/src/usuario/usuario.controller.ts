import { Request, Response, NextFunction } from 'express'
import { Usuario } from './usuario.entity.js'
import { orm } from '../shared/database/orm.js'

const em = orm.em

function sanitizeUsuarioInput( 
    req: Request, 
    res: Response, 
    next: NextFunction
) {
    req.body.sanitizedInput = {
        id: req.body.id,
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        telefono: req.body.telefono,
        direccion: req.body.direccion,
        email: req.body.email,
        password: req.body.password,
        esAdmin: req.body.esAdmin
    }

    Object.keys(req.body.sanitizedInput).forEach(key => {
        if (req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key]
        }
    })

    next();
}

// obtener todas los usuarios
async function findAll(req: Request, res: Response) {
  try {
    const usuarios = await em.find(
        Usuario, 
        {} )
      // { populate: ['comentarios', 'pedidos']})
    res.status(200).json({ message: 'Todos los usuarios encontrados', data: usuarios })
  } catch (error:any) {
    res.status(500).json({ message: 'Error al obtener usuarios' })
  }
}

// crear nuevo usuario
async function add(req: Request, res: Response) {
  try {
    const usuario = em.create(Usuario, req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({ message: 'Usuario creado', data: usuario })
  } catch (error:any) {
    console.error('Error detallado al crear:', error);
    res.status(500).json({ message: 'Error al crear usuario', detalle: error.message })
  }
}


// obtener usuario por id
 async function findOne(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const usuario = await em.findOneOrFail(
        Usuario, 
        { id },
      //  { populate: ['comentarios', 'pedidos']}
    )
    res.status(200).json({ message: 'Usuario encontrado', data: usuario })
  } catch (error:any) {
    res.status(404).json({ message: 'Usuario no encontrado' })
  }
}

async function update(req: Request, res: Response) {
  try {
      const id = req.params.id as string
      const usuario = em.getReference(Usuario,  id)
      em.assign(usuario, req.body.sanitizedInput)
      await em.flush()
      res.status(200).json({ message: 'Usuario actualizado', data: usuario })
  } catch (error:any) {
    res.status(500).json({ message: 'Error al actualizar usuario' })
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const usuario = em.getReference(Usuario, id)
    await em.removeAndFlush(usuario)
    res.status(200).send({ message: 'Usuario eliminado' })
  } catch (error) {
    res.status(500).send({ message: 'Error al eliminar usuario' });
  }
}

export {sanitizeUsuarioInput, findAll, add, findOne, update, remove}