import { z } from 'zod';

/**
 * Schema for creating a new staff member.
 * Field names use the camelCase convention expected by the Angular frontend;
 * the controller maps them to snake_case DB columns.
 */
export const createStaffSchema = z.object({
  name: z
    .string({ required_error: 'Name is required.' })
    .min(1, 'Name must not be empty.'),
  role: z
    .string({ required_error: 'Role is required.' })
    .min(1, 'Role must not be empty.'),
  email: z
    .string({ required_error: 'Email is required.' })
    .email('Must be a valid email address.'),
  phone_no: z
    .string({ required_error: 'Phone number is required.' })
    .min(1, 'Phone number must not be empty.'),
  department: z
    .string({ required_error: 'Department is required.' })
    .min(1, 'Department must not be empty.'),
  joining_date: z
    .string({ required_error: 'Joining date is required.' })
    .min(1, 'Joining date must not be empty.'),
  userId: z.string().optional(),
  idProof: z.string().optional(),
  proofNo: z.string().optional(),
});

export const updateStaffSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  email: z.string().email('Must be a valid email address.').optional(),
  phoneNo: z.string().min(1).optional(),
  phone_no: z.string().min(1).optional(),
  department: z.string().min(1).optional(),
  joiningDate: z.string().min(1).optional(),
  joining_date: z.string().min(1).optional(),
  userId: z.string().optional(),
  idProof: z.string().optional(),
  id_proof: z.string().optional(),
  proofNo: z.string().optional(),
  proof_no: z.string().optional(),
  isActive: z.boolean().optional(),
});

/** Inferred TypeScript types */
export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
