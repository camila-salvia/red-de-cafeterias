import {
    Entity,
    Property,
    ManyToOne,
    Rel,
} from '@mikro-orm/core'
import { BaseEntity } from '../shared/database/baseEntity.entity.js'
import { Categoria } from '../categoria/categoria.entity.js'

@Entity()
export class Producto extends BaseEntity {
    @Property({nullable: false})
    nombre!: string

    @ManyToOne(() => Categoria, { nullable: false})
    categoria!: Rel<Categoria>

    @Property({ nullable: false })
    descripcion!: string

    @Property({ nullable: false })
    precio!: number
}