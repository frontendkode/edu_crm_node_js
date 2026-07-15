import { z } from 'zod';

const numericString = z.union([z.string(), z.number()]);
const booleanString = z.union([z.string(), z.boolean()]);

/**
 * Schema for creating a new student record.
 * Required: fullName, email, phoneNumber.
 * All other fields are optional and stored as strings in the DB.
 */
export const createStudentSchema = z.object({
  fullName: z
    .string({ required_error: 'Full name is required.' })
    .min(1, 'Full name must not be empty.'),
  email: z
    .string({ required_error: 'Email is required.' })
    .email('Must be a valid email address.'),
  phoneNumber: z
    .string({ required_error: 'Phone number is required.' })
    .min(1, 'Phone number must not be empty.'),
  batch: z.string().optional(),
  classCount: numericString.optional(),
  classStartDate: z.string().optional(),
  classEndDate: z.string().optional(),
  course: z.string().optional(),
  shift: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  totalFee: numericString.optional(),
  initialAmt: numericString.optional(),
  balanceFee: numericString.optional(),
  emiEnabled: booleanString.optional(),
  split: numericString.optional(),
  status: z.string().optional(),
  studentId: z.string().optional(),
  studentID: z.string().optional(),
  userId: z.string().optional(),
});

/**
 * Individual attendance entry (e.g. per-class record).
 */
const attendanceEntrySchema = z
  .object({
    id: z.string().optional(),
    date: z.string({ required_error: 'Attendance date is required.' }),
    status: z.string().optional(),
    attend: z.string().optional(),
    day: z.string().optional(),
    classNo: z.string().optional(),
  })
  .refine(
    (data) => {
      const statusValue = typeof data.status === 'string' ? data.status.trim() : '';
      const attendValue = typeof data.attend === 'string' ? data.attend.trim() : '';
      return statusValue.length > 0 || attendValue.length > 0;
    },
    {
      message: 'Attendance status or attend is required.',
      path: ['status'],
    }
  );

/**
 * Individual due-day / payment-schedule entry.
 */
const dueDayEntrySchema = z.object({
  id: z.string().optional(),
  dueNo: numericString.optional(),
  dueDate: z.string({ required_error: 'Due date is required.' }),
  dueAmt: numericString.optional(),
  status: z.string().optional(),
  paymentType: z.string().optional(),
  paymentDateAndTime: z.string().optional(),
});

/**
 * Schema for enrolling a student – includes the full student data
 * plus attendance and payment-schedule arrays.
 */
export const enrollStudentSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(1, 'Full name must not be empty.'),
  email: z.string().email('Must be a valid email address.'),
  phoneNumber: z.string().min(1, 'Phone number must not be empty.'),
  batch: z.string().optional(),
  classCount: numericString.optional(),
  classStartDate: z.string().optional(),
  classEndDate: z.string().optional(),
  course: z.string().optional(),
  shift: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  totalFee: numericString.optional(),
  initialAmt: numericString.optional(),
  balanceFee: numericString.optional(),
  emiEnabled: booleanString.optional(),
  split: numericString.optional(),
  status: z.string().optional(),
  studentId: z.string().optional(),
  studentID: z.string().optional(),
  userId: z.string().optional(),
  attendance: z.array(attendanceEntrySchema).optional(),
  dueDay: z.array(dueDayEntrySchema).optional(),
});

export const updateStudentPaymentSchema = z.object({
  dueDayId: z.string().min(1, 'Due day id is required.'),
  status: z.string().min(1, 'Status is required.'),
  studentId: z.string().min(1, 'Student id is required.'),
  paymentType: z.string().optional(),
  paymentDateAndTime: z.string().optional(),
});

export const updateStudentAttendanceSchema = z.object({
  attendanceId: z.string().min(1, 'Attendance id is required.'),
  status: z.string().min(1, 'Attendance status is required.'),
});

/** Inferred TypeScript types */
export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type EnrollStudentInput = z.infer<typeof enrollStudentSchema>;
