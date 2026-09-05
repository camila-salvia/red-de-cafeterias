import { Router } from 'express';
import { add, findAll, findOne, update, remove, sanitizeComentarioInput } from './comentario.controller.js';
import { validarComentarioInput } from './comentario.validator.js';

const router = Router();

router.post('/', validarComentarioInput, add);
router.get('/', findAll);
router.get('/:id', findOne);
router.put('/:id',validarComentarioInput, update);
router.delete('/:id', remove);
router.patch('/:id', validarComentarioInput, update);


export default router;