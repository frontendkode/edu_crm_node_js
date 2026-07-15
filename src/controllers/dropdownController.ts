import { Request, Response, NextFunction } from 'express';
import { createNewDropdown, getDropdowns, updateExistingDropdown } from '../services/dropdownService';

export const getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dropdowns = await getDropdowns();
    res.json({ responseObject: dropdowns });
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { dropdownType, values } = req.body;
    const dropdown = await createNewDropdown(dropdownType, values, req.user?.id);
    res.status(201).json({ responseObject: dropdown, responseMessage: 'Dropdown created successfully.' });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, dropdownType, values } = req.body;
    const dropdown = await updateExistingDropdown(id, dropdownType, values, req.user?.id);
    res.json({ responseObject: dropdown, responseMessage: 'Dropdown updated successfully.' });
  } catch (error) {
    next(error);
  }
};
