import { Router } from 'express';
import multer from 'multer';
import { CompanyController } from '../../controllers/company/company.controller';
import { authenticateJWT } from '../../middlewares/auth/jwt.middleware';

const router = Router();

// Memory storage — files go straight to ImageKit as Buffer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDFs are allowed'));
    }
  },
});

const uploadFields = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'document', maxCount: 1 },
]);

// All routes require auth
router.post('/', authenticateJWT, uploadFields, CompanyController.createOrUpdate as any);
router.get('/me', authenticateJWT, CompanyController.getMyCompany as any);
router.get('/', authenticateJWT, CompanyController.getAllCompanies as any);
router.get('/:id', authenticateJWT, CompanyController.getCompanyById as any);

export { router as companyRouter };
