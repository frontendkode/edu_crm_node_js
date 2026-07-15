import { Op, fn, col } from 'sequelize';
import sequelize from '../config/database';
import AuditLog from '../models/AuditLog';
import Lead from '../models/Lead';
import Student from '../models/Student';
import Task from '../models/Task';
import DueDate from '../models/DueDate';

export interface AuditQueryOptions {
  userId?: string;
  targetType?: string;
  action?: string;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

const buildAuditWhere = (options: AuditQueryOptions): any => {
  const where: any = {};
  if (options.userId) {
    where.user_id = options.userId;
  }
  if (options.targetType) {
    where.target_type = options.targetType;
  }
  if (options.action) {
    where.action = { [Op.like]: `%${options.action}%` };
  }
  if (options.fromDate || options.toDate) {
    where.created_at = {};
    if (options.fromDate) {
      where.created_at[Op.gte] = new Date(options.fromDate);
    }
    if (options.toDate) {
      const to = new Date(options.toDate);
      to.setHours(23, 59, 59, 999);
      where.created_at[Op.lte] = to;
    }
  }
  return where;
};

const AUDIT_SORT_FIELDS = ['created_at', 'action', 'user_id', 'target_type'];

const getAuditOrder = (sortBy?: string, sortOrder?: 'ASC' | 'DESC') => {
  const field = sortBy && AUDIT_SORT_FIELDS.includes(sortBy) ? sortBy : 'created_at';
  const direction = sortOrder === 'ASC' ? 'ASC' : 'DESC';
  return [[field, direction]] as any;
};

export const findAuditLogs = async (options: AuditQueryOptions): Promise<{ rows: AuditLog[]; count: number }> => {
  return AuditLog.findAndCountAll({
    where: buildAuditWhere(options),
    order: getAuditOrder(options.sortBy, options.sortOrder),
    limit: options.limit,
    offset: options.offset,
  });
};

export const findAuditLogsForExport = async (options: AuditQueryOptions): Promise<AuditLog[]> => {
  return AuditLog.findAll({
    where: buildAuditWhere(options),
    order: getAuditOrder(options.sortBy, options.sortOrder),
  });
};

export const getReportSummary = async () => {
  const totalLeads = await Lead.count();
  const totalStudents = await Student.count();
  const totalTasks = await Task.count();
  const completedTasks = await Task.count({ where: { status: 'Completed' } });
  const openTasks = await Task.count({ where: { status: { [Op.not]: 'Completed' } } });

  const paidDueSum = await DueDate.sum('due_amt', {
    where: { status: 'Paid' },
  });

  const totalDueSum = await DueDate.sum('due_amt');

  const leadStageBreakdown = await Lead.findAll({
    attributes: ['stage', [fn('COUNT', col('stage')), 'count'] as any],
    group: ['stage'],
  });

  const courseBreakdown = await Student.findAll({
    attributes: ['course', [fn('COUNT', col('course')), 'count'] as any],
    group: ['course'],
  });

  return {
    totalLeads,
    totalStudents,
    totalTasks,
    completedTasks,
    openTasks,
    collectedRevenue: Number(paidDueSum || 0),
    outstandingDue: Number(totalDueSum || 0) - Number(paidDueSum || 0),
    leadStageBreakdown: leadStageBreakdown.map((row: any) => ({ stage: row.get('stage') || 'Unspecified', count: Number(row.get('count') || 0) })),
    studentCourseBreakdown: courseBreakdown.map((row: any) => ({ course: row.get('course') || 'Unspecified', count: Number(row.get('count') || 0) })),
  };
};
