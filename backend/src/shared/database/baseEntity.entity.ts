import { PrimaryKey } from '@mikro-orm/core'
import {v4 as uuid} from 'uuid'

export abstract class BaseEntity {
  @PrimaryKey()
  id: string = uuid() // Se genera automáticamente al hacer 'new Producto()' o 'em.create()'
}