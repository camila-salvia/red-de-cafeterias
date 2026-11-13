import { Request, Response, NextFunction } from 'express'
import { Usuario } from './usuario.entity.js'
import { NotFoundError } from '@mikro-orm/core'
import { orm } from '../shared/database/orm.js'
import { getJwtSecret } from '../shared/middleware/auth.middleware.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const em = orm.em
const SALT_ROUNDS = 10

// La sanitización se encarga de limpiar, estructurar y recortar el objeto que manda el cliente para quedarse 
// únicamente con lo que le interesa al servidor, descartando todo lo demás.
function sanitizeUsuarioInput( 
    req: Request, 
    res: Response, 
    next: NextFunction
) {
    req.body.sanitizedInput = {
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        telefono: req.body.telefono,
        direccion: req.body.direccion,
        email: req.body.email,
        password: req.body.password,
        //esAdmin: req.body.esAdmin, --> solo un admin puede cambiar el rol, no se permite desde el front
    }

    Object.keys(req.body.sanitizedInput).forEach(key => {
        if (req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key]
        }
    })
    next();
}

async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña requeridos' });
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Email y contraseña deben ser texto' });
    }

    const usuario = await em.findOne(Usuario, { email });
    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Valida contraseña hasheada con bcrypt o texto plano temporal
    let passwordValida = false;
    const estaHasheada = usuario.password.startsWith('$2b$') || usuario.password.startsWith('$2a$');
    if (estaHasheada) {
      passwordValida = await bcrypt.compare(password, usuario.password);
    } else {
      passwordValida = usuario.password === password;
      if (passwordValida) {
        usuario.password = await bcrypt.hash(password, SALT_ROUNDS);
        await em.flush();
      }
    }

    if (!passwordValida) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        esAdmin: usuario.esAdmin
      },
      getJwtSecret(),
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      message: 'Inicio de sesión exitoso',
      data: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        esAdmin: usuario.esAdmin,
        token
      }
    });
  } catch (error: any) {
    console.error('Error en login:', error);
    return res.status(500).json({ message: 'Error interno en el servidor' });
  }
}

// obtener todas los usuarios (solo el admin puede)
async function findAll(req: Request, res: Response) {
  try {
    const usuarios = await em.find(
        Usuario, 
        {} )
    return res.status(200).json({ message: 'Todos los usuarios encontrados', data: usuarios })
  } catch (error:any) {
    return res.status(500).json({ message: 'Error al obtener usuarios' })
  }
}

// crear nuevo usuario
async function add(req: Request, res: Response) {
  try {
    const input = { ...req.body.sanitizedInput }
    input.password = await bcrypt.hash(input.password, SALT_ROUNDS)

    const usuario = em.create(Usuario, input)
    await em.flush()
    return res.status(201).json({ message: 'Usuario creado', data: usuario })
  } catch (error:any) {
    console.error('Error detallado al crear:', error);
    return res.status(500).json({ message: 'Error al crear usuario', detalle: error.message })
  }
}

// obtener usuario por id
 async function findOne(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const usuario = await em.findOneOrFail(
        Usuario, 
        { id }
    )
    return res.status(200).json({ message: 'Usuario encontrado', data: usuario })
  } catch (error:any) {
    return res.status(404).json({ message: 'Usuario no encontrado' })
  }
}

// actualizar usuario
async function update(req: Request, res: Response) {
  try {
      const id = req.params.id as string
      const usuario = await em.findOneOrFail(Usuario, { id })

      const input = { ...req.body.sanitizedInput }
      if (input.password) {
        input.password = await bcrypt.hash(String(input.password), SALT_ROUNDS)
      }
      // solo un admin puede cambiar el rol
      if (req.usuarioToken?.esAdmin && typeof req.body.esAdmin === 'boolean') {
        input.esAdmin = req.body.esAdmin
      }

      em.assign(usuario, input)
      await em.flush()
      return res.status(200).json({ message: 'Usuario actualizado', data: usuario })
  } catch (error:any) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }
    console.error('Error al actualizar usuario:', error)
    return res.status(500).json({ message: 'Error al actualizar usuario' })
  }
}

// eliminar usuario
async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const usuario = await em.findOneOrFail(Usuario, { id })
    await em.removeAndFlush(usuario)
    return res.status(200).send({ message: 'Usuario eliminado' })
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }
    console.error('Error al eliminar usuario:', error)
    return res.status(500).send({ message: 'Error al eliminar usuario' });
  }
}

export {sanitizeUsuarioInput, findAll, add, findOne, update, remove, login}