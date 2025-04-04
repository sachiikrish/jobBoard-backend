const express = require("express");
const router = express.Router();
const path = require("path");
const {
  login,
  signup,
  refreshTokenController,
} = require("../controllers/authController");
const verifyAccessToken = require("../middlewares/auth");
const dashboardController = require("../controllers/dashboardController");
const logout = require("../controllers/logoutController");
const postJob = require("../controllers/postJob");
const {
  jobList,
  userJobs,
  jobDelete,
  applyJobDetails,
  applyJob,
} = require("../controllers/jobList");
const upload = require("../controllers/cloudinary");
const {applicationDetails, accept, reject, appDelete} = require("../controllers/applicationController");

router.post("/login", login);
router.post("/signup", signup);
router.get("/dashboard", verifyAccessToken, dashboardController);
router.post("/refreshToken", refreshTokenController);
router.post("/logout", logout);
router.post("/postJob", verifyAccessToken, postJob);
router.get("/jobsList", jobList);
router.get("/user/jobs", verifyAccessToken, userJobs);
router.post("/employer/jobDetails"); // For viewing the details of the jobs posted by the employer
router.delete("/jobDelete/:id", jobDelete);
router.get("/jobs/:id", applyJobDetails);
router.post("/apply/:id", verifyAccessToken, upload.single("Resume"), applyJob);
router.get('/applicant/:id', applicationDetails);
router.post('/accept/:id', accept);
router.post('/reject/:id', reject);
router.delete('/applications/delete/:id', appDelete);

module.exports = router;
