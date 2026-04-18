import { Router } from 'express';
import { AdminController } from '../../controllers/admin/admin.controller';
import { authenticateAdmin } from '../../middlewares/auth/admin.middleware';

const router = Router();

// Public — admin login
router.post('/login', AdminController.login);

// Protected — all require valid admin JWT
router.get('/users', authenticateAdmin, AdminController.getAllUsers as any);
router.get('/docs', authenticateAdmin, AdminController.getAllDocs as any);
router.get('/stats', authenticateAdmin, AdminController.getStats as any);
router.patch('/docs/:companyId/verify', authenticateAdmin, AdminController.verifyDoc as any);
router.patch('/docs/:companyId/reject', authenticateAdmin, AdminController.rejectDoc as any);

export { router as adminRouter };
