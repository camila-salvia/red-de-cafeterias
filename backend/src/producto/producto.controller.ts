import { Request, Response, NextFunction } from 'express'
import { Producto } from './producto.entity.js'
import { Categoria } from '../categoria/categoria.entity.js'
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
    const { categoria } = req.query

    // devolvemos todos
    if (!categoria || categoria === 'TODO') {
      const productos = await em.find(Producto, {}, { populate: ['categoria'] })
      return res.status(200).json({ message: 'Todos los productos', data: productos })
    }

    // buscamos las categorías que coincidan con el texto
    const cats = await em.find(Categoria, {
      nombre: { $like: `%${String(categoria).toLowerCase()}%` }
    })

    if (cats.length === 0) {
      return res.status(200).json({ message: 'Sin productos para esa categoría', data: [] })
    }

    // traemos los productos asociados a esas categorías encontradas
    const productos = await em.find(
      Producto,
      { categoria: { $in: cats } },
      { populate: ['categoria'] }
    )

    return res.status(200).json({ message: 'Productos filtrados', data: productos })
  } catch (error: any) {
    console.error('Error detallado en findAll:', error)
    return res.status(500).json({ message: 'Error al obtener productos', error: error.message })
  }
}

// crear nuevo producto
async function add(req: Request, res: Response) {
  try {
    const input = req.body.sanitizedInput || req.body;
    if (!input.categoria) {
      return res.status(400).json({ message: 'La categoría es obligatoria' });
    }
    // Extrae el ID sin importar si envían "uuid" o { id: "uuid" }
    const categoriaId = typeof input.categoria === 'object' ? input.categoria.id : input.categoria;
    if (!categoriaId) {
      return res.status(400).json({ message: 'El ID de la categoría es inválido o no fue proporcionado' });
    }
    const producto = em.create(Producto, {
      ...input,
      categoria: em.getReference(Categoria, categoriaId)
    });
    await em.flush();
    return res.status(201).json({ message: 'Producto creado exitosamente', data: producto });
  } catch (error: any) {
    console.error('Error detallado al crear:', error);
    return res.status(500).json({ message: 'Error al crear producto', detalle: error.message });
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
      const id = req.params.id as string;
      // buscar producto 
      const producto = await em.findOneOrFail(Producto, { id });
      const input = req.body.sanitizedInput || req.body;
      // si el front envió categoria para actualizar, la convertimos en referencia
      if (input.categoria) {
        const categoriaId = typeof input.categoria === 'object' ? input.categoria.id : input.categoria;
        input.categoria = em.getReference(Categoria, categoriaId);
      }
      // asignar datos limpios al prodcucto encontrado
      em.assign(producto, input);
      await em.flush();
      res.status(200).json({ message: 'Producto actualizado', data: producto });
  } catch (error:any) {
      console.error('Detalle del error en update:', error);
      res.status(500).json({ message: 'Error al actualizar producto', detalle: error.message });
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