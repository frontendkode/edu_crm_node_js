import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getAuditLogs, getAuditLogExport, getReportsSummary } from '../services/reportService';

const auditQuerySchema = z.object({
  userId: z.string().optional(),
  targetType: z.string().optional(),
  action: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  page: z.preprocess((value) => Number(value), z.number().int().positive().optional()),
  limit: z.preprocess((value) => Number(value), z.number().int().positive().optional()),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

const exportQuerySchema = auditQuerySchema.extend({
  format: z.enum(['json', 'csv']).optional(),
});

export const getAudit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = auditQuerySchema.parse(req.query);
    const result = await getAuditLogs({
      ...query,
      sortOrder: query.sortOrder ? query.sortOrder.toUpperCase() as 'ASC' | 'DESC' : 'DESC',
    });
    res.json({ responseObject: result });
  } catch (error) {
    next(error);
  }
};

export const exportAudit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = exportQuerySchema.parse(req.query);
    const exportResult = await getAuditLogExport({
      ...query,
      sortOrder: query.sortOrder ? query.sortOrder.toUpperCase() as 'ASC' | 'DESC' : 'DESC',
    });

    if (exportResult.format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.csv"');
      res.send(exportResult.content);
      return;
    }

    res.json({ responseObject: exportResult.logs });
  } catch (error) {
    next(error);
  }
};

export const getSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await getReportsSummary();
    res.json({ responseObject: result });
  } catch (error) {
    next(error);
  }
};
