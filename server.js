// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Use Render port or fallback for local dev
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5176', 'http://localhost:5174', 'http://localhost:5173'], // add your frontend host here later
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import your routes
const authRoutes = require("./src/routes/auth");
const transactionRoutes = require("./src/routes/transactions");

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  const state = mongoose.connection.readyState;
  res.json({
    server: "running",
    database:
      state === 1 ? "connected" :
      state === 2 ? "connecting" :
      "disconnected",
    timestamp: new Date().toISOString()
  });
});

// MongoDB connection
if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI not set in environment variables");
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // stop app if DB fails
  });

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/api/health`);
  console.log(`Auth Routes: http://localhost:${PORT}/api/auth`);
  console.log(`Transaction Routes: http://localhost:${PORT}/api/transactions`);
});
