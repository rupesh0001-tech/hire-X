import { Router } from 'express';
import { MarketplaceController } from '../../controllers/marketplace/marketplace.controller';
import { authenticateJWT } from '../../middlewares/auth/jwt.middleware';

const router = Router();

// All routes require authentication
router.get('/', authenticateJWT, MarketplaceController.getAllListings as any);
router.post('/', authenticateJWT, MarketplaceController.createListing as any);
router.get('/my-listings', authenticateJWT, MarketplaceController.getMyListings as any);
router.get('/my-applications', authenticateJWT, MarketplaceController.getMyApplications as any);
router.post('/:id/apply', authenticateJWT, MarketplaceController.applyForListing as any);
router.patch('/:id/applications/:appId', authenticateJWT, MarketplaceController.updateApplicationStatus as any);
router.patch('/:id/applications/:appId/withdraw', authenticateJWT, MarketplaceController.withdrawApplication as any);
router.patch('/:id/applications/:appId/report', authenticateJWT, MarketplaceController.reportApplication as any);

export { router as marketplaceRouter };
