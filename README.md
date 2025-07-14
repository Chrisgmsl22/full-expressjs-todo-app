## Development Setup

Follow these steps to set up and run the project locally:

### 1. Clone the repository

```sh
git clone https://github.com/your-username/full-expressjs-todo-app.git
cd full-expressjs-todo-app
```

### 2. Install dependencies

```sh
npm install
```

### 3. Start the development server

For live-reloading and TypeScript support, use:

```sh
npm run dev
```

This will start the server using `ts-node-dev` and automatically reload when you make changes to the source files.

### 4. Test the API

Open your browser or use a tool like Postman or curl to test the GET endpoint:

```sh
curl http://localhost:3000/
```

You should see:

```
Welcome to my Express API using TS YAY1
```

---

**Note:**

-   Make sure you have Node.js and npm installed.
-   If you add environment variables, document them in this README.
