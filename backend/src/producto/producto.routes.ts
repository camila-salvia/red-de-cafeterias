import { Router } from 'express';
import { add, findAll, findOne, update, remove, sanitizeProductoInput, findAllAdmin, cambiarEstadoProducto } from './producto.controller.js';
import { verificarToken, soloAdmin } from '../shared/middleware/auth.middleware.js';
import { validarProductoInput } from './producto.validator.js';

const router = Router();

// solo admin
router.get('/admin/productos', verificarToken, soloAdmin, findAllAdmin)
router.post('/', verificarToken, soloAdmin, validarProductoInput, sanitizeProductoInput, add);
router.put('/:id', verificarToken, soloAdmin, validarProductoInput, sanitizeProductoInput, update);
router.patch('/:id', verificarToken, soloAdmin, validarProductoInput, sanitizeProductoInput, update); // para actualizar datos del producto
router.patch('/:id/estado', verificarToken, soloAdmin, cambiarEstadoProducto); // solo para cambiar estado del producto
router.delete('/:id', verificarToken, soloAdmin, remove);

// públicas
router.get('/', findAll);
router.get('/:id', findOne);

export default router;