const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["user", "owner", "admin"],
    default: "user",
  },
  status: {
    type: String,
    enum: ["active", "blocked"],
    default: "active",
  },
  ownerVerificationStatus: {
    type: String,
    enum: ["unverified", "pending", "verified", "rejected"],
    default: "unverified",
  },
});

module.exports = mongoose.model("User", userSchema);