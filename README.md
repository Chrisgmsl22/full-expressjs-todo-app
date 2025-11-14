[![CI Pipeline](https://github.com/chrisgmsl22/full-expressjs-todo-app/actions/workflows/ci.yml/badge.svg)](https://github.com/chrisgmsl22/full-expressjs-todo-app/actions/workflows/ci.yml)

# Full Express.js Todo App

(I used AI to create this whole description for now)

A full-featured backend API built with Express.js, TypeScript, MongoDB, JWT authentication, Docker, and comprehensive testing.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://full-expressjs-todo-app.onrender.com/api)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-blue)](https://www.docker.com/)

## Features

- **RESTful API** with Express.js and TypeScript
- **MongoDB** with Mongoose ODM (local + Atlas cloud)
- **Redis Caching** for improved performance
- **JWT Authentication** with bcrypt password hashing
- **Docker & Docker Compose** for containerized development
- **Makefile** for easy command management
- **Comprehensive Testing** with Jest and Supertest (Unit + Integration)
- **CI/CD Pipeline** with GitHub Actions
- **Deployed** to Render.com
- **ESLint** for code quality
- **Environment-based** configuration

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start (Docker - Recommended)](#quick-start-docker---recommended)
- [Manual Setup (Without Docker)](#manual-setup-without-docker)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Available Commands](#available-commands)
- [Deployment](#deployment)

---

## Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **Docker** & **Docker Compose** ([Download](https://www.docker.com/get-started)) - _Recommended_
- **npm** (comes with Node.js)

---

## Quick Start (Docker - Recommended)

The easiest way to get started is using Docker:

### 1. Clone the repository

```bash
git clone https://github.com/Chrisgmsl22/full-expressjs-todo-app.git
cd full-expressjs-todo-app
```

### 2. Install dependencies

```bash
make setup-local
```

### 3. Set up environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Your `.env` should look like this for local development:

```env
MONGO_URI=mongodb://localhost:27017/todo-app-db
JWT_SECRET=your-super-secret-jwt-key
PORT=3000
```

### 4. Build the setup

```bash
make setup
```

This will install all dependencies and build the project

### 5. Run the development server

```bash
make dev
```

The API will be available at `http://localhost:3000` 🎉

### 6. Test the API

```bash
# Get all tasks
curl http://localhost:3000/api/

# Or use Postman/Insomnia
```

## Testing

This project has comprehensive test coverage with both **unit tests** and **integration tests**.

### Test Architecture

- **Unit Tests**: Mock external dependencies (Redis, etc.) for fast, isolated testing
- **Integration Tests**: Use real Redis and MongoDB to test realistic scenarios

### Prerequisites for Integration Tests

Integration tests require **real Redis** running locally:

```bash
# Start Redis with Docker (REQUIRED before running integration tests)
make dev  # Starts both MongoDB and Redis
```

### Running Tests

```bash
# Run ALL tests (unit + integration)
make run-tests

# Run only unit tests (fast, no dependencies)
make run-unit-tests

# Run only integration tests (requires Redis & MongoDB)
make run-intg-tests

# Run with coverage
npm test -- --coverage --watchAll=false

# Run specific test file
npm test task.integration.test.ts
```

## It is highly recommended to use the "Jest runner" extension, which will allow you to run individual tests using the UI

### Test Types

| Test Type       | Mocks Used | Real Services        | Speed  | When to Use           |
| --------------- | ---------- | -------------------- | ------ | --------------------- |
| **Unit**        | Redis Mock | None                 | Fast   | Test logic/middleware |
| **Integration** | None       | Real Redis + MongoDB | Slower | Test API endpoints    |

### Important Notes

- ⚠️ **Integration tests will fail** if Redis is not running
- ✅ **Unit tests** work standalone (no dependencies)
- Always run `make dev` before integration tests locally
- CI/CD automatically spins up Redis service containers

---

## API Endpoints

### Authentication

| Method | Endpoint              | Description             | Auth Required |
| ------ | --------------------- | ----------------------- | ------------- |
| POST   | `/api/users/register` | Register a new user     | ❌            |
| POST   | `/api/users/login`    | Login and get JWT token | ❌            |

### Tasks

| Method | Endpoint         | Description       | Auth Required |
| ------ | ---------------- | ----------------- | ------------- |
| GET    | `/api/tasks`     | Get all tasks     | ✅            |
| GET    | `/api/tasks/:id` | Get task by ID    | ✅            |
| POST   | `/api/tasks`     | Create a new task | ✅            |
| PUT    | `/api/tasks/:id` | Update a task     | ✅            |
| DELETE | `/api/tasks/:id` | Delete a task     | ✅            |

---

---

## Deployment

The app is deployed to **Render.com** at:
🌐 https://full-expressjs-todo-app.onrender.com/api

### Deploy Your Own

1. **Connect to MongoDB Atlas** (free tier):
    - Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
    - Create a cluster and get connection string
    - URL-encode special characters in password (e.g., `$` → `%24`)

2. **Deploy to Render**:
    - Sign up at [Render.com](https://render.com)
    - Connect your GitHub repository
    - Choose "Docker" as runtime
    - Add environment variables:
        - `MONGO_URI` - Your Atlas connection string
        - `JWT_SECRET` - Random secure string
        - `PORT` - 3000

3. **Click Deploy** 🚀

---

## Environment Variables

| Variable     | Description                   | Example                                 |
| ------------ | ----------------------------- | --------------------------------------- |
| `MONGO_URI`  | MongoDB connection string     | `mongodb://localhost:27017/todo-app-db` |
| `REDIS_HOST` | Redis host                    | `localhost`                             |
| `REDIS_PORT` | Redis port                    | `6379`                                  |
| `JWT_SECRET` | Secret key for JWT signing    | `your-super-secret-key`                 |
| `PORT`       | Server port                   | `3000`                                  |
| `DOCKER_ENV` | Set by Docker (auto-detected) | `true`                                  |

---

## Tech Stack

- **Runtime**: Node.js 18
- **Framework**: Express.js 5
- **Language**: TypeScript 5.8
- **Database**: MongoDB with Mongoose
- **Caching**: Redis (ioredis)
- **Authentication**: JWT + bcrypt
- **Testing**: Jest + Supertest (Unit + Integration)
- **Containerization**: Docker + Docker Compose
- **Deployment**: Render.com
- **CI/CD**: GitHub Actions
- **Code Quality**: ESLint + Husky

---

## Learning Project

This is a learning project built following a structured curriculum:

- ✅ **Phase 1**: Express.js fundamentals
- ✅ **Phase 2**: MongoDB integration
- ✅ **Phase 3**: Authentication & security
- ✅ **Phase 4**: Docker containerization
- ✅ **Phase 5**: Cloud deployment
- ✅ **Phase 6**: Testing (Unit + Integration)
- ✅ **Phase 7**: CI/CD Pipeline (GitHub Actions)
- ✅ **Phase 8**: Redis Caching
- 🚧 **Phase 9**: Advanced features (pagination, filtering, AI integration)

See [ACTION_PLAN.md](./ACTION_PLAN.md) for detailed learning goals.

---

## License

ISC

---

## Contributing

This is a personal learning project, but feel free to fork and experiment!

---

## Questions or Issues?

Open an issue on GitHub or reach out!

---
