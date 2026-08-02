import { Entity, Property } from '@mikro-orm/core'
import { BaseEntity } from '../shared/database/baseEntity.entity.js'

@Entity()
export class MetodoPago extends BaseEntity {
  @Property({nullable: false})
  nombre!: string

  @Property({nullable: false, default: true})
  activo!: boolean
}