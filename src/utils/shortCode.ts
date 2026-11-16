import { randomInt } from 'node:crypto';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/** Genera un codigo corto aleatorio en base62 (seguro criptograficamente). */
export function generateShortCode(length = 7): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += ALPHABET[randomInt(ALPHABET.length)];
  }
  return code;
}

/** Un alias valido tiene entre 3 y 30 caracteres alfanumericos, guion o guion bajo. */
export const ALIAS_REGEX = /^[A-Za-z0-9_-]{3,30}$/;
