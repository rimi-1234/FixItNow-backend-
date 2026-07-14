import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import prisma from '../lib/prisma.js';

export const auth = (...requiredRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization?.split(' ')[1]
        : req.headers.authorization;

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'You are not authorized',
          errorDetails: { reason: 'No token provided' },
        });
      }

      const decoded = jwt.verify(token, config.jwt_access_secret as string) as {
        id: string;
        email: string;
        role: string;
      };

      const dbUser = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, role: true, status: true },
      });

      if (!dbUser) {
        return res.status(401).json({
          success: false,
          message: 'You are not authorized',
          errorDetails: { reason: 'User not found' },
        });
      }

      if (dbUser.status === 'BANNED') {
        return res.status(403).json({
          success: false,
          message: 'Your account has been banned',
          errorDetails: { reason: 'User is banned' },
        });
      }

      if (requiredRoles.length && !requiredRoles.includes(dbUser.role)) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden',
          errorDetails: { reason: 'You do not have the required permissions' },
        });
      }

      req.user = {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
      };
      next();
    } catch (error) {
      next(error);
    }
  };
};
