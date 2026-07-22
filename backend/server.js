const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const recipeRoutes = require('./routes/recipeRoutes');
const mealPlanRoutes = require('./routes/mealPlanRoutes');
const Pantry = require("./models/Pantry");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/recipes', recipeRoutes);
app.use('/api/meal-plans', mealPlanRoutes);

app.get("/api/pantry", async (req, res) => {
  try {
    const items = await Pantry.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST: Add a new ingredient
app.post("/api/pantry", async (req, res) => {
  try {
    const { name, quantity, unit, category } = req.body;
    
    const newItem = new Pantry({
      name,
      quantity: quantity || 1,
      unit: unit || "pcs",
      category: category || "other",
    });

    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE: Remove an ingredient by ID (when used up)
app.delete("/api/pantry/:id", async (req, res) => {
  try {
    await Pantry.findByIdAndDelete(req.params.id);
    res.json({ message: "Ingredient removed from pantry" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// MongoDB Connection
mongoose
  .connect('mongodb://127.0.0.1:27017/culinary_diary')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));