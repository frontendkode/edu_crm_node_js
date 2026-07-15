import { Request, Response, NextFunction } from 'express';
import { getDashboardData, getDashboardNotifications } from '../services/dashboardService';

export const getData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await getDashboardData();
    res.json({ responseObject: data });
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await getDashboardNotifications();
    res.json({ responseObject: data });
  } catch (error) {
    next(error);
  }
};
