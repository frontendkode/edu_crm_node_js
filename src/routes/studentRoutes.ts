import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import {
  createStudentSchema,
  enrollStudentSchema,
  updateStudentAttendanceSchema,
  updateStudentPaymentSchema,
} from '../validators/studentValidator';
import * as studentController from '../controllers/studentController';

const router = Router();

router.get('/api/students', authenticateToken, authorizeRoles('SUPER_ADMIN', 'ADMIN', 'STAFF'), studentController.getAll);
router.get('/api/students/:id', authenticateToken, authorizeRoles('SUPER_ADMIN', 'ADMIN', 'STAFF'), studentController.getById);
router.post('/api/students', authenticateToken, authorizeRoles('SUPER_ADMIN', 'ADMIN', 'STAFF'), validateRequest(createStudentSchema), studentController.create);
router.post('/api/students/enroll', authenticateToken, authorizeRoles('SUPER_ADMIN', 'ADMIN', 'STAFF'), validateRequest(enrollStudentSchema), studentController.enroll);
router.patch('/api/students/:studentId/payment', authenticateToken, authorizeRoles('SUPER_ADMIN', 'ADMIN', 'STAFF'), validateRequest(updateStudentPaymentSchema), studentController.updatePayment);
router.patch('/api/students/attendance/:attendanceId', authenticateToken, authorizeRoles('SUPER_ADMIN', 'ADMIN', 'STAFF'), validateRequest(updateStudentAttendanceSchema), studentController.updateAttendance);

export default router;
