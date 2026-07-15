import { randomUUID } from 'crypto';
import sequelize from '../config/database';
import { AppError } from '../utils/appError';
import { logAuditEvent } from './auditService';
import {
  createAttendance,
  createAttendanceBatch,
  deleteAttendanceForStudent,
  findAttendanceById,
  updateAttendance,
} from '../repositories/attendanceRepository';
import {
  createDueDate,
  createDueDateBatch,
  deleteDueDatesForStudent,
  findDueDateById,
  findDueDatesByStudentId,
  updateDueDate,
} from '../repositories/dueDateRepository';
import {
  createStudent,
  findAllStudents,
  findStudentByEmail,
  findStudentById,
  updateStudent,
} from '../repositories/studentRepository';
import { CreateStudentInput, EnrollStudentInput } from '../validators/studentValidator';

const safeNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const normalizeStringValue = (value: unknown, defaultValue = ''): string => {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value).trim();
  return defaultValue;
};

const normalizeOptionalString = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    const normalized = String(value).trim();
    return normalized.length > 0 ? normalized : null;
  }
  return null;
};

const toCamelCaseAttendance = (record: any) => ({
  id: record.id,
  attend: record.attend,
  createAt: record.create_at,
  date: record.date,
  day: record.day,
  studentId: record.student_management_id,
});

const toCamelCaseDueDay = (record: any) => ({
  id: record.id,
  dueNo: record.due_no,
  dueAmt: record.due_amt,
  dueDate: record.due_date,
  status: record.status,
  paymentType: record.payment_type,
  paymentDateAndTime: record.payment_date,
  createAt: record.create_at,
  studentId: record.student_management_id,
});

const toCamelCaseStudent = (student: any) => {
  const data = student.toJSON ? student.toJSON() : student;

  return {
    id: data.id,
    balanceFee: data.balance_fee,
    batch: data.batch,
    classCount: data.class_count,
    classEndDate: data.class_end_date,
    classStartDate: data.class_start_date,
    course: data.course,
    createdAt: data.created_at,
    createdBy: data.created_by,
    email: data.email,
    emiEnabled: data.emi_enabled,
    endTime: data.end_time,
    fullName: data.full_name,
    initialAmt: data.initial_amt,
    phoneNumber: data.phone_number,
    shift: data.shift,
    split: data.split,
    startTime: data.start_time,
    status: data.status,
    studentID: data.student_id,
    totalFee: data.total_fee,
    userId: data.user_id,
    dueDay: Array.isArray(data.dueDay) ? data.dueDay.map(toCamelCaseDueDay) : [],
    attendance: Array.isArray(data.attendance) ? data.attendance.map(toCamelCaseAttendance) : [],
  };
};

const calculateBalance = (totalFee: unknown, initialAmt: unknown, dueDays: any[] = []) => {
  const total = safeNumber(totalFee);
  const initial = safeNumber(initialAmt);
  const paidDue = dueDays
    .filter((entry) => entry.status === 'Paid')
    .reduce((sum, entry) => sum + safeNumber(entry.dueAmt), 0);

  return String(Math.max(total - initial - paidDue, 0));
};

export const getStudents = async (options?: {
  search?: string;
  course?: string;
  status?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}) => {
  const studentsPage = await findAllStudents({
    search: options?.search,
    course: options?.course,
    status: options?.status,
    limit: options?.limit,
    offset: options?.offset,
    sortBy: options?.sortBy,
    sortOrder: options?.sortOrder,
  });

  return {
    total: studentsPage.count,
    items: studentsPage.rows.map((student) => toCamelCaseStudent(student)),
  };
};

