import { Router } from 'express';
import { PaymentController } from '../../controllers/payment/payment.controller';
import { authenticateJWT } from '../../middlewares/auth/jwt.middleware';

export const paymentRouter = Router();

paymentRouter.use(authenticateJWT);

paymentRouter.post('/promote/order', PaymentController.createOrder);
paymentRouter.post('/promote/verify', PaymentController.verifyPayment);
