const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Recipe = require('./models/Recipe')

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected successfully to Compass!'))
  .catch(err => console.error('MongoDB connection error:', err));

// Simple test route
app.get('/', (req, res) => {
  res.send('Culinary Diary API is running...');
});

// ყველა რეცეპტის წამოსაღები ენდპოინტი
app.get('/api/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.find(); // ბაზიდან ყველა რეცეპტის წამოღება
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});