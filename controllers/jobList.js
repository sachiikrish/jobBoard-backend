const Job = require("../models/Job");
const Application = require("../models/Application");
const cloudinary = require("cloudinary");
const User = require("../models/User");
const { format, parseISO } = require("date-fns");

const jobList = async (req, res) => {
  try {
    const { type, jobCategory, experience, max, min } = req.query;

    let filter = {};

    if (jobCategory) {
      filter.category = jobCategory;
    }

    if (type) {
      filter.jobType = type;
    }

    if (experience) {
      filter.experience = experience;
    }

    if (min) {
      filter.salary = { $gte: Number(min) };
    }

    if (max) {
      filter.salary = { ...filter.salary, $lte: Number(max) };
    }

    let jobsArray = await Job.find(filter);

    console.log("Filter being applied:", filter); // 🔥 Debugging line
    res.status(200).json(jobsArray);
  } catch (error) {
    console.error(
      "Error occured while fetching the jobs list: ",
      error.message
    );
  }
};

const userJobs = async (req, res) => {
  try {
    const userJobsArray = await Job.find({ createdBy: req.user.userId });
    if (userJobsArray.length === 0) {
      return res
        .status(404)
        .json({ message: "You have not posted any Job yet." });
    }

    const jobsWithApplicant = userJobsArray.map((job) => {
      return {
        ...job.toObject(),
        applicantCount: job.applicants.length,
      };
    });

    const jobIDs = userJobsArray.map((job) => job._id);

    const applications = await Application.find({ jobID: { $in: jobIDs } })
      .populate("userID", "name email")
      .populate("jobID", "company title");

    res.status(200).json({ jobsWithApplicant, applications });
  } catch (error) {
    console.error(
      "Error occured while fetching the user's posted jobs: ",
      error.message
    );
  }
};

const jobDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const foundJob = await Job.findByIdAndDelete(id);
    if (!foundJob) {
      return res
        .status(404)
        .json({ message: "Job not found in the database!" });
    }
    const jobApplication = await Application.deleteMany({ jobID: id });
    res.status(200).json({ message: "Job deleted!" });
  } catch (error) {
    console.error("Error occured while deleting a job: ", error.message);
  }
};

const applyJobDetails = async (req, res) => {
  const { id } = req.params;
  try {
    let foundJob = await Job.findById(id);
    if (!foundJob) {
      return res.status(404).json({ message: "No such job found" });
    }

    const formatDate = (date) => {
      if (date instanceof Date) {
        return format(date, "dd MMMM yyyy"); // If it's already a Date object, format it directly
      } else if (typeof date === "string") {
        return format(parseISO(date), "dd MMMM yyyy"); // If it's a string, parse and format it
      } else {
        return null;
      }
    };

    const formattedStartDate = formatDate(foundJob.startDate);
    const formattedEndDate = formatDate(foundJob.endDate);
    const formattedApplyBy = formatDate(foundJob.deadline);

    const jobDetails = {
      ...foundJob.toObject(),
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      deadline: formattedApplyBy,
    };
    res.status(200).json(jobDetails);
  } catch (error) {
    console.error(
      "Error occured while fetching the details of the job from the backend: ",
      error.message
    );
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const applyJob = async (req, res) => {
  if (!req.file) {
    return res.status(404).json({ message: "No file uploaded!" });
  }
  console.log("UPLOADED FILE (RESUME): ", req.file);
  const { id } = req.params;
  try {
    const existingApplication = await Application.findOne({
      jobID: id,
      userID: req.user.userId,
    });
    if (existingApplication) {
      return res
        .status(400)
        .json({ message: "You have already applied for this job." });
    }

    // get resume URL from cloudinary
    const resumeFile = req.file;
    console.log(resumeFile);
    //const resumeURL = resumeFile.path;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(resumeFile.path, {
      resource_type: "auto",
    });
    const resumeURL = result.secure_url;

    const newApplication = new Application({
      jobID: id,
      userID: req.user.userId,
      resume: resumeURL,
    });
    await newApplication.save();

    const job = await Job.findById(id);
    job.applicants.push(newApplication._id);
    await job.save();
    res.status(200).json({ message: "Application has been submitted!" });
  } catch (error) {
    console.error(
      "Error occured while submitting the application in the database: ",
      error.message
    );
    res.status(500).json({ message: "Error message" });
  }
};

module.exports = { jobList, userJobs, jobDelete, applyJobDetails, applyJob };
