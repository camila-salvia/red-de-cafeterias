import { Router } from 'express';
import { add, findAll, findOne, update, remove, sanitizeComentarioInput } from './comentario.controller.js';
import { validarComentarioInput } from './comentario.validator.js';
import { verificarToken, soloAdmin } from '../shared/middleware/auth.middleware.js';

const router = Router();

// públicas
router.get('/', findAll);
router.get('/:id', findOne);

// cliente autenticado: comentar
router.post('/', verificarToken, sanitizeComentarioInput, validarComentarioInput, add);

// moderacion: solo admin
router.put('/:id', verificarToken, soloAdmin, sanitizeComentarioInput, validarComentarioInput, update);
router.patch('/:id', verificarToken, soloAdmin, sanitizeComentarioInput, validarComentarioInput, update);
router.delete('/:id', verificarToken, soloAdmin, remove);

export default router;