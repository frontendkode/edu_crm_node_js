import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  addActivityToLead,
  addReminderToLead,
  createNewLead,
  getAllLeads,
  updateLeadStage,
} from '../services/leadService';
import {
  activityLogSchema,
  createLeadSchema,
  reminderSchema,
} from '../validators/leadValidator';
import { updateLeadDetails } from '../services/leadService';
import { updateLeadSchema } from '../validators/leadValidator';

const parseQuery = (schema: z.ZodSchema<any>, source: unknown) => {
  return schema.parse(source);
};

export const getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const leads = await getAllLeads();
    res.json({ responseObject: leads });
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = createLeadSchema.parse(req.body);
    const activityLogEntries = Array.isArray(req.body.activityLog) ? req.body.activityLog : [];
    const reminderEntries = Array.isArray(req.body.reminderLog) ? req.body.reminderLog : [];
    const actorId = req.user?.id;

    const lead = await createNewLead(input, actorId, activityLogEntries, reminderEntries);

    res.status(201).json({ responseObject: lead, responseMessage: 'Lead created successfully.' });
  } catch (error) {
    next(error);
  }
};

export const updateStage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const querySchema = z.object({
      id: z.string().min(1, 'Lead id is required.'),
      stage: z.string().min(1, 'Stage is required.'),
    });

    const { id, stage } = parseQuery(querySchema, req.query);
    await updateLeadStage(id, stage, req.user?.id);
    res.json({ responseMessage: 'Lead stage updated successfully.' });
  } catch (error) {
    next(error);
  }
};

export const addReminder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const querySchema = z.object({ leadId: z.string().min(1, 'Lead id is required.') });
    const { leadId } = parseQuery(querySchema, req.query);
    const input = reminderSchema.parse(req.body);
    const reminder = await addReminderToLead(leadId, input, req.user?.id);
    res.status(201).json({ responseObject: reminder, responseMessage: 'Reminder added successfully.' });
  } catch (error) {
    next(error);
  }
};

export const addActivity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const querySchema = z.object({ leadId: z.string().min(1, 'Lead id is required.') });
    const { leadId } = parseQuery(querySchema, req.query);
    const input = activityLogSchema.parse(req.body);
    const activity = await addActivityToLead(leadId, input, req.user?.id);
    res.status(201).json({ responseObject: activity, responseMessage: 'Activity log added successfully.' });
  } catch (error) {
    next(error);
  }
};



export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const querySchema = z.object({ id: z.string().min(1, 'Lead id is required.') });
    const { id } = parseQuery(querySchema, req.query);
    const input = updateLeadSchema.parse(req.body);

    const lead = await updateLeadDetails(id, input, req.user?.id);

    res.json({ responseObject: lead, responseMessage: 'Lead updated successfully.' });
  } catch (error) {
    next(error);
  }
};