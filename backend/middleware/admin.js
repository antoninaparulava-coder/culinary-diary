const User = require("../models/User");

async function requireAdmin(req, res, next) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Not authenticated.",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(401).json({
        message: "User not found.",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required.",
      });
    }

    req.adminUser = user;

    next();
  } catch (error) {
    console.error("Admin middleware error:", error);

    return res.status(500).json({
      message: "Could not verify administrator access.",
    });
  }
}

module.exports = requireAdmin;