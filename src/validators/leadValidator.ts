import { z } from 'zod';

/**
 * Schema for adding an activity log entry to a lead.
 */
export const activityLogSchema = z.object({
  type: z
    .string({ required_error: 'Activity type is required.' })
    .min(1, 'Activity type must not be empty.'),
  description: z.string().optional(),
  logResult: z.string().optional(),
});

/**
 * Schema for adding a reminder to a lead.
 */
export const reminderSchema = z.object({
  type: z
    .string({ required_error: 'Reminder type is required.' })
    .min(1, 'Reminder type must not be empty.'),
  description: z.string().optional(),
  reminderDate: z.string().optional(),
  reminderTime: z.string().optional(),
});

/**
 * Schema for creating a new lead.
 */
export const createLeadSchema = z.object({
  fullName: z
    .string({ required_error: 'Full name is required.' })
    .min(1, 'Full name must not be empty.'),
  phoneNumber: z
    .string({ required_error: 'Phone number is required.' })
    .min(1, 'Phone number must not be empty.'),
  email: z
    .string({ required_error: 'Email is required.' })
    .email('Must be a valid email address.'),
  courseInterest: z
    .string({ required_error: 'Course interest is required.' })
    .min(1, 'Course interest must not be empty.'),
  source: z
    .string({ required_error: 'Source is required.' })
    .min(1, 'Source must not be empty.'),
  counselor: z
    .string({ required_error: 'Counselor is required.' })
    .min(1, 'Counselor must not be empty.'),
  notes: z.string().optional(),
  stage: z.string().optional(),
  activityLog: z.array(activityLogSchema).optional(),
  reminderLog: z.array(reminderSchema).optional(),
});

/** Inferred TypeScript types */
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type ActivityLogInput = z.infer<typeof activityLogSchema>;
export type ReminderInput = z.infer<typeof reminderSchema>;
