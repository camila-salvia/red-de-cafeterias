import { AppDataSource } from "../../../database/data-source.js";

import { Categoria } from "./categoria.entity.js";
export const categoriaRepository = AppDataSource.getRepository(Categoria);