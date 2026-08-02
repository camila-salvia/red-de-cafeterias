import { Entity, ManyToOne, OneToMany, Property, Rel, Collection } from '@mikro-orm/core'
import { BaseEntity } from '../shared/database/baseEntity.entity.js'
import { Usuario } from '../usuario/usuario.entity.js'
import { MetodoPago } from '../metodo-pago/metodo-pago.entity.js'
import { DetallePedido } from '../detalle-pedido/detalle-pedido.entity.js'

@Entity()
export class Pedido extends BaseEntity {
  @Property({nullable: false})
  fecha_pedido!: Date

  @Property({nullable: false})
  costo_total!: number

  @Property({nullable: false})
  direccion_envio!: string

  @Property({nullable: false})
  fecha_pago!: Date

  @Property({nullable: false})
  estado_pago!: string

  @ManyToOne(() => Usuario, { nullable: false })
  usuario!: Rel<Usuario>

  @ManyToOne(() => MetodoPago, { nullable: false })
  metodo_pago!: Rel<MetodoPago>

  @OneToMany(() => DetallePedido, (detallePedido) => detallePedido.pedido)
  detalles = new Collection<DetallePedido>(this)
}