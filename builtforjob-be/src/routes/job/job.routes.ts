import { Router } from 'express';
import { JobController } from '../../controllers/job/job.controller';
import { authenticateJWT } from '../../middlewares/auth/jwt.middleware';

const router = Router();

// All routes require authentication
router.get('/', authenticateJWT, JobController.getAllJobs as any);
router.get('/my-jobs', authenticateJWT, JobController.getMyJobs as any);
router.get('/my-applications', authenticateJWT, JobController.getMyApplications as any);
router.get('/:id', authenticateJWT, JobController.getJob as any);
router.post('/', authenticateJWT, JobController.createJob as any);
router.patch('/:id', authenticateJWT, JobController.updateJob as any);
router.delete('/:id', authenticateJWT, JobController.deleteJob as any);
router.post('/:id/apply', authenticateJWT, JobController.applyForJob as any);
router.patch('/:jobId/applications/:appId', authenticateJWT, JobController.updateApplicationStatus as any);

export { router as jobRouter };
