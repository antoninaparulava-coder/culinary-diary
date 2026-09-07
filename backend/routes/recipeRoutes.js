const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();
const Recipe = require("../models/Recipe");

// ==========================
// GET all recipes
// ==========================
router.get("/", async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ==========================
// GET single recipe
// ==========================
router.get("/:id", async (req, res) => {
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
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ==========================
// POST new recipe
// ==========================
router.post("/", async (req, res) => {
  try {
    const recipe = new Recipe(req.body);
    const newRecipe = await recipe.save();

    res.status(201).json(newRecipe);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

module.exports = router;