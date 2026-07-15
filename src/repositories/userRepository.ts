import { Op, Transaction } from 'sequelize';
import User from '../models/User';

export interface UserQueryOptions {
  search?: string;
  role?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export const findByUsername = async (username: string): Promise<User | null> => {
  return User.findOne({ where: { username } });
};

export const findById = async (id: string): Promise<User | null> => {
  return User.findByPk(id);
};

export const findAllUsers = async (options: UserQueryOptions) => {
  const where: any = {};

  if (options.search) {
    where[Op.or] = [
      { username: { [Op.like]: `%${options.search}%` } },
      { role: { [Op.like]: `%${options.search}%` } },
    ];
  }

  if (typeof options.isActive === 'boolean') {
    where.is_active = options.isActive;
  }

  if (options.role) {
    where.role = options.role;
  }

  const order = [[options.sortBy || 'created_at', options.sortOrder || 'ASC']] as any;

  return User.findAndCountAll({
    where,
    limit: options.limit,
    offset: options.offset,
    order,
  });
};

export const createUser = async (userData: Partial<User>, transaction?: Transaction): Promise<User> => {
  return User.create(userData as any, { transaction });
};

export const updateUser = async (
  id: string,
  updates: Partial<User>,
  transaction?: Transaction
): Promise<[number, User[]]> => {
  const [affectedCount] = await User.update(updates, {
    where: { id },
    transaction,
  });

  if (affectedCount === 0) {
    return [0, []];
  }

  const updatedUser = await User.findByPk(id, { transaction });
  return [affectedCount, updatedUser ? [updatedUser] : []];
};

export const deleteUser = async (id: string): Promise<number> => {
  return User.destroy({ where: { id } });
};
