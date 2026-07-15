export const sanitizeUser = (user: any) => {
  const sanitized = { ...user };
  delete sanitized.password;
  delete sanitized.otp;
  delete sanitized.token;
  delete sanitized.token_creation_date;

  const normalizedEnabled =
    typeof sanitized.enabled === 'boolean'
      ? sanitized.enabled
      : typeof sanitized.is_active === 'boolean'
        ? sanitized.is_active
        : true;

  const normalizedAllowedRoutes = Array.isArray(sanitized.allowedRoutes)
    ? sanitized.allowedRoutes
    : Array.isArray(sanitized.allowed_routes)
      ? sanitized.allowed_routes
      : [];

  return {
    ...sanitized,
    enabled: normalizedEnabled,
    allowedRoutes: normalizedAllowedRoutes,
  };
};
