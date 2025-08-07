import express from "express";
import taskRoutes from "./routes/task.routes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Get express running

// Mount the routes under /api
app.use("/api", taskRoutes);

// Defining a Get method
app.get("/", (_req, res) => {
    res.send("Welcome to my Express API using TS YAY2");
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
