import { Application } from 'express';
import { authenticateToken } from './auth';
import { validateRequest } from './validateRequest';
import { authorizeModule } from './authorizeModule';

// --- Controller imports (placeholder paths – will be created separately) ---
import * as authController from '../controllers/authController';
import * as dropdownController from '../controllers/dropdownController';
import * as dashboardController from '../controllers/dashboardController';
import * as leadController from '../controllers/leadController';
import * as studentController from '../controllers/studentController';
import * as staffController from '../controllers/staffController';
import * as taskController from '../controllers/taskController';
import { loginSchema, registerSchema } from '../validators/authValidator';
import { createStaffSchema, updateStaffSchema } from '../validators/staffValidator';
import { createLeadSchema, activityLogSchema, reminderSchema } from '../validators/leadValidator';
import { createTaskSchema } from '../validators/taskValidator';
import { createDropdownSchema, updateDropdownSchema } from '../validators/dropdownValidator';
import {
  createStudentSchema,
  enrollStudentSchema,
  updateStudentAttendanceSchema,
  updateStudentPaymentSchema,
} from '../validators/studentValidator';

/**
 * Registers legacy Angular-frontend routes on the Express app and wires
 * each one to the appropriate new controller handler.
 *
 * Call this **after** body-parsing middleware is set up but **before** the
 * centralized error handler.
 */
export const setupLegacyRoutes = (app: Application): void => {
  // ──────────────────────────── Auth ────────────────────────────
  app.post('/api/auth/signIn2', validateRequest(loginSchema), authController.login);
  app.post('/api/user/create', validateRequest(registerSchema), authController.register);

  // ──────────────────────────── Dropdown ────────────────────────
  app.post(
    '/kiss-tech/api-dropdown/create',
    authenticateToken,
    validateRequest(createDropdownSchema),
    dropdownController.create
  );
  app.post(
    '/kiss-tech/api-dropdown/getAll',
    authenticateToken,
    dropdownController.getAll
  );
  app.post(
    '/kiss-tech/api-dropdown/update',
    authenticateToken,
    validateRequest(updateDropdownSchema),
    dropdownController.update
  );

  // ──────────────────────────── Dashboard ───────────────────────
  app.post(
    '/kiss-tech/api-das-board/getDashBoardDatas',
    authenticateToken,
    authorizeModule('/dashboard'),
    dashboardController.getData
  );
  app.post(
    '/kiss-tech/api-das-board/getDailyNotification',
    authenticateToken,
    authorizeModule('/dashboard'),
    dashboardController.getNotifications
  );

  // ──────────────────────────── Leads ───────────────────────────
  app.post(
    '/kiss-tech/api-lead/getAllLeads',
    authenticateToken,
    authorizeModule('/lead'),
    leadController.getAll
  );
  app.post(
    '/kiss-tech/api-lead/create',
    authenticateToken,
    authorizeModule('/lead'),
    validateRequest(createLeadSchema),
    leadController.create
  );
  app.post(
    '/kiss-tech/api-lead/updateStage',
    authenticateToken,
    authorizeModule('/lead'),
    leadController.updateStage
  );
  app.post(
    '/kiss-tech/api-lead/updateReminder',
    authenticateToken,
    authorizeModule('/lead'),
    validateRequest(reminderSchema),
    leadController.addReminder
  );
  app.post(
    '/kiss-tech/api-lead/updateActivity',
    authenticateToken,
    authorizeModule('/lead'),
    validateRequest(activityLogSchema),
    leadController.addActivity
  );

  // ──────────────────────────── Students ────────────────────────
  app.post(
    '/kiss-tech/api-student/getAllStudents',
    authenticateToken,
    authorizeModule('/student'),
    studentController.getAll
  );
  app.post(
    '/kiss-tech/api-student/create',
    authenticateToken,
    authorizeModule('/student'),
    validateRequest(createStudentSchema),
    studentController.create
  );
  app.post(
    '/kiss-tech/api-student/update',
    authenticateToken,
    authorizeModule('/student'),
    validateRequest(enrollStudentSchema),
    studentController.enroll
  );
  app.all(
    '/kiss-tech/api-student/updatePaymentDetails',
    authenticateToken,
    authorizeModule('/student'),
    validateRequest(updateStudentPaymentSchema, 'query'),
    studentController.updatePayment
  );
  app.all(
    '/kiss-tech/api-student/updateAttendanceDetails',
    authenticateToken,
    authorizeModule('/student'),
    validateRequest(updateStudentAttendanceSchema, 'query'),
    studentController.updateAttendance
  );

  // ──────────────────────────── Staff ───────────────────────────
  app.post(
    '/kiss-tech/api-staff/getAllStaffsWithTask',
    authenticateToken,
    authorizeModule('/staff'),
    staffController.getAll
  );
  app.post(
    '/kiss-tech/api-staff/getAllStaffNameAndId',
    authenticateToken,
    // authorizeModule('/staff'),
    staffController.getAllNamesAndIds
  );
  app.post(
    '/kiss-tech/api-staff/create',
    authenticateToken,
    authorizeModule('/staff'),
    validateRequest(createStaffSchema),
    staffController.create
  );
  app.get('/staff/:id', authenticateToken, staffController.getById);
  app.put('/staff/:id', authenticateToken, validateRequest(updateStaffSchema), staffController.update);
  app.delete('/staff/:id', authenticateToken, staffController.deleteStaff);

  // ──────────────────────────── Tasks ───────────────────────────
  app.post(
    '/kiss-tech/api-task/create',
    authenticateToken,
    authorizeModule('/task'),
    validateRequest(createTaskSchema),
    taskController.create
  );
  app.post(
    '/kiss-tech/api-task/getAllTasks',
    authenticateToken,
    authorizeModule('/task'),
    taskController.getAll
  );
  app.post(
    '/kiss-tech/api-task/taskStatusUpdateById',
    authenticateToken,
    authorizeModule('/task'),
    taskController.updateStatus
  );
};
