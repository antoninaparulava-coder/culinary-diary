const express = require("express");
const router = express.Router();

const Pantry = require("../models/Pantry");
const requireAuth = require("../middleware/auth");

// ==========================
// GET pantry
// ==========================
router.get("/", requireAuth, async (req, res) => {
  try {
    const items = await Pantry.find({
      userId: req.userId,
    }).sort({
      createdAt: -1,
    });

    res.json(items);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// ==========================
// POST pantry item
// ==========================
router.post("/", requireAuth, async (req, res) => {
  try {
    const { name, quantity, unit, category } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Ingredient name is required.",
      });
    }

    const newItem = new Pantry({
      userId: req.userId,
      name: name.trim(),
      quantity: quantity || 1,
      unit: unit || "pcs",
      category: category || "other",
    });

    const savedItem = await newItem.save();

    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
});

// ==========================
// DELETE pantry item
// ==========================
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const deletedItem = await Pantry.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!deletedItem) {
      return res.status(404).json({
        message: "Ingredient not found.",
      });
    }

    res.json({
      message: "Ingredient removed from pantry",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;