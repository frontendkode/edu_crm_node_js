import DueDate from '../models/DueDate';
import Lead from '../models/Lead';
import ReminderLog from '../models/ReminderLog';
import Student from '../models/Student';
import Attendance from '../models/Attendance';
import Task from '../models/Task';
import { Op } from 'sequelize';
import dayjs from 'dayjs';

const today = dayjs().format('YYYY-MM-DD');
const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');

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

export const findTodayPendingTasks = async (): Promise<Task[]> => {
  return Task.findAll({
    where: {
      due_date: today,
      status: {
        [Op.ne]: 'Submitted',
      },
    },
    order: [['priority', 'DESC']],
  });
};

export const findTodayTomorrowReminderLeads = async (): Promise<LeadWithReminders[]> => {
  return Lead.findAll({
    include: [
      {
        model: ReminderLog,
        as: 'reminderLog',
        required: true,
        where: {
          reminder_date: {
            [Op.between]: [today, tomorrow],
          },
        },
      },
    ],
    order: [
      [{ model: ReminderLog, as: 'reminderLog' }, 'reminder_date', 'ASC'],
      [{ model: ReminderLog, as: 'reminderLog' }, 'reminder_time', 'ASC'],
    ],
  });
};

export const findTodayAttendanceStudents = async (): Promise<StudentWithRelations[]> => {
  return Student.findAll({
    include: [
      {
        model: Attendance,
        as: 'attendance',
        required: true,
        where: {
          date: today,
        },
      },
    ],
    order: [
      [{ model: Attendance, as: 'attendance' }, 'date', 'ASC'],
    ],
  });
};

export const findPendingDueStudents = async (): Promise<StudentWithRelations[]> => {
  return Student.findAll({
    include: [
      {
        model: DueDate,
        as: 'dueDay',
        required: true,
        where: {
          due_date: {
            [Op.lte]: today,
          },
          status: {
            [Op.ne]: 'Paid',
          },
        },
      },
    ],
    order: [
      [{ model: DueDate, as: 'dueDay' }, 'due_date', 'ASC'],
    ],
  });
};