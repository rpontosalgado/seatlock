# SeatLock

Distributed cinema ticket sales system with concurrency-safe seat reservations. Guaranteed no double-booking under high concurrency.

## Quick Start

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Start infrastructure
docker-compose up -d

# Run migrations
npx prisma migrate dev --name init

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
│   └── seed.ts                # Sample data
├── src/
│   ├── main.ts                # Entry point
│   ├── app.module.ts          # Root module
│   ├── config/                # Environment configuration
│   ├── database/              # PrismaService + PrismaModule
│   ├── sessions/              # Session CRUD + seat generation
│   ├── reservations/          # Two-phase locking reservation logic
│   ├── payments/              # Payment confirmation
│   ├── cache/                 # Redis + DistributedLockService
│   ├── events/                # Kafka producers, DLQ consumer
│   ├── expiry-worker/         # Background reservation expiry sweep
│   ├── logger/                # Structured JSON logger
│   └── health/               # Health check endpoint
└── test/
    ├── fixtures/              # Test helpers
    ├── integration/           # Integration tests
    ├── concurrency/           # Concurrency tests
    └── e2e/                   # End-to-end tests
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
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run lint` | Lint and fix |
| `npm run migrate:deploy` | Run Prisma migrations |

## Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/) enforced by:

- **Commitlint** — validates commit message format
- **Husky** — runs hooks on `commit-msg` and `prepare-commit-msg`
- **Commitizen** — interactive prompt via `git commit`

## License

Private