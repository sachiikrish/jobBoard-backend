const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();
const port = 5000;
const cors = require("cors");
const mongoose = require("mongoose");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookie = require("cookie-parser");
const router = require("./routes/Route");
const path = require("path");
const ejs = require("ejs");
const upload = require("./controllers/cloudinary");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const nodemailer = require("nodemailer");



const { CloudinaryStorage } = require("multer-storage-cloudinary");

const conn = mongoose.connect(
  process.env.MONGODB_URI
);

//Middlewares
app.use(
  cors({
    origin: process.env.FRONT_END_URL,
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookie());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//Routes
app.use("/", router);

app.use(express.static(path.join(__dirname, "../job_board/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../job_board/build", "index.html"));
});

app.listen(port, () => {
  console.log(`your backend server is being listened at the port = ${port}`);
});
