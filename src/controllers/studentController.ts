import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  createNewStudent,
  enrollStudent,
  getStudentById,
  getStudents,
  updateStudentAttendance,
  updateStudentPayment,
} from '../services/studentService';
import { createStudentSchema, enrollStudentSchema } from '../validators/studentValidator';

export const getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, course, status, page, limit, sortBy, sortOrder } = req.query as any;

    const result = await getStudents({
      search: typeof search === 'string' ? search : undefined,
      course: typeof course === 'string' ? course : undefined,
      status: typeof status === 'string' ? status : undefined,
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
    const student = await getStudentById(req.params.id);
    res.json({ responseObject: student });
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = createStudentSchema.parse(req.body);
    const student = await createNewStudent(input, req.user?.id);
    res.status(201).json({ responseObject: student, responseMessage: 'Student created successfully.' });
  } catch (error) {
    next(error);
  }
};

export const enroll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = enrollStudentSchema.parse(req.body);
    const student = await enrollStudent(input, req.user?.id);
    const responseMessage = 'Student enrollment saved successfully.';
    res.json({
      responseObject: {
        ...student,
        responseMessage,
      },
      responseMessage,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const querySchema = z.object({
      dueDayId: z.string().min(1, 'Due day id is required.'),
      status: z.string().min(1, 'Status is required.'),
      studentId: z.string().min(1, 'Student id is required.'),
      paymentType: z.string().optional(),
      paymentDateAndTime: z.string().optional(),
    });

    const { dueDayId, status, studentId, paymentType, paymentDateAndTime } = querySchema.parse(req.query);
    const updatedRecord = await updateStudentPayment(dueDayId, status, studentId, paymentType, paymentDateAndTime, req.user?.id);

    res.json({ responseObject: updatedRecord, responseMessage: 'Student payment details updated successfully.' });
  } catch (error) {
    next(error);
  }
};

export const updateAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const querySchema = z.object({
      attendanceId: z.string().min(1, 'Attendance id is required.'),
      status: z.string().min(1, 'Attendance status is required.'),
    });

    const { attendanceId, status } = querySchema.parse(req.query);
    const updatedRecord = await updateStudentAttendance(attendanceId, status, req.user?.id);
    res.json({ responseObject: updatedRecord, responseMessage: 'Student attendance updated successfully.' });
  } catch (error) {
    next(error);
  }
};
