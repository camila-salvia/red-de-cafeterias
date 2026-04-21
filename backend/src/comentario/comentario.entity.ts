import { Entity, Property, ManyToOne, Rel } from '@mikro-orm/core'
import { BaseEntity } from '../shared/database/baseEntity.entity.js'
import { Usuario } from '../usuario/usuario.entity.js'

@Entity()
export class Comentario extends BaseEntity {
  @Property({nullable: false})
  contenido!: string

  @Property({nullable: false})
  fecha_publicacion!: Date

  @Property({nullable: false})
  puntuacion!: number

  @ManyToOne(() => Usuario)
  usuario!: Rel<Usuario>
}