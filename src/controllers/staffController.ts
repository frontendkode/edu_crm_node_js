import { Request, Response, NextFunction } from 'express';
import { createNewStaff, getAllStaffNames, getStaff, getStaffList, removeStaff, updateExistingStaff } from '../services/staffService';
import { createStaffSchema, updateStaffSchema } from '../validators/staffValidator';

export const getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const source = Object.keys(req.body || {}).length ? req.body : req.query;
    const {
      search,
      role,
      department,
      page,
      limit,
      sortBy,
      sortOrder,
      isActive,
    } = source as any;

    const result = await getStaffList({
      search,
      role,
      department,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      sortBy,
      sortOrder: sortOrder === 'desc' ? 'desc' : 'asc',
      isActive: typeof isActive === 'boolean' ? isActive : undefined,
    });

    res.json({
      responseObject: result.items,
      metadata: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllNamesAndIds = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const staff = await getAllStaffNames();
    res.json({ responseObject: staff });
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = createStaffSchema.parse(req.body);
    const actorId = req.user?.id;

    const staff = await createNewStaff(input, actorId);

    res.status(201).json({ responseObject: staff, responseMessage: 'Staff member created successfully.' });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const staff = await getStaff(req.params.id);
    res.json({ responseObject: staff });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = updateStaffSchema.parse(req.body);
    const actorId = req.user?.id;
    const staff = await updateExistingStaff(req.params.id, input, actorId);
    res.json({ responseObject: staff, responseMessage: 'Staff member updated successfully.' });
  } catch (error) {
    next(error);
  }
};

export const deleteStaff = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await removeStaff(req.params.id, req.user?.id);
    res.json({ responseMessage: 'Staff member deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
