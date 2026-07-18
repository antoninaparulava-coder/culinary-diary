const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  ingredients: {
    type: [String], // ტექსტების მასივი ინგრედიენტებისთვის
    required: true
  },
  instructions: {
    type: String,
    required: true
  },
  prepTime: {
    type: Number, // მომზადების დრო წუთებში
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Recipe', recipeSchema);