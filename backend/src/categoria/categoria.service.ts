/*
import { Categoria } from "./categoria.entity.js";

const categorias: Categoria[] = [];

export const categoriaService = {

  async getAll() {
    return categorias;
  },

  async getById(id: string) {
    const categoria = categorias.find(c => c.id === id);
    return categoria;
  },

  async create(input: { id: string; nombre: string }) {
    const categoria = new Categoria(input.id, input.nombre);
    categorias.push(categoria);
    return categoria;
  },

  async update(id: string, input: { id: string; nombre: string }) {
    const index = categorias.findIndex(c => c.id === id);
    if (index === -1) {
      return null;
    }
    categorias[index] = new Categoria(input.id, input.nombre);
    return categorias[index];
  },

  async delete(id: string) {
    const index = categorias.findIndex(c => c.id === id);
    if (index === -1) {
      return null;
    }
    const deletedCategoria = categorias[index];
    categorias.splice(index, 1);
    return deletedCategoria;
  }
};
*/
