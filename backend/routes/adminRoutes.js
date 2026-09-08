const express = require("express");

const User = require("../models/User");
const Recipe = require("../models/Recipe");

const requireAuth = require("../middleware/auth");
const requireAdmin = require("../middleware/admin");

const router = express.Router();


// ======================================================
// ADMIN DASHBOARD
// ======================================================

router.get(
  "/dashboard",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const [users, recipes] = await Promise.all([
        User.countDocuments(),
        Recipe.countDocuments(),
      ]);

      res.json({
        stats: {
          users,
          recipes,
        },
      });
    } catch (error) {
      console.error("Admin dashboard error:", error);

      res.status(500).json({
        message: "Could not load dashboard statistics.",
      });
    }
  }
);


// ======================================================
// GET ALL USERS
// ======================================================

router.get(
  "/users",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const users = await User.find()
        .select("-password")
        .sort({ createdAt: -1 });

      res.json(users);
    } catch (error) {
      console.error("Get admin users error:", error);

      res.status(500).json({
        message: "Could not load users.",
      });
    }
  }
);


// ======================================================
// CHANGE USER ROLE
// ======================================================

router.patch(
  "/users/:id/role",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { role } = req.body;

      if (!["user", "admin"].includes(role)) {
        return res.status(400).json({
          message: "Invalid role.",
        });
      }

      // Don't allow admin to change their own role
      if (req.params.id === req.userId.toString()) {
        return res.status(400).json({
          message: "You cannot change your own administrator role.",
        });
      }

      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      user.role = role;

      await user.save();

      res.json({
        message: `User role changed to ${role}.`,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Change user role error:", error);

      res.status(500).json({
        message: "Could not change user role.",
      });
    }
  }
);


// ======================================================
// DELETE USER
// ======================================================

router.delete(
  "/users/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      // Don't allow admin to delete themselves
      if (req.params.id === req.userId.toString()) {
        return res.status(400).json({
          message: "You cannot delete your own account from the admin panel.",
        });
      }

      const user = await User.findByIdAndDelete(req.params.id);

      if (!user) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      res.json({
        message: "User deleted successfully.",
      });
    } catch (error) {
      console.error("Delete user error:", error);

      res.status(500).json({
        message: "Could not delete user.",
      });
    }
  }
);


// ======================================================
// GET ALL RECIPES
// ======================================================

router.get(
  "/recipes",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const recipes = await Recipe.find()
        .sort({ createdAt: -1 });

      res.json(recipes);
    } catch (error) {
      console.error("Get admin recipes error:", error);

      res.status(500).json({
        message: "Could not load recipes.",
      });
    }
  }
);


// ======================================================
// CREATE RECIPE
// ======================================================

router.post(
  "/recipes",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        title,
        emoji,
        blurb,
        tags,
        ingredients,
        instructions,
        prepTime,
        calories,
        difficulty,
      } = req.body;

      if (
        !title ||
        !ingredients ||
        !Array.isArray(ingredients) ||
        ingredients.length === 0 ||
        !instructions
      ) {
        return res.status(400).json({
          message: "Title, ingredients, and instructions are required.",
        });
      }

      const recipe = new Recipe({
        title,
        emoji: emoji || "🍳",
        blurb: blurb || "",
        tags: Array.isArray(tags) ? tags : [],
        ingredients,
        instructions,
        prepTime: Number(prepTime) || 0,
        calories: Number(calories) || 300,
        difficulty: difficulty || "Easy",
      });

      const savedRecipe = await recipe.save();

      res.status(201).json(savedRecipe);
    } catch (error) {
      console.error("Create recipe error:", error);

      res.status(400).json({
        message: error.message || "Could not create recipe.",
      });
    }
  }
);


// ======================================================
// UPDATE RECIPE
// ======================================================

router.put(
  "/recipes/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        title,
        emoji,
        blurb,
        tags,
        ingredients,
        instructions,
        prepTime,
        calories,
        difficulty,
      } = req.body;

      const recipe = await Recipe.findById(req.params.id);

      if (!recipe) {
        return res.status(404).json({
          message: "Recipe not found.",
        });
      }

      recipe.title = title;
      recipe.emoji = emoji || "🍳";
      recipe.blurb = blurb || "";
      recipe.tags = Array.isArray(tags) ? tags : [];
      recipe.ingredients = ingredients;
      recipe.instructions = instructions;
      recipe.prepTime = Number(prepTime) || 0;
      recipe.calories = Number(calories) || 300;
      recipe.difficulty = difficulty || "Easy";

      const updatedRecipe = await recipe.save();

      res.json(updatedRecipe);
    } catch (error) {
      console.error("Update recipe error:", error);

      res.status(400).json({
        message: error.message || "Could not update recipe.",
      });
    }
  }
);


// ======================================================
// DELETE RECIPE
// ======================================================

router.delete(
  "/recipes/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const recipe = await Recipe.findByIdAndDelete(req.params.id);

      if (!recipe) {
        return res.status(404).json({
          message: "Recipe not found.",
        });
      }

      res.json({
        message: "Recipe deleted successfully.",
      });
    } catch (error) {
      console.error("Delete recipe error:", error);

      res.status(500).json({
        message: "Could not delete recipe.",
      });
    }
  }
);


module.exports = router;