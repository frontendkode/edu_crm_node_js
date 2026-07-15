import { Request, Response, NextFunction } from 'express';
import { ValidationError, UniqueConstraintError } from 'sequelize';

/**
 * Centralized error-handling middleware.
 *
 * Handles:
 *  - Sequelize ValidationError  → 400 with per-field messages
 *  - Sequelize UniqueConstraintError → 409 with duplicate-field info
 *  - Everything else → 500 Internal Server Error
 *
 * Always responds with `{ error: string, details?: any }`.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Always log the full stack for debugging
  console.error('[ErrorHandler]', err.stack || err.message);

  // --- Sequelize field-level validation errors ---
  if (err instanceof ValidationError) {
    const fieldErrors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
      type: e.type,
    }));

    res.status(400).json({
      error: 'Validation failed.',
      details: fieldErrors,
    });
    return;
  }

  // --- Sequelize unique constraint violations ---
  if (err instanceof UniqueConstraintError) {
    const duplicateFields = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));

    res.status(409).json({
      error: 'Duplicate entry. A record with this data already exists.',
      details: duplicateFields,
    });
    return;
  }

  // --- Generic / unexpected errors ---
  const statusCode = (err as any).statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error.'
      : err.message || 'Internal server error.';

  res.status(statusCode).json({ error: message });
};
