import { Transaction } from 'sequelize';
import Attendance from '../models/Attendance';

export const findAttendanceById = async (id: string): Promise<Attendance | null> => {
  return Attendance.findByPk(id);
};

export const createAttendance = async (attendanceData: Partial<Attendance>, transaction?: Transaction): Promise<Attendance> => {
  return Attendance.create(attendanceData as any, { transaction });
};

export const createAttendanceBatch = async (
  attendanceItems: Partial<Attendance>[],
  transaction?: Transaction
): Promise<Attendance[]> => {
  return Attendance.bulkCreate(attendanceItems as any[], { transaction });
};

export const updateAttendance = async (
  id: string,
  updates: Partial<Attendance>,
  transaction?: Transaction
): Promise<[number, Attendance[]]> => {
  return Attendance.update(updates, {
    where: { id },
    returning: true,
    transaction,
  });
};

export const deleteAttendanceForStudent = async (
  studentId: string,
  transaction?: Transaction
): Promise<number> => {
  return Attendance.destroy({ where: { student_management_id: studentId }, transaction });
};
