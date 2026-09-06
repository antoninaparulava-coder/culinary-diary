const mongoose = require("mongoose");

const mealPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    mealType: {
      type: String,
      enum: ["Breakfast", "Lunch", "Dinner"],
      required: true,
    },

    recipe: {
      _id: { type: String },
      title: { type: String, required: true },
      emoji: { type: String, default: "🍳" },
    },
  },
  { timestamps: true }
);

// Each user can only have one recipe per meal type on a given date
mealPlanSchema.index(
  { userId: 1, date: 1, mealType: 1 },
  { unique: true }
);

module.exports = mongoose.model("MealPlan", mealPlanSchema);