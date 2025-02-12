const jwt = require("jsonwebtoken");
const blackListToken = require("../models/blacklistToken.model");
const userModel = require("../models/user.model");
const captainModel = require("../models/captain.model");

// Helper function for authentication
async function authenticate(token, model) {
  if (!token) {
    return { error: "Unauthorized: No token provided" };
  }

  try {
    // Check if token is blacklisted
    const isBlackListed = await blackListToken.findOne({ token });
    if (isBlackListed) {
      return { error: "Unauthorized: Invalid Token" };
    }
  } catch (error) {
    console.error("⚠️ Database error while checking blacklist:", error);
    return { error: "Internal Server Error" };
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET); // ✅ Wrap this in try-catch
  } catch (error) {
    console.error("⚠️ JWT verification error:", error.message); // Avoid crashing!
    return { error: "Unauthorized: Invalid token" };
  }

  try {
    const userOrCaptain = await model.findById(decoded._id);
    if (!userOrCaptain) {
      return { error: "Unauthorized: User or Captain not found" };
    }
    return { user: userOrCaptain };
  } catch (error) {
    console.error("⚠️ Database error while fetching user:", error);
    return { error: "Internal Server Error" };
  }
}

// Middleware for user authentication
module.exports.authUser = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    const result = await authenticate(token, userModel);

    if (result.error) {
      return res.status(401).json({ message: result.error });
    }

    req.user = result.user;
    next();
  } catch (error) {
    console.error("⚠️ Unexpected error in authUser middleware:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Middleware for captain authentication
module.exports.authCaptain = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    const result = await authenticate(token, captainModel);

    if (result.error) {
      return res.status(401).json({ message: result.error });
    }

    req.captain = result.user;
    next();
  } catch (error) {
    console.error("⚠️ Unexpected error in authCaptain middleware:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
