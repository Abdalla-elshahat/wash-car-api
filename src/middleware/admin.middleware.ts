// src/middleware/admin.middleware.ts
import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AdminMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      throw new ForbiddenException('No token provided');
    }
    const token = authHeader.split(' ')[1];

    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'mySecretKey');
      
      if (!decoded.role || (decoded.role !== 'Admin' && decoded.role !== 'admin')) {
        throw new ForbiddenException('Access denied: Admins only');
      }

      (req as any).user = decoded;
      next();
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      throw new ForbiddenException('Invalid token');
    }
  }
}
