import { Categoria } from "./categoria.entity.js";

const categorias: Categoria[] = [];

export const categoriaService = {

  getAll() {
    return categorias;
  },

  getById(id: string) {
  const categoria = categorias.find(c => c.id_categoria === id);
  return categoria;
  },


  create(input: { id_categoria: string; nombre: string }) {
    const categoria = new Categoria(input.id_categoria, input.nombre);
    categorias.push(categoria);
    return categoria;
  },

  update(id: string, input: { id_categoria: string; nombre: string }) {
    const index = categorias.findIndex(c => c.id_categoria === id);
    if (index === -1) {
      return null;
    }
    categorias[index] = new Categoria(input.id_categoria, input.nombre);
    return categorias[index];
  },

  delete(id: string) {
    const index = categorias.findIndex(c => c.id_categoria === id);
    if (index === -1) {
      return null;
    }
    const deletedCategoria = categorias[index];
    categorias.splice(index, 1);
    return deletedCategoria;
  }
};

