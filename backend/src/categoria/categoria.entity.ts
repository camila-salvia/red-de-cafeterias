import { Entity, Property, OneToMany, Collection } from '@mikro-orm/core'
import { BaseEntity } from '../shared/database/baseEntity.entity.js'
import { Producto } from '../producto/producto.entity.js'

@Entity()
export class Categoria extends BaseEntity {
  @Property({nullable: false})
  nombre!: string

  @OneToMany(() => Producto, producto => producto.categoria)
  productos = new Collection<Producto>(this)
}