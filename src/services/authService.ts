import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { signAccessToken } from '../utils/jwt';
import { AppError } from '../utils/appError';
import { createSession, findSessionByUserId, updateSessionByUserId } from '../repositories/sessionRepository';
import { findByUsername, updateUser } from '../repositories/userRepository';
import { createNewUser } from './userService';
import { findStaffByUserId } from '../repositories/staffRepository';
import { LoginInput, RegisterInput } from '../validators/authValidator';
import { JwtResponse } from '../types/auth';

const PASSWORD_SALT_ROUNDS = 10;
const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;
const REFRESH_TOKEN_EXPIRY_HOURS = 24 * 30; // 30 days
const DEFAULT_USER_ALLOWED_ROUTES = ['/dashboard', '/lead', '/students', '/staff-task', '/fees', '/students-attendance'];

const getTokenExpiry = (): Date => {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + REFRESH_TOKEN_EXPIRY_HOURS);
  return expiry;
};

export const login = async (input: LoginInput): Promise<JwtResponse> => {
  const user = await findByUsername(input.username);
  console.log(user);

  if (!user || !user.password) {
    throw new AppError('Invalid username or password.', 401);
  }

  if (user.locked_until && user.locked_until > new Date()) {
    throw new AppError(
      'Account temporarily locked due to repeated failed login attempts. Please try again later.',
      423
    );
  }

  const passwordMatches = await bcrypt.compare(input.password, user.password);

  if (!passwordMatches) {
    const failedAttempts = user.failed_login_attempts + 1;
    const updates: Partial<typeof user> = { failed_login_attempts: failedAttempts };

    if (failedAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
      const lockedUntil = new Date();
      lockedUntil.setMinutes(lockedUntil.getMinutes() + LOCK_DURATION_MINUTES);
      updates.locked_until = lockedUntil;
    }

    await updateUser(user.id, updates);
    console.log(user);

    throw new AppError('Invalid username or password.', 401);
  }

  if (user.failed_login_attempts !== 0 || user.locked_until) {
    await updateUser(user.id, {
      failed_login_attempts: 0,
      locked_until: null,
    });
  }

  // Reject disabled users
  if (typeof (user as any).enabled !== 'undefined' && !(user as any).enabled) {
    throw new AppError('Account disabled.', 403);
  }

  const savedAllowedRoutes = Array.isArray((user as any).allowed_routes)
    ? (user as any).allowed_routes
    : Array.isArray((user as any).allowedRoutes)
    ? (user as any).allowedRoutes
    : [];
  const normalizedAllowedRoutes = savedAllowedRoutes.length > 0 ? savedAllowedRoutes : DEFAULT_USER_ALLOWED_ROUTES;

  const normalizedRole = (user.role ?? 'USER').toString().trim().toUpperCase();

  const token = signAccessToken({
    id: user.id,
    username: user.username ?? '',
    role: normalizedRole,
    enabled: typeof (user as any).enabled !== 'undefined' ? (user as any).enabled : true,
    allowedRoutes: normalizedAllowedRoutes,
  });

  const refreshToken = randomUUID();
  const expiration_time = getTokenExpiry();

  const existingSession = await findSessionByUserId(user.id);
  
  if (existingSession) {
    await updateSessionByUserId(user.id, {
      token: refreshToken,
      expiration_time,
    });
  } else {
    await createSession({
      id: randomUUID(),
      user_id: user.id,
      token: refreshToken,
      expiration_time,
    });
  }

  const staff = await findStaffByUserId(user.id);

  return {
    id: user.id,
    username: user.username ?? '',
    role: normalizedRole,
    enabled: typeof (user as any).enabled !== 'undefined' ? (user as any).enabled : true,
    allowedRoutes: normalizedAllowedRoutes,
    token,
    refreshToken,
    staffId: staff?.id,
  };
};

export const register = async (input: RegisterInput): Promise<{ id: string; username: string; role: string }> => {
  const createInput: any = {
    username: input.username,
    password: input.password,
    role: input.role,
    staffId: input.staffId,
  };

  if (typeof (input as any).enabled === 'boolean') {
    createInput.enabled = (input as any).enabled;
  }

  if (Array.isArray((input as any).allowedRoutes)) {
    createInput.allowedRoutes = (input as any).allowedRoutes;
  }

  const user = await createNewUser(createInput);

  return {
    id: user.id,
    username: user.username ?? input.username,
    role: user.role ?? input.role,
  };
};
