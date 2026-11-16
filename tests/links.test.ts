process.env.NODE_ENV = 'test';

import request from 'supertest';
import { createApp } from '../src/app';
import { connectDB, disconnectDB } from '../src/config/db';
import { Link } from '../src/models/Link';

const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/linkshort_test';

const app = createApp();

beforeAll(async () => {
  await connectDB(MONGO_URI);
});

beforeEach(async () => {
  await Link.deleteMany({});
});

afterAll(async () => {
  await Link.deleteMany({});
  await disconnectDB();
});

describe('POST /api/links', () => {
  it('crea un enlace con codigo aleatorio', async () => {
    const res = await request(app).post('/api/links').send({ url: 'https://example.com/pagina' });

    expect(res.status).toBe(201);
    expect(res.body.shortCode).toMatch(/^[A-Za-z0-9]{7}$/);
    expect(res.body.shortUrl).toContain(res.body.shortCode);
    expect(res.body.originalUrl).toBe('https://example.com/pagina');
    expect(res.body.clicks).toBe(0);
  });

  it('crea un enlace con alias personalizado', async () => {
    const res = await request(app).post('/api/links').send({ url: 'https://example.com', alias: 'mi-alias' });
    expect(res.status).toBe(201);
    expect(res.body.shortCode).toBe('mi-alias');
  });

  it('responde 409 si el alias ya existe', async () => {
    await request(app).post('/api/links').send({ url: 'https://example.com', alias: 'repetido' });
    const res = await request(app).post('/api/links').send({ url: 'https://otro.com', alias: 'repetido' });
    expect(res.status).toBe(409);
  });

  it('responde 400 ante una URL invalida', async () => {
    const res = await request(app).post('/api/links').send({ url: 'esto-no-es-url' });
    expect(res.status).toBe(400);
    expect(res.body.details[0].path).toBe('url');
  });

  it('responde 400 si la URL no es http/https', async () => {
    const res = await request(app).post('/api/links').send({ url: 'ftp://example.com/archivo' });
    expect(res.status).toBe(400);
  });

  it('responde 400 si la fecha de expiracion esta en el pasado', async () => {
    const res = await request(app)
      .post('/api/links')
      .send({ url: 'https://example.com', expiresAt: '2000-01-01T00:00:00Z' });
    expect(res.status).toBe(400);
  });
});

describe('GET /:code (redireccion)', () => {
  it('redirige a la URL original y cuenta el clic', async () => {
    const created = await request(app).post('/api/links').send({ url: 'https://example.com/destino' });
    const code = created.body.shortCode;

    const redirect = await request(app).get('/' + code).set('User-Agent', 'jest-test');
    expect(redirect.status).toBe(302);
    expect(redirect.headers.location).toBe('https://example.com/destino');

    const stats = await request(app).get('/api/links/' + code + '/stats');
    expect(stats.status).toBe(200);
    expect(stats.body.clicks).toBe(1);
    expect(stats.body.lastClicks).toHaveLength(1);
    expect(stats.body.lastClicks[0].userAgent).toBe('jest-test');
  });

  it('responde 404 si el codigo no existe', async () => {
    const res = await request(app).get('/noexiste');
    expect(res.status).toBe(404);
  });

  it('responde 410 si el enlace expiro', async () => {
    await Link.create({
      shortCode: 'vencido',
      originalUrl: 'https://example.com',
      expiresAt: new Date(Date.now() - 1000),
    });
    const res = await request(app).get('/vencido');
    expect(res.status).toBe(410);
  });
});

describe('GET /api/links', () => {
  it('lista los enlaces paginados, del mas reciente al mas antiguo', async () => {
    for (let i = 1; i <= 12; i++) {
      await request(app).post('/api/links').send({ url: 'https://example.com/' + i });
    }
    const res = await request(app).get('/api/links?page=1&limit=5');

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(5);
    expect(res.body.total).toBe(12);
    expect(res.body.pages).toBe(3);
    expect(res.body.items[0].originalUrl).toBe('https://example.com/12');
  });
});

describe('DELETE /api/links/:code', () => {
  it('elimina un enlace existente', async () => {
    const created = await request(app).post('/api/links').send({ url: 'https://example.com' });
    const res = await request(app).delete('/api/links/' + created.body.shortCode);
    expect(res.status).toBe(204);

    const after = await request(app).get('/api/links/' + created.body.shortCode + '/stats');
    expect(after.status).toBe(404);
  });

  it('responde 404 si no existe', async () => {
    const res = await request(app).delete('/api/links/nada123');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/health', () => {
  it('responde ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
