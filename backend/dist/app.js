import express from 'express';
import categoriaRoutes from './categoria/categoria.routes.js';
const app = express();
// Middleware para JSON
app.use(express.json());
// Rutas 
app.use('/api/categoria', categoriaRoutes);
// Health / root
app.get('/', (req, res) => {
    res.json({ message: 'Hello' });
});
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
//# sourceMappingURL=app.js.map