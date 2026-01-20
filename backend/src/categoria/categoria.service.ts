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
};
