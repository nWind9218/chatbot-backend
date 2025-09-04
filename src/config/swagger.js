const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
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

## Getting Started
1. Register a new account or use test accounts
2. Login to get JWT tokens
3. Create organizations and invite members
4. Generate API keys for integrations
5. Start building your AI chatbot features!
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
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', description: 'User ID' },
            email: { type: 'string', format: 'email', description: 'User email' },
            firstName: { type: 'string', description: 'First name' },
            lastName: { type: 'string', description: 'Last name' },
            avatar: { type: 'string', format: 'uri', nullable: true, description: 'Avatar URL' },
            role: { type: 'string', enum: ['ADMIN', 'USER'], description: 'User role' },
            isActive: { type: 'boolean', description: 'Account status' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            lastLogin: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        Organization: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', description: 'Organization name' },
            slug: { type: 'string', description: 'URL-friendly identifier' },
            description: { type: 'string', nullable: true },
            logo: { type: 'string', format: 'uri', nullable: true },
            planType: { type: 'string', enum: ['FREE', 'BASIC', 'PRO', 'ENTERPRISE'] },
            planExpiry: { type: 'string', format: 'date-time', nullable: true },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ApiKey: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', description: 'API key name' },
            permissions: { type: 'object', description: 'Key permissions' },
            rateLimit: { type: 'integer', description: 'Requests per hour' },
            isActive: { type: 'boolean' },
            lastUsed: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            expiresAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Success message' },
            data: { type: 'object', description: 'Response data' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
              description: 'Validation errors (optional)',
            },
          },
        },
        PaginatedResponse: {
          type: 'object',
          allOf: [
            { $ref: '#/components/schemas/SuccessResponse' },
            {
              type: 'object',
              properties: {
                pagination: {
                  type: 'object',
                  properties: {
                    total: { type: 'integer', description: 'Total items' },
                    page: { type: 'integer', description: 'Current page' },
                    limit: { type: 'integer', description: 'Items per page' },
                    totalPages: { type: 'integer', description: 'Total pages' },
                    hasNext: { type: 'boolean', description: 'Has next page' },
                    hasPrev: { type: 'boolean', description: 'Has previous page' },
                  },
                },
              },
            },
          ],
        },
      },
    },
    tags: [
      {
        name: 'Health',
        description: 'System health check',
      },
      {
        name: 'Authentication',
        description: 'User authentication and profile management',
      },
      {
        name: 'Organizations',
        description: 'Multi-tenant organization management',
      },
      {
        name: 'API Keys',
        description: 'API key management for external integrations',
      },
    ],
  },
  apis: [
    './src/routes/*.js', // paths to files containing OpenAPI definitions
  ],
};

const specs = swaggerJsdoc(options);

const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
  },
  customSiteTitle: 'AI Chatbot SaaS API Docs',
  customfavIcon: '/assets/favicon.ico',
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
