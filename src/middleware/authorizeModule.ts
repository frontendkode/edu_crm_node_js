import { Request, Response, NextFunction } from 'express';

const getRouteVariants = (route: string): string[] => {
  if (!route) return [];
  const normalized = route.trim().startsWith('/') ? route.trim() : `/${route.trim()}`;
  const variants = new Set<string>([normalized]);

  const withoutAdminPrefix = normalized.replace(/^\/admin/, '');
  if (withoutAdminPrefix !== normalized) {
    variants.add(withoutAdminPrefix);
  }

  if (normalized === '/students' || normalized === '/student') {
    variants.add('/students');
    variants.add('/student');
  }

  if (normalized === '/staff-task' || normalized === '/task') {
    variants.add('/staff-task');
    variants.add('/task');
  }

  if (normalized === '/students-attendance' || normalized === '/student-attendance') {
    variants.add('/students-attendance');
    variants.add('/student-attendance');
  }

  if (normalized === '/user-management' || normalized === '/admin/user-management') {
    variants.add('/user-management');
    variants.add('/admin/user-management');
  }

  return Array.from(variants);
};

/**
 * Simple module-based authorization middleware factory.
 * - Bypasses check for ADMIN / SUPER_ADMIN
 * - Rejects if user.enabled is false
 * - Checks if requested module exists in req.user.allowedRoutes
 */
export const authorizeModule = (moduleRoute: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user as any;

    if (!user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    // If account disabled
    if (typeof user.enabled !== 'undefined' && !user.enabled) {
      res.status(403).json({ message: 'Account disabled.' });
      return;
    }

    const role = (user.role || '').toString().toUpperCase();
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
      // admin bypass
      next();
      return;
    }

    const allowed: string[] = Array.isArray(user.allowedRoutes) ? user.allowedRoutes : [];
    const requestedVariants = getRouteVariants(moduleRoute);

    const hasAccess = allowed.some((route) => {
      const candidateVariants = getRouteVariants(route);
      return candidateVariants.some((variant) => requestedVariants.includes(variant));
    });

    if (hasAccess) {
      next();
      return;
    }

    res.status(403).json({ message: 'Access denied' });
  };
};
