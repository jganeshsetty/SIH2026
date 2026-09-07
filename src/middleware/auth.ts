import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { db } from '../db/index.ts';
import { users } from '../db/schema.ts';
import { eq } from 'drizzle-orm';
import { verifyToken } from '../lib/auth-utils.ts';

export interface AuthRequest extends Request {
  user?: any;
  dbUser?: any;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing token' });
    return;
  }

  const token = authHeader.split('Bearer ')[1];
  
  // 1. Try local Farmora JWT verification first
  const localUser = verifyToken(token);
  if (localUser) {
    try {
      const dbUsers = await db.select().from(users).where(eq(users.uid, localUser.uid));
      if (dbUsers.length > 0) {
        req.dbUser = dbUsers[0];
        req.user = localUser;
        next();
        return;
      }
    } catch (dbErr) {
      console.warn('DB lookup error for local user:', dbErr);
    }
  }

  // 2. Try Firebase ID token verification
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    
    const dbUsers = await db.select().from(users).where(eq(users.uid, decodedToken.uid));
    if (dbUsers.length > 0) {
      req.dbUser = dbUsers[0];
    }
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Invalid authentication token' });
    return;
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.dbUser) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const normalizedRole = (req.dbUser.role || '').toLowerCase();
    const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());

    if (!normalizedAllowed.includes(normalizedRole)) {
      res.status(403).json({ error: `Forbidden: Access restricted to ${allowedRoles.join(', ')}` });
      return;
    }

    next();
  };
};
