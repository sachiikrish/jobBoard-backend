const User = require("../models/User");
const logout = async (req, res) => {
  // // Optionally clear the refresh token from the cookies
  // res.clearCookie("refreshToken", {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === "production",
  //   sameSite: "Strict",
  //   path: "/",
  // });

  // // Optionally remove the refresh token from the server-side array
  // const refreshToken = req.cookies.refreshToken;
  // if (refreshToken && refreshTokens.includes(refreshToken)) {
  //   refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  // }

  // res.status(200).json({ message: "Logged out successfully!" });

  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(403).json({ message: "Invalid Refresh Token" });
    }
    const foundUser = await User.findOne({ refreshTokens: refreshToken });
    if (!foundUser) {
      return res.status(403).json({ message: "Invalid Refresh Token" });
    }

    foundUser.refreshTokens = foundUser.refreshTokens.filter(
      (token) => token !== refreshToken
    );
    await foundUser.save();

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "development",
      sameSite: "Strict",
      path: "/",
    });
    res.status(200).json({ message: "Logged out!" });
  } catch (error) {
    res.status(500).json({ message: "Server error!" });
  }
};

module.exports = logout;
