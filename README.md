# 🚌 TransitOps

**TransitOps** is a full-stack fleet and transit operations management platform designed to help organizations efficiently manage vehicles, drivers, trips, fuel logs, expenses, and maintenance — all from a single, role-based dashboard.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Infrastructure Setup (Docker)](#infrastructure-setup-docker)
  - [Server Setup](#server-setup)
  - [Client Setup](#client-setup)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Role & Permission System](#role--permission-system)
- [Default Admin Credentials](#default-admin-credentials)

---

## Overview

TransitOps provides a centralized platform for transit and logistics teams to:

- Track and manage their **vehicle fleet** registry
- Manage **driver** profiles and assignments
- Schedule, dispatch, and monitor **trips**
- Log **fuel consumption** and **operational expenses**
- Track **vehicle maintenance** records
- Generate **reports** and view operational **dashboards**
- Manage **users** with fine-grained **role-based access control (RBAC)**

---

## Features

| Module              | Capabilities                                                       |
| ------------------- | ------------------------------------------------------------------ |
| 🚗 Vehicle Registry  | Create, update, delete, and track vehicle status                   |
| 👨‍✈️ Driver Management | Manage driver profiles, status, and assignments                    |
| 🗺️ Trip Management   | Create trips, dispatch, complete, and cancel with status tracking  |
| ⛽ Fuel Logs         | Log fuel consumption per vehicle                                   |
| 💸 Expense Tracking  | Record and categorize operational expenses                         |
| 🔧 Maintenance       | Track scheduled and unscheduled vehicle maintenance                |
| 📊 Dashboard         | Real-time operational overview and KPIs                            |
| 📈 Reports           | Generate and export operational reports                            |
| 👤 User Management   | Invite users, assign roles, manage account lifecycle               |
| 🔐 RBAC              | Fine-grained permission system with custom roles                   |
| 📧 Email Notifications | Async email delivery via RabbitMQ message queue                  |
| ⏱️ Cron Jobs          | Scheduled background tasks for automated operations               |

---

## Tech Stack

### Client (Frontend)

| Technology        | Purpose                          |
| ----------------- | -------------------------------- |
| Next.js 16        | React framework with App Router  |
| React 19          | UI library                       |
| TypeScript        | Static typing                    |
| Tailwind CSS v4   | Utility-first styling            |
| Redux Toolkit     | Global state management          |
| React Hook Form   | Form handling with validation    |
| Zod               | Schema validation                |
| TanStack Table    | Data table rendering             |
| Recharts          | Data visualization / charts      |
| Lucide React      | Icon library                     |

### Server (Backend)

| Technology     | Purpose                                 |
| -------------- | --------------------------------------- |
| Node.js        | JavaScript runtime                      |
| Express 5      | HTTP server framework                   |
| TypeScript     | Static typing                           |
| Prisma 7       | ORM for PostgreSQL                      |
| PostgreSQL 16  | Relational database                     |
| RabbitMQ       | Message broker for async email queue    |
| JWT            | Authentication (access & refresh tokens)|
| bcrypt         | Password hashing                        |
| Zod            | Request validation                      |
| Winston        | Structured logging                      |
| Nodemailer     | Email delivery                          |
| MJML           | Responsive email templates              |
| Helmet         | HTTP security headers                   |
| node-cron      | Scheduled cron jobs                     |
| Nginx          | Reverse proxy (Docker dev setup)        |

---

## Project Structure

```
transit-ops/
├── client/                    # Next.js frontend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/        # Auth routes (login, register, etc.)
│   │   │   └── (pages)/       # Protected app pages
│   │   │       ├── dashboard/
│   │   │       ├── drivers/
│   │   │       ├── fuel-and-expense/
│   │   │       ├── maintainance/
│   │   │       ├── settings/
│   │   │       ├── trips/
│   │   │       └── vehicle-registry/
│   │   ├── components/        # Reusable UI components
│   │   ├── enums/             # Frontend enums
│   │   └── types/             # TypeScript type definitions
│   ├── public/                # Static assets
│   └── package.json
│
└── server/                    # Express.js backend API
    ├── src/
    │   ├── configs/           # App configuration (env, etc.)
    │   ├── controllers/       # Route handler logic
    │   ├── dto/               # Data Transfer Objects
    │   ├── enums/             # Shared enums (status, permissions)
    │   ├── lib/               # Prisma client, RabbitMQ setup
    │   ├── middlewares/       # Auth, RBAC, error handling
    │   ├── routes/            # Express routers
    │   ├── schemas/           # Zod validation schemas
    │   ├── service/           # Business logic layer
    │   ├── template/          # Email templates (MJML/Handlebars)
    │   ├── types/             # TypeScript types
    │   └── utils/             # Logger, helpers
    ├── prisma/
    │   ├── model/             # Prisma model files
    │   ├── migrations/        # Database migrations
    │   └── schema.prisma      # Prisma schema entry point
    ├── deployment/            # Nginx config for dev proxy
    ├── docker-compose.yml     # PostgreSQL + RabbitMQ + Nginx
    └── package.json
```

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v20+
- [npm](https://www.npmjs.com/) v10+
- [Docker](https://www.docker.com/) & Docker Compose

---

### Infrastructure Setup (Docker)

The `docker-compose.yml` in the `server/` directory spins up:
- **PostgreSQL 16** on port `5432`
- **RabbitMQ 3** (with management UI) on ports `5672` / `15672`
- **Nginx** reverse proxy on port `80`

```bash
cd server
docker compose up -d
```

> RabbitMQ Management UI: [http://localhost:15672](http://localhost:15672)  
> Default credentials: `admin` / `admin`

---

### Server Setup

```bash
cd server

# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
# Edit .env with your actual values

# 3. Generate Prisma client
npm run db:generate

# 4. Run database migrations
npm run db:migrate

# 5. Start development server
npm run dev
```

The API server will be available at **http://localhost:4000**

---

### Client Setup

```bash
cd client

# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

The frontend will be available at **http://localhost:3000**

---

## Environment Variables

### Server (`server/.env`)

| Variable                    | Description                                  | Example                                              |
| --------------------------- | -------------------------------------------- | ---------------------------------------------------- |
| `PORT`                      | Server port                                  | `4000`                                               |
| `CORS_ORIGIN`               | Allowed CORS origin(s), comma-separated      | `http://localhost:3000`                              |
| `DATABASE_URL`              | PostgreSQL connection string                 | `postgresql://user:pass@localhost:5432/transit_ops`  |
| `NODE_ENV`                  | Runtime environment                          | `development`                                        |
| `COOKIE_DOMAIN`             | Cookie domain                                | `localhost`                                          |
| `ACCESS_TOKEN_SECRET`       | JWT access token signing secret              | *(random 32+ char string)*                           |
| `ACCESS_TOKEN_EXPIRY`       | Access token TTL                             | `15m`                                                |
| `REFRESH_TOKEN_SECRET`      | JWT refresh token signing secret             | *(random 32+ char string)*                           |
| `REFRESH_TOKEN_EXPIRY`      | Refresh token TTL                            | `10d`                                                |
| `ACCESS_TOKEN_COOKIE_EXPIRY`| Access token cookie TTL (minutes)            | `15`                                                 |
| `REFRESH_TOKEN_COOKIE_EXPIRY`| Refresh token cookie TTL (days)             | `10`                                                 |
| `SMTP_HOST`                 | SMTP server host                             | `smtp.gmail.com`                                     |
| `SMTP_PORT`                 | SMTP server port                             | `587`                                                |
| `SMTP_SECURE`               | Use TLS for SMTP                             | `false`                                              |
| `SMTP_USER`                 | SMTP account email                           | `your_email@gmail.com`                               |
| `SMTP_PASS`                 | SMTP account password / app password         | `your_app_password`                                  |
| `MAIL_FROM`                 | Sender display name and address              | `"TransitOps <no-reply@transitops.com>"`             |
| `RABBITMQ_CONNECTION_URI`   | RabbitMQ connection URI                      | `amqp://admin:admin@localhost:5672`                  |
| `RABBITMQ_EMAIL_QUEUE`      | Queue name for email jobs                    | `email_queue`                                        |
| `DEFAULT_ADMIN_EMAIL`       | Seeded default admin email                   | `admin@transitops.com`                               |
| `DEFAULT_ADMIN_PASSWORD`    | Seeded default admin password                | `AdminPassword123`                                   |

---

## API Reference

All API routes are prefixed with `/api/v1`. All protected routes require a valid JWT access token (sent via HTTP-only cookie).

| Resource        | Base Path               | Operations                                              |
| --------------- | ----------------------- | ------------------------------------------------------- |
| Users           | `/api/v1/users`         | CRUD, authentication, profile management                |
| Roles           | `/api/v1/roles`         | CRUD, assign permissions                                |
| Vehicles        | `/api/v1/vehicles`      | CRUD (create, read, update, delete)                     |
| Drivers         | `/api/v1/drivers`       | CRUD, assign to vehicles                                |
| Trips           | `/api/v1/trips`         | Create, list, get, dispatch, complete, cancel           |
| Fuel Logs       | `/api/v1/fuel-logs`     | CRUD fuel consumption records                           |
| Expenses        | `/api/v1/expenses`      | CRUD operational expense records                        |
| Maintenance     | `/api/v1/maintenance`   | CRUD maintenance log records                            |
| Dashboard       | `/api/v1/dashboard`     | Aggregate KPIs and operational summaries                |
| Reports         | `/api/v1/reports`       | Generate and export operational reports                 |

---

## Role & Permission System

TransitOps uses a **custom RBAC (Role-Based Access Control)** system. Roles are assigned sets of granular permissions that gate access to every API endpoint.

### Available Permissions

| Domain        | Permissions                                                                          |
| ------------- | ------------------------------------------------------------------------------------ |
| Users         | `user:create`, `user:read`, `user:update`, `user:delete`                             |
| Roles         | `role:create`, `role:read`, `role:update`, `role:delete`                             |
| Drivers       | `driver:create`, `driver:read`, `driver:update`, `driver:delete`, `driver:assign`    |
| Vehicles      | `vehicle:create`, `vehicle:read`, `vehicle:update`, `vehicle:delete`                 |
| Trips         | `trip:create`, `trip:read`, `trip:update`, `trip:delete`, `trip:dispatch`, `trip:cancel` |
| Expenses      | `expense:create`, `expense:read`, `expense:update`, `expense:delete`                 |
| Fuel Logs     | `fuelLog:create`, `fuelLog:read`, `fuelLog:update`, `fuelLog:delete`                 |
| Maintenance   | `maintenanceLog:create`, `maintenanceLog:read`, `maintenanceLog:update`, `maintenanceLog:delete` |
| Reports       | `report:view`, `report:export`                                                       |

---

## Default Admin Credentials

On first startup, the server automatically seeds a default admin user. You can change these via environment variables before running the server.

| Field    | Default Value             |
| -------- | ------------------------- |
| Email    | `admin@transitops.com`    |
| Password | `AdminPassword123`        |

> ⚠️ **Important:** Change the default admin credentials immediately in production by updating `DEFAULT_ADMIN_EMAIL` and `DEFAULT_ADMIN_PASSWORD` in your `.env` file before the first run.

---

## Available Scripts

### Server

| Script               | Description                                  |
| -------------------- | -------------------------------------------- |
| `npm run dev`        | Start dev server with hot reload (nodemon)   |
| `npm run build`      | Compile TypeScript to `dist/` (tsup)         |
| `npm run start`      | Run compiled production build                |
| `npm run lint`       | Lint source files                            |
| `npm run format`     | Format source files with Prettier            |
| `npm run db:generate`| Regenerate Prisma client                     |
| `npm run db:migrate` | Run pending database migrations (dev)        |
| `npm run db:migrate:prod` | Deploy migrations to production DB      |
| `npm run db:push`    | Push schema changes without migration file   |
| `npm run db:studio`  | Open Prisma Studio (visual DB browser)       |
| `npm run db:reset`   | Reset the database (⚠️ destructive)          |

### Client

| Script          | Description                    |
| --------------- | ------------------------------ |
| `npm run dev`   | Start Next.js dev server       |
| `npm run build` | Build production bundle        |
| `npm run start` | Serve production build         |
| `npm run lint`  | Lint source files              |
