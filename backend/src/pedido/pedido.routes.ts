import { Router } from 'express';
import { add, findAll, findByUsuario, findOne, update, remove, sanitizePedidoInput } from './pedido.controller.js';
import { validarPedidoInput } from './pedido.validator.js';
import { verificarToken, soloAdmin, propietarioOAdmin } from '../shared/middleware/auth.middleware.js'; //verificar

const router = Router();

// cliente autenticado
router.post('/', verificarToken, sanitizePedidoInput, validarPedidoInput, add);

// para "mis pedidos" o admin
router.get('/usuario/:usuarioId', verificarToken, propietarioOAdmin('usuarioId'), findByUsuario); 
router.get('/:id', verificarToken, findOne);

// solo admin
router.get('/', verificarToken, soloAdmin, findAll);
router.patch('/:id', verificarToken, soloAdmin, sanitizePedidoInput, update);
router.put('/:id', verificarToken, soloAdmin, sanitizePedidoInput, update);
router.delete('/:id', verificarToken, soloAdmin, remove);

export default router;