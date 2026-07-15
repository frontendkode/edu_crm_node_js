import { Op, Transaction } from 'sequelize';
import Staff from '../models/Staff';
import Task from '../models/Task';

export interface StaffQueryOptions {
  search?: string;
  role?: string;
  department?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export const findStaffById = async (id: string): Promise<Staff | null> => {
  return Staff.findByPk(id, {
    include: [
      {
        model: Task,
        as: 'taskManagementDTOS',
      },
    ],
  });
};

export const findAllStaff = async (options: StaffQueryOptions) => {
  const where: any = {};

  if (options.search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${options.search}%` } },
      { email: { [Op.like]: `%${options.search}%` } },
      { department: { [Op.like]: `%${options.search}%` } },
    ];
  }

  if (options.role) {
    where.role = options.role;
  }

  if (options.department) {
    where.department = options.department;
  }

  if (typeof options.isActive === 'boolean') {
    where.is_active = options.isActive;
  }

  const order = [[options.sortBy || 'created_at', options.sortOrder || 'ASC']] as any;

  return Staff.findAndCountAll({
    where,
    limit: options.limit,
    offset: options.offset,
    order,
    include: [
      {
        model: Task,
        as: 'taskManagementDTOS',
      },
    ],
  });
};

export const findAllStaffNameAndIds = async (): Promise<Staff[]> => {
  return Staff.findAll({
    attributes: ['id', 'name'],
    where: { is_active: true },
    order: [['name', 'ASC']],
  });
};

export const createStaff = async (staffData: Partial<Staff>, transaction?: Transaction): Promise<Staff> => {
  return Staff.create(staffData as any, { transaction });
};

export const updateStaff = async (
  id: string,
  updates: Partial<Staff>,
  transaction?: Transaction
): Promise<[number, Staff[]]> => {
  return Staff.update(updates, {
    where: { id },
    returning: true,
    transaction,
  });
};

export const deleteStaff = async (id: string): Promise<number> => {
  return Staff.destroy({ where: { id } });
};
