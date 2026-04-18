import type { Request, Response, NextFunction } from 'express';
import prisma from '../../config/database/db';
import { HashService } from '../../services/hash/hash.service';
import { JWTService } from '../../services/jwt/jwt.service';

export class AdminController {
  // POST /admin/login
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const admin = await prisma.admin.findUnique({ where: { email } });
      if (!admin) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const isValid = await HashService.comparePassword(password, admin.password);
      if (!isValid) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      // Use a separate JWT payload that includes an isAdmin flag
      const token = JWTService.generateToken({
        userId: admin.id,
        email: admin.email,
        isAdmin: true,
      } as any);

      return res.json({
        success: true,
        message: 'Admin login successful',
        data: {
          token,
          admin: {
            id: admin.id,
            email: admin.email,
            firstName: admin.firstName,
            lastName: admin.lastName,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /admin/users — all users with company info
  static async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isVerified: true,
          jobTitle: true,
          location: true,
          avatarUrl: true,
          createdAt: true,
          company: {
            select: {
              id: true,
              name: true,
              industry: true,
              website: true,
              docUrl: true,
              docVerificationStatus: true,
              docRejectionReason: true,
              logoUrl: true,
              createdAt: true,
            },
          },
          _count: { select: { posts: true } },
        },
      });

      return res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  // GET /admin/docs — all founders with pending/rejected docs
  static async getAllDocs(req: Request, res: Response, next: NextFunction) {
    try {
      const companies = await prisma.company.findMany({
        orderBy: { updatedAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
              jobTitle: true,
              location: true,
              role: true,
              createdAt: true,
            },
          },
        },
      });

      return res.json({ success: true, data: companies });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /admin/docs/:companyId/verify — approve
  static async verifyDoc(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId } = req.params;

      const company = await prisma.company.update({
        where: { id: companyId },
        data: {
          docVerificationStatus: 'VERIFIED',
          docRejectionReason: null,
        },
      });

      return res.json({
        success: true,
        message: 'Document verified successfully',
        data: company,
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /admin/docs/:companyId/reject — reject with reason
  static async rejectDoc(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId } = req.params;
      const { reason } = req.body;

      if (!reason || !reason.trim()) {
        return res.status(400).json({ success: false, message: 'Rejection reason is required' });
      }

      const company = await prisma.company.update({
        where: { id: companyId },
        data: {
          docVerificationStatus: 'REJECTED',
          docRejectionReason: reason.trim(),
        },
      });

      return res.json({
        success: true,
        message: 'Document rejected',
        data: company,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /admin/stats — dashboard overview numbers
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const [totalUsers, totalFounders, totalPosts, pendingDocs, verifiedDocs, rejectedDocs, totalEvents, pendingRefunds] =
        await Promise.all([
          prisma.user.count({ where: { role: 'USER' } }),
          prisma.user.count({ where: { role: 'FOUNDER' } }),
          prisma.post.count(),
          prisma.company.count({ where: { docVerificationStatus: 'PENDING' } }),
          prisma.company.count({ where: { docVerificationStatus: 'VERIFIED' } }),
          prisma.company.count({ where: { docVerificationStatus: 'REJECTED' } }),
          prisma.event.count({ where: { isListed: true } }),
          prisma.eventRegistration.count({ where: { refundStatus: 'PENDING' } }),
        ]);

      return res.json({
        success: true,
        data: { totalUsers, totalFounders, totalPosts, pendingDocs, verifiedDocs, rejectedDocs, totalEvents, pendingRefunds },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /admin/events — all events
  static async getAllEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const events = await prisma.event.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          organizer: { select: { id: true, firstName: true, lastName: true, email: true } },
          _count: { select: { registrations: { where: { paymentStatus: 'PAID' } } } },
        },
      });
      return res.json({ success: true, data: events });
    } catch (error) { next(error); }
  }

  // POST /admin/events/:id/cancel — admin force-cancels event
  static async cancelEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await prisma.$transaction([
        prisma.event.update({ where: { id }, data: { status: 'CANCELLED' } }),
        prisma.eventRegistration.updateMany({
          where: { eventId: id, paymentStatus: 'PAID' },
          data: { refundStatus: 'PENDING', refundReason: 'Event cancelled by admin' },
        }),
      ]);
      return res.json({ success: true, message: 'Event cancelled and refunds queued' });
    } catch (error) { next(error); }
  }

  // GET /admin/events/:id/registrations — admin view (stripped of private info)
  static async getEventRegistrations(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const regs = await prisma.eventRegistration.findMany({
        where: { eventId: id, paymentStatus: 'PAID' },
        select: {
          id: true,
          participantName: true,
          participantEmail: true,
          amountPaid: true,
          attendanceStatus: true,
          refundStatus: true,
          refundReason: true,
          createdAt: true,
          // attendanceCode, participantPhone, paymentId intentionally hidden from admin
        },
      });
      return res.json({ success: true, data: regs });
    } catch (error) { next(error); }
  }
}
