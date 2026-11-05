import { Router } from 'express';
import { add, findAll, findOne, update, remove, sanitizeDetallePedidoInput } from './detalle-pedido.controller.js';
import { validarDetallePedidoInput } from './detalle-pedido.validator.js';
import { verificarToken, soloAdmin } from '../shared/middleware/auth.middleware.js';

const router = Router();

// solo admin
router.get('/', verificarToken, soloAdmin, findAll);

// usuario propietario o admin
router.get('/:id', verificarToken, findOne);
router.post('/', verificarToken, validarDetallePedidoInput, sanitizeDetallePedidoInput, add);
router.patch('/:id', verificarToken, soloAdmin, validarDetallePedidoInput, sanitizeDetallePedidoInput, update);
router.put('/:id', verificarToken, soloAdmin, validarDetallePedidoInput, sanitizeDetallePedidoInput, update);
router.delete('/:id', verificarToken, soloAdmin, remove);

export default router;