import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/express';

const JWT_SECRET = process.env.JWT_SECRET as string;

/**
 * Middleware that extracts and verifies a Bearer JWT from the Authorization header.
 * On success, attaches the decoded payload to `req.user`.
 * On failure, responds with 401 Unauthorized.
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Access denied. No token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

/**
 * Middleware factory that restricts access to specific roles.
 * Must be used AFTER `authenticateToken`.
 *
 * @param roles - Allowed roles (compared case-insensitively)
 * @returns Express middleware that checks `req.user.role` against the allowed list
 *
 * @example
 * router.get('/admin-only', authenticateToken, authorizeRoles('admin'), handler);
 */
export const authorizeRoles = (...roles: string[]) => {
  const allowedRoles = roles.map((r) => r.toLowerCase());

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    const userRole = req.user.role.toLowerCase();

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        error: 'Forbidden. You do not have permission to access this resource.',
      });
      return;
    }

    next();
  };
};
