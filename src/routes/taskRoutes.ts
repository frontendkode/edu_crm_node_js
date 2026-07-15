import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { createTaskSchema, updateTaskSchema } from '../validators/taskValidator';
import * as taskController from '../controllers/taskController';

const router = Router();

router.get('/api/tasks', authenticateToken, authorizeRoles('SUPER_ADMIN', 'ADMIN', 'STAFF'), taskController.getAll);
router.get('/api/tasks/:id', authenticateToken, authorizeRoles('SUPER_ADMIN', 'ADMIN', 'STAFF'), taskController.getById);
router.post('/api/tasks', authenticateToken, authorizeRoles('SUPER_ADMIN', 'ADMIN', 'STAFF'), validateRequest(createTaskSchema), taskController.create);
router.put('/api/tasks/:id', authenticateToken, authorizeRoles('SUPER_ADMIN', 'ADMIN', 'STAFF'), validateRequest(updateTaskSchema), taskController.update);
router.patch('/api/tasks/:id/status', authenticateToken, authorizeRoles('SUPER_ADMIN', 'ADMIN', 'STAFF'), taskController.updateStatus);
router.delete('/api/tasks/:id', authenticateToken, authorizeRoles('SUPER_ADMIN', 'ADMIN'), taskController.deleteTask);

export default router;
