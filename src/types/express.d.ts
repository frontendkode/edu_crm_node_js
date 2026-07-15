/**
 * Extends Express Request interface to include JWT-decoded user data.
 * This declaration is automatically picked up by TypeScript via tsconfig includes.
 */

export interface JwtPayload {
  id: string;
  username: string;
  role: string;
  enabled?: boolean;
  allowedRoutes?: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
