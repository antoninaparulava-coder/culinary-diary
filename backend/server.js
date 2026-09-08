const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const recipeRoutes = require("./routes/recipeRoutes");
const mealPlanRoutes = require("./routes/mealPlanRoutes");
const authRoutes = require("./routes/authRoutes");
const challengeRoutes = require("./routes/challengeRoutes");
const pantryRoutes = require("./routes/pantryRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

const PORT = process.env.PORT || 5000;


// ==========================
// Middleware
// ==========================

app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());


// ==========================
// Routes
// ==========================

app.use("/api/auth", authRoutes);

app.use("/api/recipes", recipeRoutes);

app.use("/api/meal-plans", mealPlanRoutes);

app.use("/api/challenges", challengeRoutes);

app.use("/api/pantry", pantryRoutes);

app.use("/api/admin", adminRoutes);


// ==========================
// MongoDB Connection
// ==========================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });