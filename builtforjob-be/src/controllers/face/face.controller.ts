import type { Request, Response, NextFunction } from 'express';
import prisma from '../../config/database/db';
import { JWTService } from '../../services/jwt/jwt.service';

// Euclidean distance between two descriptors
function euclideanDistance(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
}

const FACE_MATCH_THRESHOLD = 0.5; // lower = stricter

export class FaceController {
  // POST /face/register  — called after normal registration to save descriptor
  static async saveFaceDescriptor(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, descriptor } = req.body;

      if (!email || !descriptor || !Array.isArray(descriptor)) {
        return res.status(400).json({ success: false, message: 'Email and face descriptor array are required' });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      await prisma.user.update({
        where: { email },
        data: { faceDescriptor: descriptor },
      });

      return res.json({ success: true, message: 'Face registered successfully' });
    } catch (error) {
      next(error);
    }
  }

  // POST /face/login  — provide email + descriptor, get token back
  static async faceLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, descriptor } = req.body;

      if (!email || !descriptor || !Array.isArray(descriptor)) {
        return res.status(400).json({ success: false, message: 'Email and face descriptor array are required' });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      if (!user.faceDescriptor) {
        return res.status(400).json({ success: false, message: 'No face registered for this account. Please register your face first.' });
      }

      const saved = user.faceDescriptor as number[];
      const distance = euclideanDistance(descriptor, saved);

      console.log(`Face distance for ${email}: ${distance}`);

      if (distance > FACE_MATCH_THRESHOLD) {
        return res.status(401).json({ success: false, message: 'Face does not match. Try again.' });
      }

      const token = JWTService.generateToken({ userId: user.id, email: user.email });

      return res.json({
        success: true,
        message: 'Face login successful',
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
