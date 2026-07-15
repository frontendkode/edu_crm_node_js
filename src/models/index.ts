import './ActivityLog';
import './AuditLog';
import './Attendance';
import './Dropdown';
import './DropdownValue';
import './DueDate';
import './Lead';
import './ReminderLog';
import './Session';
import './Staff';
import './Student';
import './Task';
import './User';

import User from './User';
import Session from './Session';
import Staff from './Staff';
import Task from './Task';
import Lead from './Lead';
import ActivityLog from './ActivityLog';
import ReminderLog from './ReminderLog';
import Student from './Student';
import Attendance from './Attendance';
import DueDate from './DueDate';
import Dropdown from './Dropdown';
import DropdownValue from './DropdownValue';

User.hasMany(Session, {
  foreignKey: 'user_id',
  as: 'sessions',
});

Session.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

User.hasOne(Staff, {
  foreignKey: 'user_id',
  as: 'staffProfile',
});

Staff.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'userAccount',
});

Staff.hasMany(Task, {
  foreignKey: 'staff_id',
  as: 'taskManagementDTOS',
});

Task.belongsTo(Staff, {
  foreignKey: 'staff_id',
  as: 'staff',
});

Lead.hasMany(ActivityLog, {
  foreignKey: 'lead_id',
  as: 'activityLog',
});

ActivityLog.belongsTo(Lead, {
  foreignKey: 'lead_id',
  as: 'lead',
});

Lead.hasMany(ReminderLog, {
  foreignKey: 'lead_id',
  as: 'reminderLog',
});

ReminderLog.belongsTo(Lead, {
  foreignKey: 'lead_id',
  as: 'lead',
});

Student.hasMany(Attendance, {
  foreignKey: 'student_management_id',
  as: 'attendance',
});

Attendance.belongsTo(Student, {
  foreignKey: 'student_management_id',
  as: 'student',
});

Student.hasMany(DueDate, {
  foreignKey: 'student_management_id',
  as: 'dueDay',
});

DueDate.belongsTo(Student, {
  foreignKey: 'student_management_id',
  as: 'student',
});

Dropdown.hasMany(DropdownValue, {
  foreignKey: 'dropdown_id',
  as: 'values',
});

DropdownValue.belongsTo(Dropdown, {
  foreignKey: 'dropdown_id',
  as: 'dropdown',
});
