import { z } from 'zod';

/**
 * Schema for creating a new task.
 * Required: taskTitle, priority, staffId, dueDate.
 */
export const createTaskSchema = z.object({
  taskTitle: z
    .string({ required_error: 'Task title is required.' })
    .min(1, 'Task title must not be empty.'),
  description: z.string().optional(),
  taskType: z
    .string({ required_error: 'Task type is required.' })
    .min(1, 'Task type must not be empty.'),
  priority: z
    .string({ required_error: 'Priority is required.' })
    .min(1, 'Priority must not be empty.'),
  staffId: z
    .string({ required_error: 'Staff ID is required.' })
    .min(1, 'Staff ID must not be empty.'),
  dueDate: z
    .string({ required_error: 'Due date is required.' })
    .min(1, 'Due date must not be empty.'),
  staffName: z.string().optional(),
  associatedLead: z.string().optional(),
  status: z.string().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

/** Inferred TypeScript types */
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
