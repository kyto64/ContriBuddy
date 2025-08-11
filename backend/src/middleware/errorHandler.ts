import type { Request, Response, NextFunction } from 'express'

export interface AppError extends Error {
  statusCode?: number
  status?: string
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = error.statusCode || 500
  const status = error.status || 'error'

  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  })

  res.status(statusCode).json({
    status,
    message: statusCode === 500 ? 'Internal server error' : error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  })
}
