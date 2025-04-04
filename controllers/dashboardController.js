const User = require("../models/User");

const dashboardController = async (req, res) => {
  console.log(req.user);
  try {
    const foundUser = await User.findById(req.user.userId).select("-password");
    console.log("User found in dashboardController: ", foundUser); // Log the user data from the database
    if (!foundUser) {
      return res.status(404).json({ message: "User not found!" });
    }
    res.status(200).json({userDetails: foundUser});
  } catch (error) {
    console.error("Error in dashboard controller: ", error.message);
  }
};

module.exports = dashboardController;
