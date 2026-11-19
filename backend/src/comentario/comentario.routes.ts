import { Router } from 'express';
import { add, findAll, findOne, update, remove, sanitizeComentarioInput } from './comentario.controller.js';
import { validarComentarioInput } from './comentario.validator.js';
import { moderarComentarioInput } from './comentario.moderacion.js';
import { verificarToken, soloAdmin } from '../shared/middleware/auth.middleware.js';

const router = Router();

// públicas
router.get('/', findAll);
router.get('/:id', findOne);

// cliente autenticado: puede comentar
// sanitize va antes que validar porque sanitize inyecta el usuario desde el token - el cliente no lo envia
router.post('/', verificarToken, sanitizeComentarioInput, validarComentarioInput, moderarComentarioInput, add);

// moderación: solo admin
router.put('/:id', verificarToken, soloAdmin, sanitizeComentarioInput, validarComentarioInput, moderarComentarioInput, update);
router.patch('/:id', verificarToken, soloAdmin, sanitizeComentarioInput, validarComentarioInput, moderarComentarioInput, update);
router.delete('/:id', verificarToken, soloAdmin, remove);

export default router;