const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to authenticate user
exports.authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("Authorization Header: ", authHeader);
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    console.log("Decoded User:", user);
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Middleware to check role
exports.authorize = (role) => {
  return (req, res, next) => {
    console.log("User Role:", req.user.role);  // Log the user's role
    if (req.user.role !== role) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};
