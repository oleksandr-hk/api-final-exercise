# Dojo API

Standalone REST API application with OAuth2 authentication and JWT tokens. Built with Next.js 16 (API routes only), Prisma 7, and MariaDB/MySQL.

## Quick Start

### Prerequisites

- Node.js 20+
- MySQL or MariaDB database (see [mySqlInstall.md](mySqlInstall.md) для інструкцій із встановлення)

### Setup

```bash
# Install dependencies
npm install

# Copy environment config
cp .env.example .env
# Edit .env with your database URL and JWT secret

# Push schema to database
npm run db:push

# Seed sample data
npm run db:seed

# Start development server
npm run dev
```

### Environment Variables

Keep credentials in your local `.env` file or your CI secret store. Never commit real credentials.

| Variable         | Description                                      |
| ---------------- | ------------------------------------------------ |
| `DATABASE_URL`   | MySQL/MariaDB connection string                   |
| `JWT_SECRET`     | JWT signing secret (minimum 32 characters)        |
| `UPLOAD_DIR`     | Directory used for uploaded files                |
| `BASE_URL`       | Base URL used by the Playwright API tests         |
| `ADMIN_NAME`     | Seeded administrator name used by test fixtures   |
| `ADMIN_EMAIL`    | Seeded administrator email used by test fixtures  |
| `ADMIN_PASSWORD` | Seeded administrator password used by test fixtures |

## Connecting to the Database

You can connect to the database using any MySQL-compatible client or GUI tool.

**Default connection details** (from `.env`):

| Parameter | Value              |
| --------- | ------------------ |
| Host      | `localhost`        |
| Port      | `3306`             |
| User      | `root`             |
| Password  | _(from your .env)_ |
| Database  | `dojo_api`         |

### CLI

```bash
mysql -u root -h localhost -P 3306 dojo_api
```

### GUI Tools

Use the same connection details above in any of these tools:

- **[DBeaver](https://dbeaver.io/)** (free, cross-platform)
- **[MySQL Workbench](https://www.mysql.com/products/workbench/)** (official MySQL GUI)
- **[TablePlus](https://tableplus.com/)** (macOS/Windows/Linux)
- **[DataGrip](https://www.jetbrains.com/datagrip/)** (JetBrains, paid)

### Prisma Studio

Prisma includes a built-in database browser:

```bash
npm run db:studio
```

This opens a web UI at `http://localhost:5555` where you can browse and edit all tables.

## API Documentation

Visit **http://localhost:3000/api/docs** for interactive Swagger UI.

Import the OpenAPI spec into Postman: `GET http://localhost:3000/api/docs/spec`

## Authentication Flow

### 1. Register a user

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"John Doe\", \"email\": \"$USER_EMAIL\", \"password\": \"$USER_PASSWORD\"}"
```

### 2. Get access token (password grant)

```bash
curl -X POST http://localhost:3000/api/oauth/token \
  -H "Content-Type: application/json" \
  -d "{\"grant_type\": \"password\", \"email\": \"$USER_EMAIL\", \"password\": \"$USER_PASSWORD\"}"
```

Response:

```json
{
  "access_token": "<access-token>",
  "token_type": "Bearer",
  "expires_in": 900,
  "refresh_token": "<refresh-token>",
  "scope": "read write"
}
```

### 3. Use the access token

```bash
curl http://localhost:3000/api/oauth/userinfo \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### 4. Refresh the token

```bash
curl -X POST http://localhost:3000/api/oauth/token \
  -H "Content-Type: application/json" \
  -d "{\"grant_type\": \"refresh_token\", \"refresh_token\": \"$REFRESH_TOKEN\"}"
```

### 5. Client credentials (M2M)

```bash
curl -X POST http://localhost:3000/api/oauth/token \
  -H "Content-Type: application/json" \
  -d "{\"grant_type\": \"client_credentials\", \"client_id\": \"$CLIENT_ID\", \"client_secret\": \"$CLIENT_SECRET\"}"
```

## API Tests

The API test suite uses Playwright Test and runs directly against the HTTP API. Start the database and application before running tests locally.

### Test structure

```text
tests/
├── app/
│   ├── controllers/    # API request wrappers grouped by resource
│   └── schemas/        # Zod schemas used for response validation
├── fixtures/           # Authenticated admin, regular-user, and anonymous contexts
├── specs/              # Feature suites grouped by API domain
│   ├── admin/
│   ├── courses/
│   ├── learning-path/
│   ├── oauth/
│   ├── posts/
│   ├── promo/
│   ├── purchase/
│   ├── register/
│   └── tag/
├── test-data/          # Typed test-data definitions
├── types/              # Request and response types
├── utils/              # Data generators and shared helpers
└── *.spec.ts           # OAuth lifecycle and compatibility tests
```

`playwright.config.ts` loads the target URL from `BASE_URL`. Before the suite starts, `global.setup.ts` performs the configured global API setup. The custom fixtures create isolated regular users per Playwright worker and obtain authenticated request contexts for regular-user and administrator scenarios.

Generated authentication tokens are written under `tests/file_storage/` and are ignored by Git. Do not commit token files or credentials.

### Running tests

```bash
# Run the complete suite
npm test

# Run one tagged feature suite
npm run test:admin
npm run test:auth
npm run test:register
npm run test:oauth
npm run test:courses
npm run test:learning-paths
npm run test:posts
npm run test:promo-codes
npm run test:purchases
npm run test:tags
```

The HTML report is written to `playwright-report/`. GitHub Actions runs the same suite against an isolated MySQL service for pushes and pull requests to `main`, and it can also be started manually from the Actions tab.

## Seed Data

The seed command creates the users, OAuth client, courses, and promo codes required by the application and test suite. Credentials are intentionally not documented here; keep them in local environment configuration or a CI secret store.
