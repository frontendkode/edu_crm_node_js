import { randomUUID } from 'crypto';
import sequelize from '../config/database';
import { AppError } from '../utils/appError';
import { logAuditEvent } from './auditService';
import {
  createActivityLog,
  createLead,
  createReminderLog,
  findLeadByEmail,
  findLeadById,
  findAllLeads,
  updateLead,
} from '../repositories/leadRepository';
import { ActivityLogInput, CreateLeadInput, ReminderInput } from '../validators/leadValidator';

const toCamelCaseLead = (lead: any) => {
  const activityLog = Array.isArray(lead.activityLog)
    ? lead.activityLog.map((activity: any) => ({
        id: activity.id,
        type: activity.type,
        description: activity.description,
        logResult: activity.log_result,
        leadId: activity.lead_id,
        createdAt: activity.created_at,
      }))
    : [];

  const reminderLog = Array.isArray(lead.reminderLog)
    ? lead.reminderLog.map((reminder: any) => ({
        id: reminder.id,
        type: reminder.type,
        description: reminder.description,
        reminderDate: reminder.reminder_date,
        reminderTime: reminder.reminder_time,
        leadId: reminder.lead_id,
        createdAt: reminder.created_at,
      }))
    : [];

  return {
    id: lead.id,
    counselor: lead.counselor,
    courseInterest: lead.course_interest,
    createdAt: lead.created_at,
    createdBy: lead.created_by,
    email: lead.email,
    fullName: lead.full_name,
    notes: lead.notes,
    phoneNumber: lead.phone_number,
    source: lead.source,
    stage: lead.stage,
    activityLog,
    reminderLog,
  };
};

export const getAllLeads = async (options?: {
  search?: string;
  stage?: string;
  counselor?: string;
  courseInterest?: string;
  source?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}) => {
  const leads = await findAllLeads({
    search: options?.search,
    stage: options?.stage,
    counselor: options?.counselor,
    courseInterest: options?.courseInterest,
    source: options?.source,
    limit: options?.limit,
    offset: options?.offset,
    sortBy: options?.sortBy,
    sortOrder: options?.sortOrder,
  });

  return leads.map((lead) => toCamelCaseLead(lead.toJSON ? lead.toJSON() : lead));
};

export const createNewLead = async (
  input: CreateLeadInput,
  actorId?: string,
  activityLogEntries: ActivityLogInput[] = [],
  reminderEntries: ReminderInput[] = []
) => {
  const normalizedEmail = input.email.trim().toLowerCase();
  const existingLead = await findLeadByEmail(normalizedEmail);
  if (existingLead) {
    throw new AppError('A lead with that email already exists.', 409);
  }

  const reminderLogItems = Array.isArray(reminderEntries) ? reminderEntries : [];
  const activityLogItems = Array.isArray(activityLogEntries) ? activityLogEntries : [];

  const leadId = randomUUID();
  const transaction = await sequelize.transaction();

  try {
    await createLead(
      {
        id: leadId,
        full_name: input.fullName.trim(),
        phone_number: input.phoneNumber.trim(),
        email: normalizedEmail,
        course_interest: input.courseInterest.trim(),
        source: input.source.trim(),
        counselor: input.counselor.trim(),
        notes: input.notes?.trim() ?? null,
        stage: input.stage?.trim() || 'Need to connect',
        created_at: new Date().toISOString(),
        created_by: actorId || null,
      },
      transaction
    );

    for (const activity of activityLogItems) {
      await createActivityLog(
        {
          id: randomUUID(),
          type: activity.type,
          description: activity.description ?? null,
          log_result: activity.logResult ?? null,
          lead_id: leadId,
          created_at: new Date().toISOString(),
        },
        transaction
      );
    }

    for (const reminder of reminderLogItems) {
      await createReminderLog(
        {
          id: randomUUID(),
          type: reminder.type,
          description: reminder.description ?? null,
          reminder_date: reminder.reminderDate ?? null,
          reminder_time: reminder.reminderTime ?? null,
          lead_id: leadId,
          created_at: new Date().toISOString(),
        },
        transaction
      );
    }

    await logAuditEvent({
      userId: actorId,
      targetType: 'lead',
      targetId: leadId,
      action: 'create_lead',
      details: `Created new lead ${input.fullName}`,
    });

    await transaction.commit();

    const createdLead = await findLeadById(leadId);
    if (!createdLead) {
      throw new AppError('Failed to load created lead.', 500);
    }

    return toCamelCaseLead(createdLead.toJSON ? createdLead.toJSON() : createdLead);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const updateLeadStage = async (id: string, stage: string, actorId?: string) => {
  const lead = await findLeadById(id);
  if (!lead) {
    throw new AppError('Lead not found.', 404);
  }

  const [count] = await updateLead(id, { stage: stage.trim() });
  if (count === 0) {
    throw new AppError('Failed to update lead stage.', 500);
  }

  await logAuditEvent({
    userId: actorId,
    targetType: 'lead',
    targetId: id,
    action: 'update_lead_stage',
    details: `Updated stage to ${stage}`,
  });

  const updatedLead = await findLeadById(id);
  if (!updatedLead) {
    throw new AppError('Lead not found after update.', 500);
  }

  return toCamelCaseLead(updatedLead.toJSON ? updatedLead.toJSON() : updatedLead);
};

export const addActivityToLead = async (
  leadId: string,
  activity: ActivityLogInput,
  actorId?: string
) => {
  const lead = await findLeadById(leadId);
  if (!lead) {
    throw new AppError('Lead not found.', 404);
  }

  const log = await createActivityLog({
    id: randomUUID(),
    type: activity.type,
    description: activity.description ?? null,
    log_result: activity.logResult ?? null,
    lead_id: leadId,
    created_at: new Date().toISOString(),
  });

  await logAuditEvent({
    userId: actorId,
    targetType: 'lead',
    targetId: leadId,
    action: 'add_lead_activity',
    details: `Added activity log for lead ${leadId}`,
  });

  return {
    id: log.id,
    type: log.type,
    description: log.description,
    logResult: log.log_result,
    leadId: log.lead_id,
    createdAt: log.created_at,
  };
};

export const addReminderToLead = async (
  leadId: string,
  reminder: ReminderInput,
  actorId?: string
) => {
  const lead = await findLeadById(leadId);
  if (!lead) {
    throw new AppError('Lead not found.', 404);
  }

  const reminderLog = await createReminderLog({
    id: randomUUID(),
    type: reminder.type,
    description: reminder.description ?? null,
    reminder_date: reminder.reminderDate ?? null,
    reminder_time: reminder.reminderTime ?? null,
    lead_id: leadId,
    created_at: new Date().toISOString(),
  });

  await logAuditEvent({
    userId: actorId,
    targetType: 'lead',
    targetId: leadId,
    action: 'add_lead_reminder',
    details: `Added reminder for lead ${leadId}`,
  });

  return {
    id: reminderLog.id,
    type: reminderLog.type,
    description: reminderLog.description,
    reminderDate: reminderLog.reminder_date,
    reminderTime: reminderLog.reminder_time,
    leadId: reminderLog.lead_id,
    createdAt: reminderLog.created_at,
  };
};
