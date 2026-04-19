import { Router } from 'express';
import { MessageController } from '../../controllers/message/message.controller';
import { authenticateJWT } from '../../middlewares/auth/jwt.middleware';

const router = Router();

router.get('/inbox', authenticateJWT, MessageController.getInbox as any);
router.get('/:userId', authenticateJWT, MessageController.getChatHistory as any);

export { router as messageRouter };
