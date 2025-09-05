const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const config = require('./index');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Chatbot SaaS API',
      version: '1.0.0',
      description: `
# AI Chatbot SaaS Backend API

A comprehensive SaaS backend built with Express.js, PostgreSQL, and Prisma.

## Features
- 🔐 JWT Authentication with refresh tokens
- 🏢 Multi-tenant organization management
- 🔑 API key management for external integrations
- 👥 Role-based access control
- 🛡️ Security features (rate limiting, CORS, helmet)
- 📊 Database ORM with Prisma

## Authentication
Most endpoints require a JWT token in the Authorization header:
\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`

Or you can use API keys:
\`\`\`
X-API-Key: <your_api_key>
\`\`\`

## Test Accounts
After running \`npm run db:seed\`:
- **Admin**: admin@example.com / admin123456
- **User1**: user1@example.com / user123456  
- **User2**: user2@example.com / user123456
      `,
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
      license: {
        name: 'ISC',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.PORT}${config.API_PREFIX}/${config.API_VERSION}`,
        description: 'Development server',
      },
      {
        url: `https://your-api.com${config.API_PREFIX}/${config.API_VERSION}`,
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from login endpoint',
        },
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'Enter your API key',
        },
      },
      schemas: {
        // TODO: Thêm User, Organization, ApiKey, SuccessResponse, ErrorResponse, PaginatedResponse
      },
    },
    tags: [
      { name: 'Health', description: 'System health check' },
      { name: 'Authentication', description: 'User authentication and profile management' },
      { name: 'Organizations', description: 'Multi-tenant organization management' },
      { name: 'API Keys', description: 'API key management for external integrations' },
    ],
  },
  // 👇 đảm bảo cross-platform, match với cấu trúc project
  apis: [path.resolve(__dirname, '../routes/*.js')],
};

const specs = swaggerJsdoc(options);

const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none', // collapse tags by default
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
  },
  customSiteTitle: 'AI Chatbot SaaS API Docs',
  // ⚠️ favicon cần serve static (nếu chưa có thì bỏ dòng này đi)
  // customfavIcon: '/favicon.ico',
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #2563eb; }
    .swagger-ui .scheme-container { background: #f8fafc; border: 1px solid #e2e8f0; }
  `,
};

module.exports = {
  specs,
  swaggerUi,
  swaggerOptions,
};
