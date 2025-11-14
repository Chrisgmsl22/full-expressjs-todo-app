.PHONY: help setup install build dev stop run-tests run-unit-tests run-intg-tests lint clean db-check db-users db-tasks db-shell db-logs

# Default target - shows help
help:
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "📋 Todo App - Available Commands"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "Daily Development:"
	@echo "  make dev              - Start services and run app locally"
	@echo "  make stop             - Stop all services"
	@echo "  make run-tests        - Run all tests"
	@echo "  make run-unit-tests   - Run unit tests only"
	@echo "  make run-intg-tests   - Run integration tests only"
	@echo "  make lint             - Format + lint code"
	@echo ""
	@echo "Setup (one-time):"
	@echo "  make setup            - Install dependencies and build"
	@echo "  make install          - Install dependencies only"
	@echo "  make build            - Build TypeScript only"
	@echo ""
	@echo "Database Helpers:"
	@echo "  make db-check         - Check database status"
	@echo "  make db-users         - List all users"
	@echo "  make db-tasks         - List all tasks"
	@echo "  make db-shell         - Open MongoDB shell"
	@echo "  make db-logs          - View MongoDB logs"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean            - Clean dist and node_modules"
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "Tip: Run 'make setup' first time, then 'make dev' daily"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ===== Setup Commands =====
setup: install build
	@echo ""
	@echo "Setup complete!"
	@echo "Run 'make dev' to start development"

install:
	@echo "Installing dependencies..."
	@npm clean-install

build:
	@echo "Building TypeScript..."
	@npm run build

# ===== Daily Development =====
dev:
	@echo "Starting development environment..."
	@echo ""
	@echo "Starting all services in Docker..."
	@docker-compose up -d
	@echo "Services running:"
	@echo "  - MongoDB: localhost:27017"
	@echo "  - Redis: localhost:6379"
	@echo ""
	@echo "Starting app locally..."
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@npm run dev

stop:
	@echo "🛑 Stopping all services..."
	@docker-compose stop
	@echo "Services stopped"

# ===== Testing =====
run-tests:
	@echo "Running all tests"
	@npm test

run-unit-tests:
	@npm run test:unit

run-intg-tests:
	@echo "Running integration tests (requires Redis running)..."
	@echo "   Make sure 'make dev' is running first!"
	@npm run test:integration


# ===== Code Quality =====
lint:
	@echo "Checking code formatting..."
	@npm run format:check || (echo "⚠️  Auto-fixing formatting..." && npm run format)
	@echo "Formatting complete!"
	@echo ""
	@echo "Running ESLint..."
	@npx eslint src --ext .ts
	@echo "Linting complete!"

# ===== Database Helpers =====
db-check:
	@echo "Database Status:"
	@docker exec todo-mongo mongosh todo-app-db --quiet --eval "printjson({collections: db.getCollectionNames(), users: db.users.countDocuments(), tasks: db.tasks.countDocuments()})"

db-users:
	@echo "Users in Database:"
	@docker exec todo-mongo mongosh todo-app-db --quiet --eval "db.users.find({}, {password: 0}).forEach(printjson)"

db-tasks:
	@echo "Tasks in Database:"
	@docker exec todo-mongo mongosh todo-app-db --quiet --eval "db.tasks.find().forEach(printjson)"

db-shell:
	@echo "Opening MongoDB shell..."
	@docker exec -it todo-mongo mongosh todo-app-db

db-logs:
	@echo "MongoDB logs (Ctrl+C to exit):"
	@docker-compose logs -f mongo

# ===== Cleanup =====
clean:
	@echo "Cleaning up..."
	@rm -rf dist node_modules
	@echo "Cleaned dist and node_modules"
