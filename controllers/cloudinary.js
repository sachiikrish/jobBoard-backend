const dotenv = require('dotenv');
dotenv.config();
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.cloud_api_key,
  api_secret: process.env.api_secret_key,
});

// set up multer storage with Cloudinary
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "job-applications",
//     allowed_formats: ["pdf", "docx"],
//   },
// });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname)
  }
}); 

const upload = multer({storage:storage});

// console.log(process.env.cloud_name, process.env.cloud_api_key, process.env.api_secret_key);

module.exports = upload;