const User = require("../models/User");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookie = require("cookie-parser");

const login = async (req, res) => {
  try {
    const { Username, Password } = req.body;

    const foundUser = await User.findOne({ username: Username.toLowerCase() });
    if (!foundUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    const isMatch = await bcrypt.compare(Password, foundUser.password);
    if (!isMatch) {
      return res.status(404).json({ message: "Wrong credentials!" });
    }

    //generate ACCESS AND REFRESH tokens
    const payLoad = { userId: foundUser._id, userName: foundUser.username };
    const accessToken = generateAccessToken(payLoad);
    const refreshToken = generateRefreshToken(payLoad);

    foundUser.refreshTokens.push(refreshToken);
    await foundUser.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "development",
      sameSite: "Strict",
      path: "/",
    });

    res
      .status(200)
      .json({ message: "Login Successful!", accessToken: accessToken});
  } catch (error) {
    console.error("Error in login: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const signup = async (req, res) => {
  try {
    const { Name, Password, Role, Email, ConfirmPassword, Username } = req.body;
    const existingUser = await User.findOne({
      $or: [{ username: Username }, { email: Email }],
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists!" });
    }
    const isPasswordSame = await confirmPassword(Password, ConfirmPassword);
    if (!isPasswordSame) {
      return res.status(400).json({ message: "Password not matched!" });
    }
    const hashedPassword = await bcrypt.hash(Password, 10);
    const newUser = new User({
      username: Username.toLowerCase(),
      email: Email,
      password: hashedPassword,
      role: Role,
      name: Name,
    });
    await newUser.save();
    res.status(200).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const generateAccessToken = (User) => {
  try {
    return JWT.sign(User, process.env.ACCESS_TOKEN_KEY, { expiresIn: "5m" });
  } catch (error) {
    console.log("Errot occured while generating an access token: ", error);
    return null;
  }
};

const generateRefreshToken = (User) => {
  try {
    console.log("Refresh token is being generated!");
    const refreshToken = JWT.sign(User, process.env.REFRESH_TOKEN_KEY);
    return refreshToken;
  } catch (error) {
    console.log("Errot occured while generating a refresh token: ", error);
    return null;
  }
};
function confirmPassword(first, second) {
  if (first === second) {
    return true;
  } else {
    return false;
  }
}

const refreshTokenController = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ message: "Referesh token is missing!" });
  }

  try {
    const foundUser = await User.findOne({ refreshTokens: refreshToken });
    console.log("User found while refreshing the access token: ", foundUser);
    if (!foundUser) {
      return res.status(404).json({ message: "Invalid Refresh Token" });
    }

    JWT.verify(refreshToken, process.env.REFRESH_TOKEN_KEY, (err, user) => {
      if (err) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }

      const payLoad = { userId: user.userId, userName: user.userName };
      const accessToken = generateAccessToken(payLoad);
      console.log("Access token regnerated: ", accessToken);
      res.status(200).json({ accessToken: accessToken });
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = { login, signup, refreshTokenController };
