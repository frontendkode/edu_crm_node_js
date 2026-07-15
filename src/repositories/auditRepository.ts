import AuditLog from '../models/AuditLog';

export const createAuditLog = async (log: Partial<AuditLog>): Promise<AuditLog> => {
  return AuditLog.create(log as any);
};
