import { Router } from 'express';
import { FaceController } from '../../controllers/face/face.controller';

const router = Router();

// POST /face/register — save face descriptor after registration
router.post('/register', FaceController.saveFaceDescriptor);

// POST /face/login — login with face
router.post('/login', FaceController.faceLogin);

export { router as faceRouter };
