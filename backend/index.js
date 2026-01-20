import categoriaRoutes from './src/categoria/categoria.routes';

const express = require('express');

const app = express();
const PORT = 3000;

// Middleware para JSON
app.use(express.json());

// Ruta de prueba
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/categoria', categoriaRoutes);

// Levantar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
