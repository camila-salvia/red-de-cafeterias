import { Router } from 'express';
import { add, findAll, findOne, update, remove, sanitizeUsuarioInput, login } from './usuario.controller.js';
import { validarUsuarioInput } from './usuario.validator.js'; // verificar 
import { verificarToken, soloAdmin, propietarioOAdmin } from '../shared/middleware/auth.middleware.js';
// verificar que paso con sanitizeUsuarioInput, ahora que se usa validarUsuarioInput

const router = Router();

// públicas
router.post('/login', login);
router.post('/', validarUsuarioInput, sanitizeUsuarioInput, add);

// solo admin
router.get('/', verificarToken, soloAdmin, findAll);
router.delete('/:id', verificarToken, soloAdmin, remove);

// usuario propietario o admin
router.get('/:id', verificarToken, propietarioOAdmin(), findOne);
router.put('/:id', verificarToken, propietarioOAdmin(), sanitizeUsuarioInput, update);
router.patch('/:id', verificarToken, propietarioOAdmin(), sanitizeUsuarioInput, update);
router.delete('/:id', verificarToken, propietarioOAdmin(), remove);

export default router;