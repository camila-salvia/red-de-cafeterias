import { Router } from 'express';
import { add, findAll, findOne, update, remove, sanitizeProductoInput } from './producto.controller.js';

const router = Router();

router.post('/', sanitizeProductoInput, add);
router.get('/', findAll);
router.get('/:id', findOne);
router.put('/:id',sanitizeProductoInput, update);
router.delete('/:id', remove);
router.patch('/:id', sanitizeProductoInput, update);


export default router;