import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
//import { Producto } from "../producto/producto.entity.js";

@Entity({ name: "categoria" })
export class Categoria {

  @PrimaryColumn({ type: "varchar", length: 36 })
  id_categoria!: string;

  @Column({ type: "varchar", length: 50 })
  nombre!: string;

  //@OneToMany(() => Producto, (producto) => producto.categoria)
  //productos: Producto[];
}
