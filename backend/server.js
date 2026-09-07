const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const recipeRoutes = require("./routes/recipeRoutes");
const mealPlanRoutes = require("./routes/mealPlanRoutes");
const authRoutes = require("./routes/authRoutes");
const challengeRoutes = require("./routes/challengeRoutes");

const requireAuth = require("./middleware/auth");

// Models
const Pantry = require("./models/Pantry");
const Recipe = require("./models/Recipe");

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


// ==========================
// Pantry Endpoints
// ==========================

// GET pantry
app.get("/api/pantry", requireAuth, async (req, res) => {
  try {
    const items = await Pantry.find({
      userId: req.userId,
    }).sort({
      createdAt: -1,
    });

    res.json(items);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});


// POST pantry item
app.post("/api/pantry", requireAuth, async (req, res) => {
  try {
    const { name, quantity, unit, category } = req.body;

    const newItem = new Pantry({
      userId: req.userId,
      name,
      quantity: quantity || 1,
      unit: unit || "pcs",
      category: category || "other",
    });

    const savedItem = await newItem.save();

    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
});


// DELETE pantry item
app.delete("/api/pantry/:id", requireAuth, async (req, res) => {
  try {
    const deletedItem = await Pantry.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!deletedItem) {
      return res.status(404).json({
        message: "Ingredient not found.",
      });
    }

    res.json({
      message: "Ingredient removed from pantry",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});


// ==========================
// Single Recipe
// ==========================

app.get("/api/recipes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        message: "Invalid recipe ID format",
      });
    }

    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found",
      });
    }

    res.json(recipe);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});


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