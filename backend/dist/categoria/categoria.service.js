import { Categoria } from "./categoria.entity.js";
const categorias = [];
export const categoriaService = {
    getAll() {
        return categorias;
    },
    getById(id) {
        const categoria = categorias.find(c => c.id_categoria === id);
        return categoria;
    },
    create(input) {
        const categoria = new Categoria(input.id_categoria, input.nombre);
        categorias.push(categoria);
        return categoria;
    },
};
//# sourceMappingURL=categoria.service.js.map