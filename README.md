# LinkShort API — Acortador de URLs con estadisticas

[![CI](https://github.com/JimAcosta123/linkshort-api/actions/workflows/ci.yml/badge.svg)](https://github.com/JimAcosta123/linkshort-api/actions)

API REST que acorta URLs, redirige al destino original y registra estadisticas de clics. Construida con **Node.js, TypeScript, Express y MongoDB**, con pruebas automatizadas, Docker y un pipeline de integracion continua en GitHub Actions.

## Funcionalidades

- Crear enlaces cortos con codigo aleatorio (base62) o **alias personalizado**.
- Enlaces con **fecha de expiracion** opcional (responde `410 Gone` al vencer).
- Redireccion `302` al destino y registro de clics (fecha, referrer, user-agent).
- Endpoint de **estadisticas** por enlace y listado **paginado**.
- Validacion de entrada con **Zod**, manejo centralizado de errores y **rate limiting** por IP.
- Cabeceras de seguridad con Helmet y documentacion **OpenAPI/Swagger** en `/api/docs`.
- **23 pruebas** (unitarias e integracion) con Jest + Supertest.
- Imagen Docker multi-etapa y `docker-compose` con MongoDB incluido.

## Stack tecnico

Node.js 20+, TypeScript 5, Express 4, MongoDB + Mongoose 8, Zod, Jest, Supertest, ESLint 9, Docker, GitHub Actions.

## Estructura

```
src/
├── config/        # variables de entorno validadas (zod) y conexion a MongoDB
├── controllers/   # esquemas de validacion + handlers HTTP
├── docs/          # especificacion OpenAPI
├── middleware/    # validate (zod), errorHandler, rateLimiter
├── models/        # esquema Mongoose Link
├── routes/        # rutas Express
├── services/      # logica de negocio (crear, resolver, estadisticas)
├── utils/         # ApiError, generador de codigos
├── app.ts         # fabrica de la app (usada por tests y servidor)
└── server.ts      # punto de entrada
tests/             # pruebas Jest
```

## Como correrlo en local

### Requisitos
- Node.js 20+
- MongoDB 6+ corriendo en local (o una URI de MongoDB Atlas)

### Pasos
```bash
cp .env.example .env     # ajusta MONGO_URI si hace falta
npm install
npm run dev              # http://localhost:4000
```

- Documentacion Swagger: http://localhost:4000/api/docs
- Health check: http://localhost:4000/api/health

### Con Docker (no requiere instalar Node ni MongoDB)
```bash
docker compose up --build
```

### Pruebas y calidad
```bash
npm test                 # pruebas (usa la base linkshort_test)
npm run test:coverage    # pruebas + cobertura
npm run lint             # ESLint
npm run typecheck        # verificacion de tipos
npm run build            # compila a dist/
```

## Endpoints

| Metodo | Ruta                      | Descripcion                                   |
|--------|---------------------------|-----------------------------------------------|
| POST   | /api/links                | Crea un enlace `{ url, alias?, expiresAt? }`  |
| GET    | /api/links?page=&limit=   | Lista enlaces paginados                        |
| GET    | /api/links/:code/stats    | Estadisticas y ultimos clics de un enlace      |
| DELETE | /api/links/:code          | Elimina un enlace                              |
| GET    | /:code                    | Redirige al destino y registra el clic         |
| GET    | /api/health               | Estado del servicio                            |

### Ejemplo
```bash
curl -X POST http://localhost:4000/api/links \
  -H "Content-Type: application/json" \
  -d '{"url":"https://developer.mozilla.org/es/docs/Web/JavaScript","alias":"mdn-js"}'
# -> { "shortCode": "mdn-js", "shortUrl": "http://localhost:4000/mdn-js", ... }
```

## Decisiones de diseño

- `app.ts` separa la creacion de la app del arranque del servidor, lo que permite probarla con Supertest sin abrir puertos.
- Solo se guardan los ultimos 20 clics por enlace (`$slice`) para que el documento no crezca sin limite; el contador total si se mantiene siempre.
- La generacion del codigo usa `crypto.randomInt` y reintenta ante una colision, en lugar de confiar en un contador secuencial predecible.
- Las variables de entorno se validan al arrancar: si falta algo, la app falla rapido con un mensaje claro.

## Posibles mejoras

- Autenticacion para que cada usuario administre solo sus enlaces.
- Cache en Redis para las redirecciones mas frecuentes.
- Panel web con graficos de clics por dia.

---
Proyecto de portafolio de Jim Kleber Acosta Acosta, Desarrollador de Software (SENATI).
