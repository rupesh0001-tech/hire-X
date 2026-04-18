import type { Response, NextFunction } from 'express';
import prisma from '../../config/database/db';
import { ImageKitService } from '../../services/imagekit/imagekit.service';
import type { AuthRequest } from '../../middlewares/auth/jwt.middleware';

export class PostController {
  // POST /post — Create a post (text or image)
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { content, type } = req.body;
      const file = (req as any).file as Express.Multer.File | undefined;

      if (!content && !file) {
        return res.status(400).json({ success: false, message: 'Post must have content or an image' });
      }

      let imageUrl: string | undefined;
      let imageFileId: string | undefined;

      if (file) {
        const uploaded = await ImageKitService.uploadFile(
          file.buffer,
          `post-${userId}-${Date.now()}`,
          '/posts'
        );
        imageUrl = uploaded.url;
        imageFileId = uploaded.fileId;
      }

      const post = await prisma.post.create({
        data: {
          type: imageUrl ? 'IMAGE' : 'TEXT',
          content: content || null,
          imageUrl: imageUrl || null,
          imageFileId: imageFileId || null,
          authorId: userId,
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              jobTitle: true,
              role: true,
              company: { select: { name: true, logoUrl: true } },
            },
          },
          _count: { select: { likes: true, comments: true } },
        },
      });

      return res.status(201).json({ success: true, message: 'Post created', data: post });
    } catch (error) {
      next(error);
    }
  }

  // GET /post/feed — Get all posts for the feed (newest first)
  static async getFeed(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const page = parseInt((req.query.page as string) || '1');
      const limit = parseInt((req.query.limit as string) || '20');
      const skip = (page - 1) * limit;

      const posts = await prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              jobTitle: true,
              role: true,
              company: { select: { name: true, logoUrl: true } },
            },
          },
          likes: { select: { userId: true } },
          comments: {
            orderBy: { createdAt: 'asc' },
            include: {
              author: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                  role: true,
                },
              },
            },
          },
          _count: { select: { likes: true, comments: true } },
        },
      });

      // Annotate whether current user liked each post
      const enriched = posts.map((p) => ({
        ...p,
        isLikedByMe: p.likes.some((l) => l.userId === userId),
      }));

      return res.json({ success: true, data: enriched });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /post/:id — Delete a post (author only)
  static async deletePost(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { id } = req.params;
      const post = await prisma.post.findUnique({ where: { id } });
      if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
      if (post.authorId !== userId) return res.status(403).json({ success: false, message: 'Forbidden' });

      if (post.imageFileId) {
        try { await ImageKitService.deleteFile(post.imageFileId); } catch (_) {}
      }

      await prisma.post.delete({ where: { id } });
      return res.json({ success: true, message: 'Post deleted' });
    } catch (error) {
      next(error);
    }
  }

  // POST /post/:id/like — Toggle like
  static async toggleLike(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { id: postId } = req.params;

      const existing = await prisma.like.findUnique({
        where: { postId_userId: { postId, userId } },
      });

      if (existing) {
        await prisma.like.delete({ where: { postId_userId: { postId, userId } } });
        const count = await prisma.like.count({ where: { postId } });
        return res.json({ success: true, liked: false, likeCount: count });
      } else {
        await prisma.like.create({ data: { postId, userId } });
        const count = await prisma.like.count({ where: { postId } });
        return res.json({ success: true, liked: true, likeCount: count });
      }
    } catch (error) {
      next(error);
    }
  }

  // POST /post/:id/comment — Add a comment
  static async addComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { id: postId } = req.params;
      const { content } = req.body;

      if (!content?.trim()) {
        return res.status(400).json({ success: false, message: 'Comment content is required' });
      }

      const comment = await prisma.comment.create({
        data: { content: content.trim(), postId, authorId: userId },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              role: true,
            },
          },
        },
      });

      return res.status(201).json({ success: true, data: comment });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /post/:postId/comment/:commentId
  static async deleteComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { commentId } = req.params;
      const comment = await prisma.comment.findUnique({ where: { id: commentId } });
      if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
      if (comment.authorId !== userId) return res.status(403).json({ success: false, message: 'Forbidden' });

      await prisma.comment.delete({ where: { id: commentId } });
      return res.json({ success: true, message: 'Comment deleted' });
    } catch (error) {
      next(error);
    }
  }

  // GET /post/user/:userId — Get posts by a specific user (for profile visit)
  static async getUserPosts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const currentUserId = req.user?.userId;
      if (!currentUserId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { userId } = req.params;

      const posts = await prisma.post.findMany({
        where: { authorId: userId },
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              jobTitle: true,
              role: true,
              company: { select: { name: true, logoUrl: true } },
            },
          },
          likes: { select: { userId: true } },
          comments: {
            orderBy: { createdAt: 'asc' },
            include: {
              author: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                  role: true,
                },
              },
            },
          },
          _count: { select: { likes: true, comments: true } },
        },
      });

      const enriched = posts.map((p) => ({
        ...p,
        isLikedByMe: p.likes.some((l) => l.userId === currentUserId),
      }));

      return res.json({ success: true, data: enriched });
    } catch (error) {
      next(error);
    }
  }
}
