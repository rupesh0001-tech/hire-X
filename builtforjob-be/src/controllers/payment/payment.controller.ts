import type { Response, NextFunction } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import prisma from '../../config/database/db';
import type { AuthRequest } from '../../middlewares/auth/jwt.middleware';

const razorpay = new Razorpay({
  key_id: process.env.PAY_KEY!,
  key_secret: process.env.PAY_SECRET!,
});

const PROMOTION_PRICE_PAISE = 100000; // ₹1000 in paise
const PROMOTION_DAYS = 7;

export class PaymentController {
  // POST /payment/promote/order  — create Razorpay order
  static async createOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { postId } = req.body;
      if (!postId) return res.status(400).json({ success: false, message: 'postId is required' });

      const post = await prisma.post.findUnique({ where: { id: postId } });
      if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
      if (post.authorId !== userId) {
        return res.status(403).json({ success: false, message: 'You can only promote your own posts' });
      }

      // receipt max length is 40 chars — use short timestamp in base-36 to stay well under limit
      const receipt = `promo_${Date.now().toString(36)}`;

      const order = await razorpay.orders.create({
        amount: PROMOTION_PRICE_PAISE,
        currency: 'INR',
        receipt,
        notes: { postId: postId as string, userId: userId as string },
      });

      return res.json({
        success: true,
        data: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: process.env.PAY_KEY,
        },
      });
    } catch (error: any) {
      // Razorpay errors carry a nested `error` object with a `description` field
      const rzpMsg =
        error?.error?.description ||
        error?.description ||
        error?.message ||
        'Payment gateway error. Please try again.';
      console.error('[Razorpay createOrder error]', JSON.stringify(error));
      return res.status(502).json({ success: false, message: rzpMsg });
    }
  }

  // POST /payment/promote/verify — verify signature & promote post
  static async verifyPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, postId } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !postId) {
        return res.status(400).json({ success: false, message: 'Missing payment fields' });
      }

      // Verify HMAC signature
      const hmac = crypto.createHmac('sha256', process.env.PAY_SECRET!);
      hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const digest = hmac.digest('hex');

      if (digest !== razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Payment verification failed' });
      }

      // Mark post as promoted for 7 days
      const promotedUntil = new Date();
      promotedUntil.setDate(promotedUntil.getDate() + PROMOTION_DAYS);

      const post = await prisma.post.update({
        where: { id: postId },
        data: { isSponsored: true, promotedUntil },
      });

      return res.json({
        success: true,
        message: 'Post promoted successfully for 7 days!',
        data: { postId: post.id, promotedUntil: post.promotedUntil },
      });
    } catch (error) {
      next(error);
    }
  }
}
