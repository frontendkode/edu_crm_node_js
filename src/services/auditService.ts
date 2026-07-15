import { randomUUID } from 'crypto';
import { createAuditLog } from '../repositories/auditRepository';

export const logAuditEvent = async (params: {
  userId?: string;
  targetType: string;
  targetId?: string;
  action: string;
  details?: string;
}) => {
  await createAuditLog({
    id: randomUUID(),
    user_id: params.userId || null,
    target_type: params.targetType,
    target_id: params.targetId || null,
    action: params.action,
    details: params.details || null,
  });
};
