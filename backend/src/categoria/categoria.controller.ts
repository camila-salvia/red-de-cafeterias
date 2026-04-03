import { Request, Response, NextFunction } from 'express'
import { categoriaService } from './categoria.service.js'
export function sanitizeCategoriaInput( req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    id_categoria: req.body.id_categoria,
    nombre: req.body.nombre
  } 
  next();
} 

export async function createCategoria(req: Request, res: Response) {
  try {
    const categoria = await categoriaService.create(req.body.sanitizedInput);
    res.status(201).send({ data: categoria });
  } catch (error) {
    res.status(500).send({ message: 'Error al crear categoría' });
  }
}

export async function getCategorias(req: Request, res: Response) {
  const categorias = await categoriaService.getAll();
  res.status(200).send({ data: categorias });
}

export async function getCategoriaById(req: Request, res: Response) {
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
