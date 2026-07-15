import { Transaction } from 'sequelize';
import DueDate from '../models/DueDate';

export const findDueDateById = async (id: string): Promise<DueDate | null> => {
  return DueDate.findByPk(id);
};

export const createDueDate = async (dueDateData: Partial<DueDate>, transaction?: Transaction): Promise<DueDate> => {
  return DueDate.create(dueDateData as any, { transaction });
};

export const createDueDateBatch = async (
  dueDateItems: Partial<DueDate>[],
  transaction?: Transaction
): Promise<DueDate[]> => {
  return DueDate.bulkCreate(dueDateItems as any[], { transaction });
};

export const updateDueDate = async (
  id: string,
  updates: Partial<DueDate>,
  transaction?: Transaction
): Promise<[number, DueDate[]]> => {
  return DueDate.update(updates, {
    where: { id },
    returning: true,
    transaction,
  });
};

export const deleteDueDatesForStudent = async (
  studentId: string,
  transaction?: Transaction
): Promise<number> => {
  return DueDate.destroy({ where: { student_management_id: studentId }, transaction });
};

export const findDueDatesByStudentId = async (studentId: string): Promise<DueDate[]> => {
  return DueDate.findAll({ where: { student_management_id: studentId } });
};
