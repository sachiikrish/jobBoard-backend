const mongoose = require("mongoose");

const application_schema = new mongoose.Schema({
  jobID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "job",
    required: true,
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  resume: { type: String, required: true },
  status: {
    type: String,
    enum: ["accepted", "pending", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Application = mongoose.model("application", application_schema);

module.exports = Application;
