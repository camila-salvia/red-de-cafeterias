import { Router } from 'express';
import { add, findAll, findOne, update, remove, sanitizePedidoInput } from './pedido.controller.js';

const router = Router();

router.post('/', sanitizePedidoInput, add);
router.get('/', findAll);
router.get('/:id', findOne);
router.patch('/:id', sanitizePedidoInput, update);
router.put('/:id', sanitizePedidoInput, update);
router.delete('/:id', remove);


export default router;