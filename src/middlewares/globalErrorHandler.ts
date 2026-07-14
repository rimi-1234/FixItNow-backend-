import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

const toPlainErrorDetails = (err: any) => {
  if (err instanceof ZodError) {
    return {
      issues: err.issues.map((issue) => ({
        field: issue.path[issue.path.length - 1],
        message: issue.message,
      })),
    };
  }

  if (err && typeof err === 'object') {
    const details: Record<string, unknown> = {};
    if (err.statusCode) details.statusCode = err.statusCode;
    if (err.code) details.code = err.code;
    if (err.name && err.name !== 'Error') details.name = err.name;
    return Object.keys(details).length ? details : {};
  }

  if (typeof err === 'string') return { message: err };
  return {};
};

export const globalErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';
  let errorDetails = toPlainErrorDetails(err);

  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    errorDetails = toPlainErrorDetails(err);
  }

  // Prisma unique constraint (e.g. duplicate email)
  if (err?.code === 'P2002') {
    statusCode = 409;
    message = 'Duplicate value — resource already exists';
    errorDetails = { fields: err.meta?.target || [], code: 'P2002' };
  }

  // Prisma record not found
  if (err?.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
    errorDetails = { code: 'P2025' };
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorDetails,
  });
};
