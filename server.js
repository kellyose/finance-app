const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5176', 'http://localhost:5178', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import Routes from src folder
const authRoutes = require("./src/routes/auth");
const transactionRoutes = require("./src/routes/transactions"); // Fixed import

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes); // Use the transaction routes

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Finance App Backend is running",
    timestamp: new Date().toISOString()
  });
});

// Remove the demo transaction endpoints since we're using routes
// (Delete everything from "In-memory storage" to "GET transaction summary")

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/finance-app")
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => {
    console.error("MongoDB connection error:", err.message);
    console.log("Running in demo mode without MongoDB");
  });

// Start Server
app.listen(PORT, () => {
  console.log("Server running on: http://localhost:" + PORT);
  console.log("Health Check: http://localhost:" + PORT + "/api/health");
  console.log("Auth: http://localhost:" + PORT + "/api/auth");
  console.log("Transactions: http://localhost:" + PORT + "/api/transactions");
  console.log("Summary: http://localhost:" + PORT + "/api/transactions/summary");
});