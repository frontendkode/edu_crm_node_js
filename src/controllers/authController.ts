import { Request, Response, NextFunction } from 'express';
import { decryptPayload, encryptPayload } from '../utils/crypto';
import { loginInputSchema, loginSchema, registerSchema } from '../validators/authValidator';
import { login as authenticate, register as registerUser } from '../services/authService';
import { AppError } from '../utils/appError';

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { encData } = req.body as { encData?: string };
    const credentials = encData
      ? (decryptPayload(encData) as unknown)
      : req.body;

    const parsedCredentials = loginInputSchema.parse(credentials);
    const jwtResponse = await authenticate(parsedCredentials);

    const responsePayload = {
      responseObject: {
        jwtResponse,
      },
    };

    if (encData) {
      const encryptedResponse = encryptPayload(responsePayload);
      res.status(200).send(encryptedResponse);
      return;
    }

    res.status(200).json(responsePayload);
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsedBody = registerSchema.parse(req.body);
    const user = await registerUser(parsedBody);

    res.status(201).json({
      message: 'User created successfully.',
      user,
    });
  } catch (error) {
    next(error);
  }
};
