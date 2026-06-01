import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';

export interface UserPayload {
  id: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'super-secret-key-for-primetrade-assignment-development';

    const decoded = jwt.verify(token, jwtSecret) as UserPayload;

    // Validate that the user still exists in the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid session. User no longer exists.',
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
    });
  }
};
