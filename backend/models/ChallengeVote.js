const mongoose = require("mongoose");

const challengeVoteSchema = new mongoose.Schema(
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

    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Submission",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// A user can vote for a submission only once
challengeVoteSchema.index(
  { userId: 1, submissionId: 1 },
  { unique: true }
);

module.exports = mongoose.model("ChallengeVote", challengeVoteSchema);