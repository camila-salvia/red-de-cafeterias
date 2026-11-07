import bcrypt from 'bcrypt'
import { orm } from './orm.js'
import { Categoria } from '../../categoria/categoria.entity.js'
import { MetodoPago } from '../../metodo-pago/metodo-pago.entity.js'
import { Usuario } from '../../usuario/usuario.entity.js'

const CATEGORIAS = ['bebidas', 'comidas']
const METODOS_PAGO = ['efectivo', 'transferencia', 'tarjeta']

const ADMIN = {
  nombre: 'Admin',
  apellido: 'Cafeteria',
  telefono: 1100000000,
  direccion: 'Sucursal central',
  email: 'admin@cafeteria.com',
  password: 'password123',
}

// Crea los datos iniciales solo si no existen. No borra ni modifica datos existentes,
export async function seedInitialData() {
  const em = orm.em.fork()

  for (const nombre of CATEGORIAS) {
    const existe = await em.findOne(Categoria, { nombre })
    if (!existe) em.create(Categoria, { nombre })
  }

  for (const nombre of METODOS_PAGO) {
    const existe = await em.findOne(MetodoPago, { nombre })
    if (!existe) em.create(MetodoPago, { nombre, activo: true })
  }

  const adminExiste = await em.findOne(Usuario, { email: ADMIN.email })
  if (!adminExiste) {
    em.create(Usuario, {
      ...ADMIN,
      password: await bcrypt.hash(ADMIN.password, 10),
      esAdmin: true,
    })
  }

  await em.flush()
}