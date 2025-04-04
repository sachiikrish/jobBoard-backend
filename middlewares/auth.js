const JWT = require("jsonwebtoken");

const verifyAccessToken = (req, res, next) => {
  console.log("Headers Received:", req.headers);
  const token = req.headers.authorization?.split(" ")[1];
  console.log("Token:", token);  // Log token to see if it's being passed correctly
  if (!token) {
    console.log("❌ Token is missing!");
    return res.status(401).json({ message: "Missing access token!" });
  }

  try {
    const decoded = JWT.verify(token, process.env.ACCESS_TOKEN_KEY);
    req.user = decoded; // attach the user's info to the req object
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

module.exports = verifyAccessToken;
