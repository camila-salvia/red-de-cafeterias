import { Router } from 'express';
// Copiá este import tal cual está en pedido.routes.ts (la ruta del middleware puede variar)
import { verificarToken } from '../shared/middleware/auth.middleware.js';
import { crearPreferencia, webhook } from './pago.controller.js';
import router from '../pedido/pedido.routes.js';

export const pagoRouter = Router();

// Crea la preferencia de pago de un pedido propio
pagoRouter.post('/preferencia/:id', verificarToken, crearPreferencia);

// Webhook de Mercado Pago: pública, se protege con la firma (x-signature)
pagoRouter.post('/webhook', webhook);

export default router;