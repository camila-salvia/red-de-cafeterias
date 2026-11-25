import { Entity, Property, BlobType } from '@mikro-orm/core'
import { BaseEntity } from '../shared/database/baseEntity.entity.js'


@Entity()
export class ImagenProducto extends BaseEntity {

    @Property({ unique: true })
    nombre!: string

    
    @Property()
    tipo!: string

    @Property({ type: BlobType, columnType: 'mediumblob' })
    datos!: Buffer
}