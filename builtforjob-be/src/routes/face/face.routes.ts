import { Router } from 'express';
import multer from 'multer';
import { FaceController } from '../../controllers/face/face.controller';
import { authenticateJWT } from '../../middlewares/auth/jwt.middleware';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  },
});

// POST /face/register — save face descriptor after registration
router.post('/register', FaceController.saveFaceDescriptor);

// POST /face/login — login with face
router.post('/login', FaceController.faceLogin);

// POST /face/verify-photo — upload photo and check face match
router.post('/verify-photo', authenticateJWT, upload.single('photo'), FaceController.verifyPhoto as any);

export { router as faceRouter };
