import { Router } from 'express';
import multer from 'multer';
import { PostController } from '../../controllers/post/post.controller';
import { authenticateJWT } from '../../middlewares/auth/jwt.middleware';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

export const postRouter = Router();

// All routes require authentication
postRouter.use(authenticateJWT);

postRouter.post('/', upload.single('image'), PostController.create);
postRouter.get('/feed', PostController.getFeed);
postRouter.get('/user/:userId', PostController.getUserPosts);
postRouter.delete('/:id', PostController.deletePost);
postRouter.post('/:id/like', PostController.toggleLike);
postRouter.post('/:id/comment', PostController.addComment);
postRouter.delete('/:postId/comment/:commentId', PostController.deleteComment);
