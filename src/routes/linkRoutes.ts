import { Router } from 'express';
import * as controller from '../controllers/linkController';
import { validate } from '../middleware/validate';
import { createLinkLimiter } from '../middleware/rateLimiter';

export const linkRouter = Router();

linkRouter.post('/', createLinkLimiter, validate(controller.createLinkSchema), controller.create);
linkRouter.get('/', validate(controller.listQuerySchema, 'query'), controller.list);
linkRouter.get('/:code/stats', validate(controller.codeParamSchema, 'params'), controller.stats);
linkRouter.delete('/:code', validate(controller.codeParamSchema, 'params'), controller.remove);

export const redirectRouter = Router();
redirectRouter.get('/:code', validate(controller.codeParamSchema, 'params'), controller.redirect);
