import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import { Categoria } from "./categoria.entity.js"

@Entity()
export class CategoriaClass {
  @PrimaryKey()
  id?: string
  @Property()
  nombre!: string
}

// borrar luego
