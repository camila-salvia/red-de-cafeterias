import "reflect-metadata";
import { DataSource } from "typeorm";
import { Categoria } from "../backend/src/categoria/categoria.entity.ts";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "tu_password",
  database: "tu_db",
  synchronize: false,
  logging: false,
  entities: [Categoria],
});
