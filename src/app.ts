import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import { swaggerSpec } from './config/swagger';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { requestHandler, sanitizeRequest } from './middleware/request.middleware';
import { getLandingPageHtml, getLoginPageHtml, verifyLandingPassword } from './utils/landing.util';
import redis from './lib/redis';

// Create Express app
const app: Express = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
    },
  },
}));

// CORS
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  })
);

// Request logging
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request handler (timing, request ID)
app.use(requestHandler);

// Sanitize request body
app.use(sanitizeRequest);

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Serve public assets (docs, images)
app.use('/public', express.static(path.join(process.cwd(), 'public')));

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve as any[], swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Nimion API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
  },
}) as any);

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API routes
app.use('/api', routes);

// Store for authenticated sessions (simple in-memory for dashboard)
const dashboardSessions = new Set<string>();

// Root endpoint - Password-protected landing page
app.get('/', (req, res) => {
  const sessionId = req.headers.cookie?.match(/dashboard_session=([^;]+)/)?.[1];
  
  // Handle logout
  if (req.query.logout === '1') {
    if (sessionId) dashboardSessions.delete(sessionId);
    res.setHeader('Set-Cookie', 'dashboard_session=; Path=/; Max-Age=0');
    res.redirect('/');
    return;
  }

  // Check if authenticated
  if (sessionId && dashboardSessions.has(sessionId)) {
    const status = {
      database: true,
      redis: redis.isReady(),
      socket: true,
    };
    res.setHeader('Content-Type', 'text/html');
    res.send(getLandingPageHtml(status));
    return;
  }

  // Show login page
  res.setHeader('Content-Type', 'text/html');
  res.send(getLoginPageHtml());
});

// Handle login POST
app.post('/', (req, res) => {
  const { password } = req.body;

  if (verifyLandingPassword(password)) {
    // Create session
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    dashboardSessions.add(sessionId);

    // Set cookie (expires in 1 hour)
    res.setHeader('Set-Cookie', `dashboard_session=${sessionId}; Path=/; Max-Age=3600; HttpOnly`);
    res.redirect('/');
  } else {
    res.setHeader('Content-Type', 'text/html');
    res.send(getLoginPageHtml('Invalid password. Please try again.'));
  }
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;

