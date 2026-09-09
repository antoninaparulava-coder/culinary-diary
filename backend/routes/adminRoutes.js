const express = require("express");

const User = require("../models/User");
const Recipe = require("../models/Recipe");

const requireAuth = require("../middleware/auth");
const requireAdmin = require("../middleware/admin");

const Challenge = require("../models/Challenge");
const ChallengeParticipation = require("../models/ChallengeParticipation");
const Submission = require("../models/Submission");
const ChallengeVote = require("../models/ChallengeVote");

const router = express.Router();


// ======================================================
// ADMIN DASHBOARD
// ======================================================

router.get("/dashboard", async (req, res) => {
  try {
    const [users, recipes, challenges] = await Promise.all([
      User.countDocuments(),
      Recipe.countDocuments(),
      Challenge.countDocuments(),
    ]);

    res.json({
      stats: {
        users,
        recipes,
        challenges,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    res.status(500).json({
      message: "Could not load dashboard statistics.",
    });
  }
});


// ======================================================
// GET ALL USERS
// ======================================================

router.get(
  "/users",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const users = await User.find()
        .select("-password")
        .sort({ createdAt: -1 });

      res.json(users);
    } catch (error) {
      console.error("Get admin users error:", error);

      res.status(500).json({
        message: "Could not load users.",
      });
    }
  }
);


// ======================================================
// CHANGE USER ROLE
// ======================================================

router.patch(
  "/users/:id/role",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { role } = req.body;

      if (!["user", "admin"].includes(role)) {
        return res.status(400).json({
          message: "Invalid role.",
        });
      }

      // Don't allow admin to change their own role
      if (req.params.id === req.userId.toString()) {
        return res.status(400).json({
          message: "You cannot change your own administrator role.",
        });
      }

      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      user.role = role;

      await user.save();

      res.json({
        message: `User role changed to ${role}.`,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Change user role error:", error);

      res.status(500).json({
        message: "Could not change user role.",
      });
    }
  }
);


// ======================================================
// DELETE USER
// ======================================================

router.delete(
  "/users/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      // Don't allow admin to delete themselves
      if (req.params.id === req.userId.toString()) {
        return res.status(400).json({
          message: "You cannot delete your own account from the admin panel.",
        });
      }

      const user = await User.findByIdAndDelete(req.params.id);

      if (!user) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      res.json({
        message: "User deleted successfully.",
      });
    } catch (error) {
      console.error("Delete user error:", error);

      res.status(500).json({
        message: "Could not delete user.",
      });
    }
  }
);


// ======================================================
// GET ALL RECIPES
// ======================================================

router.get(
  "/recipes",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const recipes = await Recipe.find()
        .sort({ createdAt: -1 });

      res.json(recipes);
    } catch (error) {
      console.error("Get admin recipes error:", error);

      res.status(500).json({
        message: "Could not load recipes.",
      });
    }
  }
);


// ======================================================
// CREATE RECIPE
// ======================================================

router.post(
  "/recipes",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        title,
        emoji,
        blurb,
        tags,
        ingredients,
        instructions,
        prepTime,
        calories,
        difficulty,
      } = req.body;

      if (
        !title ||
        !ingredients ||
        !Array.isArray(ingredients) ||
        ingredients.length === 0 ||
        !instructions
      ) {
        return res.status(400).json({
          message: "Title, ingredients, and instructions are required.",
        });
      }

      const recipe = new Recipe({
        title,
        emoji: emoji || "🍳",
        blurb: blurb || "",
        tags: Array.isArray(tags) ? tags : [],
        ingredients,
        instructions,
        prepTime: Number(prepTime) || 0,
        calories: Number(calories) || 300,
        difficulty: difficulty || "Easy",
      });

      const savedRecipe = await recipe.save();

      res.status(201).json(savedRecipe);
    } catch (error) {
      console.error("Create recipe error:", error);

      res.status(400).json({
        message: error.message || "Could not create recipe.",
      });
    }
  }
);


// ======================================================
// UPDATE RECIPE
// ======================================================

router.put(
  "/recipes/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        title,
        emoji,
        blurb,
        tags,
        ingredients,
        instructions,
        prepTime,
        calories,
        difficulty,
      } = req.body;

      const recipe = await Recipe.findById(req.params.id);

      if (!recipe) {
        return res.status(404).json({
          message: "Recipe not found.",
        });
      }

      recipe.title = title;
      recipe.emoji = emoji || "🍳";
      recipe.blurb = blurb || "";
      recipe.tags = Array.isArray(tags) ? tags : [];
      recipe.ingredients = ingredients;
      recipe.instructions = instructions;
      recipe.prepTime = Number(prepTime) || 0;
      recipe.calories = Number(calories) || 300;
      recipe.difficulty = difficulty || "Easy";

      const updatedRecipe = await recipe.save();

      res.json(updatedRecipe);
    } catch (error) {
      console.error("Update recipe error:", error);

      res.status(400).json({
        message: error.message || "Could not update recipe.",
      });
    }
  }
);


// ======================================================
// DELETE RECIPE
// ======================================================

router.delete(
  "/recipes/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const recipe = await Recipe.findByIdAndDelete(req.params.id);

      if (!recipe) {
        return res.status(404).json({
          message: "Recipe not found.",
        });
      }

      res.json({
        message: "Recipe deleted successfully.",
      });
    } catch (error) {
      console.error("Delete recipe error:", error);

      res.status(500).json({
        message: "Could not delete recipe.",
      });
    }
  }
);

