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
  const input = req.body.sanitizedInput;
  const categoria = await categoriaService.create(input);
  res.status(201).send({ message: 'Categoría creada', data: categoria });
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

