const express = require("express");
const User = require("../models/User");
const Recipe = require("../models/Recipe");
const requireAdmin = require("../middleware/admin");

const router = express.Router();

// ==========================
// ADMIN DASHBOARD
// ==========================
router.get("/dashboard", requireAdmin, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const recipeCount = await Recipe.countDocuments();

    res.json({
      message: "Welcome to the admin dashboard.",
      stats: {
        users: userCount,
        recipes: recipeCount,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    res.status(500).json({
      message: "Failed to load admin dashboard.",
    });
  }
});

module.exports = router;