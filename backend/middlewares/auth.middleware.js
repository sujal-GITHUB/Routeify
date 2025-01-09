const jwt = require("jsonwebtoken");
const blackListToken = require("../models/blacklistToken.model");
const userModel = require("../models/user.model");
const captainModel = require("../models/captain.model");

// Helper function for authentication
async function authenticate(token, model, res) {
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const isBlackListed = await blackListToken.findOne({ token: token });
  if (isBlackListed) {
    return res.status(401).json({ message: "Unauthorized: Invalid Token" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userOrCaptain = await model.findById(decoded._id);
    if (!userOrCaptain) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User or Captain not found" });
    }

    return userOrCaptain;
  } catch (error) {
    console.error("Error during authentication:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized: Token expired" });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// User authentication
module.exports.authUser = async (req, res, next) => {
  const token =
    req.cookies.token ||
    (req.headers.authorization && req.headers.authorization.split(" ")[1]);
  const user = await authenticate(token, userModel, res);
  if (user) {
    req.user = user;
    return next();
  }
};

// Captain authentication
module.exports.authCaptain = async (req, res, next) => {
  const token =
    req.cookies.token ||
    (req.headers.authorization && req.headers.authorization.split(" ")[1]);
  const captain = await authenticate(token, captainModel, res);
  if (captain) {
    req.captain = captain;
    return next();
  }
};
