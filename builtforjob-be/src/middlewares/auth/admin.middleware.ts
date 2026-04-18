import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../../services/jwt/jwt.service';

export interface AdminRequest extends Request {
  admin?: { adminId: string; email: string };
}

export const authenticateAdmin = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = JWTService.verifyToken(token) as any;

      // Must have the isAdmin flag
      if (!decoded.isAdmin) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }

      req.admin = { adminId: decoded.userId, email: decoded.email };
      next();
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
  } catch {
    return res.status(500).json({ success: false, message: 'Authentication error' });
  }
};
