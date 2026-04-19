import { Response, NextFunction } from 'express';
import prisma from '../../config/database/db';
import { AuthRequest } from '../../middlewares/auth/jwt.middleware';
import { MessageController } from '../message/message.controller';

export class MarketplaceController {
  
  // 1. Get all public OPEN listings (founders see offers, users see requests usually, but can be open to all)
  static async getAllListings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const listings = await prisma.marketplaceListing.findMany({
        where: { status: 'OPEN' },
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              jobTitle: true,
              role: true,
            }
          },
          _count: {
            select: { applications: true }
          },
          applications: {
            where: { applicantId: req.user!.userId },
            select: { id: true }
          }
        }
      });
      return res.json({ success: true, data: listings });
    } catch (error) {
      next(error);
    }
  }

  // 2. Create Listing
  static async createListing(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const creatorId = req.user!.userId;
      const { title, description, amountText, promisesOrExpectations } = req.body;
      const user = await prisma.user.findUnique({ where: { id: creatorId }});

      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      // Founders ask for funds, Users offer funds
      const type = user.role === 'FOUNDER' ? 'FUND_REQUEST' : 'FUND_OFFER';

      const newListing = await prisma.marketplaceListing.create({
        data: {
          creatorId,
          title,
          description,
          amountText,
          promisesOrExpectations,
          type
        },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              jobTitle: true,
              role: true,
            }
          }
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Listing created successfully',
        data: newListing
      });
    } catch (error) {
      next(error);
    }
  }

  // 3. Get my listings with their applications
  static async getMyListings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const creatorId = req.user!.userId;
      console.log('--- getMyListings called for ---', creatorId);
      const listings = await prisma.marketplaceListing.findMany({
        where: { creatorId },
        orderBy: { createdAt: 'desc' },
        include: {
          applications: {
            include: {
              applicant: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                  jobTitle: true,
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });
      return res.json({ success: true, data: listings });
    } catch (error) {
      next(error);
    }
  }

  // 4. Apply to a listing
  static async applyForListing(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const applicantId = req.user!.userId;
      const { id: listingId } = req.params;
      const { note } = req.body;

      const listing = await prisma.marketplaceListing.findUnique({ where: { id: listingId } });
      if (!listing || listing.status !== 'OPEN') {
        return res.status(400).json({ success: false, message: 'Listing is closed or not found' });
      }

      if (listing.creatorId === applicantId) {
        return res.status(400).json({ success: false, message: 'Cannot apply to your own listing' });
      }

      const existing = await prisma.marketplaceApplication.findUnique({
        where: { listingId_applicantId: { listingId, applicantId } }
      });

      if (existing) {
        return res.status(400).json({ success: false, message: 'Already applied to this listing' });
      }

      const application = await prisma.marketplaceApplication.create({
        data: {
          listingId,
          applicantId,
          note
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Applied successfully',
        data: application
      });
    } catch (error) {
      next(error);
    }
  }

  // 5. Get my applications
  static async getMyApplications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const applicantId = req.user!.userId;
      const apps = await prisma.marketplaceApplication.findMany({
        where: { applicantId },
        orderBy: { createdAt: 'desc' },
        include: {
          listing: {
            include: {
              creator: {
                select: {
                  id: true, firstName: true, lastName: true, avatarUrl: true, jobTitle: true,
                }
              }
            }
          }
        }
      });
      return res.json({ success: true, data: apps });
    } catch (error) {
      next(error);
    }
  }

  // 6. Update application status (Accept/Reject)
  static async updateApplicationStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const creatorId = req.user!.userId;
      const { id: listingId, appId } = req.params;
      const { status } = req.body; // ACCEPTED or REJECTED

      const listing = await prisma.marketplaceListing.findUnique({ where: { id: listingId } });
      if (!listing || listing.creatorId !== creatorId) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      const application = await prisma.marketplaceApplication.update({
        where: { id: appId },
        data: { status } // Types: 'ACCEPTED' | 'REJECTED'
      });

      if (status === 'ACCEPTED') {
        const titleSnippet = listing.title.length > 20 ? listing.title.substring(0,20)+'...' : listing.title;
        await MessageController.injectSystemMessage(
          creatorId, // The listing creator
          application.applicantId, // The applicant
          `Hi! I have accepted your interest in "${titleSnippet}". Let's discuss the terms further!`,
          'MARKETPLACE',
          listing.id
        );
      }

      return res.json({
        success: true,
        message: `Application ${status.toLowerCase()}`,
        data: application
      });
    } catch (error) {
      next(error);
    }
  }

  // 7. Withdraw application (both can do it, terminates contract)
  static async withdrawApplication(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id: listingId, appId } = req.params;

      const application = await prisma.marketplaceApplication.findUnique({
        where: { id: appId },
        include: { listing: true }
      });

      if (!application) return res.status(404).json({ success: false, message: 'Not found' });

      // Ensure user is either applicant or creator
      if (application.applicantId !== userId && application.listing.creatorId !== userId) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      await prisma.marketplaceApplication.update({
        where: { id: appId },
        data: { status: 'WITHDRAWN' }
      });

      return res.json({ success: true, message: 'Application withdrawn successfully' });
    } catch (error) {
      next(error);
    }
  }

  // 8. Report Middleman (involves terminating contract and adding concern to listing)
  static async reportApplication(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id: listingId, appId } = req.params;

      const application = await prisma.marketplaceApplication.findUnique({
        where: { id: appId },
        include: { listing: true }
      });

      if (!application) return res.status(404).json({ success: false, message: 'Not found' });

      // Either side can report
      if (application.applicantId !== userId && application.listing.creatorId !== userId) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      if (application.status !== 'ACCEPTED') {
        return res.status(400).json({ success: false, message: 'Only accepted connections can be reported' });
      }

      // 15 days window logic
      const daysSinceAccepted = (new Date().getTime() - new Date(application.updatedAt).getTime()) / (1000 * 3600 * 24);
      if (daysSinceAccepted > 15) {
        return res.status(400).json({ success: false, message: 'Connections can only be reported within 15 days of acceptance' });
      }

      // Terminate connection
      await prisma.marketplaceApplication.update({
        where: { id: appId },
        data: { status: 'TERMINATED' }
      });

      // Mark the listing as concerned
      await prisma.marketplaceListing.update({
        where: { id: application.listingId },
        data: { concernsCount: { increment: 1 } }
      });

      return res.json({ success: true, message: 'Middleman reported successfully. Contract terminated.' });
    } catch (error) {
      next(error);
    }
  }
}
