# SeatLock

Distributed cinema ticket sales system with concurrency-safe seat reservations. Guaranteed no double-booking under high concurrency.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start infrastructure (PostgreSQL, Redis, Kafka)
docker compose up -d postgres redis zookeeper kafka

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed the database
npx prisma db seed

# Start development server
npm run start:dev
```

## Architecture

```
Client → NestJS API → PostgreSQL (source of truth)
                     → Redis (distributed locks + cache)
                     → Kafka (event bus + DLQ)
```

### Two-Phase Locking

1. **Optimistic fast path (Redis)**: `SET seat:{id} {reservationId} NX EX 35` — rejects contended seats in sub-ms
2. **Pessimistic write path (PostgreSQL)**: `SELECT ... FOR UPDATE ORDER BY id` — ACID guarantees with deadlock prevention

### Key Features

- 30-second reservation expiry with background sweep worker
- Idempotent reservation requests via `idempotency_key`
- Kafka event bus with dead-letter queues and exponential backoff
- Structured JSON logging (DEBUG, INFO, WARN, ERROR)
- Conventional Commits enforced via Husky + Commitlint + Commitizen

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/sessions` | Create a session |
| GET | `/sessions/:id` | Get session details |
| GET | `/sessions/:id/seats` | List seat availability |
| POST | `/reservations` | Reserve seats |
| GET | `/reservations/:id` | Get reservation status |
| DELETE | `/reservations/:id` | Cancel reservation |
| POST | `/payments` | Confirm payment |
| GET | `/users/:id/purchases` | List user purchases |
| GET | `/health` | Health check |

## Project Structure

```
seatlock/
├── docker-compose.yml
├── Dockerfile
├── prisma/
│   ├── schema.prisma          # Database schema (single source of truth)
│   ├── seed.ts                # Sample data
│   └── migrations/            # Prisma migrations
├── src/
│   ├── main.ts                # Entry point
│   ├── app.module.ts          # Root module
│   ├── config/                # Environment configuration
│   ├── database/              # PrismaService + PrismaModule + test mocks
│   ├── sessions/              # Session CRUD + seat generation
│   ├── reservations/          # Two-phase locking reservation logic
│   ├── payments/              # Payment confirmation
│   ├── cache/                 # Redis + DistributedLockService
│   ├── events/                # Kafka producers, DLQ consumer
│   ├── expiry-worker/         # Background reservation expiry sweep
│   ├── logger/                # Structured JSON logger
│   └── health/                # Health check endpoint
└── test/
    ├── integration/           # Integration tests (need Docker)
    ├── concurrency/           # Concurrency tests (need Docker)
    └── e2e/                   # End-to-end tests (need Docker)
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://seatlock:seatlock@localhost:5432/seatlock` | PostgreSQL connection |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection |
| `KAFKA_BROKERS` | `localhost:9092` | Kafka broker list |
| `LOG_LEVEL` | `info` | Log level (debug, info, warn, error) |
| `PORT` | `3000` | HTTP server port |

## Scripts

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Start dev server with watch |
| `npm run build` | Build for production |
| `npm test` | Run unit tests (no Docker needed) |
| `npm run test:integration` | Run integration tests (needs Docker) |
| `npm run test:e2e` | Run end-to-end tests (needs Docker) |
| `npm run test:concurrency` | Run concurrency tests (needs Docker) |
| `npm run test:all` | Run all test suites |
| `npm run lint` | Lint and fix |
| `npm run migrate:deploy` | Run Prisma migrations |
| `npx prisma db seed` | Seed the database |

## Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/) enforced by:

- **Commitlint** — validates commit message format
- **Husky** — runs hooks on `commit-msg` and `prepare-commit-msg`
- **Commitizen** — interactive prompt via `git commit`

## License

Private