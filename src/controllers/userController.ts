import { Request, Response, NextFunction } from 'express';
import { createNewUser, getUserById, getUsers, removeUser, updateExistingUser } from '../services/userService';
import { createUserSchema, updateUserSchema } from '../validators/userValidator';
import { sanitizeUser } from '../utils/sanitizers';

export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = createUserSchema.parse(req.body);
    const actorId = req.user?.id;
    const user = await createNewUser(input, actorId);
    res.status(201).json({
      responseObject: sanitizeUser(user.toJSON ? user.toJSON() : user),
      responseMessage: 'User created successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, sortBy, sortOrder, search, role, isActive } = req.query;
    const limitValue = limit ? Number(limit) : 25;
    const pageValue = page ? Number(page) : 1;
    const result = await getUsers({
      limit: limitValue,
      offset: (pageValue - 1) * limitValue,
      sortBy: typeof sortBy === 'string' ? sortBy : undefined,
      sortOrder: sortOrder === 'string' && sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC',
      search: typeof search === 'string' ? search : undefined,
      role: typeof role === 'string' ? role : undefined,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    });

    res.json({
      responseObject: result.rows.map((user) => sanitizeUser(user.toJSON ? user.toJSON() : user)),
      metadata: {
        total: result.count,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : result.rows.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await getUserById(req.params.id);
    res.json({ responseObject: sanitizeUser(user.toJSON()) });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = updateUserSchema.parse(req.body);
    const actorId = req.user?.id;
    const user = await updateExistingUser(req.params.id, input, actorId);
    res.json({ responseObject: sanitizeUser(user.toJSON()), responseMessage: 'User updated successfully.' });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await removeUser(req.params.id, req.user?.id);
    res.json({ responseMessage: 'User deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
