import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { linkRouter, redirectRouter } from './routes/linkRoutes';
import { errorHandler } from './middleware/errorHandler';
import { openapiSpec } from './docs/openapi';
import { env } from './config/env';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  if (env.NODE_ENV !== 'test') app.use(morgan('dev'));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'linkshort-api' }));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
  app.use('/api/links', linkRouter);
  app.use('/', redirectRouter);

  app.use((_req, res) => res.status(404).json({ message: 'Ruta no encontrada' }));
  app.use(errorHandler);

  return app;
}
