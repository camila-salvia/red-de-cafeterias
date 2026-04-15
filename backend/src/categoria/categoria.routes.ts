import { Router } from 'express';
import { add, findAll, findOne, update, remove } from './categoria.controller.js';

const router = Router();

router.post('/', add);
router.get('/', findAll);
router.get('/:id', findOne);
router.put('/:id', update);
router.delete('/:id', remove);


export default router;
