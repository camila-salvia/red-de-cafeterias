import { Router } from 'express';
import { add, findAll, findOne, update, remove, sanitizeProductoInput } from './producto.controller.js';
import { verificarToken, soloAdmin } from '../shared/middleware/auth.middleware.js';

const router = Router();

// públicas
router.get('/', findAll);
router.get('/:id', findOne);

// protegidas
router.post('/', verificarToken, soloAdmin, add);
router.put('/:id', verificarToken, soloAdmin, update);
router.delete('/:id', verificarToken, soloAdmin, remove);
// router.patch('/:id', verificarToken, sanitizeProductoInput, update);

export default router;