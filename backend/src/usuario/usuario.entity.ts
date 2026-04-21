import {
    Entity,
    Property,
    OneToMany,
    Collection,
} from '@mikro-orm/core'
import { BaseEntity } from '../shared/database/baseEntity.entity.js'
import { Comentario } from '../comentario/comentario.entity.js'
// import { Pedido } from '../pedido/pedido.entity.js'

@Entity()
export class Usuario extends BaseEntity {
    @Property({nullable: false})
    nombre!: string

    @Property({ nullable: false })
    apellido!: string

    @Property({ nullable: false })
    telefono!: number

    @Property({ nullable: false})
    direccion!: string

    @Property({ nullable: false, unique: true })
    email!: string

    @Property({ nullable: false })
    password!: string

    @Property({ nullable: false })
    esAdmin: boolean = false

    @OneToMany(() => Comentario, comentario => comentario.usuario)
    comentarios = new Collection<Comentario>(this)

    // @OneToMany(() => Pedido, pedido => pedido.usuario)
    // pedidos = new Collection<Pedido>(this)
}