import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import * as reportController from '../controllers/reportController';

const router = Router();

router.get('/api/reports/summary', authenticateToken, authorizeRoles('SUPER_ADMIN', 'ADMIN'), reportController.getSummary);
router.get('/api/reports/audit', authenticateToken, authorizeRoles('SUPER_ADMIN', 'ADMIN'), reportController.getAudit);
router.get('/api/reports/audit/export', authenticateToken, authorizeRoles('SUPER_ADMIN', 'ADMIN'), reportController.exportAudit);

export default router;
