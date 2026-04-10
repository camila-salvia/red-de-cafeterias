import { Router } from 'express';
import { add, findAll } from './categoria.controller.js';

const router = Router();

router.post('/', add);
router.get('/', findAll);
//router.get('/:id', getCategoriaById);
//router.put('/:id', updateCategoria);
//router.delete('/:id', deleteCategoria);


export default router;
