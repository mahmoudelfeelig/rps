// Middleware to authenticate user
exports.authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // include status so we can check for banned
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    if (user.status === "banned") {
      return res
        .status(403)
        .json({ message: "Your account is banned. Contact support." });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Middleware to check role (and ban on misuse)
exports.authorize = (requiredRole) => {
  return async (req, res, next) => {
    // If they’re not the required role, ban them immediately
    if (req.user.role !== requiredRole) {
      await User.findByIdAndUpdate(req.user._id, {
        status: "banned",
      });
      return res
        .status(403)
        .json({ message: "Forbidden – your account has been banned." });
    }
    next();
  };
};