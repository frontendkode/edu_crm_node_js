import { randomUUID } from 'crypto';
import { AppError } from '../utils/appError';
import { getPagination } from '../utils/pagination';
import { createStaff, deleteStaff, findAllStaff, findAllStaffNameAndIds, findStaffById, updateStaff } from '../repositories/staffRepository';
import { logAuditEvent } from './auditService';
import { CreateStaffInput, UpdateStaffInput } from '../validators/staffValidator';

const toCamelCaseStaff = (staff: any) => ({
  id: staff.id,
  name: staff.name,
  role: staff.role,
  email: staff.email,
  phoneNo: staff.phone_no,
  department: staff.department,
  joiningDate: staff.joining_date,
  idProof: staff.id_proof,
  proofNo: staff.proof_no,
  userId: staff.user_id,
  isActive: staff.is_active,
  createdAt: staff.created_at,
  updatedAt: staff.updated_at,
  createdBy: staff.created_by,
  taskManagementDTOS: staff.taskManagementDTOS,
});

export const getStaffList = async (options: {
  search?: string;
  role?: string;
  department?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  const pagination = getPagination(options);

  const staffPage = await findAllStaff({
    search: options.search,
    role: options.role,
    department: options.department,
    isActive: typeof options.isActive === 'boolean' ? options.isActive : true,
    limit: pagination.limit,
    offset: pagination.offset,
    sortBy: pagination.sortBy,
    sortOrder: pagination.sortOrder,
  });

  return {
    total: staffPage.count,
    page: pagination.page,
    limit: pagination.limit,
    items: staffPage.rows.map((staff) => toCamelCaseStaff(staff.toJSON ? staff.toJSON() : staff)),
  };
};

export const getAllStaffNames = async () => {
  return findAllStaffNameAndIds();
};

export const getStaff = async (id: string) => {
  const staff = await findStaffById(id);
  if (!staff) {
    throw new AppError('Staff member not found.', 404);
  }
  return toCamelCaseStaff(staff.toJSON ? staff.toJSON() : staff);
};

export const createNewStaff = async (input: CreateStaffInput, actorId?: string) => {
  const staffId = randomUUID();
  const staff = await createStaff({
    id: staffId,
    name: input.name,
    role: input.role,
    email: input.email,
    phone_no: input.phone_no,
    department: input.department,
    joining_date: input.joining_date,
    id_proof: input.idProof ?? null,
    proof_no: input.proofNo ?? null,
    user_id: input.userId ?? null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  await logAuditEvent({
    userId: actorId,
    targetType: 'staff',
    targetId: staffId,
    action: 'create_staff',
    details: `Created staff ${input.name} in ${input.department}`,
  });

  return toCamelCaseStaff(staff.toJSON ? staff.toJSON() : staff);
};

export const updateExistingStaff = async (id: string, input: UpdateStaffInput, actorId?: string) => {
  const staff = await getStaff(id);

  const updates: any = {
    updated_at: new Date().toISOString(),
  };

  if (input.name) updates.name = input.name;
  if (input.role) updates.role = input.role;
  if (input.email) updates.email = input.email;
  if (input.phoneNo) updates.phone_no = input.phoneNo;
  if (input.phone_no) updates.phone_no = input.phone_no;
  if (input.department) updates.department = input.department;
  if (input.joiningDate) updates.joining_date = input.joiningDate;
  if (input.joining_date) updates.joining_date = input.joining_date;
  if (input.idProof !== undefined) updates.id_proof = input.idProof;
  if (input.id_proof !== undefined) updates.id_proof = input.id_proof;
  if (input.proofNo !== undefined) updates.proof_no = input.proofNo;
  if (input.proof_no !== undefined) updates.proof_no = input.proof_no;
  if (input.userId !== undefined) updates.user_id = input.userId;
  if (typeof input.isActive === 'boolean') updates.is_active = input.isActive;

  const [count, updated] = await updateStaff(id, updates);
  if (count === 0) {
    throw new AppError('Failed to update staff member.', 500);
  }

  await logAuditEvent({
    userId: actorId,
    targetType: 'staff',
    targetId: id,
    action: 'update_staff',
    details: `Updated staff ${id}`,
  });

  return toCamelCaseStaff(updated[0].toJSON());
};

export const removeStaff = async (id: string, actorId?: string) => {
  const staff = await getStaff(id);
  const deletedCount = await deleteStaff(id);
  if (deletedCount === 0) {
    throw new AppError('Failed to delete staff member.', 500);
  }

  await logAuditEvent({
    userId: actorId,
    targetType: 'staff',
    targetId: id,
    action: 'delete_staff',
    details: `Deleted staff ${staff.name}`,
  });

  return deletedCount;
};
