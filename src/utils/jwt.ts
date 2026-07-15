import * as jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/auth';
import { AppError } from './appError';

const JWT_SECRET = process.env.JWT_SECRET as string;
const ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '12h';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined in environment variables.');
}

export const signAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload as object, JWT_SECRET as jwt.Secret, {
    expiresIn: ACCESS_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'],
  } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (err) {
    throw new AppError('Invalid or expired access token.', 401);
  }
};
