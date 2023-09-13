const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const crypto = require("crypto");
const path = require("path");
const Post = require("../models/Post"); // Your Post model

const conn = mongoose.createConnection(
  "mongodb://localhost:27017/your_database_name",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// Init gfs
let gfs;
conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("posts");
});

// Create storage engine
const storage = new GridFsStorage({
  url: "mongodb://localhost:27017/your_database_name",
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "posts",
        };
        resolve(fileInfo);
      });
    });
  },
});

const upload = multer({ storage });

// Upload a file for a specific post
router.post("/:id/upload", upload.single("file"), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.file_id = req.file.id;
    await post.save();
    res
      .status(201)
      .json({ message: "File uploaded successfully", file: req.file });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a file by filename
router.get("/:filename", (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({ message: "No file exists" });
    }

    // Check if the file is an image
    if (file.contentType === "image/jpeg" || file.contentType === "image/png") {
      // Read output to browser
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({ message: "Not an image" });
    }
  });
});

// DELETE a file by filename
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    gfs.remove({ _id: post.file_id, root: "posts" }, (err, gridStore) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      post.file_id = null;
      post.save();
      res.status(200).json({ message: "File deleted successfully" });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
