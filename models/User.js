const mongoose = require("mongoose");

const user_schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["employer", "candidate"],
    required: true,
  },
  profileDetails: {
    bio: { type: String },
    resume: { type: String },
  },
  createdAt: { type: Date, default: Date.now },
  
  refreshTokens: {
    type: [String],
  },
});

const User = mongoose.model("user", user_schema);

module.exports = User;
