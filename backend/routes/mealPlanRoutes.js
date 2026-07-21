const express = require('express');
const router = express.Router();
const MealPlan = require('../models/MealPlan');

// GET meal plans (supports query params: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD)
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const mealPlans = await MealPlan.find(query).populate('recipe');
    res.json(mealPlans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST or UPDATE a meal slot
router.post('/', async (req, res) => {
  const { date, mealType, recipeId } = req.body;

  try {
    const updatedMealPlan = await MealPlan.findOneAndUpdate(
      { date, mealType },
      { recipe: recipeId },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate('recipe');

    res.status(201).json(updatedMealPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a meal from calendar
router.delete('/:id', async (req, res) => {
  try {
    await MealPlan.findByIdAndDelete(req.params.id);
    res.json({ message: 'Meal removed from calendar' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;