export const createNewStudent = async (input: CreateStudentInput, actorId?: string) => {
  const normalizedEmail = input.email.trim().toLowerCase();
  const existingStudent = await findStudentByEmail(normalizedEmail);

  if (existingStudent) {
    throw new AppError('A student with that email already exists.', 409);
  }

  const studentId = randomUUID();
  const student = await createStudent({
    id: studentId,
    balance_fee: normalizeStringValue(input.balanceFee, '0'),
    batch: normalizeOptionalString(input.batch),
    class_count: normalizeOptionalString(input.classCount),
    class_end_date: normalizeOptionalString(input.classEndDate),
    class_start_date: normalizeOptionalString(input.classStartDate),
    course: normalizeOptionalString(input.course),
    created_at: new Date().toISOString(),
    created_by: actorId || null,
    email: normalizedEmail,
    emi_enabled: normalizeStringValue(input.emiEnabled, 'false'),
    end_time: normalizeOptionalString(input.endTime),
    full_name: input.fullName.trim(),
    initial_amt: normalizeStringValue(input.initialAmt, '0'),
    phone_number: input.phoneNumber.trim(),
    shift: normalizeOptionalString(input.shift),
    split: normalizeOptionalString(input.split),
    start_time: normalizeOptionalString(input.startTime),
    status: normalizeStringValue(input.status, 'Inactive') || 'Inactive',
    student_id: normalizeOptionalString(input.studentId) ?? normalizeOptionalString(input.studentID),
    total_fee: normalizeStringValue(input.totalFee, '0'),
    user_id: normalizeOptionalString(input.userId),
  });

  await logAuditEvent({
    userId: actorId,
    targetType: 'student',
    targetId: studentId,
    action: 'create_student',
    details: `Created student ${input.fullName}`,
  });

  return toCamelCaseStudent(student.toJSON ? student.toJSON() : student);
};

