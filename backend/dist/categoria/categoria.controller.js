import { categoriaService } from './categoria.service.js';
export function sanitizeCategoriaInput(req, res, next) {
    req.body.sanitizedInput = {
        id: req.body.id,
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
export async function updateCategoria(req, res) {
    const id = req.params.id;
    const updatedData = req.body.sanitizedInput;
    try {
        const categoria = await categoriaService.update(id, updatedData);
        if (!categoria) {
            return res.status(404).send({ message: 'Categoría no encontrada' });
        }
        res.status(200).send({ data: categoria });
    }
    catch (error) {
        res.status(500).send({ message: 'Error al actualizar categoría' });
    }
}
export async function deleteCategoria(req, res) {
    const id = req.params.id;
    try {
        const categoria = await categoriaService.delete(id);
        if (!categoria) {
            return res.status(404).send({ message: 'Categoría no encontrada' });
        }
        res.status(200).send({ data: categoria });
    }
    catch (error) {
        res.status(500).send({ message: 'Error al eliminar categoría' });
    }
}
//# sourceMappingURL=categoria.controller.js.map