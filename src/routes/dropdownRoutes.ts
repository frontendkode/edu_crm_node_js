import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { createDropdownSchema, updateDropdownSchema } from '../validators/dropdownValidator';
import * as dropdownController from '../controllers/dropdownController';

const router = Router();

router.get('/api/dropdowns', authenticateToken, authorizeRoles('SUPER_ADMIN', 'ADMIN', 'STAFF'), dropdownController.getAll);
router.post('/api/dropdowns', authenticateToken, authorizeRoles('SUPER_ADMIN', 'ADMIN'), validateRequest(createDropdownSchema), dropdownController.create);
router.put('/api/dropdowns', authenticateToken, authorizeRoles('SUPER_ADMIN', 'ADMIN'), validateRequest(updateDropdownSchema), dropdownController.update);

export default router;
