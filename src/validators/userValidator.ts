import { z } from 'zod';

export const createUserSchema = z.object({
  username: z
    .string({ required_error: 'Username is required.' })
    .min(3, 'Username must be at least 3 characters.'),
  password: z
    .string({ required_error: 'Password is required.' })
    .min(6, 'Password must be at least 6 characters.'),
  role: z
    .string({ required_error: 'Role is required.' })
    .min(1, 'Role must not be empty.'),
  staffId: z.string().optional(),
  enabled: z.boolean().optional(),
  allowedRoutes: z.array(z.string()).optional(),
});

export const updateUserSchema = z.object({
  username: z.string().min(3).optional(),
  password: z.string().min(6).optional(),
  role: z.string().min(1).optional(),
  staffId: z.string().optional(),
  isActive: z.boolean().optional(),
  enabled: z.boolean().optional(),
  allowedRoutes: z.array(z.string()).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
