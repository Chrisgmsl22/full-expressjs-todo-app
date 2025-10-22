.PHONY: help install build dev start lint clean docker-build docker-up docker-down docker-restart docker-logs docker-clean db-up db-down start-hybrid-dev

# Default target - shows help
help:
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "📋 Available Commands"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo " Local Development:"
	@echo "  make install          - Install dependencies"
	@echo "  make build            - Build TypeScript"
	@echo "  make dev              - Run dev server locally"
	@echo "  make start            - Start production server"
	@echo "  make lint             - Run ESLint"
	@echo "  make lint-fix         - Fix ESLint issues"
	@echo "  make clean            - Clean dist and node_modules"
	@echo ""
	@echo " Hybrid Development (Recommended):"
	@echo "  make start-hybrid-dev       - Start DB in Docker, run app locally"
	@echo "  make db-up            - Start only MongoDB in Docker"
	@echo "  make db-down          - Stop MongoDB"
	@echo "  make db-logs          - View MongoDB logs"
	@echo ""
	@echo " Full Docker:"
	@echo "  make docker-build     - Build Docker images"
	@echo "  make docker-up        - Start all containers"
	@echo "  make docker-down      - Stop all containers"
	@echo "  make docker-restart   - Restart containers"
	@echo ""
	@echo " Quick Setup:"
	@echo "  make setup-local      - Install + build for local dev"
	@echo "  make setup-docker     - Build + start Docker"
	@echo "  make setup-hybrid     - Setup for hybrid development"

# ===== Local Development =====
install:
	npm install

build:
	npm run build

dev:
	npm run dev

start:
	npm start

lint:
	npx eslint .

lint-fix:
	npx eslint . --fix

clean:
	rm -rf dist node_modules

# ===== Hybrid Development (DB in Docker, App Local) =====
db-up:
	@echo "🚀 Starting MongoDB in Docker..."
	docker-compose up -d mongo
	@echo "✅ MongoDB is running on localhost:27017"
	@echo "💡 Run 'make dev' in another terminal to start your app"

db-down:
	@echo "🛑 Stopping MongoDB..."
	docker-compose stop mongo
	@echo "✅ MongoDB stopped"

db-logs:
	docker-compose logs -f mongo

# You will use this most of the time
start-hybrid-dev:
	@echo "🔀 Starting Hybrid Development Mode..."
	@echo "📦 Starting MongoDB in Docker..."
	@make db-up
	@echo ""
	@echo " Starting app locally..."
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	npm run dev

# ===== Docker Commands =====
docker-build:
	docker-compose build

docker-up:
	@echo "🐳 Starting all Docker containers..."
	docker-compose up -d
	@echo "✅ Containers started!"
	@echo "📊 View logs: make docker-logs"
	@echo "🔍 Check status: make docker-status"

docker-down:
	@echo "🛑 Stopping all Docker containers..."
	docker-compose down
	@echo "✅ All containers stopped"

docker-restart:
	@echo "♻️  Restarting Docker containers..."
	docker-compose restart
	@echo "✅ Containers restarted!"



# ===== Combined Workflows =====
setup-local: install build
	@echo "✅ Local setup complete!"
	@echo "💡 Run 'make start-hybrid-dev' to start development"

setup-docker: docker-build docker-up
	@echo "✅ Docker setup complete!"
	@echo "🌐 App: http://localhost:3000"
	@echo "📊 Logs: make docker-logs"

setup-hybrid: install build db-up
	@echo "✅ Hybrid setup complete!"
	@echo "💡 MongoDB running in Docker on localhost:27017"
	@echo "🚀 Run 'make dev' to start your app locally"

# ===== Testing (for future) =====
test:
	npm run test

test-docker:
	docker-compose run app npm test



# ===== Database Commands =====
db-check:
	@echo "📊 Docker MongoDB Status:"
	@docker exec todo-mongo mongosh todo-app-db --quiet --eval "printjson({collections: db.getCollectionNames(), users: db.users.countDocuments(), tasks: db.tasks.countDocuments()})"

db-users:
	@echo "👥 Users in Docker MongoDB:"
	@docker exec todo-mongo mongosh todo-app-db --quiet --eval "db.users.find({}, {password: 0}).forEach(printjson)"

db-tasks:
	@echo "📝 Tasks in Docker MongoDB:"
	@docker exec todo-mongo mongosh todo-app-db --quiet --eval "db.tasks.find().forEach(printjson)"

db-shell:
	@echo "🐚 Opening MongoDB shell in Docker..."
	docker exec -it todo-mongo mongosh todo-app-db