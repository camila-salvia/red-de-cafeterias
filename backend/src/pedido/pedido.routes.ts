import { Router } from 'express';
import { add, findAll, findByUsuario, findOne, update, remove, sanitizePedidoInput } from './pedido.controller.js';
import { validarPedidoInput } from './pedido.validator.js';
import { verificarToken } from '../shared/middleware/auth.middleware.js'; //verificar

const router = Router();

router.post('/', verificarToken, validarPedidoInput, add);
router.get('/', findAll);
router.get('/usuario/:usuarioId', findByUsuario); // para "mis pedidos"
router.get('/:id', findOne);
router.patch('/:id', sanitizePedidoInput, update);
router.put('/:id', sanitizePedidoInput, update);
router.delete('/:id', remove);


export default router;