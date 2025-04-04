const mongoose = require("mongoose");

const job_schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  requirements: {
    type: [String],
    required: true,
  },
  salary: {
    type: Number,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  applicants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  category: {
    type: String,
    enum: [
      "Finance",
      "Marketing",
      "IT & Software",
      "Business",
      "Human Resources",
      "Design",
    ],
  },
  experience: {
    type: String,
    enum: ["Entry", "Mid", "Senior", "Manager"],
    required: true,
  },
  jobType: {
    type: String,
    enum: ["Part-time", "Full-time", "Internship"],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
});

const Job = mongoose.model("job", job_schema);

module.exports = Job;
