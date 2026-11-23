import { Router } from 'express';
import { add, findAll, findOne, update, remove, sanitizeMetodoPagoInput } from './metodo-pago.controller.js';
import { validarMetodoPagoInput } from './metodo-pago.validator.js';
import { verificarToken, soloAdmin } from '../shared/middleware/auth.middleware.js';
import { findAllAdmin } from '../metodo-pago/metodo-pago.controller.js';

const router = Router();

// solo admin
router.get('/admin/metodos', verificarToken, soloAdmin, findAllAdmin);
router.post('/', verificarToken, soloAdmin, validarMetodoPagoInput, sanitizeMetodoPagoInput, add);
router.patch('/:id', verificarToken, soloAdmin, validarMetodoPagoInput, sanitizeMetodoPagoInput, update);
router.put('/:id', verificarToken, soloAdmin, validarMetodoPagoInput, sanitizeMetodoPagoInput, update);
router.delete('/:id', verificarToken, soloAdmin, remove);

// públicas
router.get('/', findAll);
router.get('/:id', findOne);

export default router;