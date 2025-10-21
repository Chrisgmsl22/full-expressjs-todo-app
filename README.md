# Full Express.js Todo App

A full-featured backend API built with Express.js, TypeScript, MongoDB, JWT authentication, Docker, and comprehensive testing.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://full-expressjs-todo-app.onrender.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-blue)](https://www.docker.com/)

## 🚀 Features

- ✅ **RESTful API** with Express.js and TypeScript
- ✅ **MongoDB** with Mongoose ODM (local + Atlas cloud)
- ✅ **JWT Authentication** with bcrypt password hashing
- ✅ **Docker & Docker Compose** for containerized development
- ✅ **Makefile** for easy command management
- ✅ **Testing** with Jest and Supertest (in progress)
- ✅ **Deployed** to Render.com
- ✅ **ESLint** for code quality
- ✅ **Environment-based** configuration

## 📋 Table of Contents

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
- **Docker** & **Docker Compose** ([Download](https://www.docker.com/get-started)) - *Recommended*
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
npm install
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

### 4. Start MongoDB with Docker

```bash
make db-up
```

This starts MongoDB in a Docker container on port 27017.

### 5. Run the development server

```bash
npm run dev
```

The API will be available at `http://localhost:3000` 🎉

### 6. Test the API

```bash
# Get all tasks
curl http://localhost:3000/api/tasks

# Or use Postman/Insomnia
```

---

## Manual Setup (Without Docker)

If you prefer not to use Docker, you'll need to install MongoDB locally:

### macOS:
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

### Windows:
```bash
# Download from: https://www.mongodb.com/try/download/community
# Or use Chocolatey:
choco install mongodb
net start MongoDB
```

### Linux (Ubuntu/Debian):
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

Then follow steps 1-3 and 5-6 from the Docker setup above.

---

## Development Workflow

### Recommended: Local App + Docker Database (Hybrid)

This gives you fast TypeScript hot-reload with isolated database:

```bash
# Terminal 1: Start MongoDB in Docker
make db-up

# Terminal 2: Run the app locally
npm run dev
```

### Full Docker Setup

Run everything in Docker:

```bash
make docker-up
```

This starts both the app and MongoDB in containers.

---

## Testing

Run the test suite with Jest:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/users/register` | Register a new user | ❌ |
| POST | `/api/users/login` | Login and get JWT token | ❌ |

### Tasks

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tasks` | Get all tasks | ✅ |
| GET | `/api/tasks/:id` | Get task by ID | ✅ |
| POST | `/api/tasks` | Create a new task | ✅ |
| PUT | `/api/tasks/:id` | Update a task | ✅ |
| DELETE | `/api/tasks/:id` | Delete a task | ✅ |

### Example Requests

**Register a user:**
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Create a task (with JWT token):**
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Learn Docker",
    "description": "Complete Docker tutorial"
  }'
```

---

## Project Structure

```
full-expressjs-todo-app/
├── src/
│   ├── controllers/       # Request handlers
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── middleware/       # Auth, error handling, etc.
│   ├── types/            # TypeScript interfaces
│   ├── utils/            # Helper functions
│   └── index.ts          # App entry point
├── dist/                 # Compiled JavaScript (git ignored)
├── docker-compose.yml    # Docker orchestration
├── Dockerfile            # Docker image definition
├── Makefile              # Command shortcuts
├── jest.config.mjs       # Jest testing configuration
├── tsconfig.json         # TypeScript configuration
├── .env                  # Environment variables (git ignored)
└── package.json          # Dependencies and scripts
```

---

## Available Commands

### Development

```bash
npm run dev          # Start dev server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Run production build
npm run lint         # Check code quality
npm run lint:fix     # Fix linting issues
```

### Testing

```bash
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Docker (via Makefile)

```bash
make help            # Show all available commands

# Database only
make db-up           # Start MongoDB in Docker
make db-down         # Stop MongoDB
make db-logs         # View MongoDB logs
make db-status       # Check database status
make db-shell        # Open MongoDB shell

# Full stack
make docker-up       # Start app + MongoDB
make docker-down     # Stop all containers
make docker-logs     # View all logs
make docker-restart  # Restart containers
make docker-clean    # Remove containers and volumes

# Development
make dev             # Run app locally (recommended)
make build           # Build TypeScript
```

---

## Deployment

The app is deployed to **Render.com** at:
🌐 https://full-expressjs-todo-app.onrender.com

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

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/todo-app-db` |
| `JWT_SECRET` | Secret key for JWT signing | `your-super-secret-key` |
| `PORT` | Server port | `3000` |
| `DOCKER_ENV` | Set by Docker (auto-detected) | `true` |

---

## Tech Stack

- **Runtime**: Node.js 18
- **Framework**: Express.js 5
- **Language**: TypeScript 5.8
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcrypt
- **Testing**: Jest + Supertest
- **Containerization**: Docker + Docker Compose
- **Deployment**: Render.com
- **Code Quality**: ESLint + Husky

---

## Learning Project

This is a learning project built following a structured curriculum:

- ✅ **Phase 1**: Express.js fundamentals
- ✅ **Phase 2**: MongoDB integration
- ✅ **Phase 3**: Authentication & security
- ✅ **Phase 4**: Docker containerization
- ✅ **Phase 5**: Cloud deployment
- 🚧 **Phase 6**: Testing (in progress)
- 📋 **Phase 7**: Advanced features (caching, pagination, etc.)

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

**Built with ❤️ while learning backend development**
