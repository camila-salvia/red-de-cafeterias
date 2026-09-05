// backend/src/tests/debug-db.ts
// Script de debug para verificar BD
// Ejecutar con: npx ts-node src/tests/debug-db.ts

import { orm } from '../shared/database/orm.js';
import { Categoria } from '../categoria/categoria.entity.js';
import { Producto } from '../producto/producto.entity.js';

const em = orm.em;

async function debugDB() {
  try {
    console.log('=== CATEGORÍAS ===');
    const categorias = await em.find(Categoria, {});
    categorias.forEach((cat) => {
      console.log(`- ${cat.nombre} (ID: ${cat.id})`);
    });

    console.log('\n=== PRODUCTOS ===');
    const productos = await em.find(Producto, {}, { populate: ['categoria'] });
    productos.forEach((prod) => {
      console.log(`- ${prod.nombre} → ${prod.categoria.nombre}`);
    });

    console.log('\n=== PRODUCTOS DUPLICADOS ===');
    const nombres = productos.map((p) => p.nombre);
    const duplicados = nombres.filter((n, i) => nombres.indexOf(n) !== i);
    if (duplicados.length === 0) {
      console.log('✓ No hay duplicados');
    } else {
      duplicados.forEach((nombre) => {
        console.log(`✗ ${nombre} aparece ${nombres.filter((n) => n === nombre).length} veces`);
      });
    }

    console.log('\n=== BÚSQUEDA: lemon pie ===');
    const lemonPie = productos.filter(
      (p) => p.nombre.toLowerCase().includes('lemon') || p.nombre.toLowerCase().includes('pie')
    );
    if (lemonPie.length === 0) {
      console.log('✗ No encontrado');
    } else {
      lemonPie.forEach((prod) => {
        console.log(`✓ ${prod.nombre} → ${prod.categoria.nombre}`);
      });
    }

    console.log('\n=== TEST FILTRO: COMIDAS ===');
    const catsComidas = await em.find(Categoria, {
      nombre: { $like: '%comidas%' }
    });
    console.log(`Categorías encontradas con LIKE %comidas%:`, catsComidas.map((c) => c.nombre));

    if (catsComidas.length > 0) {
      const prodsComidas = await em.find(Producto, { categoria: { $in: catsComidas } });
      console.log(`Productos en esas categorías:`);
      prodsComidas.forEach((p) => console.log(`  - ${p.nombre}`));
    }

    await orm.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

debugDB();
