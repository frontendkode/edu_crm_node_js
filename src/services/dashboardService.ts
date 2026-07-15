import { logAuditEvent } from './auditService';
import { LeadWithReminders, StudentWithRelations } from '../repositories/dashboardRepository';
import {
  findAllDashboardLeads,
  findAllDashboardStudents,
  findAllDashboardTasks,
  findReminderLeads,
  findAttendanceStudents,
  findDueDayStudents,
} from '../repositories/dashboardRepository';
import Attendance from '../models/Attendance';
import DueDate from '../models/DueDate';
import ReminderLog from '../models/ReminderLog';
import Task from '../models/Task';

const parseDateValue = (value: string | null | undefined): Date | null => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
};

const startOfDay = (date: Date): Date => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const endOfDay = (date: Date): Date => {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const toNumber = (value: string | null | undefined): number => {
  if (!value) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const getDashboardData = async () => {
  const [leads, students, tasks]: [LeadWithReminders[], StudentWithRelations[], Task[]] = await Promise.all([
    findAllDashboardLeads(),
    findAllDashboardStudents(),
    findAllDashboardTasks(),
  ]);

  const leadDashBoardDTOS = leads.map((lead) => ({
    id: lead.id,
    fullName: lead.full_name,
    stage: lead.stage ?? 'New',
    counselor: lead.counselor,
    courseInterest: lead.course_interest,
    source: lead.source,
    phoneNumber: lead.phone_number,
    email: lead.email,
    createdAt: lead.created_at?.toString() ?? null,
    noteCount: lead.reminderLog?.length ?? 0,
    stageUpdatedAt: lead.created_at?.toString() ?? null,
  }));

  const studentDashBoardDTOS = students.map((student) => ({
    id: student.id,
    fullName: student.full_name,
    course: student.course,
    status: student.status,
    batch: student.batch,
    studentId: student.student_id,
    totalFee: student.total_fee,
    balanceFee: student.balance_fee,
    dueDay: Array.isArray(student.dueDay)
      ? student.dueDay.map((due) => ({
          id: due.id,
          dueNo: due.due_no,
          dueAmt: due.due_amt,
          dueDate: due.due_date,
          paymentType: due.payment_type,
          paymentDateAndTime: due.payment_date,
          status: due.status,
        }))
      : [],
    attendance: Array.isArray(student.attendance)
      ? student.attendance.map((attendance) => ({
          id: attendance.id,
          attend: attendance.attend,
          date: attendance.date,
          day: attendance.day,
        }))
      : [],
  }));

  const allDueDays = students.flatMap((student) => Array.isArray(student.dueDay) ? student.dueDay : []);

  const collectionAmount = allDueDays
    .filter((due) => (due.status || '').toLowerCase() === 'paid')
    .reduce((sum, due) => sum + toNumber(due.due_amt), 0);

  const totalDueAmount = allDueDays
    .filter((due) => (due.status || '').toLowerCase() !== 'paid')
    .reduce((sum, due) => sum + toNumber(due.due_amt), 0);

  const today = new Date();
  const weeklyCutoff = endOfDay(addDays(today, 7));
  const overdueTasks = tasks.filter((task) => {
    const dueDate = parseDateValue(task.due_date);
    return dueDate !== null && dueDate.getTime() < startOfDay(today).getTime() && (task.status || '').toLowerCase() !== 'completed';
  }).length;

  const dueSoonTasks = tasks.filter((task) => {
    const dueDate = parseDateValue(task.due_date);
    return dueDate !== null && dueDate.getTime() >= startOfDay(today).getTime() && dueDate.getTime() <= weeklyCutoff.getTime() && (task.status || '').toLowerCase() !== 'completed';
  }).length;

  await logAuditEvent({
    userId: undefined,
    targetType: 'dashboard',
    action: 'view_dashboard',
    details: 'Dashboard data retrieved',
  });

  return {
    leadDashBoardDTOS,
    studentDashBoardDTOS,
    feeCollection: {
      collectionAmount,
      totalDueAmount,
    },
    taskSummary: {
      totalTasks: tasks.length,
      overdueTasks,
      dueSoonTasks,
    },
  };
};

export const getDashboardNotifications = async () => {
  const [tasks, leads, attendanceStudents, dueDayStudents]: [
    Task[],
    LeadWithReminders[],
    StudentWithRelations[],
    StudentWithRelations[]
  ] = await Promise.all([
    findAllDashboardTasks(),
    findReminderLeads(),
    findAttendanceStudents(),
    findDueDayStudents(),
  ]);

  const today = startOfDay(new Date());
  const upcomingWindow = endOfDay(addDays(today, 7));

  const taskNotifications = tasks
    .filter((task) => {
      const dueDate = parseDateValue(task.due_date);
      return (
        dueDate !== null &&
        dueDate.getTime() <= upcomingWindow.getTime() &&
        (task.status || '').toLowerCase() !== 'completed'
      );
    })
    .slice(0, 8)
    .map((task) => ({
      id: task.id,
      taskTitle: task.task_title,
      dueDate: task.due_date,
      staffName: task.staff_name,
      priority: task.priority,
      status: task.status,
    }));

  const leadNotifications = leads
    .map((lead) => ({
      id: lead.id,
      fullName: lead.full_name,
      reminderLogs: Array.isArray(lead.reminderLog)
        ? lead.reminderLog
            .filter((reminder: ReminderLog) => {
              const reminderDate = parseDateValue(reminder.reminder_date);
              return (
                reminderDate !== null &&
                reminderDate.getTime() >= today.getTime() &&
                reminderDate.getTime() <= upcomingWindow.getTime()
              );
            })
            .map((reminder: ReminderLog) => ({
              id: reminder.id,
              description: reminder.description,
              type: reminder.type,
              reminderDate: reminder.reminder_date,
              reminderTime: reminder.reminder_time,
            }))
        : [],
    }))
    .filter((lead) => lead.reminderLogs.length > 0)
    .slice(0, 6);

  const studentAttendanceNotifications = attendanceStudents
    .map((student) => ({
      id: student.id,
      fullName: student.full_name,
      attendance: Array.isArray(student.attendance)
        ? student.attendance
            .filter((attendance: Attendance) => {
              const attendanceDate = parseDateValue(attendance.date);
              return (
                attendanceDate !== null &&
                attendanceDate.getTime() >= today.getTime() &&
                attendanceDate.getTime() <= upcomingWindow.getTime()
              );
            })
            .map((attendance: Attendance) => ({
              id: attendance.id,
              date: attendance.date,
              day: attendance.day,
              attend: attendance.attend,
            }))
        : [],
    }))
    .filter((student) => student.attendance.length > 0)
    .slice(0, 6);

  const studentDueDayNotifications = dueDayStudents
    .map((student) => ({
      id: student.id,
      fullName: student.full_name,
      dueDays: Array.isArray(student.dueDay)
        ? student.dueDay
            .filter((due: DueDate) => {
              const dueDate = parseDateValue(due.due_date);
              return (
                dueDate !== null &&
                dueDate.getTime() <= upcomingWindow.getTime() &&
                (due.status || '').toLowerCase() !== 'paid'
              );
            })
            .map((due: DueDate) => ({
              id: due.id,
              dueNo: due.due_no,
              dueAmt: due.due_amt,
              dueDate: due.due_date,
              status: due.status,
            }))
        : [],
    }))
    .filter((student) => student.dueDays.length > 0)
    .slice(0, 6);

  await logAuditEvent({
    userId: undefined,
    targetType: 'dashboard',
    action: 'view_notifications',
    details: 'Dashboard notifications retrieved',
  });

  return {
    task: taskNotifications,
    lead: leadNotifications,
    studentAttendance: studentAttendanceNotifications,
    studentDueDays: studentDueDayNotifications,
  };
};
