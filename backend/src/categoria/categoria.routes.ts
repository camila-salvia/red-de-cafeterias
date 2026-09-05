import { Router } from 'express';
import { add, findAll, findOne, update, remove, sanitizeCategoriaInput } from './categoria.controller.js';
import { validarCategoriaInput } from './categoria.validator.js';

const router = Router();

router.post('/', validarCategoriaInput, add);
router.get('/', findAll);
router.get('/:id', findOne);
router.put('/:id', validarCategoriaInput, update);
router.delete('/:id', remove);


export default router;
