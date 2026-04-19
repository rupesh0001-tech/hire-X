import type { Response, NextFunction } from 'express';
import prisma from '../../config/database/db';
import type { AuthRequest } from '../../middlewares/auth/jwt.middleware';
import { MessageController } from '../message/message.controller';

export class JobController {
  // ── GET /job  — all OPEN jobs (any authenticated user)
  static async getAllJobs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const jobs = await prisma.job.findMany({
        where: { status: 'OPEN' },
        orderBy: { createdAt: 'desc' },
        include: {
          company: {
            select: { id: true, name: true, logoUrl: true, industry: true, website: true },
          },
          founder: {
            select: { id: true, firstName: true, lastName: true },
          },
          _count: { select: { applications: true } },
        },
      });
      return res.json({ success: true, data: jobs });
    } catch (error) {
      next(error);
    }
  }

  // ── GET /job/:id — single job detail
  static async getJob(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const job = await prisma.job.findUnique({
        where: { id },
        include: {
          company: {
            select: { id: true, name: true, logoUrl: true, industry: true, website: true, description: true },
          },
          founder: {
            select: { id: true, firstName: true, lastName: true },
          },
          _count: { select: { applications: true } },
        },
      });
      if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
      return res.json({ success: true, data: job });
    } catch (error) {
      next(error);
    }
  }

  // ── POST /job  — create job (FOUNDER + VERIFIED only)
  static async createJob(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
      if (user?.role !== 'FOUNDER') {
        return res.status(403).json({ success: false, message: 'Only founders can post jobs' });
      }

      const company = await prisma.company.findUnique({ where: { userId } });
      if (!company) {
        return res.status(400).json({ success: false, message: 'You must have a company profile to post jobs' });
      }
      if (company.docVerificationStatus !== 'VERIFIED') {
        return res.status(403).json({ success: false, message: 'Your company documents must be verified before posting jobs' });
      }

      const { title, description, requirements, location, type, salary, experience, skills } = req.body;
      if (!title || !description) {
        return res.status(400).json({ success: false, message: 'Title and description are required' });
      }

      const job = await prisma.job.create({
        data: {
          title,
          description,
          requirements,
          location,
          type: type ?? 'FULL_TIME',
          salary,
          experience,
          skills: Array.isArray(skills) ? skills : [],
          companyId: company.id,
          founderId: userId,
        },
        include: {
          company: { select: { id: true, name: true, logoUrl: true, industry: true } },
        },
      });

      return res.status(201).json({ success: true, message: 'Job posted successfully', data: job });
    } catch (error) {
      next(error);
    }
  }

  // ── PATCH /job/:id  — update job (founder owner only)
  static async updateJob(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const job = await prisma.job.findUnique({ where: { id } });
      if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
      if (job.founderId !== userId) return res.status(403).json({ success: false, message: 'Not authorized' });

      const { title, description, requirements, location, type, salary, experience, skills, status } = req.body;
      const updated = await prisma.job.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description && { description }),
          ...(requirements !== undefined && { requirements }),
          ...(location !== undefined && { location }),
          ...(type && { type }),
          ...(salary !== undefined && { salary }),
          ...(experience !== undefined && { experience }),
          ...(skills && { skills }),
          ...(status && { status }),
        },
      });
      return res.json({ success: true, message: 'Job updated', data: updated });
    } catch (error) {
      next(error);
    }
  }

  // ── DELETE /job/:id  — delete job (founder owner only)
  static async deleteJob(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const job = await prisma.job.findUnique({ where: { id } });
      if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
      if (job.founderId !== userId) return res.status(403).json({ success: false, message: 'Not authorized' });

      await prisma.job.delete({ where: { id } });
      return res.json({ success: true, message: 'Job deleted' });
    } catch (error) {
      next(error);
    }
  }

  // ── GET /job/my-jobs — founder's posted jobs with application counts
  static async getMyJobs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const jobs = await prisma.job.findMany({
        where: { founderId: userId },
        orderBy: { createdAt: 'desc' },
        include: {
          company: { select: { id: true, name: true, logoUrl: true } },
          _count: { select: { applications: true } },
          applications: {
            orderBy: { createdAt: 'desc' },
            include: {
              applicant: {
                select: { id: true, firstName: true, lastName: true, avatarUrl: true, email: true, jobTitle: true },
              },
            },
          },
        },
      });
      return res.json({ success: true, data: jobs });
    } catch (error) {
      next(error);
    }
  }

  // ── POST /job/:id/apply  — user applies for a job
  static async applyForJob(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { id: jobId } = req.params;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      // Founders cannot apply
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
      if (user?.role === 'FOUNDER') {
        return res.status(403).json({ success: false, message: 'Founders cannot apply for jobs' });
      }

      const job = await prisma.job.findUnique({ where: { id: jobId } });
      if (!job || job.status !== 'OPEN') {
        return res.status(404).json({ success: false, message: 'Job not found or closed' });
      }

      // Check if already applied
      const existing = await prisma.jobApplication.findUnique({
        where: { jobId_applicantId: { jobId, applicantId: userId } },
      });
      if (existing) {
        return res.status(400).json({ success: false, message: 'You have already applied for this job' });
      }

      const { name, resumeUrl, note } = req.body;
      if (!name || !resumeUrl) {
        return res.status(400).json({ success: false, message: 'Name and resume URL are required' });
      }

      const application = await prisma.jobApplication.create({
        data: { jobId, applicantId: userId, name, resumeUrl, note },
        include: {
          job: { select: { id: true, title: true, company: { select: { name: true } } } },
        },
      });
      return res.status(201).json({ success: true, message: 'Application submitted!', data: application });
    } catch (error) {
      next(error);
    }
  }

  // ── GET /job/my-applications  — user's job applications
  static async getMyApplications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const applications = await prisma.jobApplication.findMany({
        where: { applicantId: userId },
        orderBy: { createdAt: 'desc' },
        include: {
          job: {
            include: {
              company: { select: { id: true, name: true, logoUrl: true, industry: true } },
            },
          },
        },
      });
      return res.json({ success: true, data: applications });
    } catch (error) {
      next(error);
    }
  }

  // ── PATCH /job/:jobId/applications/:appId  — founder accepts/rejects
  static async updateApplicationStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { jobId, appId } = req.params;
      const { status } = req.body; // ACCEPTED | REJECTED
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const job = await prisma.job.findUnique({ where: { id: jobId } });
      if (!job || job.founderId !== userId) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      if (!['ACCEPTED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }

      const updated = await prisma.jobApplication.update({
        where: { id: appId },
        data: { status },
        include: {
          applicant: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      });

      if (status === 'ACCEPTED') {
        const titleSnippet = job.title.length > 20 ? job.title.substring(0,20)+'...' : job.title;
        await MessageController.injectSystemMessage(
          userId, // founder ID
          updated.applicant.id, // applicant ID
          `Hello! Your application for "${titleSnippet}" has been accepted. Let's discuss the next steps!`,
          'JOB_APPLICATION',
          job.id
        );
      }

      return res.json({ success: true, message: `Application ${status.toLowerCase()}`, data: updated });
    } catch (error) {
      next(error);
    }
  }
}
