import { Router } from 'express';
import { add, findAll, findOne, update, remove, sanitizeMetodoPagoInput } from './metodo-pago.controller.js';

const router = Router();

router.post('/', sanitizeMetodoPagoInput, add);
router.get('/', findAll);
router.get('/:id', findOne);
router.patch('/:id', sanitizeMetodoPagoInput, update);
router.put('/:id', sanitizeMetodoPagoInput, update);
router.delete('/:id', remove);


export default router;