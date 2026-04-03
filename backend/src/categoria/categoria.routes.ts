import { Router } from 'express';
import { createCategoria, getCategorias,getCategoriaById, updateCategoria, deleteCategoria, sanitizeCategoriaInput } from './categoria.controller.js';

const router = Router();

router.post('/', sanitizeCategoriaInput, createCategoria);
router.get('/', getCategorias);
router.get('/:id', getCategoriaById);
router.put('/:id', sanitizeCategoriaInput, updateCategoria);
router.delete('/:id', deleteCategoria);


export default router;
