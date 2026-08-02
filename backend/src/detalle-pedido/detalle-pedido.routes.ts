import { Router } from 'express';
import { add, findAll, findOne, update, remove, sanitizeDetallePedidoInput } from './detalle-pedido.controller.js';

const router = Router();

router.post('/', sanitizeDetallePedidoInput, add);
router.get('/', findAll);
router.get('/:id', findOne);
router.patch('/:id', sanitizeDetallePedidoInput, update);
router.put('/:id', sanitizeDetallePedidoInput, update);
router.delete('/:id', remove);


export default router;