import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { JsonWebTokenError } from 'jsonwebtoken';

interface ErrorResponse {
  status: number;
  message: string;
  details?: any;
  stack?: string;
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);

  const errorResponse: ErrorResponse = {
    status: 500,
    message: 'Internal Server Error'
  };

  // Handle known error types
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    errorResponse.status = 400;
    errorResponse.message = 'Database error';
    errorResponse.details = err.meta;
  } 
  else if (err instanceof Prisma.PrismaClientValidationError) {
    errorResponse.status = 400;
    errorResponse.message = 'Validation error';
  }
  else if (err instanceof JsonWebTokenError) {
    errorResponse.status = 401;
    errorResponse.message = 'Invalid token';
  }
  else if (err.name === 'UnauthorizedError') {
    errorResponse.status = 401;
    errorResponse.message = 'Unauthorized';
  }

  // Development environment shows stack traces
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  res.status(errorResponse.status).json(errorResponse);
};

export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}