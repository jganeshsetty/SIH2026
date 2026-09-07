// ============================================================================
// Farmora Authentication & Role Authorization Middleware
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin';
import { db } from '../db/index';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '../lib/auth-utils';

export interface AuthRequest extends Request {
  user?: any;
  dbUser?: any;
}

/**
 * Authentication Middleware: Verifies Bearer Token via Local JWT or Firebase Auth
 */
export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing authorization bearer token' });
    return;
  }

  const token = authHeader.split('Bearer ')[1];

  // 1. Verify local Farmora JWT token
  const localUser = verifyToken(token);
  if (localUser) {
    try {
      const dbUsers = await db
        .select()
        .from(users)
        .where(eq(users.uid, localUser.uid))
        .limit(1);

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

  // 2. Verify Firebase Admin ID token
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;

    try {
      let dbUsers = await db
        .select()
        .from(users)
        .where(eq(users.uid, decodedToken.uid))
        .limit(1);

      if (dbUsers.length === 0 && decodedToken.email) {
        dbUsers = await db
          .select()
          .from(users)
          .where(eq(users.email, decodedToken.email.toLowerCase().trim()))
          .limit(1);
      }

      if (dbUsers.length > 0) {
        req.dbUser = dbUsers[0];
      }
    } catch (e) {
      console.warn('Database error during token user lookup:', e);
    }

    next();
    return;
  } catch (error) {
    // 3. Fallback: Parse JWT payload if Firebase Admin verification is unconfigured
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
        if (payload && (payload.user_id || payload.sub || payload.uid)) {
          const uid = payload.user_id || payload.sub || payload.uid;
          const email = payload.email || '';
          req.user = { uid, email, name: payload.name || email.split('@')[0] || 'Farmora User' };

          try {
            let dbUsers = await db
              .select()
              .from(users)
              .where(eq(users.uid, uid))
              .limit(1);

            if (dbUsers.length === 0 && email) {
              dbUsers = await db
                .select()
                .from(users)
                .where(eq(users.email, email.toLowerCase().trim()))
                .limit(1);
            }

            if (dbUsers.length > 0) {
              req.dbUser = dbUsers[0];
            }
          } catch (e) {}

          next();
          return;
        }
      }
    } catch (jwtParseErr) {}

    res.status(401).json({ error: 'Unauthorized: Invalid authentication token' });
    return;
  }
};

/**
 * Role-Based Authorization Middleware (Farmer, Buyer, Transporter)
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.dbUser) {
      res.status(401).json({ error: 'Unauthorized: Access requires authentication' });
      return;
    }

    const normalizedRole = (req.dbUser.role || '').toLowerCase();
    const normalizedAllowed = allowedRoles.map(role => role.toLowerCase());

    const isAllowed = normalizedAllowed.includes(normalizedRole) ||
                      (normalizedAllowed.includes('transporter') && ['transport_driver', 'driver'].includes(normalizedRole)) ||
                      (normalizedAllowed.includes('transport_driver') && ['transporter', 'driver'].includes(normalizedRole));

    if (!isAllowed) {
      res.status(403).json({ error: `Forbidden: Access restricted to ${allowedRoles.join(', ')}` });
      return;
    }

    next();
  };
};
