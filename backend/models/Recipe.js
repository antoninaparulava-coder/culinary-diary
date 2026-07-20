const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  emoji: { type: String, default: '🍳' },
  blurb: { type: String },
  tags: { type: [String], default: [] },
  ingredients: { type: [String], required: true },
  instructions: { type: String, required: true },
  prepTime: { type: Number, default: 0 },
  calories: { type: Number, default: 300 }, 
  difficulty: { type: String, default: 'Easy' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recipe', recipeSchema);