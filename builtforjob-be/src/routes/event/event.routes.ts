import { Router } from 'express';
import multer from 'multer';
import { EventController } from '../../controllers/event/event.controller';
import { authenticateJWT } from '../../middlewares/auth/jwt.middleware';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
});

// All routes require auth
router.use(authenticateJWT);

// Browse & discovery
router.get('/', EventController.getAllEvents as any);
router.get('/my-events', EventController.getMyEvents as any);
router.get('/my-registrations', EventController.getMyRegistrations as any);
router.get('/:id', EventController.getEvent as any);
router.get('/:id/registrations', EventController.getEventRegistrations as any);

// Creating an event (listing fee flow)
router.post('/listing/order', EventController.createListingOrder as any);
router.post('/', upload.single('banner'), EventController.createEvent as any);

// Registering for an event (entry fee flow)
router.post('/:id/register/order', EventController.createRegistrationOrder as any);
router.post('/:id/register/verify', EventController.verifyRegistration as any);

// Attendance verification (host only)
router.post('/:id/verify-attendance', EventController.verifyAttendance as any);

// Cancel event (host only)
router.post('/:id/cancel', EventController.cancelEvent as any);

export { router as eventRouter };
