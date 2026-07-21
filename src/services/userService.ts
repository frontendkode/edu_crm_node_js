import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import sequelize from '../config/database';
import { AppError } from '../utils/appError';
import { createUser, deleteUser, findById, findByUsername, findAllUsers, updateUser } from '../repositories/userRepository';
import { findStaffById, findStaffByUserId, updateStaff } from '../repositories/staffRepository';
import { logAuditEvent } from './auditService';
import { CreateUserInput, UpdateUserInput } from '../validators/userValidator';

const PASSWORD_SALT_ROUNDS = 10;
const DEFAULT_USER_ALLOWED_ROUTES = ['/dashboard', '/lead', '/students', '/staff-task', '/fees', '/students-attendance'];

export const getUsers = async (options: Parameters<typeof findAllUsers>[0]) => {
  const normalizedOptions = {
    ...options,
    sortOrder:
      options.sortOrder && options.sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
  } as Parameters<typeof findAllUsers>[0];

  return findAllUsers(normalizedOptions);
};

export const getUserById = async (id: string) => {
  const user = await findById(id);
  if (!user) {
    throw new AppError('User not found.', 404);
  }
  return user;
};

export const createNewUser = async (input: CreateUserInput, actorId?: string) => {
  const normalizedUsername = input.username.trim();
  const existingUser = await findByUsername(normalizedUsername);

  if (existingUser) {
    throw new AppError('A user with that username already exists.', 409);
  }

  const encryptedPassword = await bcrypt.hash(input.password, PASSWORD_SALT_ROUNDS);
  const userId = randomUUID();

  const transaction = await sequelize.transaction();
  try {
      const userPayload: any = {
        id: userId,
        username: normalizedUsername,
        password: encryptedPassword,
        role: input.role,
        user_type: input.staffId ? 'STAFF' : 'USER',
        otp: null,
        token: null,
        token_creation_date: null,
        failed_login_attempts: 0,
        locked_until: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Optional fields from input
      if (typeof (input as any).enabled === 'boolean') {
        userPayload.enabled = (input as any).enabled;
        userPayload.is_active = (input as any).enabled; // keep existing field in sync
      }

      if (Array.isArray((input as any).allowedRoutes)) {
        userPayload.allowed_routes = (input as any).allowedRoutes.length > 0 ? (input as any).allowedRoutes : DEFAULT_USER_ALLOWED_ROUTES;
      }

      const user = await createUser(userPayload, transaction);

    if (input.staffId) {
      const staff = await findStaffById(input.staffId);
      if (!staff) {
        throw new AppError('Associated staff member not found.', 404);
      }

      await updateStaff(input.staffId, { user_id: userId }, transaction);
    }

    await logAuditEvent({
      userId: actorId,
      targetType: 'user',
      targetId: userId,
      action: 'create_user',
      details: `Created user ${normalizedUsername} with role ${input.role}`,
    });

    await transaction.commit();
    return user;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const updateExistingUser = async (id: string, input: UpdateUserInput, actorId?: string) => {
  const user = await findById(id);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  if (input.username && input.username !== user.username) {
    const existingUser = await findByUsername(input.username.trim());
    if (existingUser && existingUser.id !== id) {
      throw new AppError('A user with that username already exists.', 409);
    }
  }

  const updates: any = {
    updated_at: new Date().toISOString(),
  };

  if (input.username) {
    updates.username = input.username.trim();
  }

  if (typeof input.role === 'string' && input.role.trim().length > 0) {
    updates.role = input.role.trim().toUpperCase();
  }

  // Support both legacy isActive and new enabled property
  if (typeof (input as any).enabled === 'boolean') {
    updates.enabled = (input as any).enabled;
    updates.is_active = (input as any).enabled; // keep legacy column in sync
  } else if (typeof (input as any).isActive === 'boolean') {
    updates.is_active = (input as any).isActive;
  }

  if (input.password) {
    updates.password = await bcrypt.hash(input.password, PASSWORD_SALT_ROUNDS);
  }

  if (Array.isArray((input as any).allowedRoutes)) {
    updates.allowed_routes = (input as any).allowedRoutes.length > 0 ? (input as any).allowedRoutes : DEFAULT_USER_ALLOWED_ROUTES;
  }

  const [count, updated] = await updateUser(id, updates);
  if (count === 0) {
    throw new AppError('Failed to update user.', 500);
  }

  if (typeof input.staffId === 'string') {
    const normalizedStaffId = input.staffId.trim();
    const existingStaffForUser = await findStaffByUserId(id);

    if (existingStaffForUser && normalizedStaffId !== existingStaffForUser.id) {
      await updateStaff(existingStaffForUser.id, { user_id: null });
    }

    if (normalizedStaffId) {      const staff = await findStaffById(normalizedStaffId);
      if (!staff) {
        throw new AppError('Associated staff member not found.', 404);
      }
      await updateStaff(normalizedStaffId, { user_id: id });
    }
  }

  await logAuditEvent({
    userId: actorId,
    targetType: 'user',
    targetId: id,
    action: 'update_user',
    details: `Updated user ${id}`,
  });

  return updated[0];
};

export const removeUser = async (id: string, actorId?: string) => {
  const user = await findById(id);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  const deletedCount = await deleteUser(id);
  if (deletedCount === 0) {
    throw new AppError('Failed to delete user.', 500);
  }

  await logAuditEvent({
    userId: actorId,
    targetType: 'user',
    targetId: id,
    action: 'delete_user',
    details: `Deleted user ${user.username}`,
  });

  return deletedCount;
};
