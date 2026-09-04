import { Router } from 'express';
import { add, findAll, findOne, update, remove, sanitizeUsuarioInput, login } from './usuario.controller.js';

const router = Router();

router.post('/', sanitizeUsuarioInput, add);
router.get('/', findAll);
router.post('/login', login);
router.get('/:id', findOne);
router.put('/:id',sanitizeUsuarioInput, update);
router.delete('/:id', remove);
router.patch('/:id', sanitizeUsuarioInput, update);


export default router;