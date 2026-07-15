import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { createUserSchema, updateUserSchema } from '../validators/userValidator';
import * as userController from '../controllers/userController';

const router = Router();

router.get('/api/users', authenticateToken, authorizeRoles('SUPER_ADMIN', 'ADMIN'), userController.listUsers);
router.get('/api/users/:id', authenticateToken, authorizeRoles('SUPER_ADMIN', 'ADMIN'), userController.getUser);
router.post('/api/users', authenticateToken, authorizeRoles('SUPER_ADMIN', 'ADMIN'), validateRequest(createUserSchema), userController.createUser);
router.put('/api/users/:id', authenticateToken, authorizeRoles('SUPER_ADMIN', 'ADMIN'), validateRequest(updateUserSchema), userController.updateUser);
router.delete('/api/users/:id', authenticateToken, authorizeRoles('SUPER_ADMIN', 'ADMIN'), userController.deleteUser);

export default router;
