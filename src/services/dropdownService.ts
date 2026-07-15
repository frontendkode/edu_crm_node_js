import { randomUUID } from 'crypto';
import sequelize from '../config/database';
import { AppError } from '../utils/appError';
import { logAuditEvent } from './auditService';
import {
  createDropdown,
  createDropdownValues,
  deleteDropdownValues,
  findAllDropdowns,
  findDropdownById,
  findDropdownByType,
  updateDropdownType,
} from '../repositories/dropdownRepository';

export const getDropdowns = async () => {
  const dropdowns = await findAllDropdowns();
  return dropdowns.map((dropdown) => ({
    id: dropdown.id,
    dropdownType: dropdown.dropdown_type,
    values: Array.isArray(dropdown.values) ? dropdown.values.map((value) => value.value) : [],
  }));
};

export const createNewDropdown = async (dropdownType: string, values: string[], actorId?: string) => {
  const existing = await findDropdownByType(dropdownType.trim());
  if (existing) {
    throw new AppError(`Dropdown type '${dropdownType}' already exists.`, 409);
  }

  const transaction = await sequelize.transaction();
  try {
    const dropdownId = randomUUID();
    await createDropdown({ id: dropdownId, dropdown_type: dropdownType.trim() }, transaction);

    const normalizedValues = Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
    await createDropdownValues(
      normalizedValues.map((value) => ({ dropdown_id: dropdownId, value })),
      transaction
    );

    await logAuditEvent({
      userId: actorId,
      targetType: 'dropdown',
      targetId: dropdownId,
      action: 'create_dropdown',
      details: `Created dropdown '${dropdownType}' with ${normalizedValues.length} values.`,
    });

    await transaction.commit();

    return {
      id: dropdownId,
      dropdownType: dropdownType.trim(),
      values: normalizedValues,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const updateExistingDropdown = async (
  id: string,
  dropdownType: string,
  values: string[],
  actorId?: string
) => {
  const dropdown = await findDropdownById(id);
  if (!dropdown) {
    throw new AppError('Dropdown not found.', 404);
  }

  const existingSameType = await findDropdownByType(dropdownType.trim());
  if (existingSameType && existingSameType.id !== id) {
    throw new AppError(`Dropdown type '${dropdownType}' is already in use.`, 409);
  }

  const transaction = await sequelize.transaction();
  try {
    await updateDropdownType(id, dropdownType.trim(), transaction);
    await deleteDropdownValues(id, transaction);

    const normalizedValues = Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
    if (normalizedValues.length > 0) {
      await createDropdownValues(
        normalizedValues.map((value) => ({ dropdown_id: id, value })),
        transaction
      );
    }

    await logAuditEvent({
      userId: actorId,
      targetType: 'dropdown',
      targetId: id,
      action: 'update_dropdown',
      details: `Updated dropdown '${dropdownType}' with ${normalizedValues.length} values.`,
    });

    await transaction.commit();

    return {
      id,
      dropdownType: dropdownType.trim(),
      values: normalizedValues,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
