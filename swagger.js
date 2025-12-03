import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GGDevLog API 문서',
      version: '1.0.0'
    }
  },
  apis: ['./routes/*.js']
};

const specs = swaggerJSDoc(options);

export { swaggerUi, specs };
