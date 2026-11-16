import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

export const createLinkLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'test',
  message: { message: 'Demasiadas solicitudes, intenta de nuevo en unos minutos' },
});
