import { Router } from 'express';
import { add, findAll, findOne, update, remove, sanitizeComentarioInput } from './comentario.controller.js';

const router = Router();

router.post('/', sanitizeComentarioInput, add);
router.get('/', findAll);
router.get('/:id', findOne);
router.put('/:id',sanitizeComentarioInput, update);
router.delete('/:id', remove);
router.patch('/:id', sanitizeComentarioInput, update);


export default router;