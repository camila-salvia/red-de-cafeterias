import { Router } from 'express';
import { add, findAll, findOne, update, remove, sanitizeProductoInput } from './producto.controller.js';
import { verificarToken, soloAdmin } from '../shared/middleware/auth.middleware.js';
import { validarProductoInput } from './producto.validator.js';

const router = Router();

// públicas
router.get('/', findAll);
router.get('/:id', findOne);

// protegidas
router.post('/', verificarToken, soloAdmin, validarProductoInput,add);
router.put('/:id', verificarToken, soloAdmin, validarProductoInput, update);
router.delete('/:id', verificarToken, soloAdmin, remove);
// router.patch('/:id', verificarToken, sanitizeProductoInput, update);

export default router;