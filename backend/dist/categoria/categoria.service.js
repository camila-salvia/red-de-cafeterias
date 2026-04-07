import { Categoria } from "./categoria.entity.js";
const categorias = [];
export const categoriaService = {
    async getAll() {
        return categorias;
    },
    async getById(id) {
        const categoria = categorias.find(c => c.id === id);
        return categoria;
    },
    async create(input) {
        const categoria = new Categoria(input.id, input.nombre);
        categorias.push(categoria);
        return categoria;
    },
    async update(id, input) {
        const index = categorias.findIndex(c => c.id === id);
        if (index === -1) {
            return null;
        }
        categorias[index] = new Categoria(input.id, input.nombre);
        return categorias[index];
    },
    async delete(id) {
        const index = categorias.findIndex(c => c.id === id);
        if (index === -1) {
            return null;
        }
        const deletedCategoria = categorias[index];
        categorias.splice(index, 1);
        return deletedCategoria;
    }
};
//# sourceMappingURL=categoria.service.js.map