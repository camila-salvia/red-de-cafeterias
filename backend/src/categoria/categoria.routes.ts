import { Router } from 'express';
import { add, findAll, findOne, update, remove, sanitizeCategoriaInput } from './categoria.controller.js';

const router = Router();

router.post('/', sanitizeCategoriaInput, add);
router.get('/', findAll);
router.get('/:id', findOne);
router.put('/:id', sanitizeCategoriaInput, update);
router.delete('/:id', remove);


export default router;
