import { Router } from 'express';
import { createCategoria, getCategorias,getCategoriaById, sanitizeCategoriaInput } from './categoria.controller.js';

const router = Router();

router.post('/', sanitizeCategoriaInput, createCategoria);
router.get('/', getCategorias);
router.get('/:id', getCategoriaById);


export default router;
