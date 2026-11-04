import { Router } from 'express';
import { add, findAll, findOne, update, remove, sanitizeProductoInput } from './producto.controller.js';
import { verificarToken, soloAdmin } from '../shared/middleware/auth.middleware.js';
import { validarProductoInput } from './producto.validator.js';

const router = Router();

// públicas
router.get('/', findAll);
router.get('/:id', findOne);

// solo admin
router.post('/', verificarToken, soloAdmin, validarProductoInput, sanitizeProductoInput, add);
router.put('/:id', verificarToken, soloAdmin, validarProductoInput, sanitizeProductoInput, update);
router.patch('/:id', verificarToken, soloAdmin, validarProductoInput, sanitizeProductoInput, update);
router.delete('/:id', verificarToken, soloAdmin, remove);

export default router;