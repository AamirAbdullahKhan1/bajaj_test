const express = require("express");
const cors = require("cors");
const bfhlRouter = require("./routes/bfhl");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "BFHL API is running. POST to /bfhl with { data: [...] }",
  });
});

app.use("/bfhl", bfhlRouter);

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ error: true, message: "Route not found." });
});

app.listen(PORT, () => {
  console.log(`BFHL API listening on port ${PORT}`);
});
