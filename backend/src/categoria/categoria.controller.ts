import { Request, Response, NextFunction } from 'express'
import { orm } from '../shared/database/orm.js'
//import { categoriaService } from './categoria.service.js'
import { Categoria } from './categoria.entity.js'

const em = orm.em
/*export function sanitizeCategoriaInput( req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    id: req.body.id,
    nombre: req.body.nombre
  } 
  next();
} */

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
    const categoria = em.create(Categoria, req.body)
    await em.flush()
    res.status(201).json({ message: 'Categoría creada', data: categoria })
  } catch (error:any) {
    res.status(500).json({ message: 'Error al crear categoría' })
  }
}


// obtener categoría por id
/* export async function getCategoriaById(req: Request, res: Response) {
  const id = req.params.id as string;

  const categoria = await categoriaService.getById(id);

  if (!categoria) {
    return res.status(404).send({ message: 'Categoría no encontrada' });
  }

  res.status(200).send({ data: categoria });
}

export async function updateCategoria(req: Request, res: Response) {
  const id = req.params.id as string;
  const updatedData = req.body.sanitizedInput;

  try {
    const categoria = await categoriaService.update(id, updatedData);

    if (!categoria) {
      return res.status(404).send({ message: 'Categoría no encontrada' });
    }

    res.status(200).send({ data: categoria });
  } catch (error) {
    res.status(500).send({ message: 'Error al actualizar categoría' });
  }
}

export async function deleteCategoria(req: Request, res: Response) {
  const id = req.params.id as string;

  try {
    const categoria = await categoriaService.delete(id);

    if (!categoria) {
      return res.status(404).send({ message: 'Categoría no encontrada' });
    }

    res.status(200).send({ data: categoria });
  } catch (error) {
    res.status(500).send({ message: 'Error al eliminar categoría' });
  }
}
*/
export {findAll, add}