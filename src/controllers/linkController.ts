import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as linkService from '../services/linkService';
import { ALIAS_REGEX } from '../utils/shortCode';
import { env } from '../config/env';
import { ILink } from '../models/Link';

const HTTP_REGEX = /^https?:\/\//i;

export const createLinkSchema = z.object({
  url: z
    .string()
    .url('Debe ser una URL valida (incluye http:// o https://)')
    .refine((u) => HTTP_REGEX.test(u), 'Solo se permiten URLs http o https'),
  alias: z.string().regex(ALIAS_REGEX, 'Alias invalido: 3-30 caracteres alfanumericos, guion o guion bajo').optional(),
  expiresAt: z.coerce
    .date()
    .refine((d) => d.getTime() > Date.now(), 'La fecha de expiracion debe ser futura')
    .optional(),
});

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const codeParamSchema = z.object({
  code: z.string().regex(ALIAS_REGEX, 'Codigo invalido'),
});

function toResponse(link: ILink) {
  return {
    shortCode: link.shortCode,
    shortUrl: env.BASE_URL + '/' + link.shortCode,
    originalUrl: link.originalUrl,
    clicks: link.clicks,
    expiresAt: link.expiresAt ?? null,
    createdAt: link.createdAt,
  };
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const link = await linkService.createLink(req.body);
    res.status(201).json(toResponse(link));
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const result = await linkService.listLinks(page, limit);
    res.json({ ...result, items: result.items.map(toResponse) });
  } catch (err) {
    next(err);
  }
}

export async function stats(req: Request, res: Response, next: NextFunction) {
  try {
    const link = await linkService.getLinkOrFail(req.params.code);
    res.json({
      ...toResponse(link),
      expired: linkService.isExpired(link),
      lastClicks: link.lastClicks,
    });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await linkService.deleteLink(req.params.code);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function redirect(req: Request, res: Response, next: NextFunction) {
  try {
    const url = await linkService.resolveAndTrack(req.params.code, {
      referrer: req.get('referer'),
      userAgent: req.get('user-agent'),
    });
    res.redirect(302, url);
  } catch (err) {
    next(err);
  }
}
