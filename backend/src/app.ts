import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { logger } from './config/logger';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Basic Security & CORS Settings
app.use(helmet());
app.use(
  cors({
    origin: '*', // For local testing. In production, configure to matching domains
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate Limiting (to satisfy security & scalability criteria)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per window
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Parse JSON request bodies
app.use(express.json());

// Log HTTP Requests
app.use((req, res, next) => {
  logger.info(`[${req.method}] ${req.originalUrl} - IP: ${req.ip}`);
  next();
});

// Swagger/OpenAPI 3.0 Documentation Object
// Using direct specification mapping to guarantee robustness and eliminate file parsing bugs.
const openApiDocs = {
  openapi: '3.0.0',
  info: {
    title: 'Primetrade.ai Watchlist REST API',
    version: '1.0.0',
    description: 'Secure, scalable REST API featuring user authentication, role-based access, and a cryptocoin watchlist management dashboard.',
    contact: {
      name: 'Primetrade.ai Hiring Team',
      email: 'hiring@primetrade.ai',
    },
  },
  servers: [
    {
      url: `http://localhost:${PORT}/api/v1`,
      description: 'Local development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error description message' },
        },
      },
      ValidationError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation failed' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'email' },
                message: { type: 'string', example: 'Invalid email address' },
              },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '2a14e9f7-7b19-4a9a-9b1a-28394017e8c3' },
          email: { type: 'string', example: 'trader@primetrade.ai' },
          name: { type: 'string', example: 'John Trader' },
          role: { type: 'string', example: 'USER', enum: ['USER', 'ADMIN'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      WatchlistItem: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '8df9a8fa-71ea-4f01-9a7b-3b3fb34e1cba' },
          symbol: { type: 'string', example: 'BTC' },
          name: { type: 'string', example: 'Bitcoin' },
          amount: { type: 'number', example: 1.45 },
          purchasePrice: { type: 'number', example: 68500.5 },
          note: { type: 'string', example: 'Buy signal confirmed on weekly chart' },
          userId: { type: 'string', example: '2a14e9f7-7b19-4a9a-9b1a-28394017e8c3' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        summary: 'Register a new user',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'trader@primetrade.ai' },
                  password: { type: 'string', format: 'password', example: 'securePassword123' },
                  name: { type: 'string', example: 'John Trader' },
                  role: { type: 'string', example: 'USER', enum: ['USER', 'ADMIN'] },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User successfully created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'User registered successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Validation or conflict error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } } },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Authenticate a user & obtain JWT token',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'trader@primetrade.ai' },
                  password: { type: 'string', format: 'password', example: 'securePassword123' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Authentication successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Login successful' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } } },
          401: { description: 'Invalid email or password', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/watchlist': {
      get: {
        summary: 'Retrieve all watchlist items for the authenticated user',
        tags: ['Watchlist CRUD'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of watchlist items',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/WatchlistItem' } },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized access', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
      post: {
        summary: 'Create a new coin watchlist item',
        tags: ['Watchlist CRUD'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['symbol', 'name', 'amount', 'purchasePrice'],
                properties: {
                  symbol: { type: 'string', example: 'SOL' },
                  name: { type: 'string', example: 'Solana' },
                  amount: { type: 'number', example: 15.6 },
                  purchasePrice: { type: 'number', example: 145.25 },
                  note: { type: 'string', example: 'DCA support entry' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Item created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Watchlist item created successfully' },
                    data: { $ref: '#/components/schemas/WatchlistItem' },
                  },
                },
              },
            },
          },
          400: { description: 'Input validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } } },
          401: { description: 'Unauthorized access', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/watchlist/{id}': {
      get: {
        summary: 'Fetch detailed single watchlist item by id',
        tags: ['Watchlist CRUD'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, description: 'ID of the watchlist item', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Detailed Watchlist Item data',
            content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/WatchlistItem' } } } } },
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          403: { description: 'Access Forbidden (Item belongs to other user)', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          404: { description: 'Watchlist item not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
      put: {
        summary: 'Update details of a watchlist item',
        tags: ['Watchlist CRUD'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, description: 'ID of the watchlist item', schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  amount: { type: 'number', example: 18.2 },
                  purchasePrice: { type: 'number', example: 142.1 },
                  note: { type: 'string', example: 'Added to spot bag on local support' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Item updated successfully',
            content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, message: { type: 'string', example: 'Watchlist item updated successfully' }, data: { $ref: '#/components/schemas/WatchlistItem' } } } } },
          },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
      delete: {
        summary: 'Remove a watchlist item',
        tags: ['Watchlist CRUD'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, description: 'ID of the watchlist item to delete', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Item successfully deleted',
            content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, message: { type: 'string', example: 'Watchlist item deleted successfully' } } } } },
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          404: { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/watchlist/admin/stats': {
      get: {
        summary: 'Admin dashboard analytical intelligence aggregator',
        tags: ['Admin System'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Aggregate platform analytics & user management overview',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        totalUsers: { type: 'integer', example: 5 },
                        totalItems: { type: 'integer', example: 12 },
                        totalPortfolioValue: { type: 'number', example: 104500.5 },
                        users: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              email: { type: 'string' },
                              name: { type: 'string' },
                              role: { type: 'string' },
                              createdAt: { type: 'string' },
                              _count: { type: 'object', properties: { watchlist: { type: 'integer' } } },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          403: { description: 'Forbidden (Requires ADMIN role privilege)', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
  },
};

// Route Docs mounting
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocs));

// Mount REST router under v1
app.use('/api/v1', routes);

// Global Error Handler middleware (always at bottom)
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  logger.info(`📄 API Docs mounted at http://localhost:${PORT}/api-docs`);
});

export default app;
