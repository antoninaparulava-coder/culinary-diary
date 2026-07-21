const mongoose = require('mongoose');

const mealPlanSchema = new mongoose.Schema({
  date: {
    type: String, // Stored as "YYYY-MM-DD" for easy querying (e.g. "2026-07-27")
    required: true,
  },
  mealType: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Dinner'],
    required: true,
  },
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe', // References the Recipe model
    required: true,
  },
}, { timestamps: true });

// Ensure each date can only have one recipe per meal type
mealPlanSchema.index({ date: 1, mealType: 1 }, { unique: true });

module.exports = mongoose.model('MealPlan', mealPlanSchema);