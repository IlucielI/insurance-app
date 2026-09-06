# Insurance App (Customer Portal)

Digital Insurance Application & Customer Self-Service Portal for policy submission, premium simulation, and document tracking.

## Scope

This portal provides customer-facing insurance capabilities integrated with `insurance-core-api`:

- **Digital Policy Application**: Streamlined step-by-step submission flow with OCR identity extraction, income verification, and medical questionnaires.
- **Actuarial Premium Simulation**: Instant calculation of monthly/annual premiums based on age, coverage terms, and product tier.
- **Application & Claim Tracking**: Real-time status visibility across the 4-Pillar underwriting pipeline (Identity, DSR, Medical, Legal).
- **RFI Document Upload Center**: Secure upload portal for requested additional documents when underwriting flags an application.
- **e-Policy Digital Wallet**: Downloadable official OJK-registered PDF policy certificates with cryptographic QR code validation.
- **System Health & Observability**: Real-time telemetry endpoint matching Go backend specifications (`/health`).

## Architecture

The project is structured with strict separation of concerns combining **Clean Architecture** on the server layer and **Atomic Design** on the frontend UI:

### 1. Server Core (`src/server/`)

Layered architecture following SOLID principles:

- `controllers`: HTTP request/response handlers with status code mappings and response serialization.
- `services`: Business logic, domain rules, and Go-compatible duration formatting.
- `repositories`: Data access contracts (`system.repository.interface.ts`) and concrete implementations (`system.repository.ts`).
- `di`: Centralized Dependency Injection (DI) assembly and service registry (`registry.ts`).
- `dtos`: Strongly-typed Data Transfer Objects defining API contracts (`health.dto.ts`).

### 2. Frontend Atomic Design (`src/components/`)

Component hierarchy following Brad Frost's Atomic Design methodology:

- `atoms`: Fundamental UI building blocks (`Badge`, `Button`, `Card`, `Input`).
- `molecules`: Combinations of atoms acting as a unit (`HeaderNav`, `StatusPill`).
- `organisms`: Distinct interactive UI sections composed of molecules and atoms.
- `templates`: Page-level layout skeletons (`AppLayout`).

## Prerequisites

For local Node.js development:

- Node.js 20.x or newer
- npm 10.x or newer

For Docker development:

- Docker
- Docker Compose

## Environment Setup

Create a local environment file before running the app:

```bash
cp .env.example .env
```

Default values:

| Variable | Description | Default Value |
|---|---|---|
| `PORT` | Local server port | `3001` |
| `NODE_ENV` | Runtime environment | `development` |
| `NEXT_TELEMETRY_DISABLED` | Telemetry toggle | `1` |
| `APP_VERSION` | Application semver | `0.1.0` |
| `CORE_API_URL` | Upstream Go Core API URL | `http://localhost:8080` |

## Local Development

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Run code quality linting:

```bash
npm run lint
```

## Docker Deployment

This project uses a two-tier Docker build architecture for maximum build caching and lightweight runtime image size:

### 1. Build Base Dependencies Image

```bash
./deployment/build-base.sh
```

### 2. Build Customer Portal App Image

```bash
./deployment/build-app.sh
```

### 3. Run Container via Docker Compose

```bash
docker compose -f deployment/docker-compose.yaml up -d
```

Access endpoints:
- Customer Portal: `http://localhost:3001`
- Health Endpoint: `http://localhost:3001/health`

## API Endpoints

### Health Check

```http
GET /health
```

#### Response (`200 OK`)

```json
{
  "version": "0.1.0",
  "uptime": "2m14.502s",
  "git_hash": "2ddf5c8"
}
```

## License

Internal proprietary insurance platform. All rights reserved.
