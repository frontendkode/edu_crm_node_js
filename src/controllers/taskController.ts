import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  createNewTask,
  getTaskById,
  getTasks,
  removeTask,
  updateExistingTask,
  updateTaskStatus,
} from '../services/taskService';
import { createTaskSchema, updateTaskSchema } from '../validators/taskValidator';

export const getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, status, staffId, taskType, priority, page, limit, sortBy, sortOrder } = req.query as any;

    const result = await getTasks({
      search: typeof search === 'string' ? search : undefined,
      status: typeof status === 'string' ? status : undefined,
      staffId: typeof staffId === 'string' ? staffId : undefined,
      taskType: typeof taskType === 'string' ? taskType : undefined,
      priority: typeof priority === 'string' ? priority : undefined,
      limit: limit ? Number(limit) : undefined,
      offset: page && limit ? (Number(page) - 1) * Number(limit) : undefined,
      sortBy: typeof sortBy === 'string' ? sortBy : undefined,
      sortOrder: typeof sortOrder === 'string' && sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC',
    });

    res.json({ responseObject: result.items, metadata: { total: result.total } });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const task = await getTaskById(req.params.id);
    res.json({ responseObject: task });
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = createTaskSchema.parse(req.body);
    const task = await createNewTask(input, req.user?.id);
    res.status(201).json({ responseObject: task, responseMessage: 'Task created successfully.' });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = updateTaskSchema.parse(req.body);
    const task = await updateExistingTask(req.params.id, input, req.user?.id);
    res.json({ responseObject: task, responseMessage: 'Task updated successfully.' });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const querySchema = z.object({
      id: z.string().min(1, 'Task id is required.'),
      status: z.string().min(1, 'Status is required.'),
    });

    const { id, status } = querySchema.parse(req.query);
    const task = await updateTaskStatus(id, status, req.user?.id);
    res.json({ responseObject: task, responseMessage: 'Task status updated successfully.' });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await removeTask(req.params.id, req.user?.id);
    res.json({ responseMessage: 'Task deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
