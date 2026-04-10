/*
export class Categoria {
  constructor(
    public id: string,
    public nombre: string
  ) {}
}
*/

import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity()
export class Categoria {
  @PrimaryKey()
  id?: string
  @Property()
  nombre!: string
}
