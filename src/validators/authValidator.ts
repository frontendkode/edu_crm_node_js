import { z } from 'zod';

/**
 * Schema for the login endpoint payload that the legacy Angular frontend sends.
 * The frontend sends credentials encrypted via AES, so the request body
 * contains a single `encData` string.
 */
export const loginSchema = z.object({
  encData: z
    .string({ required_error: 'Encrypted payload is required.' })
    .min(1, 'Encrypted payload must not be empty.'),
});

/**
 * Schema for the decrypted login credentials.
 */
export const loginInputSchema = z.object({
  username: z
    .string({ required_error: 'Username is required.' })
    .min(3, 'Username must be at least 3 characters.'),
  password: z
    .string({ required_error: 'Password is required.' })
    .min(6, 'Password must be at least 6 characters.'),
});

/**
 * Schema for the user registration endpoint.
 */
export const registerSchema = z.object({
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

/** Inferred TypeScript types for convenience */
export type LoginInput = z.infer<typeof loginInputSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
