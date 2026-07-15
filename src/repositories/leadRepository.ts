import { Op, Transaction } from 'sequelize';
import ActivityLog from '../models/ActivityLog';
import Lead from '../models/Lead';
import ReminderLog from '../models/ReminderLog';

export interface LeadQueryOptions {
  search?: string;
  stage?: string;
  counselor?: string;
  courseInterest?: string;
  source?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

const leadIncludes = [
  {
    model: ActivityLog,
    as: 'activityLog',
  },
  {
    model: ReminderLog,
    as: 'reminderLog',
  },
];

export const findLeadById = async (id: string): Promise<Lead | null> => {
  return Lead.findByPk(id, {
    include: leadIncludes,
    order: [
      [{ model: ActivityLog, as: 'activityLog' }, 'created_at', 'ASC'],
      [{ model: ReminderLog, as: 'reminderLog' }, 'reminder_date', 'ASC'],
    ],
  });
};

export const findLeadByEmail = async (email: string): Promise<Lead | null> => {
  return Lead.findOne({ where: { email } });
};

export const findAllLeads = async (options: LeadQueryOptions): Promise<Lead[]> => {
  const where: any = {};

  if (options.search) {
    const searchTerm = `%${options.search}%`;
    where[Op.or] = [
      { full_name: { [Op.like]: searchTerm } },
      { email: { [Op.like]: searchTerm } },
      { phone_number: { [Op.like]: searchTerm } },
      { course_interest: { [Op.like]: searchTerm } },
      { source: { [Op.like]: searchTerm } },
      { counselor: { [Op.like]: searchTerm } },
    ];
  }

  if (options.stage) {
    where.stage = options.stage;
  }

  if (options.counselor) {
    where.counselor = options.counselor;
  }

  if (options.courseInterest) {
    where.course_interest = options.courseInterest;
  }

  if (options.source) {
    where.source = options.source;
  }

  const order = [[options.sortBy || 'created_at', options.sortOrder || 'DESC']] as any;

  return Lead.findAll({
    where,
    include: leadIncludes,
    order: [
      ...order,
      [{ model: ActivityLog, as: 'activityLog' }, 'created_at', 'ASC'],
      [{ model: ReminderLog, as: 'reminderLog' }, 'reminder_date', 'ASC'],
    ],
    limit: options.limit,
    offset: options.offset,
  });
};

export const createLead = async (leadData: Partial<Lead>, transaction?: Transaction): Promise<Lead> => {
  return Lead.create(leadData as any, { transaction });
};

export const updateLead = async (
  id: string,
  updates: Partial<Lead>,
  transaction?: Transaction
): Promise<[number, Lead[]]> => {
  return Lead.update(updates, {
    where: { id },
    returning: true,
    transaction,
  });
};

export const createActivityLog = async (
  activityData: Partial<ActivityLog>,
  transaction?: Transaction
): Promise<ActivityLog> => {
  return ActivityLog.create(activityData as any, { transaction });
};

export const createReminderLog = async (
  reminderData: Partial<ReminderLog>,
  transaction?: Transaction
): Promise<ReminderLog> => {
  return ReminderLog.create(reminderData as any, { transaction });
};
