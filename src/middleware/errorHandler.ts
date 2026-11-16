import { ErrorRequestHandler } from 'express';
import { ApiError } from '../utils/ApiError';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message, details: err.details });
  }

  // Error de clave duplicada de MongoDB (por ejemplo, alias repetido en una carrera)
  if (typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000) {
    return res.status(409).json({ message: 'El recurso ya existe' });
  }

  console.error(err);
  return res.status(500).json({ message: 'Error interno del servidor' });
};
