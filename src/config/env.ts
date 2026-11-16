import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGO_URI: z.string().url().default('mongodb://127.0.0.1:27017/linkshort'),
  BASE_URL: z.string().url().default('http://localhost:4000'),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(30),
});

export const env = envSchema.parse(process.env);
