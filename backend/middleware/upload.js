const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
require("dotenv").config();

const DB_CONNECTION = process.env.DB_CONNECTION;

if (!DB_CONNECTION) {
  throw new Error("DB_CONNECTION must be set");
}

const allowedMimeTypes = ["image/png", "image/jpg", "image/jpeg"];
const bucketName = "posts";

const storage = new GridFsStorage({
  url: DB_CONNECTION,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    if (allowedMimeTypes.indexOf(file.mimetype) === -1) {
      const error = new Error("Invalid file type");
      error.httpStatusCode = 400;
      return error;
    }

    return {
      bucketName,
      filename: `${Date.now()}-${file.originalname}`,
    };
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"), false);
    }
  },
});

module.exports = upload;