// =====================================================
// CHALLENGES
// =====================================================


// =====================================================
// GET ALL CHALLENGES
// GET /api/admin/challenges
// =====================================================

router.get("/challenges", async (req, res) => {
  try {
    const now = new Date();

    // Automatically mark expired challenges as inactive
    await Challenge.updateMany(
      {
        endDate: { $lt: now },
        active: true,
      },
      {
        $set: { active: false },
      }
    );

    const challenges = await Challenge.find()
      .sort({ startDate: 1 })
      .lean();

    const result = await Promise.all(
      challenges.map(async (challenge) => {
        const participants =
          await ChallengeParticipation.countDocuments({
            challengeSlug: challenge.slug,
            joined: true,
          });

        const submissions =
          await Submission.countDocuments({
            challengeSlug: challenge.slug,
          });

        const difference =
          new Date(challenge.endDate).getTime() -
          now.getTime();

        const daysLeft = Math.max(
          0,
          Math.ceil(
            difference /
              (1000 * 60 * 60 * 24)
          )
        );

        return {
          ...challenge,
          participants,
          submissions,
          daysLeft,
          ended:
            !challenge.active ||
            difference <= 0,
        };
      })
    );

    res.json(result);
  } catch (error) {
    console.error("Admin challenges error:", error);

    res.status(500).json({
      message: "Could not load challenges.",
    });
  }
});


// =====================================================
// CREATE CHALLENGE
// POST /api/admin/challenges
// =====================================================

router.post("/challenges", async (req, res) => {
  try {
    const {
      slug,
      title,
      description,
      emoji,
      goal,
      tag,
      startDate,
      endDate,
      active,
    } = req.body;

    if (!slug || !slug.trim()) {
      return res.status(400).json({
        message: "Challenge slug is required.",
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Challenge title is required.",
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        message: "Challenge description is required.",
      });
    }

    if (!tag || !tag.trim()) {
      return res.status(400).json({
        message: "Challenge tag is required.",
      });
    }

    if (!goal || Number(goal) < 1) {
      return res.status(400).json({
        message: "Goal must be at least 1.",
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "Start date and end date are required.",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return res.status(400).json({
        message: "Invalid challenge dates.",
      });
    }

    if (end <= start) {
      return res.status(400).json({
        message: "End date must be after start date.",
      });
    }

    const existingChallenge =
      await Challenge.findOne({
        slug: slug.trim(),
      });

    if (existingChallenge) {
      return res.status(409).json({
        message:
          "A challenge with this slug already exists.",
      });
    }

    const challenge = new Challenge({
      slug: slug.trim().toLowerCase(),
      title: title.trim(),
      description: description.trim(),
      emoji: emoji || "🏆",
      goal: Number(goal),
      tag: tag.trim(),
      startDate: start,
      endDate: end,
      active: active !== false,
    });

    const savedChallenge =
      await challenge.save();

    res.status(201).json(savedChallenge);
  } catch (error) {
    console.error("Create challenge error:", error);

    res.status(500).json({
      message: "Could not create challenge.",
    });
  }
});


// =====================================================
// UPDATE CHALLENGE
// PUT /api/admin/challenges/:id
// =====================================================

router.put("/challenges/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid challenge ID.",
      });
    }

    const {
      title,
      description,
      emoji,
      goal,
      tag,
      startDate,
      endDate,
      active,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Challenge title is required.",
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        message: "Challenge description is required.",
      });
    }

    if (!tag || !tag.trim()) {
      return res.status(400).json({
        message: "Challenge tag is required.",
      });
    }

    if (!goal || Number(goal) < 1) {
      return res.status(400).json({
        message: "Goal must be at least 1.",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return res.status(400).json({
        message: "Invalid challenge dates.",
      });
    }

    if (end <= start) {
      return res.status(400).json({
        message: "End date must be after start date.",
      });
    }

    const challenge =
      await Challenge.findByIdAndUpdate(
        id,
        {
          title: title.trim(),
          description: description.trim(),
          emoji: emoji || "🏆",
          goal: Number(goal),
          tag: tag.trim(),
          startDate: start,
          endDate: end,
          active: active !== false,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!challenge) {
      return res.status(404).json({
        message: "Challenge not found.",
      });
    }

    res.json(challenge);
  } catch (error) {
    console.error("Update challenge error:", error);

    res.status(500).json({
      message: "Could not update challenge.",
    });
  }
});


// ==========================
// DELETE CHALLENGE
// ==========================
router.delete("/challenges/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        message: "Challenge not found.",
      });
    }

    // Delete submissions belonging to this challenge
    const submissions = await Submission.find({
      challengeSlug: challenge.slug,
    }).select("_id");

    const submissionIds = submissions.map(
      (submission) => submission._id
    );

    // Delete votes belonging to those submissions
    if (submissionIds.length > 0) {
      await ChallengeVote.deleteMany({
        submissionId: { $in: submissionIds },
      });
    }

    // Delete submissions
    await Submission.deleteMany({
      challengeSlug: challenge.slug,
    });

    // Delete participation records
    await ChallengeParticipation.deleteMany({
      challengeSlug: challenge.slug,
    });

    // Finally delete the challenge
    await Challenge.deleteOne({
      _id: challenge._id,
    });

    res.json({
      message: "Challenge deleted successfully.",
    });
  } catch (error) {
    console.error("Delete challenge error:", error);

    res.status(500).json({
      message: "Could not delete challenge.",
    });
  }
});


module.exports = router;