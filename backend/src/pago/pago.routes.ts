import { Router } from 'express';
import { verificarToken } from '../shared/middleware/auth.middleware.js';
import { crearPreferencia, webhook } from './pago.controller.js';

export const pagoRouter = Router();

// Crea la preferencia de pago de un pedido propio
pagoRouter.post('/preferencia/:id', verificarToken, crearPreferencia);

// Webhook de Mercado Pago: pública, se protege con la firma (x-signature)
pagoRouter.post('/webhook', webhook);

export default pagoRouter;