export const enrollStudent = async (input: EnrollStudentInput, actorId?: string) => {
  const normalizedEmail = input.email.trim().toLowerCase();
  const transaction = await sequelize.transaction();

  try {
    let student = null;

    if (input.id) {
      student = await findStudentById(input.id);
      if (!student) {
        throw new AppError('Student not found.', 404);
      }
    }

    if (!student) {
      const existingStudent = await findStudentByEmail(normalizedEmail);
      if (existingStudent) {
        student = existingStudent;
      }
    }

    const studentData: any = {
      balance_fee: normalizeStringValue(input.balanceFee, '0'),
      batch: normalizeOptionalString(input.batch),
      class_count: normalizeOptionalString(input.classCount),
      class_end_date: normalizeOptionalString(input.classEndDate),
      class_start_date: normalizeOptionalString(input.classStartDate),
      course: normalizeOptionalString(input.course),
      created_by: actorId || null,
      email: normalizedEmail,
      emi_enabled: normalizeStringValue(input.emiEnabled, 'false'),
      end_time: normalizeOptionalString(input.endTime),
      full_name: input.fullName.trim(),
      initial_amt: normalizeStringValue(input.initialAmt, '0'),
      phone_number: input.phoneNumber.trim(),
      shift: normalizeOptionalString(input.shift),
      split: normalizeOptionalString(input.split),
      start_time: normalizeOptionalString(input.startTime),
      status: normalizeStringValue(input.status, 'Active') || 'Active',
      student_id: normalizeOptionalString(input.studentId) ?? normalizeOptionalString(input.studentID),
      total_fee: normalizeStringValue(input.totalFee, '0'),
      user_id: normalizeOptionalString(input.userId),
    };

    if (student) {
      studentData.updated_at = new Date().toISOString();
      await updateStudent(student.id, studentData, transaction);
    } else {
      student = await createStudent({
        id: randomUUID(),
        created_at: new Date().toISOString(),
        ...studentData,
      }, transaction);
    }

    const studentId = student.id;

    await deleteAttendanceForStudent(studentId, transaction);
    await deleteDueDatesForStudent(studentId, transaction);

    const attendanceItems = (input.attendance || []).map((item) => ({
      id: item.id || randomUUID(),
      attend: normalizeStringValue(item.attend ?? item.status, 'none'),
      create_at: new Date().toISOString(),
      date: item.date,
      day: item.day,
      student_management_id: studentId,
    }));

    const dueDayItems = (input.dueDay || []).map((item) => ({
      id: item.id || randomUUID(),
      create_at: new Date().toISOString(),
      due_amt: normalizeStringValue(item.dueAmt, '0'),
      due_date: item.dueDate,
      due_no: normalizeOptionalString(item.dueNo),
      payment_date: normalizeOptionalString(item.paymentDateAndTime),
      payment_type: normalizeOptionalString(item.paymentType),
      status: normalizeStringValue(item.status, 'Not Paid') || 'Not Paid',
      student_management_id: studentId,
    }));

    if (attendanceItems.length > 0) {
      await createAttendanceBatch(attendanceItems, transaction);
    }

    if (dueDayItems.length > 0) {
      await createDueDateBatch(dueDayItems, transaction);
    }

    const recalculatedBalance = calculateBalance(studentData.total_fee, studentData.initial_amt, dueDayItems);
    await updateStudent(studentId, { balance_fee: recalculatedBalance }, transaction);

    await logAuditEvent({
      userId: actorId,
      targetType: 'student',
      targetId: studentId,
      action: 'enroll_student',
      details: `Enrolled or updated student ${input.fullName}`,
    });

    await transaction.commit();

    const updatedStudent = await findStudentById(studentId);
    if (!updatedStudent) {
      throw new AppError('Failed to load enrolled student.', 500);
    }

    return toCamelCaseStudent(updatedStudent);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getStudentById = async (id: string) => {
  const student = await findStudentById(id);
  if (!student) {
    throw new AppError('Student not found.', 404);
  }
  return toCamelCaseStudent(student);
};

export const updateStudentPayment = async (
  dueDayId: string,
  status: string,
  studentId: string,
  paymentType?: string,
  paymentDateAndTime?: string,
  actorId?: string
) => {
  const dueDate = await findDueDateById(dueDayId);
  if (!dueDate) {
    throw new AppError('Due date record not found.', 404);
  }

  if (dueDate.student_management_id !== studentId) {
    throw new AppError('Payment record does not belong to the specified student.', 400);
  }

  const student = await findStudentById(studentId);
  if (!student) {
    throw new AppError('Student not found.', 404);
  }

  const [count] = await updateDueDate(dueDayId, {
    status: status.trim(),
    payment_type: paymentType?.trim() ?? dueDate.payment_type,
    payment_date: paymentDateAndTime?.trim() ?? dueDate.payment_date,
  });

  if (count === 0) {
    throw new AppError('Failed to update payment details.', 500);
  }

  const allDueDays = await findDueDatesByStudentId(studentId);
  const updatedBalance = calculateBalance(student.total_fee, student.initial_amt, allDueDays.map((dd) => ({
    dueAmt: dd.due_amt,
    status: dd.status,
  })));

  await updateStudent(studentId, { balance_fee: updatedBalance });

  await logAuditEvent({
    userId: actorId,
    targetType: 'student',
    targetId: studentId,
    action: 'update_student_payment',
    details: `Updated payment status for due date ${dueDayId} to ${status}`,
  });

  const updatedDue = await findDueDateById(dueDayId);
  if (!updatedDue) {
    throw new AppError('Failed to load updated due date record.', 500);
  }

  return toCamelCaseDueDay(updatedDue);
};

export const updateStudentAttendance = async (attendanceId: string, status: string, actorId?: string) => {
  const attendance = await findAttendanceById(attendanceId);
  if (!attendance) {
    throw new AppError('Attendance record not found.', 404);
  }

  const [count] = await updateAttendance(attendanceId, {
    attend: status.trim(),
  });

  if (count === 0) {
    throw new AppError('Failed to update attendance record.', 500);
  }

  await logAuditEvent({
    userId: actorId,
    targetType: 'student',
    targetId: attendance.student_management_id || undefined,
    action: 'update_student_attendance',
    details: `Updated attendance ${attendanceId} to ${status}`,
  });

  const updatedAttendance = await findAttendanceById(attendanceId);
  if (!updatedAttendance) {
    throw new AppError('Failed to load updated attendance record.', 500);
  }

  return toCamelCaseAttendance(updatedAttendance);
};
