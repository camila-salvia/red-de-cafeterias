import { Router } from 'express';
import { add, findAll, findOne, update, remove, sanitizeCategoriaInput } from './categoria.controller.js';
import { validarCategoriaInput } from './categoria.validator.js';
import { verificarToken, soloAdmin } from '../shared/middleware/auth.middleware.js';

const router = Router();

// públicas
router.get('/', findAll);
router.get('/:id', findOne);

// solo admin
router.post('/', verificarToken, soloAdmin, validarCategoriaInput, sanitizeCategoriaInput,add);
router.put('/:id', verificarToken, soloAdmin, validarCategoriaInput, sanitizeCategoriaInput, update);
router.patch('/:id', verificarToken, soloAdmin, validarCategoriaInput, sanitizeCategoriaInput, update);
router.delete('/:id', verificarToken, soloAdmin, remove);

export default router;
