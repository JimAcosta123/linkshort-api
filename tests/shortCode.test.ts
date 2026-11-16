import { generateShortCode, ALIAS_REGEX } from '../src/utils/shortCode';

describe('generateShortCode', () => {
  it('genera codigos de la longitud pedida y solo con caracteres base62', () => {
    for (let i = 0; i < 100; i++) {
      const code = generateShortCode(7);
      expect(code).toHaveLength(7);
      expect(code).toMatch(/^[A-Za-z0-9]+$/);
    }
  });

  it('genera codigos distintos entre si', () => {
    const codes = new Set(Array.from({ length: 500 }, () => generateShortCode()));
    expect(codes.size).toBe(500);
  });
});

describe('ALIAS_REGEX', () => {
  it.each(['abc', 'mi-enlace', 'promo_2025', 'A1b2C3'])('acepta "%s"', (alias) => {
    expect(ALIAS_REGEX.test(alias)).toBe(true);
  });

  it.each(['ab', 'con espacio', 'tiene/slash', 'a'.repeat(31)])('rechaza "%s"', (alias) => {
    expect(ALIAS_REGEX.test(alias)).toBe(false);
  });
});
