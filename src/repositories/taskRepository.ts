import { Op, Transaction } from 'sequelize';
import Task from '../models/Task';

export interface TaskQueryOptions {
  search?: string;
  status?: string;
  staffId?: string;
  taskType?: string;
  priority?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export const findTaskById = async (id: string): Promise<Task | null> => {
  return Task.findByPk(id);
};

export const findAllTasks = async (options: TaskQueryOptions): Promise<{ rows: Task[]; count: number }> => {
  const where: any = {};

  if (options.search) {
    const searchTerm = `%${options.search}%`;
    where[Op.or] = [
      { task_title: { [Op.like]: searchTerm } },
      { description: { [Op.like]: searchTerm } },
      { associated_lead: { [Op.like]: searchTerm } },
      { task_type: { [Op.like]: searchTerm } },
      { staff_name: { [Op.like]: searchTerm } },
    ];
  }

  if (options.status) {
    where.status = options.status;
  }

  if (options.staffId) {
    where.staff_id = options.staffId;
  }

  if (options.taskType) {
    where.task_type = options.taskType;
  }

  if (options.priority) {
    where.priority = options.priority;
  }

  const order = [[options.sortBy || 'created_at', options.sortOrder || 'DESC']] as any;

  return Task.findAndCountAll({
    where,
    order,
    limit: options.limit,
    offset: options.offset,
  });
};

export const createTask = async (taskData: Partial<Task>, transaction?: Transaction): Promise<Task> => {
  return Task.create(taskData as any, { transaction });
};

export const updateTask = async (
  id: string,
  updates: Partial<Task>,
  transaction?: Transaction
): Promise<[number, Task[]]> => {
  return Task.update(updates, {
    where: { id },
    returning: true,
    transaction,
  });
};

export const deleteTask = async (id: string, transaction?: Transaction): Promise<number> => {
  return Task.destroy({ where: { id }, transaction });
};
