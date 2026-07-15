import { Router } from 'express';
import userRoutes from './userRoutes';
import staffRoutes from './staffRoutes';
import leadRoutes from './leadRoutes';
import taskRoutes from './taskRoutes';
import studentRoutes from './studentRoutes';
import dashboardRoutes from './dashboardRoutes';
import dropdownRoutes from './dropdownRoutes';
import reportRoutes from './reportRoutes';

const router = Router();

router.use(userRoutes);
router.use(staffRoutes);
router.use(leadRoutes);
router.use(taskRoutes);
router.use(studentRoutes);
router.use(dashboardRoutes);
router.use(dropdownRoutes);
router.use(reportRoutes);

export default router;
