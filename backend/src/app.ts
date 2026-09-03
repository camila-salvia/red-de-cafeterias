import express from 'express';
import categoriaRoutes from './categoria/categoria.routes.js';
import productoRoutes from './producto/producto.routes.js';
import usuarioRoutes from './usuario/usuario.routes.js';
import comentarioRoutes from './comentario/comentario.routes.js';
import metodoPagoRoutes from './metodo-pago/metodo-pago.routes.js';
import detallePedidoRoutes from './detalle-pedido/detalle-pedido.routes.js';
import pedidoRoutes from './pedido/pedido.routes.js';
import 'reflect-metadata';
import { orm, syncSchema } from './shared/database/orm.js';
import { RequestContext } from '@mikro-orm/core';
import cors from 'cors';
import { Categoria } from './categoria/categoria.entity.js';
import { Producto } from './producto/producto.entity.js';

const app = express();

// Middleware para JSON
app.use(express.json());
app.use(cors());

app.use((req, res, next)=>{
  RequestContext.create(orm.em, next)
}
)

// Rutas 
app.use('/api/categoria', categoriaRoutes);
app.use('/api/producto', productoRoutes);
app.use('/api/usuario', usuarioRoutes);
app.use('/api/comentario', comentarioRoutes);
app.use('/api/metodo-pago', metodoPagoRoutes);
app.use('/api/detalle-pedido', detallePedidoRoutes);
app.use('/api/pedidos', pedidoRoutes);

// Health / root
app.get('/', (req, res) => {
  res.json({ message: 'Hello' });
});

await syncSchema()  //never in production
/*
async function seedInitialData() {
  const em = orm.em

  await em.nativeDelete(Producto, {})
  await em.nativeDelete(Categoria, {})

  const bebidas = em.create(Categoria, { nombre: 'bebidas' })
  const comidas = em.create(Categoria, { nombre: 'comidas' })

  await em.flush()

  em.create(Producto, {
    nombre: 'cafe cortado',
    descripcion: 'Café con leche vaporizada en menor cantidad que el café latte',
    precio: 3000,
    categoria: bebidas,
  })

  em.create(Producto, {
    nombre: 'lemon pie',
    descripcion: 'Tarta con base de galleta y relleno de crema de limón',
    precio: 3500,
    categoria: comidas,
  })

  await em.flush()
}

await seedInitialData()
*/
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});