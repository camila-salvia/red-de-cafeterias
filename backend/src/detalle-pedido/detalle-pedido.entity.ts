import { Entity, Property, ManyToOne, Rel } from '@mikro-orm/core'
import { BaseEntity } from '../shared/database/baseEntity.entity.js'
import { Pedido } from '../pedido/pedido.entity.js'

@Entity()
export class DetallePedido extends BaseEntity {
  @Property({nullable: false})
  cantidad!: number

  @Property({nullable: false, default: true})
  precio_unitario!: number

  @ManyToOne(() => Pedido, { nullable: false })
  pedido!: Rel<Pedido>
}
