import { Repository } from "../shared/repository.js";
import { Categoria } from "./categoria.entity.js";

const categorias = [
  new Categoria ("1", "Bebidas"),
]
export class CategoriaRepository implements Repository<Categoria> {
  public findAll(): Categoria[] | undefined {
    return categorias
  }
  public findOne(item: { id: string; }): Categoria | undefined {
    return categorias.find((categoria) => categoria.id_categoria === item.id);
  }
  public add(item: Categoria): Categoria | undefined {
    categorias.push(item)
    return item;
  }
  public update(item: Categoria): Categoria | undefined {
    const index = categorias.findIndex((categoria) => categoria.id_categoria === item.id_categoria);
    if (index !== -1) {
      categorias[index] = item;
      return item;
    }
    return undefined;
  }
  public delete(item: { id: string; }): Categoria | undefined {
    const index = categorias.findIndex((categoria) => categoria.id_categoria === item.id);
    if (index !== -1) {
      const deletedItem = categorias[index];
      categorias.splice(index, 1);
      return deletedItem;
    }
    //return undefined;
  }
}