import { categoriaService } from './categoria.service.js';
export function sanitizeCategoriaInput(req, res, next) {
    req.body.sanitizedInput = {
        id_categoria: req.body.id_categoria,
        nombre: req.body.nombre
    };
    next();
}
export async function createCategoria(req, res) {
    try {
        const categoria = await categoriaService.create(req.body.sanitizedInput);
        res.status(201).send({ data: categoria });
    }
    catch (error) {
        res.status(500).send({ message: 'Error al crear categoría' });
    }
}
export async function getCategorias(req, res) {
    const categorias = await categoriaService.getAll();
    res.status(200).send({ data: categorias });
}
export async function getCategoriaById(req, res) {
    const id = req.params.id;
    const categoria = await categoriaService.getById(id);
    if (!categoria) {
        return res.status(404).send({ message: 'Categoría no encontrada' });
    }
    res.status(200).send({ data: categoria });
}
//# sourceMappingURL=categoria.controller.js.map