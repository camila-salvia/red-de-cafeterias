import { Categoria } from "./categoria.entity.js";
const categorias = [
    new Categoria("1", "Bebidas"),
];
export class CategoriaRepository {
    findAll() {
        return categorias;
    }
    findOne(item) {
        return categorias.find((categoria) => categoria.id_categoria === item.id);
    }
    add(item) {
        categorias.push(item);
        return item;
    }
    update(item) {
        const index = categorias.findIndex((categoria) => categoria.id_categoria === item.id_categoria);
        if (index !== -1) {
            categorias[index] = item;
            return item;
        }
        return undefined;
    }
    delete(item) {
        const index = categorias.findIndex((categoria) => categoria.id_categoria === item.id);
        if (index !== -1) {
            const deletedItem = categorias[index];
            categorias.splice(index, 1);
            return deletedItem;
        }
        //return undefined;
    }
}
//# sourceMappingURL=categoria.repository.js.map