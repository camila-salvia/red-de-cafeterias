import { Request, Response, NextFunction } from 'express'
import { Producto } from './producto.entity.js'
import { orm } from '../shared/database/orm.js'

const em = orm.em

function sanitizeProductoInput( 
    req: Request, 
    res: Response, 
    next: NextFunction
) {
    req.body.sanitizedInput = {
        id: req.body.id,
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        precio: req.body.precio,
        categoria: req.body.categoria
    }

    Object.keys(req.body.sanitizedInput).forEach(key => {
        if (req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key]
        }
    })

    next();
}

// obtener todas los productos
async function findAll(req: Request, res: Response) {
  try {
    const productos = await em.find(
        Producto, 
        {}, 
        { populate: ['categoria']})
    res.status(200).json({ message: 'Todos los productos encontrados', data: productos })
  } catch (error:any) {
    res.status(500).json({ message: 'Error al obtener productos' })
  }
}

// crear nuevo producto
async function add(req: Request, res: Response) {
  try {
    const producto = em.create(Producto, req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({ message: 'Producto creado', data: producto })
  } catch (error:any) {
    res.status(500).json({ message: 'Error al crear producto' })
  }
}


// obtener producto por id
 async function findOne(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const producto = await em.findOneOrFail(
        Producto, 
        { id },
        { populate: ['categoria']}
    )
    res.status(200).json({ message: 'Producto encontrado', data: producto })
  } catch (error:any) {
    res.status(404).json({ message: 'Producto no encontrado' })
  }
}

async function update(req: Request, res: Response) {
  try {
      const id = req.params.id as string
      const producto = em.getReference(Producto,  id)
      em.assign(producto, req.body.sanitizedInput)
      await em.flush()
      res.status(200).json({ message: 'Producto actualizado', data: producto })
  } catch (error:any) {
    res.status(500).json({ message: 'Error al actualizar producto' })
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const producto = em.getReference(Producto, id)
    await em.removeAndFlush(producto)
    res.status(200).send({ message: 'Producto eliminado' })
  } catch (error) {
    res.status(500).send({ message: 'Error al eliminar producto' });
  }
}

export {sanitizeProductoInput, findAll, add, findOne, update, remove}