import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import * as dashboardController from '../controllers/dashboardController';

const router = Router();

router.get('/api/dashboard', authenticateToken, authorizeRoles('SUPER_ADMIN', 'ADMIN', 'STAFF'), dashboardController.getData);
router.get('/api/dashboard/notifications', authenticateToken, authorizeRoles('SUPER_ADMIN', 'ADMIN', 'STAFF'), dashboardController.getNotifications);

export default router;
