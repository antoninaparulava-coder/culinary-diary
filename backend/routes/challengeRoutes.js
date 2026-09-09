const express = require("express");
const router = express.Router();

const ChallengeParticipation = require("../models/ChallengeParticipation");
const Submission = require("../models/Submission");
const ChallengeVote = require("../models/ChallengeVote");
const requireAuth = require("../middleware/auth");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const upload = require("../middleware/upload");
const Challenge = require("../models/Challenge");

Math

/*
GET /api/challenges

Returns challenge definitions + current user's joined status.
*/

router.get("/", requireAuth, async (req, res) => {
  try {
    const now = new Date();

    // Automatically end expired challenges
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

    const participations = await ChallengeParticipation.find({
      joined: true,
    }).lean();

    const joined = {};
    const participantCounts = {};

    participations.forEach((p) => {
      const slug = p.challengeSlug;

      participantCounts[slug] =
        (participantCounts[slug] || 0) + 1;

      if (p.userId.toString() === req.userId.toString()) {
        joined[slug] = true;
      }
    });

    function getDaysLeft(endDate) {
      const now = new Date();

      const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

      const end = new Date(endDate);

      const endDay = new Date(
        end.getFullYear(),
        end.getMonth(),
        end.getDate()
      );

      return Math.max(
        0,
        Math.ceil((endDay - today) / (1000 * 60 * 60 * 24))
      );
    }

    const result = challenges.map((challenge) => {
      const endDate = new Date(challenge.endDate);

      const difference = endDate.getTime() - now.getTime();

      const daysLeft = getDaysLeft(challenge.endDate);

      return {
        ...challenge,

        participants:
          participantCounts[challenge.slug] || 0,

        joined:
          !!joined[challenge.slug],

        daysLeft,

        ended:
          !challenge.active || difference <= 0,
      };
    });

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
});

/*
GET /api/challenges/status

Returns only the current user's participation.
*/
router.get("/status", requireAuth, async (req, res) => {
  try {
    const participations = await ChallengeParticipation.find({
      userId: req.userId,
      joined: true,
    });

    const joined = {};

    participations.forEach((p) => {
      joined[p.challengeSlug] = true;
    });

    res.json({ joined });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/*
POST /api/challenges/:slug/join
*/
router.post("/:slug/join", requireAuth, async (req, res) => {
  try {
    const challenge = await Challenge.findOne({
      slug: req.params.slug,
    });

    if (!challenge) {
      return res.status(404).json({
        message: "Challenge not found.",
      });
    }

    if (!challenge.active || new Date() >= challenge.endDate) {
      return res.status(400).json({
        message: "This challenge has ended.",
      });
    }

    const participation =
      await ChallengeParticipation.findOneAndUpdate(
        {
          userId: req.userId,
          challengeSlug: req.params.slug,
        },
        {
          userId: req.userId,
          challengeSlug: req.params.slug,
          joined: true,
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

    res.json(participation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/*
DELETE /api/challenges/:slug/join

IMPORTANT:
This does NOT delete submissions.
*/


router.delete("/:slug/join", requireAuth, async (req, res) => {
  try {
    const participation =
      await ChallengeParticipation.findOneAndUpdate(
        {
          userId: req.userId,
          challengeSlug: req.params.slug,
        },
        {
          joined: false,
        },
        {
          new: true,
        }
      );

    if (!participation) {
      return res.status(404).json({
        message: "Participation not found.",
      });
    }

    res.json({ message: "Left challenge." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:slug", requireAuth, async (req, res) => {
  try {
    const now = new Date();

    const challenge = await Challenge.findOne({
      slug: req.params.slug,
    }).lean();

    if (!challenge) {
      return res.status(404).json({
        message: "Challenge not found.",
      });
    }

    if (challenge.active && now >= new Date(challenge.endDate)) {
      await Challenge.updateOne(
        { _id: challenge._id },
        { $set: { active: false } }
      );

      challenge.active = false;
    }

    const participants = await ChallengeParticipation.countDocuments({
      challengeSlug: challenge.slug,
      joined: true,
    });

    const difference =
      new Date(challenge.endDate).getTime() - now.getTime();

    const daysLeft = Math.max(
      0,
      Math.ceil(
        difference / (1000 * 60 * 60 * 24)
      )
    );

    res.json({
      ...challenge,
      participants,
      daysLeft,
      ended:
        !challenge.active || difference <= 0,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
});

/*
GET /api/challenges/:slug/submissions

Everyone can see submissions.
*/
router.get("/:slug/submissions", async (req, res) => {
  try {
    const challenge = await Challenge.findOne({
      slug: req.params.slug,
    });

    if (!challenge) {
      return res.status(404).json({
        message: "Challenge not found.",
      });
    }

    const submissions = await Submission.find({
      challengeSlug: req.params.slug,
    }).sort({ votes: -1, createdAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/*
POST /api/challenges/:slug/submissions

For now imageUrl is supplied by the frontend.
We'll connect permanent image uploading next.
*/
router.post("/:slug/submissions", requireAuth, upload.single("image"), async (req, res) => {
    try {
      const challenge = await Challenge.findOne({
       slug: req.params.slug,
      });

      if (!challenge) {
        return res.status(404).json({
          message: "Challenge not found.",
        });
      }

      if (!challenge.active || new Date() >= challenge.endDate) {
        return res.status(400).json({
          message: "This challenge has ended.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "Image is required.",
        });
      }

      const participation = await ChallengeParticipation.findOne({
        userId: req.userId,
        challengeSlug: req.params.slug,
        joined: true,
      });

      if (!participation) {
        return res.status(403).json({
          message: "Join the challenge before submitting proof.",
        });
      }

      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "culinary-diary/challenges",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        stream.end(req.file.buffer);
      });

      const submission = await Submission.create({
        userId: req.userId,
        challengeSlug: req.params.slug,
        author: `${user.firstName} ${user.lastName}`,
        imageUrl: uploadResult.secure_url,
        votes: 0,
      });

      res.status(201).json(submission);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: error.message,
      });
    }
  }
);

/*
DELETE /api/challenges/:slug/submissions/:id

A user can ONLY delete their own submission.
*/
router.delete(
  "/:slug/submissions/:id",
  requireAuth,
  async (req, res) => {
    try {
      const submission = await Submission.findOneAndDelete({
        _id: req.params.id,
        challengeSlug: req.params.slug,
        userId: req.userId,
      });

      if (!submission) {
        return res.status(404).json({
          message: "Submission not found or not owned by you.",
        });
      }

      // Remove all votes associated with this submission
      await ChallengeVote.deleteMany({
        submissionId: submission._id,
      });

      res.json({
        message: "Submission deleted.",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/*
POST /api/challenges/:slug/submissions/:id/vote
*/
router.post(
  "/:slug/submissions/:id/vote",
  requireAuth,
  async (req, res) => {
    try {
      const submission = await Submission.findOne({
        _id: req.params.id,
        challengeSlug: req.params.slug,
      });

      if (!submission) {
        return res.status(404).json({
          message: "Submission not found.",
        });
      }

      const existingVote = await ChallengeVote.findOne({
        userId: req.userId,
        submissionId: submission._id,
      });

      // If already voted, remove the vote.
      if (existingVote) {
        await ChallengeVote.deleteOne({
          _id: existingVote._id,
        });

        submission.votes = Math.max(0, submission.votes - 1);
        await submission.save();

        return res.json({
          voted: false,
          votes: submission.votes,
        });
      }

      // Otherwise create vote.
      await ChallengeVote.create({
        userId: req.userId,
        challengeSlug: req.params.slug,
        submissionId: submission._id,
      });

      submission.votes += 1;
      await submission.save();

      res.json({
        voted: true,
        votes: submission.votes,
      });
    } catch (error) {
      // Duplicate vote protection
      if (error.code === 11000) {
        return res.status(409).json({
          message: "You already voted for this submission.",
        });
      }

      res.status(500).json({ message: error.message });
    }
  }
);

/*
GET /api/challenges/:slug/votes

Returns which submissions the current user voted for.
*/
router.get("/:slug/votes", requireAuth, async (req, res) => {
  try {
    const votes = await ChallengeVote.find({
      userId: req.userId,
      challengeSlug: req.params.slug,
    });

    res.json(
      votes.map((vote) => vote.submissionId.toString())
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;