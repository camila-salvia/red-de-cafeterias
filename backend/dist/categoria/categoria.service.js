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
    update(id, input) {
        const index = categorias.findIndex(c => c.id_categoria === id);
        if (index === -1) {
            return null;
        }
        categorias[index] = new Categoria(input.id_categoria, input.nombre);
        return categorias[index];
    },
    delete(id) {
        const index = categorias.findIndex(c => c.id_categoria === id);
        if (index === -1) {
            return null;
        }
        const deletedCategoria = categorias[index];
        categorias.splice(index, 1);
        return deletedCategoria;
    }
};
//# sourceMappingURL=categoria.service.js.map