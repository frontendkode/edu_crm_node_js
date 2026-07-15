import { AnyZodObject, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';

export type RequestValidationSource = 'body' | 'query' | 'params';

export const validateRequest = (schema: AnyZodObject, source: RequestValidationSource = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const target = source === 'body' ? req.body : source === 'query' ? req.query : req.params;

    try {
      schema.parse(target);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors = error.errors.map((err) => ({
          field: err.path.join('.') || source,
          message: err.message,
        }));

        res.status(400).json({
          error: 'Request validation failed.',
          details: fieldErrors,
        });
        return;
      }

      next(error);
    }
  };
};
