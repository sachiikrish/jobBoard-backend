const Application = require("../models/Application");
const Job = require("../models/Job");
const nodemailer = require("nodemailer");
const transporter = require("../config/nodemailerConfig");

const applicationDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const foundApplication = await Application.findById(id)
      .populate("userID", "name email")
      .populate(
        "jobID",
        "title company salary location description requirements"
      );
    if (!foundApplication) {
      return res.status(404).json({ message: "Application not found!" });
    }
    res.status(200).json({ applicationDetails: foundApplication });
  } catch (error) {
    console.error(
      "Error occured while sending the applicationd etails to the frontend: ",
      error.message
    );
  }
};

const accept = async (req, res) => {
  const { id } = req.params;
  const { candidateEmail } = req.body;
  console.log("Email: ", req.body.candidateEmail);
  try {
    const isAlreadyAccepted = await Application.findOne({
      _id: id,
      status: "accepted",
    });
    if (isAlreadyAccepted) {
      return res
        .status(401)
        .json({ message: "You have already accepted this application." });
    }
    const application = await Application.findByIdAndUpdate(id, {
      status: "accepted",
    })
      .populate("userID", "name")
      .populate("jobID", "title company");

    //send the acceptance mail
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: candidateEmail,
      subject: "Job Application Accepted ✅",
      html: ` <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 5px;">
            <h2 style="color: #2ecc71;">Congratulations, ${application.userID.name}!</h2>
            <p>Your application for <strong>${application.jobID.title}</strong> at <strong>${application.jobID.company}</strong> has been accepted!
            Please be ready for the next round- Interview Round.</p>
            <hr>
            <p style="font-size: 14px; color: gray;">This is an automated message. Please do not reply.</p>
          </div>
        </div>`,
    });
    res.status(200).json({ message: "Application accepted successfully!" });
  } catch (error) {
    console.error(error.message);
  }
};

const reject = async (req, res) => {
  try {
    const { id } = req.params;
    const { candidateEmail } = req.body;

    const isAlreadyRejected = await Application.findOne({
      _id: id,
      status: "rejected",
    });

    if (isAlreadyRejected) {
      return res
        .status(401)
        .json({ message: "You have already rejected this application." });
    }
    const application = await Application.findByIdAndUpdate(id, {
      status: "rejected",
    })
      .populate("userID", "name")
      .populate("jobID", "title company");

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: candidateEmail,
      subject: "Job Application Update ❌",
      html: ` <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 5px;">
            <h2 style="color: #e74c3c;">Thank you for applying, ${application.userID.name}</h2>
            <p>We appreciate your interest in the <strong>${application.jobID.title}</strong> position at <strong>${application.jobID.company}</strong>.</p>
            <p>After careful consideration, we regret to inform you that we have decided to move forward with other candidates at this time.</p>
            <p>Please don't be discouraged — we encourage you to apply for future openings that match your skills and experience. We wish you the very best in your job search and future endeavors.</p>
            <hr>
            <p style="font-size: 14px; color: gray;">This is an automated message. Please do not reply.</p>
          </div>
        </div>`,
    });

    res.status(200).json({ message: "Application rejected successfully!" });
  } catch (error) {
    console.log(error.message);
  }
};

const appDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({ message: "No Application found!" });
    }
    await Application.findByIdAndDelete(id);

    await Job.findByIdAndUpdate(application.jobID, {
      $pull: {
        applicants: id,
      },
    });
  } catch (error) {}
};
module.exports = { applicationDetails, accept, reject, appDelete };
