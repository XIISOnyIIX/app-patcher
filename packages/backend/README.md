# FoodDealSniper Backend API

A TypeScript-based REST API for managing food deals, vendors, coupons, and user preferences.

## Features

- **Express.js** server with TypeScript
- **Prisma ORM** with SQLite for local development
- **Pino** logging with pretty output in development
- **Zod** validation for request data
- Comprehensive error handling
- Automated tests with Jest
- Database migrations and seeding

## Prerequisites

- Node.js 20+
- pnpm

## Getting Started

### Install Dependencies

```bash
pnpm install
```

### Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Default environment variables:

- `PORT=4000` - Server port
- `NODE_ENV=development` - Environment mode
- `DATABASE_URL="file:./dev.db"` - SQLite database location
- `LOG_LEVEL=info` - Logging level

### Database Setup

Run migrations and seed the database:

```bash
pnpm db:setup
```

Or run them separately:

```bash
pnpm prisma:migrate  # Run migrations
pnpm prisma:seed     # Seed database with sample data
```

### Development

Start the development server with hot-reload:

```bash
pnpm dev
```

The API will be available at `http://localhost:4000`.

### Testing

Run all tests:

```bash
pnpm test
```

Run tests in watch mode:

```bash
pnpm test:watch
```

### Production Build

Build the project:

```bash
pnpm build
```

Start the production server:

```bash
pnpm start
```

## API Endpoints

### Health Check

- `GET /health` - Health check endpoint
- `GET /` - API welcome message

### Vendors

- `GET /api/vendors` - List all active vendors
- `GET /api/vendors/:id` - Get vendor by ID
- `POST /api/vendors` - Create a new vendor
- `PUT /api/vendors/:id` - Update vendor
- `DELETE /api/vendors/:id` - Delete vendor

### Deals

- `GET /api/deals` - List all deals (supports filtering)
  - Query params: `vendorId`, `isActive`, `minDiscount`, `maxPrice`
- `GET /api/deals/active` - List only active deals
- `GET /api/deals/:id` - Get deal by ID
- `POST /api/deals` - Create a new deal
- `PUT /api/deals/:id` - Update deal
- `DELETE /api/deals/:id` - Delete deal

### User Preferences

- `GET /api/preferences/:userId` - Get user preferences
- `POST /api/preferences/:userId` - Create user preferences
- `PUT /api/preferences/:userId` - Update user preferences (upsert)
- `DELETE /api/preferences/:userId` - Delete user preferences

## Data Models

### Vendor

```typescript
{
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  category?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Deal

```typescript
{
  id: string;
  title: string;
  description: string;
  originalPrice?: number;
  discountedPrice: number;
  discountPercentage?: number;
  imageUrl?: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  vendorId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Coupon

```typescript
{
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  startDate: Date;
  endDate?: Date;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  vendorId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### User Preference

```typescript
{
  id: string;
  userId: string;
  favoriteVendors?: string; // JSON array
  preferredCategories?: string; // JSON array
  maxPrice?: number;
  minDiscount?: number;
  emailNotifications: boolean;
  pushNotifications: boolean;
  notificationFrequency: 'instant' | 'daily' | 'weekly';
  createdAt: Date;
  updatedAt: Date;
}
```

## Architecture

The application follows a layered architecture:

```
├── src/
│   ├── config/          # Configuration (env, database)
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Error handling middleware
│   ├── repositories/    # Data access layer
│   ├── routes/          # Route definitions
│   ├── services/        # Business logic
│   ├── utils/           # Utilities (logger)
│   └── index.ts         # Application entry point
├── tests/
│   ├── repositories/    # Repository tests
│   └── services/        # Service tests
└── prisma/
    ├── schema.prisma    # Database schema
    ├── migrations/      # Database migrations
    └── seed.ts          # Database seed script
```

## Scripts

- `pnpm build` - Build the TypeScript project
- `pnpm dev` - Start development server with hot-reload
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm test` - Run tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm prisma:generate` - Generate Prisma Client
- `pnpm prisma:migrate` - Run database migrations
- `pnpm prisma:seed` - Seed database with sample data
- `pnpm db:setup` - Run migrations and seed database

## Error Handling

The API uses a centralized error handling system:

- **400 Bad Request** - Validation errors (Zod)
- **404 Not Found** - Resource not found
- **409 Conflict** - Resource already exists
- **500 Internal Server Error** - Unexpected errors

All errors return JSON in the format:

```json
{
  "status": "error",
  "message": "Error description",
  "errors": [] // Optional validation errors
}
```

## Logging

The application uses Pino for structured logging:

- Development: Pretty-printed colored logs
- Production: JSON logs for machine parsing

Log levels: `debug`, `info`, `warn`, `error`
