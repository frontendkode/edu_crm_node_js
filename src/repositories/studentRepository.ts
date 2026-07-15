import { Op, Transaction } from 'sequelize';
import Attendance from '../models/Attendance';
import DueDate from '../models/DueDate';
import Student from '../models/Student';

export interface StudentQueryOptions {
  search?: string;
  course?: string;
  status?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export const findStudentById = async (id: string): Promise<Student | null> => {
  return Student.findByPk(id, {
    include: [
      { model: Attendance, as: 'attendance' },
      { model: DueDate, as: 'dueDay' },
    ],
    order: [
      [{ model: DueDate, as: 'dueDay' }, 'due_no', 'ASC'],
      [{ model: Attendance, as: 'attendance' }, 'date', 'ASC'],
    ],
  });
};

export const findStudentByEmail = async (email: string): Promise<Student | null> => {
  return Student.findOne({ where: { email } });
};

export const findAllStudents = async (options: StudentQueryOptions): Promise<{ rows: Student[]; count: number }> => {
  const where: any = {};

  if (options.search) {
    const searchTerm = `%${options.search}%`;
    where[Op.or] = [
      { full_name: { [Op.like]: searchTerm } },
      { email: { [Op.like]: searchTerm } },
      { phone_number: { [Op.like]: searchTerm } },
      { batch: { [Op.like]: searchTerm } },
      { course: { [Op.like]: searchTerm } },
      { status: { [Op.like]: searchTerm } },
    ];
  }

  if (options.course) {
    where.course = options.course;
  }

  if (options.status) {
    where.status = options.status;
  }

  const order = [[options.sortBy || 'created_at', options.sortOrder || 'DESC']] as any;

  return Student.findAndCountAll({
    where,
    include: [
      { model: Attendance, as: 'attendance' },
      { model: DueDate, as: 'dueDay' },
    ],
    order: [
      ...order,
      [{ model: DueDate, as: 'dueDay' }, 'due_no', 'ASC'],
      [{ model: Attendance, as: 'attendance' }, 'date', 'ASC'],
    ],
    limit: options.limit,
    offset: options.offset,
  });
};

export const createStudent = async (studentData: Partial<Student>, transaction?: Transaction): Promise<Student> => {
  return Student.create(studentData as any, { transaction });
};

export const updateStudent = async (
  id: string,
  updates: Partial<Student>,
  transaction?: Transaction
): Promise<[number, Student[]]> => {
  return Student.update(updates, {
    where: { id },
    returning: true,
    transaction,
  });
};

export const deleteStudent = async (id: string, transaction?: Transaction): Promise<number> => {
  return Student.destroy({ where: { id }, transaction });
};
