import { RequestHandler } from 'express';
import { ZodSchema } from 'zod';
import { ApiError } from '../utils/ApiError';

type Source = 'body' | 'params' | 'query';

/** Valida req[source] contra un esquema zod y reemplaza el valor por el parseado. */
export function validate(schema: ZodSchema, source: Source = 'body'): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
      return next(ApiError.badRequest('Datos de entrada invalidos', details));
    }
    req[source] = result.data;
    next();
  };
}
