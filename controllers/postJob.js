const Job = require("../models/Job");
const {format, parseISO} = require("date-fns");

const postJob = async (req, res) => {
  try {
    let {
      Title,
      Company,
      Location,
      Description,
      Requirements,
      PostedBy,
      Salary,
      Experience,
      Type,
      Category,
      end,
      start,
      applyBy,
    } = req.body;

  

    const newJob = new Job({
      title: Title,
      company: Company,
      location: Location,
      description: Description,
      requirements: Requirements,
      createdBy: req.user.userId,
      salary: Salary,
      category: Category,
      jobType: Type,
      experience: Experience,
      startDate: start,
      endDate: end,
      deadline: applyBy,
    });
    await newJob.save();
    res.status(200).json({ message: "Job posted successfully!" });
  } catch (error) {
    console.error("Error occured while posting a job: ", error.message);
  }
};

module.exports = postJob;
