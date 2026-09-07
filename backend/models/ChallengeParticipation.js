const mongoose = require("mongoose");

const challengeParticipationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    challengeSlug: {
      type: String,
      required: true,
    },

    joined: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// One user can participate in a challenge only once
challengeParticipationSchema.index(
  { userId: 1, challengeSlug: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "ChallengeParticipation",
  challengeParticipationSchema
);