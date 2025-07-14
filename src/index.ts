import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Defining a Get method
app.get("/", (_req, res) => {
    res.send("Welcome to my Express API using TS YAY1");
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
