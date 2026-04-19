import type { Request, Response, NextFunction } from 'express';
import prisma from '../../config/database/db';
import { ImageKitService } from '../../services/imagekit/imagekit.service';
import type { AuthRequest } from '../../middlewares/auth/jwt.middleware';

// POST /company  — create or update company profile
export class CompanyController {
  static async createOrUpdate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { name, description, website, industry } = req.body;

      if (!name) {
        return res.status(400).json({ success: false, message: 'Company name is required' });
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const logoFile = files?.logo?.[0];
      const docFile = files?.document?.[0];

      // Check if company already exists
      const existing = await prisma.company.findUnique({ where: { userId } });

      let logoUrl = existing?.logoUrl;
      let logoFileId = existing?.logoFileId;
      let docUrl = existing?.docUrl;
      let docFileId = existing?.docFileId;

      // Upload logo if provided
      if (logoFile) {
        // Delete old logo if exists
        if (logoFileId) {
          try { await ImageKitService.deleteFile(logoFileId); } catch (_) {}
        }
        const uploaded = await ImageKitService.uploadFile(
          logoFile.buffer,
          `logo-${userId}-${Date.now()}`,
          '/companies/logos'
        );
        logoUrl = uploaded.url;
        logoFileId = uploaded.fileId;
      }

      // Upload document if provided
      if (docFile) {
        if (docFileId) {
          try { await ImageKitService.deleteFile(docFileId); } catch (_) {}
        }
        const uploaded = await ImageKitService.uploadFile(
          docFile.buffer,
          `doc-${userId}-${Date.now()}`,
          '/companies/documents'
        );
        docUrl = uploaded.url;
        docFileId = uploaded.fileId;
      }

      const docStatusReset = docFile ? { docVerificationStatus: 'PENDING' as const, docRejectionReason: null } : {};

      const company = await prisma.company.upsert({
        where: { userId },
        create: {
          name,
          description,
          website,
          industry,
          logoUrl,
          logoFileId,
          docUrl,
          docFileId,
          userId,
        },
        update: {
          name,
          description,
          website,
          industry,
          logoUrl,
          logoFileId,
          docUrl,
          docFileId,
          ...docStatusReset,
        },
      });

      // Ensure user is marked as FOUNDER
      await prisma.user.update({
        where: { id: userId },
        data: { role: 'FOUNDER' },
      });

      return res.json({
        success: true,
        message: existing ? 'Company updated successfully' : 'Company created successfully',
        data: company,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyCompany(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const company = await prisma.company.findUnique({ where: { userId } });

      return res.json({
        success: true,
        data: company,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /company  — list all VERIFIED companies (public safe fields only)
  static async getAllCompanies(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const companies = await prisma.company.findMany({
        where: { docVerificationStatus: 'VERIFIED' },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          website: true,
          industry: true,
          logoUrl: true,
          createdAt: true,
          // Public user info (no email)
          user: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true, jobTitle: true },
          },
          _count: { select: { jobs: true } },
        },
      });
      return res.json({ success: true, data: companies });
    } catch (error) {
      next(error);
    }
  }

  // GET /company/:id  — single company with its OPEN jobs (public safe)
  static async getCompanyById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const company = await prisma.company.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          description: true,
          website: true,
          industry: true,
          logoUrl: true,
          createdAt: true,
          // User info
          user: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true, jobTitle: true },
          },
          // Only return OPEN jobs for public viewing
          jobs: {
            where: { status: 'OPEN' },
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              title: true,
              description: true,
              requirements: true,
              location: true,
              type: true,
              salary: true,
              experience: true,
              skills: true,
              createdAt: true,
            }
          }
        },
      });

      if (!company) {
        return res.status(404).json({ success: false, message: 'Company not found' });
      }

      return res.json({ success: true, data: company });
    } catch (error) {
      next(error);
    }
  }
}
