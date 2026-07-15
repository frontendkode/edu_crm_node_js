import { Transaction } from 'sequelize';
import Dropdown from '../models/Dropdown';
import DropdownValue from '../models/DropdownValue';

export const findDropdownById = async (id: string): Promise<Dropdown | null> => {
  return Dropdown.findByPk(id, { include: [{ model: DropdownValue, as: 'values' }] });
};

export const findDropdownByType = async (dropdownType: string): Promise<Dropdown | null> => {
  return Dropdown.findOne({
    where: { dropdown_type: dropdownType },
    include: [{ model: DropdownValue, as: 'values' }],
  });
};

export const findAllDropdowns = async (): Promise<Dropdown[]> => {
  return Dropdown.findAll({
    include: [{ model: DropdownValue, as: 'values' }],
    order: [['dropdown_type', 'ASC'], [{ model: DropdownValue, as: 'values' }, 'value', 'ASC']],
  });
};

export const createDropdown = async (
  dropdownData: Partial<Dropdown>,
  transaction?: Transaction
): Promise<Dropdown> => {
  return Dropdown.create(dropdownData as any, { transaction });
};

export const createDropdownValues = async (
  values: Array<Partial<DropdownValue>>,
  transaction?: Transaction
): Promise<DropdownValue[]> => {
  return DropdownValue.bulkCreate(values as any[], { transaction });
};

export const deleteDropdownValues = async (dropdownId: string, transaction?: Transaction): Promise<number> => {
  return DropdownValue.destroy({ where: { dropdown_id: dropdownId }, transaction });
};

export const updateDropdownType = async (
  id: string,
  dropdownType: string,
  transaction?: Transaction
): Promise<[number, Dropdown[]]> => {
  return Dropdown.update({ dropdown_type: dropdownType }, { where: { id }, returning: true, transaction });
};
