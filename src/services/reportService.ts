import { logAuditEvent } from './auditService';
import { findAuditLogs, findAuditLogsForExport, getReportSummary } from '../repositories/reportRepository';

export const getAuditLogs = async (options: {
  userId?: string;
  targetType?: string;
  action?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}) => {
  const limit = options.limit || 20;
  const offset = options.page && options.page > 0 ? (options.page - 1) * limit : 0;

  const result = await findAuditLogs({
    userId: options.userId,
    targetType: options.targetType,
    action: options.action,
    fromDate: options.fromDate,
    toDate: options.toDate,
    limit,
    offset,
    sortBy: options.sortBy,
    sortOrder: options.sortOrder,
  });

  await logAuditEvent({
    targetType: 'audit',
    action: 'query_audit_logs',
    details: `Queried audit logs page=${options.page || 1} limit=${limit}`,
  });

  return {
    total: result.count,
    page: options.page || 1,
    limit,
    logs: result.rows.map((log) => ({
      id: log.id,
      userId: log.user_id,
      targetType: log.target_type,
      targetId: log.target_id,
      action: log.action,
      details: log.details,
      createdAt: log.created_at,
    })),
  };
};

export const getAuditLogExport = async (options: {
  userId?: string;
  targetType?: string;
  action?: string;
  fromDate?: string;
  toDate?: string;
  format?: 'json' | 'csv';
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}) => {
  const logs = await findAuditLogsForExport({
    userId: options.userId,
    targetType: options.targetType,
    action: options.action,
    fromDate: options.fromDate,
    toDate: options.toDate,
    sortBy: options.sortBy || 'created_at',
    sortOrder: options.sortOrder || 'DESC',
  });

  await logAuditEvent({
    targetType: 'audit',
    action: 'export_audit_logs',
    details: `Exported audit logs format=${options.format || 'json'} count=${logs.length}`,
  });

  if (options.format === 'csv') {
    const header = ['id', 'userId', 'targetType', 'targetId', 'action', 'details', 'createdAt'];
    const rows = logs.map((log) => [
      log.id,
      log.user_id || '',
      log.target_type,
      log.target_id || '',
      log.action,
      log.details || '',
      log.created_at.toISOString(),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    return { format: 'csv', content: csv };
  }

  return {
    format: 'json',
    logs: logs.map((log) => ({
      id: log.id,
      userId: log.user_id,
      targetType: log.target_type,
      targetId: log.target_id,
      action: log.action,
      details: log.details,
      createdAt: log.created_at,
    })),
  };
};

export const getReportsSummary = async () => {
  const summary = await getReportSummary();
  await logAuditEvent({
    targetType: 'report',
    action: 'view_report_summary',
    details: 'Viewed report summary',
  });
  return summary;
};
