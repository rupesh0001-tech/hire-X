import type { Response, NextFunction } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import multer from 'multer';
import ImageKit from 'imagekit';
import prisma from '../../config/database/db';
import type { AuthRequest } from '../../middlewares/auth/jwt.middleware';

const razorpay = new Razorpay({
  key_id: process.env.PAY_KEY!,
  key_secret: process.env.PAY_SECRET!,
});

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

const LISTING_FEE_PAISE = 10000; // ₹100

/** Generate a random 5-char alphanumeric code */
function generateAttendanceCode(): string {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

/** Strip attendance codes from registrations before sending to host/admin */
function sanitizeRegistrations(regs: any[]) {
  return regs.map(({ attendanceCode: _code, paymentId: _pid, orderId: _oid, participantPhone: _ph, ...rest }) => rest);
}

export class EventController {
  // ── GET /event  — all listed events (not own, not cancelled) ──────────────
  static async getAllEvents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const events = await prisma.event.findMany({
        where: { isListed: true, status: { not: 'CANCELLED' } },
        orderBy: { eventDate: 'asc' },
        include: {
          organizer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          _count: { select: { registrations: { where: { paymentStatus: 'PAID' } } } },
        },
      });

      // For each event, tell the caller if the current user is registered
      const regMap = userId
        ? await prisma.eventRegistration.findMany({
            where: { userId, eventId: { in: events.map((e) => e.id) }, paymentStatus: 'PAID' },
            select: { eventId: true },
          })
        : [];
      const registeredIds = new Set(regMap.map((r) => r.eventId));

      return res.json({
        success: true,
        data: events.map((e) => ({ ...e, isRegistered: registeredIds.has(e.id) })),
      });
    } catch (err) { next(err); }
  }

  // ── GET /event/my-events — events hosted by current user ─────────────────
  static async getMyEvents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId!;
      const events = await prisma.event.findMany({
        where: { organizerId: userId },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { registrations: { where: { paymentStatus: 'PAID' } } } },
          registrations: {
            where: { paymentStatus: 'PAID' },
            select: {
              id: true,
              participantName: true,
              participantEmail: true,
              amountPaid: true,
              attendanceStatus: true,
              refundStatus: true,
              createdAt: true,
              // attendanceCode intentionally omitted
            },
          },
        },
      });
      return res.json({ success: true, data: events });
    } catch (err) { next(err); }
  }

  // ── GET /event/my-registrations — events user registered for ─────────────
  static async getMyRegistrations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId!;
      const regs = await prisma.eventRegistration.findMany({
        where: { userId, paymentStatus: 'PAID' },
        orderBy: { createdAt: 'desc' },
        include: {
          event: {
            include: {
              organizer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
            },
          },
        },
      });
      // Return attendance code only to the registrant themselves
      return res.json({ success: true, data: regs });
    } catch (err) { next(err); }
  }

  // ── GET /event/:id — single event detail ─────────────────────────────────
  static async getEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          organizer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, jobTitle: true } },
          _count: { select: { registrations: { where: { paymentStatus: 'PAID' } } } },
        },
      });
      if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

      const reg = userId
        ? await prisma.eventRegistration.findUnique({ where: { eventId_userId: { eventId: id, userId } } })
        : null;

      return res.json({
        success: true,
        data: {
          ...event,
          isRegistered: reg?.paymentStatus === 'PAID',
          myAttendanceCode: reg?.paymentStatus === 'PAID' ? reg.attendanceCode : null,
          myAttendanceStatus: reg?.attendanceStatus ?? null,
          myRefundStatus: reg?.refundStatus ?? null,
        },
      });
    } catch (err) { next(err); }
  }

  // ── POST /event/listing/order — create ₹100 listing fee order ────────────
  static async createListingOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId!;
      const receipt = `list_${Date.now().toString(36)}`;
      const order = await razorpay.orders.create({
        amount: LISTING_FEE_PAISE,
        currency: 'INR',
        receipt,
        notes: { userId, purpose: 'event_listing' },
      });
      return res.json({ success: true, data: { orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.PAY_KEY } });
    } catch (err: any) {
      return res.status(502).json({ success: false, message: err?.error?.description || 'Payment gateway error' });
    }
  }

  // ── POST /event — create event after listing payment verified ────────────
  static async createEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId!;
      const {
        title, description, price, venue, prize,
        maxParticipants, eventDate, contactInfo, organizerName,
        razorpay_order_id, razorpay_payment_id, razorpay_signature,
      } = req.body;

      // Verify listing fee payment
      const hmac = crypto.createHmac('sha256', process.env.PAY_SECRET!);
      hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      if (hmac.digest('hex') !== razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Listing payment verification failed' });
      }

      // Handle optional banner upload
      let bannerUrl: string | null = null;
      let bannerFileId: string | null = null;
      const bannerFile = (req as any).file as Express.Multer.File | undefined;
      if (bannerFile) {
        const uploaded = await imagekit.upload({
          file: bannerFile.buffer,
          fileName: `event_banner_${Date.now()}`,
          folder: '/events/banners',
        });
        bannerUrl = uploaded.url;
        bannerFileId = uploaded.fileId;
      }

      const event = await prisma.event.create({
        data: {
          title,
          description,
          bannerUrl,
          bannerFileId,
          price: Math.round(Number(price) * 100), // convert rupees to paise
          venue,
          prize: prize || null,
          maxParticipants: maxParticipants ? Number(maxParticipants) : null,
          eventDate: new Date(eventDate),
          contactInfo,
          organizerName,
          organizerId: userId,
          listingOrderId: razorpay_order_id,
          listingPaymentId: razorpay_payment_id,
          isListed: true,
        },
        include: {
          organizer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        },
      });

      return res.status(201).json({ success: true, message: 'Event created and listed!', data: event });
    } catch (err) { next(err); }
  }

  // ── POST /event/:id/register/order — pay event fee ───────────────────────
  static async createRegistrationOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId!;
      const { id: eventId } = req.params;

      const event = await prisma.event.findUnique({ where: { id: eventId } });
      if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
      if (event.status === 'CANCELLED') return res.status(400).json({ success: false, message: 'Event is cancelled' });
      if (event.organizerId === userId) return res.status(400).json({ success: false, message: 'You cannot register for your own event' });

      // Check seat limit
      if (event.maxParticipants) {
        const count = await prisma.eventRegistration.count({ where: { eventId, paymentStatus: 'PAID' } });
        if (count >= event.maxParticipants) return res.status(400).json({ success: false, message: 'Event is full' });
      }

      // Check if already registered
      const existing = await prisma.eventRegistration.findUnique({ where: { eventId_userId: { eventId, userId } } });
      if (existing?.paymentStatus === 'PAID') return res.status(400).json({ success: false, message: 'Already registered' });

      const amount = event.price === 0 ? 0 : event.price;
      const receipt = `ereg_${Date.now().toString(36)}`;

      if (amount === 0) {
        // Free event — register directly
        const code = generateAttendanceCode();
        const reg = await prisma.eventRegistration.upsert({
          where: { eventId_userId: { eventId, userId } },
          create: {
            eventId, userId,
            participantName: req.body.participantName || '',
            participantEmail: req.body.participantEmail || '',
            participantPhone: req.body.participantPhone || '',
            amountPaid: 0,
            paymentStatus: 'PAID',
            attendanceCode: code,
          },
          update: { paymentStatus: 'PAID' },
        });
        return res.json({ success: true, data: { free: true, attendanceCode: code, registrationId: reg.id } });
      }

      const order = await razorpay.orders.create({
        amount,
        currency: 'INR',
        receipt,
        notes: { eventId, userId, purpose: 'event_registration' },
      });

      return res.json({ success: true, data: { orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.PAY_KEY } });
    } catch (err: any) {
      return res.status(502).json({ success: false, message: err?.error?.description || 'Payment gateway error' });
    }
  }

  // ── POST /event/:id/register/verify — verify payment & create registration
  static async verifyRegistration(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId!;
      const { id: eventId } = req.params;
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, participantName, participantEmail, participantPhone } = req.body;

      const hmac = crypto.createHmac('sha256', process.env.PAY_SECRET!);
      hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      if (hmac.digest('hex') !== razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Payment verification failed' });
      }

      const event = await prisma.event.findUnique({ where: { id: eventId } });
      if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

      const attendanceCode = generateAttendanceCode();

      const reg = await prisma.eventRegistration.upsert({
        where: { eventId_userId: { eventId, userId } },
        create: {
          eventId, userId, participantName, participantEmail, participantPhone,
          amountPaid: event.price,
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          paymentStatus: 'PAID',
          attendanceCode,
        },
        update: {
          participantName, participantEmail, participantPhone,
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          paymentStatus: 'PAID',
          attendanceCode,
        },
      });

      return res.json({
        success: true,
        message: 'Registration confirmed!',
        data: { registrationId: reg.id, attendanceCode }, // secret code only for the user
      });
    } catch (err) { next(err); }
  }

  // ── POST /event/:id/verify-attendance — host dials user's 5-digit code ───
  static async verifyAttendance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId!;
      const { id: eventId } = req.params;
      const { code } = req.body;

      if (!code) return res.status(400).json({ success: false, message: 'Attendance code is required' });

      const event = await prisma.event.findUnique({ where: { id: eventId } });
      if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
      if (event.organizerId !== userId) return res.status(403).json({ success: false, message: 'Only the event host can verify attendance' });

      const reg = await prisma.eventRegistration.findFirst({
        where: { eventId, attendanceCode: code.toUpperCase(), paymentStatus: 'PAID' },
        select: { id: true, participantName: true, attendanceStatus: true },
      });

      if (!reg) return res.status(404).json({ success: false, message: 'Invalid code. No matching registration found.' });
      if (reg.attendanceStatus === 'VERIFIED') return res.json({ success: true, alreadyVerified: true, data: { participantName: reg.participantName } });

      await prisma.eventRegistration.update({
        where: { id: reg.id },
        data: { attendanceStatus: 'VERIFIED', verifiedAt: new Date() },
      });

      return res.json({ success: true, message: 'Attendance verified!', data: { participantName: reg.participantName } });
    } catch (err) { next(err); }
  }

  // ── POST /event/:id/cancel — host cancels event ──────────────────────────
  static async cancelEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId!;
      const { id: eventId } = req.params;

      const event = await prisma.event.findUnique({ where: { id: eventId } });
      if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
      if (event.organizerId !== userId) return res.status(403).json({ success: false, message: 'Only the event host can cancel' });
      if (event.status === 'CANCELLED') return res.status(400).json({ success: false, message: 'Already cancelled' });

      // Mark all paid registrations for refund
      await prisma.$transaction([
        prisma.event.update({ where: { id: eventId }, data: { status: 'CANCELLED' } }),
        prisma.eventRegistration.updateMany({
          where: { eventId, paymentStatus: 'PAID' },
          data: { refundStatus: 'PENDING', refundReason: 'Event cancelled by host' },
        }),
      ]);

      return res.json({ success: true, message: 'Event cancelled. All registrants will be refunded.' });
    } catch (err) { next(err); }
  }

  // ── GET /event/:id/registrations — host views their event's registrations ─
  static async getEventRegistrations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId!;
      const { id: eventId } = req.params;

      const event = await prisma.event.findUnique({ where: { id: eventId } });
      if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
      if (event.organizerId !== userId) return res.status(403).json({ success: false, message: 'Forbidden' });

      const regs = await prisma.eventRegistration.findMany({
        where: { eventId, paymentStatus: 'PAID' },
        select: {
          id: true,
          participantName: true,
          participantEmail: true,
          amountPaid: true,
          attendanceStatus: true,
          refundStatus: true,
          createdAt: true,
          // attendanceCode, participantPhone, paymentId intentionally excluded from host view
        },
        orderBy: { createdAt: 'asc' },
      });

      const totalRevenue = regs.filter((r) => r.attendanceStatus === 'VERIFIED').reduce((s, r) => s + r.amountPaid, 0);
      const pendingRevenue = regs.reduce((s, r) => s + r.amountPaid, 0);

      return res.json({
        success: true,
        data: {
          registrations: regs,
          stats: {
            total: regs.length,
            verified: regs.filter((r) => r.attendanceStatus === 'VERIFIED').length,
            absent: regs.filter((r) => r.attendanceStatus === 'ABSENT').length,
            notVerified: regs.filter((r) => r.attendanceStatus === 'NOT_VERIFIED').length,
            totalRevenue,   // amount host will receive (verified only)
            pendingRevenue, // expected if everyone attends
          },
        },
      });
    } catch (err) { next(err); }
  }
}
