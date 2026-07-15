import DueDate from '../models/DueDate';
import Lead from '../models/Lead';
import ReminderLog from '../models/ReminderLog';
import Student from '../models/Student';
import Attendance from '../models/Attendance';
import Task from '../models/Task';

export type LeadWithReminders = Lead & {
  reminderLog?: ReminderLog[];
};

export type StudentWithRelations = Student & {
  attendance?: Attendance[];
  dueDay?: DueDate[];
};

export const findAllDashboardLeads = async (): Promise<LeadWithReminders[]> => {
  return Lead.findAll({
    include: [
      {
        model: ReminderLog,
        as: 'reminderLog',
      },
    ],
    order: [
      ['created_at', 'DESC'],
      [{ model: ReminderLog, as: 'reminderLog' }, 'reminder_date', 'ASC'],
    ],
  });
};

export const findAllDashboardStudents = async (): Promise<StudentWithRelations[]> => {
  return Student.findAll({
    include: [
      {
        model: Attendance,
        as: 'attendance',
      },
      {
        model: DueDate,
        as: 'dueDay',
      },
    ],
    order: [
      ['created_at', 'DESC'],
      [{ model: DueDate, as: 'dueDay' }, 'due_no', 'ASC'],
      [{ model: Attendance, as: 'attendance' }, 'date', 'ASC'],
    ],
  });
};

export const findAllDashboardTasks = async (): Promise<Task[]> => {
  return Task.findAll({
    order: [['due_date', 'ASC']],
  });
};

export const findReminderLeads = async (): Promise<LeadWithReminders[]> => {
  return Lead.findAll({
    include: [
      {
        model: ReminderLog,
        as: 'reminderLog',
      },
    ],
  });
};

export const findAttendanceStudents = async (): Promise<StudentWithRelations[]> => {
  return Student.findAll({
    include: [
      {
        model: Attendance,
        as: 'attendance',
      },
    ],
  });
};

export const findDueDayStudents = async (): Promise<StudentWithRelations[]> => {
  return Student.findAll({
    include: [
      {
        model: DueDate,
        as: 'dueDay',
      },
    ],
  });
};
