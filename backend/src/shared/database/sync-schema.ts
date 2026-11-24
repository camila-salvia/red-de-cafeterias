import 'reflect-metadata';
import { orm } from './orm.js';

// Script manual para aplicar los cambios de esquema (entidades -> tablas) a la base del .env.
//   npm run schema:preview   muestra el SQL sin ejecutarlo
//   npm run schema:sync      aplica los cambios
// Usa safe: no borra tablas ni columnas existentes, solo agrega o modifica.
const soloMostrar = process.argv.includes('--dry');

try {
  const generador = orm.getSchemaGenerator();
  if (soloMostrar) {
    const sql = await generador.getUpdateSchemaSQL({ safe: true });
    console.log(sql.trim() || '-- El esquema ya está al día, no hay cambios.');
  } else {
    await generador.updateSchema({ safe: true });
    console.log('Esquema sincronizado.');
  }
} finally {
  await orm.close();
}