const mongoose = require("mongoose");

const pantrySchema = new mongoose.Schema(
  {
    // The user who owns this pantry item
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      default: 1,
    },

    unit: {
      type: String,
      enum: ["pcs", "kg", "g", "l", "ml", "pack", "tbsp", "tsp", "cloves", "cups", "slices", "other"],
      default: "pcs",
    },

    category: {
      type: String,
      enum: ["produce", "dairy", "pantry", "meat", "spice", "herb", "other"],
      default: "other",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pantry", pantrySchema);