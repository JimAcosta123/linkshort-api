const codeParam = { name: 'code', in: 'path', required: true, schema: { type: 'string' } };

export const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'LinkShort API',
    version: '1.0.0',
    description: 'Acortador de URLs con estadisticas de clics. Proyecto de portafolio.',
  },
  paths: {
    '/api/links': {
      post: {
        summary: 'Crea un enlace corto',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['url'],
                properties: {
                  url: { type: 'string', example: 'https://developer.mozilla.org/es/docs/Web/JavaScript' },
                  alias: { type: 'string', example: 'mdn-js' },
                  expiresAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Enlace creado' },
          '400': { description: 'Datos invalidos' },
          '409': { description: 'Alias en uso' },
        },
      },
      get: {
        summary: 'Lista enlaces (paginado)',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/links/{code}/stats': {
      get: {
        summary: 'Estadisticas de un enlace',
        parameters: [codeParam],
        responses: { '200': { description: 'OK' }, '404': { description: 'No encontrado' } },
      },
    },
    '/api/links/{code}': {
      delete: {
        summary: 'Elimina un enlace',
        parameters: [codeParam],
        responses: { '204': { description: 'Eliminado' }, '404': { description: 'No encontrado' } },
      },
    },
    '/{code}': {
      get: {
        summary: 'Redirige a la URL original y registra el clic',
        parameters: [codeParam],
        responses: {
          '302': { description: 'Redireccion' },
          '404': { description: 'No encontrado' },
          '410': { description: 'Expirado' },
        },
      },
    },
  },
};
