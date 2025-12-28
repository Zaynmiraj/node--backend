# Nimion Backend API

A production-ready Node.js backend built with TypeScript, Express.js, Prisma ORM, Socket.io, and Redis.

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![License](https://img.shields.io/badge/License-ISC-yellow)

## Features

- 🚀 **TypeScript** - Type-safe development
- 🔐 **JWT & API Key Auth** - Multiple authentication methods
- 📊 **Prisma ORM** - MySQL database with migrations
- ⚡ **Socket.io** - Real-time communication
- 🗄️ **Redis** - Request caching
- 📝 **Swagger UI** - API documentation
- ✅ **Joi Validation** - Request validation
- 📁 **Multer** - File uploads
- 🛡️ **Helmet & CORS** - Security middleware

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Express.js | Web framework |
| TypeScript | Type safety |
| Prisma | ORM for MySQL |
| Socket.io | Real-time events |
| Redis | Caching |
| JWT | Authentication |
| Swagger | API docs |

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma       # Database schema
├── public/
│   ├── docs/               # Documentation files
│   └── images/             # Static images
├── src/
│   ├── config/             # Configuration
│   ├── controllers/        # Request handlers
│   ├── helpers/            # Response helpers
│   ├── lib/                # Prisma & Redis clients
│   ├── middleware/         # Auth, cache, validation
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── socket/             # Socket.io handlers
│   ├── types/              # TypeScript types
│   ├── utils/              # Utility functions
│   ├── app.ts              # Express app
│   └── server.ts           # Server entry
├── .env.example            # Environment template
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- Redis 6+
- Yarn or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:Zaynmiraj/node--backend.git
   cd node--backend
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your credentials:
   ```env
   DATABASE_URL="mysql://user:password@localhost:3306/nimion_db"
   REDIS_URL="redis://localhost:6379"
   JWT_SECRET="your-secret-key"
   API_KEY="your-api-key"
   ```

4. **Setup database**
   ```bash
   # Generate Prisma client
   yarn prisma generate

   # Push schema to database
   yarn prisma db push

   # Or run migrations
   yarn prisma migrate dev
   ```

5. **Start development server**
   ```bash
   yarn dev
   # or with nodemon
   yarn dev:nodemon
   ```

6. **Access the server**
   - Dashboard: http://localhost:3000 (password: `nimion2025`)
   - API Docs: http://localhost:3000/api-docs
   - Health: http://localhost:3000/api/health

## Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start with ts-node-dev (hot reload) |
| `yarn dev:nodemon` | Start with nodemon |
| `yarn build` | Build for production |
| `yarn start` | Run production build |
| `yarn prisma:generate` | Generate Prisma client |
| `yarn prisma:migrate` | Run database migrations |
| `yarn prisma:studio` | Open Prisma Studio |

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register user |
| POST | `/api/users/login` | Login user |
| POST | `/api/admin/login` | Login admin |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get profile |
| PUT | `/api/users/profile` | Update profile |
| GET | `/api/users` | List users (admin) |

### Roles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/roles` | List roles |
| POST | `/api/roles` | Create role |
| PUT | `/api/roles/:id` | Update role |
| DELETE | `/api/roles/:id` | Delete role |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get statistics |
| GET | `/api/dashboard/overview` | System overview |

## Authentication

### JWT Token
```bash
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/users/profile
```

### API Key
```bash
curl -H "X-API-Key: <api-key>" http://localhost:3000/api/users
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | development |
| `PORT` | Server port | 3000 |
| `DATABASE_URL` | MySQL connection | - |
| `REDIS_URL` | Redis connection | redis://localhost:6379 |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRES_IN` | Token expiry | 7d |
| `API_KEY` | API key for services | - |
| `CORS_ORIGIN` | Allowed origins | http://localhost:3000 |
| `CACHE_TTL` | Cache TTL (seconds) | 3600 |

## License

ISC © Nimion
