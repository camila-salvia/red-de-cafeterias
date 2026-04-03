import { CategoriaRepository } from "./categoria.repository.js";

export class CategoriaService {

  private repository = new CategoriaRepository();

  getAll() {
    return this.repository.findAll();
  }

  getById(id: number) {
    return this.repository.findById(id);
  }

  create(data: any) {
    return this.repository.create(data);
  }

  update(id: number, data: any) {
    return this.repository.update(id, data);
  }

  delete(id: number) {
    return this.repository.delete(id);
  }
}


