const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["guest", "user", "groupAdmin", "admin"], 
    default: "user" 
  },
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: null },
  resetToken: String,
  resetTokenExpiry: Date,
});

module.exports = mongoose.model("User", userSchema);
