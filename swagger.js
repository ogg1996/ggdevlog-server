import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: auth
 */

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GGDevLog API Docs',
      version: '1.0.0'
    }
  },
  apis: ['./routes/*.js']
};

const specs = swaggerJSDoc(options);

export { swaggerUi, specs };
