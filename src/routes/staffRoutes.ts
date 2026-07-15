import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { createStaffSchema, updateStaffSchema } from '../validators/staffValidator';
import * as staffController from '../controllers/staffController';

const router = Router();

router.get('/api/staff', authenticateToken, authorizeRoles('SUPER_ADMIN', 'ADMIN'), staffController.getAll);
router.get('/api/staff/names', authenticateToken, authorizeRoles('SUPER_ADMIN', 'ADMIN', 'STAFF'), staffController.getAllNamesAndIds);
router.get('/api/staff/:id', authenticateToken, authorizeRoles('SUPER_ADMIN', 'ADMIN', 'STAFF'), staffController.getById);
router.post('/api/staff', authenticateToken, authorizeRoles('SUPER_ADMIN', 'ADMIN'), validateRequest(createStaffSchema), staffController.create);
router.put('/api/staff/:id', authenticateToken, authorizeRoles('SUPER_ADMIN', 'ADMIN'), validateRequest(updateStaffSchema), staffController.update);
router.delete('/api/staff/:id', authenticateToken, authorizeRoles('SUPER_ADMIN', 'ADMIN'), staffController.deleteStaff);

export default router;
