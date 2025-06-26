// src/utils/jwt.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRY = '1d';

export const generateToken = (userId: number, role: string) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};