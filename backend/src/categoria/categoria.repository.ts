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
}