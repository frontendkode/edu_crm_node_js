import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import {
  activityLogSchema,
  createLeadSchema,
  reminderSchema,
} from '../validators/leadValidator';
import * as leadController from '../controllers/leadController';

const router = Router();

router.get('/leads', authenticateToken, leadController.getAll);
router.post('/leads', authenticateToken, validateRequest(createLeadSchema), leadController.create);
router.patch('/leads/:id/stage', authenticateToken, leadController.updateStage);
router.post('/leads/:id/reminders', authenticateToken, validateRequest(reminderSchema), leadController.addReminder);
router.post('/leads/:id/activities', authenticateToken, validateRequest(activityLogSchema), leadController.addActivity);

export default router;
