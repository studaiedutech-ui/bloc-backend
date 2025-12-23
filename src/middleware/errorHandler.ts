import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('Error:', error);

  const status = error.status || 500;
  const message = error.message || 'Internal server error';

  res.status(status).json({
    error: {
      message,
      status,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    },
  });
}
