const express = require("express");
const router = express.Router();

const MealPlan = require("../models/MealPlan");
const requireAuth = require("../middleware/auth");

// GET meal plans
// Supports: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get("/", requireAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {
      userId: req.userId,
    };

    if (startDate && endDate) {
      query.date = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    const mealPlans = await MealPlan.find(query).sort({
      date: 1,
      mealType: 1,
    });

    res.json(mealPlans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST or UPDATE a meal slot
router.post("/", requireAuth, async (req, res) => {
  const { date, mealType, recipe } = req.body;

  try {
    const updatedMealPlan = await MealPlan.findOneAndUpdate(
      {
        userId: req.userId,
        date,
        mealType,
      },
      {
        userId: req.userId,
        recipe,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(201).json(updatedMealPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a meal from calendar
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const deletedMealPlan = await MealPlan.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!deletedMealPlan) {
      return res.status(404).json({
        message: "Meal plan not found.",
      });
    }

    res.json({ message: "Meal removed from calendar" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;