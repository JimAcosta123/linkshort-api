import { Link, ILink } from '../models/Link';
import { ApiError } from '../utils/ApiError';
import { generateShortCode } from '../utils/shortCode';

const MAX_STORED_CLICKS = 20;
const MAX_CODE_ATTEMPTS = 5;

export interface CreateLinkInput {
  url: string;
  alias?: string;
  expiresAt?: Date;
}

export interface ClickInfo {
  referrer?: string;
  userAgent?: string;
}

export async function createLink(input: CreateLinkInput): Promise<ILink> {
  if (input.alias) {
    const exists = await Link.exists({ shortCode: input.alias });
    if (exists) throw ApiError.conflict('El alias "' + input.alias + '" ya esta en uso');
    return Link.create({ shortCode: input.alias, originalUrl: input.url, expiresAt: input.expiresAt });
  }

  // Reintenta ante la (muy improbable) colision de un codigo aleatorio
  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
    const shortCode = generateShortCode();
    const exists = await Link.exists({ shortCode });
    if (!exists) {
      return Link.create({ shortCode, originalUrl: input.url, expiresAt: input.expiresAt });
    }
  }
  throw new ApiError(500, 'No se pudo generar un codigo unico, intenta de nuevo');
}

export async function getLinkOrFail(shortCode: string): Promise<ILink> {
  const link = await Link.findOne({ shortCode });
  if (!link) throw ApiError.notFound('Enlace no encontrado');
  return link;
}

export function isExpired(link: ILink, now = new Date()): boolean {
  return Boolean(link.expiresAt && link.expiresAt.getTime() <= now.getTime());
}

/** Devuelve la URL original y registra el clic. Lanza 410 si el enlace expiro. */
export async function resolveAndTrack(shortCode: string, click: ClickInfo): Promise<string> {
  const link = await getLinkOrFail(shortCode);
  if (isExpired(link)) throw ApiError.gone('Este enlace ha expirado');

  await Link.updateOne(
    { _id: link._id },
    {
      $inc: { clicks: 1 },
      $push: {
        lastClicks: {
          $each: [{ at: new Date(), referrer: click.referrer, userAgent: click.userAgent }],
          $slice: -MAX_STORED_CLICKS,
        },
      },
    },
  );

  return link.originalUrl;
}

export async function listLinks(page: number, limit: number) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Link.find().sort({ createdAt: -1 }).skip(skip).limit(limit).select('-lastClicks'),
    Link.countDocuments(),
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function deleteLink(shortCode: string): Promise<void> {
  const result = await Link.deleteOne({ shortCode });
  if (result.deletedCount === 0) throw ApiError.notFound('Enlace no encontrado');
}
