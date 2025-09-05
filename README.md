## Development Setup

Follow these steps to set up and run the project locally:

### Prerequisites

- **Node.js** (v18+ recommended)
- **npm** (comes with Node.js)
- **MongoDB** (see installation below)

### 1. Clone the repository

```sh
git clone https://github.com/your-username/full-expressjs-todo-app.git
cd full-expressjs-todo-app
```

### 2. Install and Start MongoDB

#### On macOS:
```sh
# Install MongoDB using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb/brew/mongodb-community
```

#### On Windows:
```sh
# Download and install from: https://www.mongodb.com/try/download/community
# Or use Chocolatey:
choco install mongodb

# Start MongoDB service
net start MongoDB
```

#### On Linux (Ubuntu/Debian):
```sh
# Import MongoDB public GPG key and add repository
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 3. Install dependencies

```sh
npm install
```

### 4. Environment Setup

Create a `.env` file in the root directory (if not exists):
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/todo-app-db
```

### 5. Start the development server

```sh
npm run dev
```

This will start the server using `ts-node-dev` and automatically reload when you make changes.

---

**Note:** For a more consistent development experience across different machines, consider using Docker (planned for Phase 4 of this project).