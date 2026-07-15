import { randomUUID } from 'crypto';
import sequelize from '../config/database';
import { AppError } from '../utils/appError';
import { findStaffById } from '../repositories/staffRepository';
import {
  createTask,
  deleteTask,
  findAllTasks,
  findTaskById,
  updateTask,
} from '../repositories/taskRepository';
import { CreateTaskInput, UpdateTaskInput } from '../validators/taskValidator';
import { logAuditEvent } from './auditService';

const toCamelCaseTask = (task: any) => ({
  id: task.id,
  taskTitle: task.task_title,
  description: task.description,
  taskType: task.task_type,
  priority: task.priority,
  staffName: task.staff_name,
  staffId: task.staff_id,
  dueDate: task.due_date,
  associatedLead: task.associated_lead,
  status: task.status,
  createdAt: task.created_at,
  createdBy: task.created_by,
});

export const getTasks = async (options?: {
  search?: string;
  status?: string;
  staffId?: string;
  taskType?: string;
  priority?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}) => {
  const tasksPage = await findAllTasks({
    search: options?.search,
    status: options?.status,
    staffId: options?.staffId,
    taskType: options?.taskType,
    priority: options?.priority,
    limit: options?.limit,
    offset: options?.offset,
    sortBy: options?.sortBy,
    sortOrder: options?.sortOrder,
  });

  return {
    total: tasksPage.count,
    items: tasksPage.rows.map((task) => toCamelCaseTask(task.toJSON ? task.toJSON() : task)),
  };
};

export const getTaskById = async (id: string) => {
  const task = await findTaskById(id);
  if (!task) {
    throw new AppError('Task not found.', 404);
  }

  return toCamelCaseTask(task.toJSON ? task.toJSON() : task);
};

export const createNewTask = async (input: CreateTaskInput, actorId?: string) => {
  const staff = await findStaffById(input.staffId);
  if (!staff) {
    throw new AppError('Assigned staff member does not exist.', 404);
  }

  const taskId = randomUUID();
  const newTask = await createTask({
    id: taskId,
    task_title: input.taskTitle.trim(),
    description: input.description?.trim() ?? null,
    task_type: input.taskType?.trim() ?? null,
    priority: input.priority.trim(),
    staff_id: input.staffId,
    staff_name: input.staffName?.trim() || staff.name,
    due_date: input.dueDate.trim(),
    associated_lead: input.associatedLead?.trim() ?? null,
    status: input.status?.trim() || 'Pending',
    created_at: new Date().toISOString(),
    created_by: actorId || null,
  });

  await logAuditEvent({
    userId: actorId,
    targetType: 'task',
    targetId: taskId,
    action: 'create_task',
    details: `Created task ${input.taskTitle} for staff ${staff.name}`,
  });

  return toCamelCaseTask(newTask.toJSON ? newTask.toJSON() : newTask);
};

export const updateTaskStatus = async (id: string, status: string, actorId?: string) => {
  const task = await findTaskById(id);
  if (!task) {
    throw new AppError('Task not found.', 404);
  }

  const [count] = await updateTask(id, { status: status.trim() });
  if (count === 0) {
    throw new AppError('Failed to update task status.', 500);
  }

  await logAuditEvent({
    userId: actorId,
    targetType: 'task',
    targetId: id,
    action: 'update_task_status',
    details: `Updated task ${id} status to ${status}`,
  });

  return getTaskById(id);
};

export const updateExistingTask = async (
  id: string,
  updates: UpdateTaskInput,
  actorId?: string
) => {
  const task = await findTaskById(id);
  if (!task) {
    throw new AppError('Task not found.', 404);
  }

  const updatePayload: any = {};

  if (updates.taskTitle) updatePayload.task_title = updates.taskTitle.trim();
  if (updates.description !== undefined) updatePayload.description = updates.description?.trim() ?? null;
  if (updates.taskType !== undefined) updatePayload.task_type = updates.taskType?.trim() ?? null;
  if (updates.priority !== undefined) updatePayload.priority = updates.priority?.trim() ?? null;
  if (updates.staffId) {
    const staff = await findStaffById(updates.staffId);
    if (!staff) {
      throw new AppError('Assigned staff member does not exist.', 404);
    }

    updatePayload.staff_id = updates.staffId;
    updatePayload.staff_name = updates.staffName?.trim() || staff.name;
  }
  if (updates.staffName !== undefined) updatePayload.staff_name = updates.staffName?.trim() ?? null;
  if (updates.dueDate !== undefined) updatePayload.due_date = updates.dueDate?.trim() ?? null;
  if (updates.associatedLead !== undefined) updatePayload.associated_lead = updates.associatedLead?.trim() ?? null;
  if (updates.status !== undefined) updatePayload.status = updates.status?.trim() ?? null;

  const [count] = await updateTask(id, updatePayload);
  if (count === 0) {
    throw new AppError('Failed to update task.', 500);
  }

  await logAuditEvent({
    userId: actorId,
    targetType: 'task',
    targetId: id,
    action: 'update_task',
    details: `Updated task ${id}`,
  });

  return getTaskById(id);
};

export const removeTask = async (id: string, actorId?: string) => {
  const task = await findTaskById(id);
  if (!task) {
    throw new AppError('Task not found.', 404);
  }

  const deletedCount = await deleteTask(id);
  if (deletedCount === 0) {
    throw new AppError('Failed to delete task.', 500);
  }

  await logAuditEvent({
    userId: actorId,
    targetType: 'task',
    targetId: id,
    action: 'delete_task',
    details: `Deleted task ${id}`,
  });

  return deletedCount;
};
